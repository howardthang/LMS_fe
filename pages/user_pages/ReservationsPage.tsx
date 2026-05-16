import { AlertCircle, AlertTriangle, BookMarked, CheckCircle, Clock, Info, Layers, MapPin, Printer, QrCode, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import QRCode from 'react-qr-code';
import { toast } from 'sonner';
import { cancelReservation, getMyReservations, Reservation, ReservationStatus } from '../../api/reservationService';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const STATUS_CONFIG: Record<ReservationStatus, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: {
    label: 'Đang chờ',
    color: 'bg-yellow-100 text-yellow-800',
    icon: <Clock size={12} className="mr-1" />,
  },
  READY_FOR_PICKUP: {
    label: 'Sẵn sàng nhận',
    color: 'bg-green-100 text-green-800',
    icon: <CheckCircle size={12} className="mr-1" />,
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: 'bg-gray-100 text-gray-600',
    icon: <X size={12} className="mr-1" />,
  },
  EXPIRED: {
    label: 'Hết hạn',
    color: 'bg-red-100 text-red-700',
    icon: <AlertCircle size={12} className="mr-1" />,
  },
  COMPLETED: {
    label: 'Hoàn thành',
    color: 'bg-blue-100 text-blue-800',
    icon: <CheckCircle size={12} className="mr-1" />,
  },
};

const fmtDate = (iso: string | null) => {
  if (!iso) return '—';
  try {
    return format(new Date(iso), 'HH:mm dd/MM/yyyy', { locale: vi });
  } catch {
    return '—';
  }
};

