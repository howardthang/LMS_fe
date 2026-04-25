import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  CheckCircle,
  Clock,
  Hourglass,
  Layers,
  Printer,
  XCircle,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { Badge, Button } from '../../components/ui';
import transactionsService, { UserTransaction } from '../../api/transactionsService';

const ACTIVE_STATUSES = ['WAITING_FOR_PICKUP', 'BORROWING', 'OVERDUE'];
const HISTORY_STATUSES = ['RETURNED', 'CANCELLED'];

const statusConfig: Record<UserTransaction['status'], { label: string; color: string; icon: React.ReactNode }> = {
  WAITING_FOR_PICKUP: { label: 'Chờ lấy sách', color: 'bg-yellow-100 text-yellow-800', icon: <Hourglass size={12} className="mr-1" /> },
  BORROWING:          { label: 'Đang mượn',    color: 'bg-green-100 text-green-800',  icon: <BookOpen size={12} className="mr-1" /> },
  OVERDUE:            { label: 'Quá hạn',       color: 'bg-red-100 text-red-800',      icon: <AlertTriangle size={12} className="mr-1" /> },
  RETURNED:           { label: 'Đã trả',         color: 'bg-blue-100 text-blue-800',    icon: <CheckCircle size={12} className="mr-1" /> },
  CANCELLED:          { label: 'Đã huỷ',         color: 'bg-gray-100 text-gray-600',    icon: <XCircle size={12} className="mr-1" /> },
};

const formatDate = (iso: string | null) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const daysUntil = (dueDate: string) => {
  const diff = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000);
  return diff;
};

