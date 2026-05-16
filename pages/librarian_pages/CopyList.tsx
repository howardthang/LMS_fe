import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Plus,
  Printer,
  Search,
  XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

type ItemApi = {
  id: string;
  barcode: string;
  branch: string;
  location: string;
  status: 'AVAILABLE' | 'BORROWED' | 'RESERVED' | 'IN_MAINTENANCE' | 'LOST' | string;
  condition: 'NEW' | 'OLD' | string;
  publicationTitle: string;
};

const CopyList = () => {
  const [copies, setCopies] = useState<ItemApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filtering state
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [searchInput, setSearchInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [condition, setCondition] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('DESC');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('size', size.toString());
        if (keyword) params.append('keyword', keyword);
        if (status) params.append('status', status);
        if (condition) params.append('condition', condition);
        params.append('sortBy', sortBy);
        params.append('sortDir', sortDir);

        const res: any = await axiosInstance.get(`/items?${params.toString()}`);

        if (res.code === 200 && res.data) {
          setCopies(res.data.content || []);
          setTotalElements(res.data.totalElements || 0);
          setTotalPages(res.data.totalPages || 0);
        } else {
          setCopies([]);
          setTotalElements(0);
          setTotalPages(0);
        }
      } catch (err) {
        console.error('Fetch items failed', err);
        setError('Không tải được danh sách bản sao.');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [page, size, keyword, status, condition, sortBy, sortDir]);

  const handleApplyFilters = () => {
    setKeyword(searchInput);
    setPage(0); // Reset page on filter
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'DESC' ? 'ASC' : 'DESC');
    } else {
      setSortBy(field);
      setSortDir('DESC');
    }
    setPage(0);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý bản sao</h1>
          <p className="text-slate-500">
            Quản lý các tài liệu thư viện vật lý và vật phẩm sách
          </p>
        </div>
        {/* <Link
          to="/librarianpage/copies/new"
          className="bg-secondary hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-sm transition-colors"
        >
          <Plus size={20} /> Thêm Bản Sao Mới
        </Link> */}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">
              Tìm Kiếm
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-2.5 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Tìm từ khóa, barcode..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="flex-1">
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">
              Trạng thái
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(0);
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-white"
            >
              <option value="">Tất cả</option>
              <option value="AVAILABLE">AVAILABLE (Có sẵn)</option>
              <option value="BORROWED">BORROWED (Đang mượn)</option>
              <option value="RESERVED">RESERVED (Đã đặt)</option>
              <option value="IN_MAINTENANCE">IN_MAINTENANCE (Bảo trì)</option>
              <option value="LOST">LOST (Mất)</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">
              Tình trạng máy
            </label>
            <div className="flex gap-2">
              <select
                value={condition}
                onChange={(e) => {
                  setCondition(e.target.value);
                  setPage(0);
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-white"
              >
                <option value="">Tất cả</option>
                <option value="NEW">NEW (Mới)</option>
                <option value="OLD">OLD (Cũ)</option>
              </select>
              <button
                onClick={handleApplyFilters}
                className="bg-secondary text-white h-[42px] px-4 rounded-lg flex items-center justify-center hover:bg-indigo-700"
              >
                Lọc
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-semibold text-slate-700">
            Danh sách bản sao{' '}
            <span className="text-slate-400 font-normal text-sm ml-2">
              {loading ? 'Đang tải...' : `Tổng cộng ${totalElements} phần tử`}
            </span>
          </h3>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-white border border-slate-200 rounded text-sm text-slate-600 hover:bg-slate-50 shadow-sm flex items-center gap-2">
              <Printer size={14} /> Xuất file
            </button>
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
              <th className="px-6 py-4 w-12">
                <input type="checkbox" className="rounded border-gray-300" />
              </th>
              <th className="px-6 py-4 font-semibold cursor-pointer hover:text-slate-800" onClick={() => handleSort('barcode')}>
                Barcode {sortBy === 'barcode' && (sortDir === 'DESC' ? '↓' : '↑')}
              </th>
              <th className="px-6 py-4 font-semibold cursor-pointer hover:text-slate-800" onClick={() => handleSort('publication.title')}>
                Tên sách {sortBy === 'publication.title' && (sortDir === 'DESC' ? '↓' : '↑')}
              </th>
              <th className="px-6 py-4 font-semibold cursor-pointer hover:text-slate-800" onClick={() => handleSort('branch')}>
                Vị trí {sortBy === 'branch' && (sortDir === 'DESC' ? '↓' : '↑')}
              </th>
              <th className="px-6 py-4 font-semibold cursor-pointer hover:text-slate-800" onClick={() => handleSort('status')}>
                Trạng thái {sortBy === 'status' && (sortDir === 'DESC' ? '↓' : '↑')}
              </th>
              <th className="px-6 py-4 font-semibold cursor-pointer hover:text-slate-800" onClick={() => handleSort('condition')}>
                Tình trạng {sortBy === 'condition' && (sortDir === 'DESC' ? '↓' : '↑')}
              </th>
              <th className="px-6 py-4 font-semibold text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-secondary mb-2"></div>
                  <div className="text-slate-500 text-sm">Đang tải dữ liệu...</div>
                </td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td colSpan={7} className="px-6 py-6 text-center text-red-600">
                  {error}
                </td>
              </tr>
            )}
            {!loading && !error && copies.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-6 text-center text-slate-500">
                  Không tìm thấy bản sao nào.
                </td>
              </tr>
            )}
            {!loading &&
              !error &&
              copies.map((copy) => (
                <tr
                  key={copy.id}
                  className="hover:bg-slate-50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-mono text-slate-600">
                      <span className="text-slate-300">||||</span>
                      <Link
                        to={`/librarianpage/copies/${copy.id}`}
                        className="hover:text-blue-600 hover:underline font-medium"
                      >
                        {copy.barcode}
                      </Link>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-900 line-clamp-2">
                      {copy.publicationTitle || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900">
                      {copy.branch || 'N/A'}
                    </div>
                    {copy.location && (
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{copy.location}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider
                    ${copy.status === 'AVAILABLE'
                          ? 'bg-green-100 text-green-700'
                          : copy.status === 'BORROWED'
                            ? 'bg-blue-100 text-blue-700'
                            : copy.status === 'RESERVED'
                              ? 'bg-indigo-100 text-indigo-700'
                              : copy.status === 'LOST'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-orange-100 text-orange-700'
                        }`}
                    >
                      {copy.status === 'AVAILABLE' && <CheckCircle size={10} />}
                      {copy.status === 'BORROWED' && <Clock size={10} />}
                      {copy.status === 'LOST' && <XCircle size={10} />}
                      {copy.status === 'RESERVED' && <Eye size={10} />}
                      {copy.status === 'IN_MAINTENANCE' && <AlertTriangle size={10} />}
                      {copy.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${copy.condition === 'NEW' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                      {copy.condition}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 *:transition-all transition-opacity [&_button]:p-1.5 [&_a]:p-1.5 row-actions">
                      <Link
                        to={`/librarianpage/copies/${copy.id}`}
                        className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </Link>
                      <button className="text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded" title="Report Issue">
                        <AlertTriangle size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-white">
          <span className="text-sm text-slate-500">
            Hiển thị {totalElements === 0 ? 0 : page * size + 1} - {Math.min((page + 1) * size, totalElements)} trong tổng số {totalElements} phần tử
          </span>
          {totalPages > 0 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 0}
                className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50 text-slate-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &lt;
              </button>

              {/* Pages */}
              {Array.from({ length: totalPages }, (_, i) => i)
                .filter(p => p >= page - 2 && p <= page + 2)
                .map(p => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded text-sm ${page === p
                        ? 'bg-secondary text-white'
                        : 'border border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                  >
                    {p + 1}
                  </button>
                ))
              }

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages - 1}
                className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50 text-slate-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CopyList;
