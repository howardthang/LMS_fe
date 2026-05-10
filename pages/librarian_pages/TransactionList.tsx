import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Search, X } from 'lucide-react';
import debounce from 'lodash/debounce';
import transactionsService, { LibrarianTransaction, TransactionStatus } from '../../api/transactionsService';

const STATUS_CONFIG: Record<TransactionStatus, { label: string; className: string }> = {
  WAITING_FOR_PICKUP: { label: 'Chờ lấy sách', className: 'bg-yellow-100 text-yellow-700' },
  BORROWING:          { label: 'Đang mượn',    className: 'bg-green-100 text-green-700' },
  OVERDUE:            { label: 'Quá hạn',       className: 'bg-red-100 text-red-700' },
  RETURNED:           { label: 'Đã trả',        className: 'bg-blue-100 text-blue-700' },
  CANCELLED:          { label: 'Đã hủy',        className: 'bg-gray-100 text-gray-500' },
};

type SortField = 'createdAt' | 'borrowedDate' | 'returnedDate' | 'dueDate';

const PAGE_SIZE = 15;

const SortIcon = ({ field, sortBy, sortDir }: { field: SortField; sortBy: SortField; sortDir: 'ASC' | 'DESC' }) => {
  if (sortBy !== field) return <ArrowUpDown size={13} className="text-slate-400" />;
  return sortDir === 'ASC' ? <ArrowUp size={13} className="text-secondary" /> : <ArrowDown size={13} className="text-secondary" />;
};

const TransactionList = () => {
  const [transactions, setTransactions] = useState<LibrarianTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [searchInput, setSearchInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('createdAt');
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('DESC');

  const fetchData = async (page: number, kw: string, sb: SortField, sd: 'ASC' | 'DESC') => {
    setLoading(true);
    try {
      const res = await transactionsService.getAllTransactions(page, PAGE_SIZE, kw || undefined, sb, sd);
      if (res.code === 200 && res.data) {
        setTransactions(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useMemo(
    () => debounce((kw: string) => {
      setKeyword(kw);
      setCurrentPage(0);
    }, 400),
    [],
  );

  useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

  useEffect(() => {
    fetchData(currentPage, keyword, sortBy, sortDir);
  }, [currentPage, keyword, sortBy, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDir(d => d === 'DESC' ? 'ASC' : 'DESC');
    } else {
      setSortBy(field);
      setSortDir('DESC');
    }
    setCurrentPage(0);
  };

  const handlePageChange = (page: number) => {
    if (page >= 0 && page < totalPages) setCurrentPage(page);
  };

  const formatDate = (value: string | null) => {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '—';
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Lịch sử giao dịch</h1>
        <p className="text-slate-500">Tất cả giao dịch mượn sách trong hệ thống</p>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            value={searchInput}
            onChange={e => {
              setSearchInput(e.target.value);
              debouncedSearch(e.target.value);
            }}
            placeholder="Tìm theo tên hoặc MSSV..."
            className="w-full pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(''); debouncedSearch(''); }}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Mã GD</th>
              <th className="px-6 py-4 font-semibold">Sinh viên</th>
              <th className="px-6 py-4 font-semibold">MSSV</th>
              <th
                className="px-6 py-4 font-semibold cursor-pointer hover:text-slate-700 select-none"
                onClick={() => handleSort('borrowedDate')}
              >
                <div className="flex items-center gap-1">
                  Ngày mượn <SortIcon field="borrowedDate" sortBy={sortBy} sortDir={sortDir} />
                </div>
              </th>
              <th
                className="px-6 py-4 font-semibold cursor-pointer hover:text-slate-700 select-none"
                onClick={() => handleSort('dueDate')}
              >
                <div className="flex items-center gap-1">
                  Hạn trả <SortIcon field="dueDate" sortBy={sortBy} sortDir={sortDir} />
                </div>
              </th>
              <th
                className="px-6 py-4 font-semibold cursor-pointer hover:text-slate-700 select-none"
                onClick={() => handleSort('returnedDate')}
              >
                <div className="flex items-center gap-1">
                  Ngày trả <SortIcon field="returnedDate" sortBy={sortBy} sortDir={sortDir} />
                </div>
              </th>
              <th className="px-6 py-4 font-semibold">Phí phạt</th>
              <th className="px-6 py-4 font-semibold">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center">
                  <div className="flex items-center justify-center gap-3 text-slate-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-secondary" />
                    Đang tải...
                  </div>
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-slate-400">
                  Không có giao dịch nào
                </td>
              </tr>
            ) : (
              transactions.map((tx) => {
                const statusCfg = STATUS_CONFIG[tx.status] ?? { label: tx.status, className: 'bg-gray-100 text-gray-500' };
                return (
                  <tr key={tx.transactionId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-slate-500 max-w-[140px]">
                      <span title={tx.transactionId}>{tx.transactionId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-900">{tx.fullName || '—'}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{tx.studentId || '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{formatDate(tx.borrowedDate)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{formatDate(tx.dueDate)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{formatDate(tx.returnedDate)}</td>
                    <td className="px-6 py-4 text-sm">
                      {tx.fineAmount
                        ? <span className="text-red-600 font-medium">{formatCurrency(tx.fineAmount)}</span>
                        : <span className="text-slate-400">—</span>
                      }
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusCfg.className}`}>
                        {statusCfg.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center bg-white">
          <span className="text-sm text-slate-500">
            {totalElements === 0 ? 'Không có kết quả' : (
              <>Hiển thị {currentPage * PAGE_SIZE + 1}–{Math.min((currentPage + 1) * PAGE_SIZE, totalElements)} trong {totalElements} giao dịch</>
            )}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 text-slate-500 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >&lt;</button>
            {Array.from({ length: totalPages }, (_, i) => i)
              .filter(p => p >= currentPage - 2 && p <= currentPage + 2)
              .map(p => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded text-sm ${
                    currentPage === p ? 'bg-secondary text-white' : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >{p + 1}</button>
              ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 text-slate-500 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionList;