const MyBooksPage = () => {
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');

  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [transactions, setTransactions] = useState<UserTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [qrModal, setQrModal] = useState<UserTransaction | null>(null);
  const highlightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        // Fetch enough pages to cover the highlight item if needed
        const res = await transactionsService.getMyTransactions(0, 50);
        if (res.code === 200) {
          setTransactions(res.data.content);
          setTotalPages(res.data.totalPages);
          setTotalElements(res.data.totalElements);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Auto-switch tab and scroll to highlighted transaction
  useEffect(() => {
    if (!highlightId || transactions.length === 0) return;
    const tx = transactions.find(t => t.transactionId === highlightId);
    if (!tx) return;
    const isActive = ACTIVE_STATUSES.includes(tx.status);
    setActiveTab(isActive ? 'current' : 'history');
  }, [highlightId, transactions]);

  useEffect(() => {
    if (!highlightId || !highlightRef.current) return;
    const timer = setTimeout(() => {
      highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
    return () => clearTimeout(timer);
  }, [highlightId, activeTab, transactions]);

  const active = transactions.filter(t => ACTIVE_STATUSES.includes(t.status));
  const history = transactions.filter(t => HISTORY_STATUSES.includes(t.status));
  const displayed = activeTab === 'current' ? active : history;

  const overdueCount = active.filter(t => t.status === 'OVERDUE').length;
  const soonCount = active.filter(t => t.status === 'BORROWING' && daysUntil(t.dueDate) <= 3 && daysUntil(t.dueDate) >= 0).length;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sách của tôi</h1>
          <p className="text-gray-500 text-sm">Quản lý các tài liệu bạn đang mượn và lịch sử mượn trả</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('current')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'current' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Đang mượn ({active.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Lịch sử ({history.length})
          </button>
        </div>
      </div>

      {/* Summary cards — chỉ hiện ở tab "Đang mượn" */}
      {activeTab === 'current' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-600 rounded-xl p-5 text-white shadow-lg flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{active.length}</p>
              <p className="text-sm text-blue-100 font-medium">Sách đang mượn</p>
            </div>
            <div className="p-3 bg-white/20 rounded-full"><BookOpen size={24} /></div>
          </div>
          <div className="bg-red-500 rounded-xl p-5 text-white shadow-lg flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{overdueCount}</p>
              <p className="text-sm text-red-100 font-medium">Sách quá hạn</p>
            </div>
            <div className="p-3 bg-white/20 rounded-full"><AlertCircle size={24} /></div>
          </div>
          <div className="bg-orange-500 rounded-xl p-5 text-white shadow-lg flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{soonCount}</p>
              <p className="text-sm text-orange-100 font-medium">Sắp đến hạn (≤3 ngày)</p>
            </div>
            <div className="p-3 bg-white/20 rounded-full"><Clock size={24} /></div>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-16 text-gray-400">Đang tải...</div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          {activeTab === 'current' ? 'Bạn chưa mượn sách nào.' : 'Chưa có lịch sử mượn trả.'}
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((tx) => {
            const isHighlighted = tx.transactionId === highlightId;
            const cfg = statusConfig[tx.status];
            const days = tx.status === 'BORROWING' ? daysUntil(tx.dueDate) : null;

            return (
              <div
                key={tx.transactionId}
                ref={isHighlighted ? highlightRef : null}
                onClick={() => tx.status === 'WAITING_FOR_PICKUP' ? setQrModal(tx) : undefined}
                className={`bg-white border rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4 transition-shadow ${
                  isHighlighted
                    ? 'border-yellow-300 shadow-md animate-highlight-pulse'
                    : 'border-gray-100 hover:shadow-sm'
                } ${tx.status === 'WAITING_FOR_PICKUP' ? 'cursor-pointer hover:border-blue-300' : ''}`}
              >
                {/* Book info */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-start gap-2 mb-1">
                    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${cfg.color}`}>
                      {cfg.icon}{cfg.label}
                    </span>
                    {isHighlighted && (
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex-shrink-0">
                        Từ thông báo
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-gray-900 truncate">{tx.publicationTitle}</h4>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">{tx.barcode} · {tx.branch} - {tx.shelf}</p>
                </div>

                {/* Dates */}
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500 flex-shrink-0">
                  {tx.status === 'WAITING_FOR_PICKUP' && (
                    <span>Hạn lấy: <strong className="text-yellow-700">
                      {new Date(tx.pickedUpDeadline).toLocaleString('vi-VN', {
                        hour: '2-digit', minute: '2-digit',
                        day: '2-digit', month: '2-digit', year: 'numeric',
                      })}
                    </strong></span>
                  )}
                  {(tx.status === 'BORROWING' || tx.status === 'OVERDUE') && (
                    <>
                      <span>Ngày mượn: <strong>{formatDate(tx.borrowedDate)}</strong></span>
                      <span>
                        Hạn trả: <strong className={tx.status === 'OVERDUE' ? 'text-red-600' : days !== null && days <= 3 ? 'text-orange-600' : 'text-gray-800'}>
                          {new Date(tx.dueDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          {days !== null && ` (${days >= 0 ? `còn ${days} ngày` : `quá ${-days} ngày`})`}
                        </strong>
                      </span>
                    </>
                  )}
                  {(tx.status === 'RETURNED' || tx.status === 'CANCELLED') && (
                    <>
                      <span>Ngày mượn: <strong>{formatDate(tx.borrowedDate)}</strong></span>
                      {tx.status === 'RETURNED' && <span>Ngày trả: <strong>{formatDate(tx.returnedDate)}</strong></span>}
                      {tx.fineAmount != null && tx.fineAmount > 0 && (
                        <span className="text-red-600 font-semibold">Phí phạt: {tx.fineAmount.toLocaleString('vi-VN')}đ</span>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tổng kết lịch sử */}
      {activeTab === 'history' && history.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col items-center">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-full mb-2"><BookOpen size={20} /></div>
            <span className="text-2xl font-bold text-gray-900">{totalElements}</span>
            <span className="text-xs text-gray-500">Tổng giao dịch</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col items-center">
            <div className="p-2 bg-green-50 text-green-600 rounded-full mb-2"><CheckCircle size={20} /></div>
            <span className="text-2xl font-bold text-gray-900">{history.filter(t => t.status === 'RETURNED').length}</span>
            <span className="text-xs text-gray-500">Đã trả</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col items-center">
            <div className="p-2 bg-red-50 text-red-600 rounded-full mb-2"><AlertTriangle size={20} /></div>
            <span className="text-2xl font-bold text-gray-900">
              {history.filter(t => t.fineAmount != null && t.fineAmount > 0).length}
            </span>
            <span className="text-xs text-gray-500">Lần bị phạt</span>
          </div>
        </div>
      )}
      {/* QR Modal cho WAITING_FOR_PICKUP — portal ra document.body để tránh bị clip bởi parent */}
      {qrModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto p-6">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md my-auto overflow-hidden animate-fade-in-up">
            <div className="bg-blue-600 p-6 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-white">Phiếu mượn sách</h2>
              <p className="text-blue-100 mt-2 text-sm">Đưa mã QR này cho thủ thư để nhận sách.</p>
            </div>

            <div className="p-8">
              <div className="flex justify-center mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <QRCode value={qrModal.transactionId} size={200} />
              </div>

              <div className="space-y-3 mb-8">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500 font-medium">Mã giao dịch</span>
                    <span className="font-mono font-bold text-gray-900">#{qrModal.transactionId}</span>
                  </div>
                  <h4 className="font-bold text-gray-900 leading-tight mb-2">{qrModal.publicationTitle}</h4>
                  <p className="text-sm text-gray-600 flex items-center gap-1.5 mb-1">
                    <Layers size={14} className="text-gray-400" /> Vị trí: <span className="font-medium text-gray-800">{qrModal.branch} - {qrModal.shelf}</span>
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-1.5">
                    <Printer size={14} className="text-gray-400" /> Barcode: <span className="font-medium text-gray-800">{qrModal.barcode}</span>
                  </p>
                </div>

                <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3">
                  <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-sm font-bold text-red-800 mb-1">Hạn chót đến lấy sách</span>
                    <span className="text-sm text-red-700">
                      {new Date(qrModal.pickedUpDeadline).toLocaleString('vi-VN', {
                        hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setQrModal(null)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3 rounded-xl shadow-md"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default MyBooksPage;