// Confirm cancel modal
const CancelModal = ({
  reservation,
  onConfirm,
  onClose,
}: {
  reservation: Reservation;
  onConfirm: () => void;
  onClose: () => void;
}) => {
  const isReady = reservation.status === 'READY_FOR_PICKUP';
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
        <h3 className="font-bold text-gray-900 mb-2">
          {isReady ? 'Hủy sách đã sẵn sàng?' : 'Xác nhận hủy đặt trước'}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {isReady ? (
            <>
              Sách <span className="font-semibold">"{reservation.publicationTitle}"</span> đang chờ bạn nhận.
              Nếu hủy, sách sẽ được chuyển cho người tiếp theo trong hàng chờ.
            </>
          ) : (
            <>
              Bạn có chắc muốn hủy đặt trước{' '}
              <span className="font-semibold">"{reservation.publicationTitle}"</span>? Vị trí hàng chờ sẽ bị mất.
            </>
          )}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
          >
            {isReady ? 'Tôi sẽ đến lấy' : 'Quay lại'}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700"
          >
            Hủy đặt trước
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// QR Modal cho READY_FOR_PICKUP
const QrModal = ({ reservation, onClose }: { reservation: Reservation; onClose: () => void }) =>
  createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md my-auto overflow-hidden">
        <div className="bg-green-600 p-6 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCode size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-white">Phiếu nhận sách đặt trước</h2>
          <p className="text-green-100 mt-2 text-sm">Đưa mã QR này cho thủ thư để xác nhận nhận sách.</p>
        </div>

        <div className="p-8">
          <div className="flex justify-center mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <QRCode value={reservation.reservationId} size={200} />
          </div>

          <div className="space-y-3 mb-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500 font-medium">Mã đặt trước</span>
                <span className="font-mono font-bold text-gray-900 text-xs">#{reservation.reservationId}</span>
              </div>
              <h4 className="font-bold text-gray-900 leading-tight mb-2">{reservation.publicationTitle}</h4>
              {reservation.assignedBranch && (
                <p className="text-sm text-gray-600 flex items-center gap-1.5 mb-1">
                  <Layers size={14} className="text-gray-400" />
                  Chi nhánh: <span className="font-medium text-gray-800">{reservation.assignedBranch}</span>
                  {reservation.assignedLocation && (
                    <> · Giá: <span className="font-medium text-gray-800">{reservation.assignedLocation}</span></>
                  )}
                </p>
              )}
              {reservation.assignedBarcode && (
                <p className="text-sm text-gray-600 flex items-center gap-1.5">
                  <Printer size={14} className="text-gray-400" />
                  Barcode: <span className="font-medium text-gray-800">{reservation.assignedBarcode}</span>
                </p>
              )}
            </div>

            {reservation.holdExpirationTime && (
              <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3">
                <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block text-sm font-bold text-red-800 mb-1">Hạn chót đến lấy sách</span>
                  <span className="text-sm text-red-700">{fmtDate(reservation.holdExpirationTime)}</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-md transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>,
    document.body
  );

const ReservationCard = ({
  reservation,
  onCancel,
  onShowQr,
}: {
  reservation: Reservation;
  onCancel: (r: Reservation) => void;
  onShowQr: (r: Reservation) => void;
}) => {
  const cfg = STATUS_CONFIG[reservation.status];
  const isPending = reservation.status === 'PENDING';
  const isReady = reservation.status === 'READY_FOR_PICKUP';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-14 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
          {reservation.coverImageUrl ? (
            <img src={reservation.coverImageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <BookMarked size={24} className="text-gray-300" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-semibold text-gray-900 leading-tight line-clamp-2">
              {reservation.publicationTitle}
            </h4>
            <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full flex-shrink-0 ${cfg.color}`}>
              {cfg.icon} {cfg.label}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
            <span>
              Đặt ngày: <strong className="text-gray-700">{fmtDate(reservation.reservationDate)}</strong>
            </span>
            <span>
              Cơ sở ưu tiên:{' '}
              <strong className="text-gray-700">
                {reservation.preferredBranch === 'ANY' ? 'Bất kỳ' : reservation.preferredBranch}
              </strong>
            </span>
            {reservation.status === 'PENDING' && (
              <span>
                Vị trí hàng chờ: <strong className="text-blue-700">#{reservation.queuePosition}</strong>
              </span>
            )}
            {reservation.status === 'READY_FOR_PICKUP' && reservation.holdExpirationTime && (
              <span className="text-green-700 col-span-2">
                Hạn nhận: <strong>{fmtDate(reservation.holdExpirationTime)}</strong>
              </span>
            )}
          </div>

          {/* READY_FOR_PICKUP: show item location */}
          {reservation.status === 'READY_FOR_PICKUP' && reservation.assignedBarcode && (
            <div className="flex items-center gap-1.5 text-xs bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-green-800">
              <MapPin size={13} />
              <span>
                Barcode: <strong>{reservation.assignedBarcode}</strong>
                {reservation.assignedBranch && (
                  <> · Chi nhánh: <strong>{reservation.assignedBranch}</strong></>
                )}
                {reservation.assignedLocation && (
                  <> · Giá: <strong>{reservation.assignedLocation}</strong></>
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Actions — PENDING */}
      {isPending && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => onCancel(reservation)}
            className="text-xs text-red-600 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors"
          >
            Hủy đặt trước
          </button>
        </div>
      )}

      {/* Actions — READY_FOR_PICKUP: hỏi người dùng có muốn mượn không */}
      {isReady && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm text-green-800 font-medium">
            📚 Sách đã sẵn sàng — bạn có muốn đến lấy không?
          </p>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => onCancel(reservation)}
              className="text-xs text-red-600 border border-red-200 bg-white rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors"
            >
              Không, hủy đặt
            </button>
            <button
              onClick={() => onShowQr(reservation)}
              className="text-xs text-green-700 border border-green-300 bg-white rounded-lg px-3 py-1.5 hover:bg-green-50 transition-colors font-medium flex items-center gap-1"
            >
              <QrCode size={13} /> Xem mã QR nhận sách
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ReservationsPage = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [qrTarget, setQrTarget] = useState<Reservation | null>(null);

  const load = async (p: number) => {
    try {
      setLoading(true);
      const data = await getMyReservations(p, 10);
      setReservations(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setPage(p);
    } catch {
      toast.error('Không thể tải danh sách đặt trước');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(0);
  }, []);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await cancelReservation(cancelTarget.reservationId);
      toast.success('Đã hủy đặt trước');
      setCancelTarget(null);
      load(page);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không thể hủy đặt trước';
      toast.error(msg);
    } finally {
      setCancelling(false);
    }
  };

  const pending = reservations.filter(r => r.status === 'PENDING').length;
  const ready = reservations.filter(r => r.status === 'READY_FOR_PICKUP').length;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Danh sách đặt trước</h1>
        <p className="text-gray-500 text-sm">Theo dõi trạng thái sách bạn đã đặt</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-gray-500 text-sm">Tổng</span>
          <p className="text-3xl font-bold text-gray-900">{totalElements}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-gray-500 text-sm">Đang chờ</span>
          <p className="text-3xl font-bold text-yellow-600">{pending}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-gray-500 text-sm">Sẵn sàng nhận</span>
          <p className="text-3xl font-bold text-green-600">{ready}</p>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Đang tải...</div>
      ) : reservations.length === 0 ? (
        <div className="text-center py-16">
          <BookMarked size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Bạn chưa đặt trước sách nào.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map(r => (
            <ReservationCard key={r.reservationId} reservation={r} onCancel={setCancelTarget} onShowQr={setQrTarget} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            disabled={page === 0}
            onClick={() => load(page - 1)}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 disabled:opacity-40"
          >
            Trước
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            {page + 1} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => load(page + 1)}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 disabled:opacity-40"
          >
            Sau
          </button>
        </div>
      )}

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <h4 className="font-bold flex items-center mb-1">
          <Info size={15} className="mr-2" /> Lưu ý về đặt trước
        </h4>
        <ul className="list-disc list-inside space-y-1 ml-1 text-blue-700">
          <li>
            Bạn chỉ được đặt trước tối đa <strong>2 cuốn sách</strong> cùng lúc.
          </li>
          <li>
            Khi sách sẵn sàng, bạn có <strong>48 giờ</strong> để đến nhận tại chi nhánh đã chọn.
          </li>
          <li>Hệ thống sẽ gửi thông báo khi sách của bạn đã sẵn sàng.</li>
          <li>Nếu không còn nhu cầu, vui lòng nhấn <strong>Hủy đặt trước</strong> để nhường lượt cho người sau.</li>
        </ul>
      </div>

      {cancelTarget && (
        <CancelModal
          reservation={cancelTarget}
          onConfirm={handleCancel}
          onClose={() => !cancelling && setCancelTarget(null)}
        />
      )}

      {qrTarget && (
        <QrModal reservation={qrTarget} onClose={() => setQrTarget(null)} />
      )}
    </div>
  );
};

export default ReservationsPage;
