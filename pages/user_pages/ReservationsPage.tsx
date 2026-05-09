import { AlertCircle, BookMarked, CheckCircle, Clock, Info, MapPin, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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
}) =>
  createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
        <h3 className="font-bold text-gray-900 mb-2">Xác nhận hủy đặt trước</h3>
        <p className="text-sm text-gray-600 mb-4">
          Bạn có chắc muốn hủy đặt trước{' '}
          <span className="font-semibold">"{reservation.publicationTitle}"</span>? Vị trí hàng chờ sẽ bị mất.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
          >
            Quay lại
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700"
          >
            Hủy đặt
          </button>
        </div>
      </div>
    </div>,
    document.body
  );

const ReservationCard = ({
  reservation,
  onCancel,
}: {
  reservation: Reservation;
  onCancel: (r: Reservation) => void;
}) => {
  const cfg = STATUS_CONFIG[reservation.status];
  const isActive = reservation.status === 'PENDING' || reservation.status === 'READY_FOR_PICKUP';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Cover placeholder */}
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

      {/* Actions */}
      {isActive && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => onCancel(reservation)}
            className="text-xs text-red-600 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors"
          >
            Hủy đặt trước
          </button>
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
            <ReservationCard key={r.reservationId} reservation={r} onCancel={setCancelTarget} />
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
            Khi sách sẵn sàng, bạn có <strong>48 giờ</strong> để đến nhận tại chi nhánh đã chọn.
          </li>
          <li>Hệ thống sẽ gửi thông báo khi sách của bạn đã sẵn sàng.</li>
          <li>Đặt trước chỉ áp dụng khi tất cả các bản ở chi nhánh đang được mượn.</li>
        </ul>
      </div>

      {cancelTarget && (
        <CancelModal
          reservation={cancelTarget}
          onConfirm={handleCancel}
          onClose={() => !cancelling && setCancelTarget(null)}
        />
      )}
    </div>
  );
};

export default ReservationsPage;
