import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Hourglass,
  Mail,
  Phone,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Footer } from '../../components/public_pages/Layout';
import usersService from '../../api/usersService';
import transactionsService, { UserTransaction } from '../../api/transactionsService';
import { getMyReservations, Reservation } from '../../api/reservationService';

// ─── Helpers ────────────────────────────────────────────────────────────────

const daysUntil = (dueDate: string) =>
  Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86_400_000);

const formatDate = (iso: string | null) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const firstName = (fullName: string) => fullName.trim().split(' ').pop() ?? fullName;

// ─── Stat Card ───────────────────────────────────────────────────────────────

interface Stat { label: string; value: number; sub: string; icon: React.ReactNode; bg: string; iconBg: string }

const StatCard = ({ stat }: { stat: Stat }) => (
  <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
    <div className={`p-3 rounded-xl flex-shrink-0 ${stat.iconBg}`}>{stat.icon}</div>
    <div>
      <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
      <p className={`text-3xl font-bold ${stat.bg}`}>{stat.value}</p>
      <p className="text-xs text-slate-400">{stat.sub}</p>
    </div>
  </div>
);

// ─── Due Book Item ───────────────────────────────────────────────────────────

const DueBookItem = ({ tx }: { tx: UserTransaction }) => {
  const days = daysUntil(tx.dueDate);
  const isOverdue = tx.status === 'OVERDUE' || days < 0;
  const isUrgent = !isOverdue && days <= 3;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white border border-slate-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all">
      <div className="w-10 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
        <BookOpen size={20} className="text-blue-500" />
      </div>

      <div className="flex-grow min-w-0">
        <h4 className="font-bold text-slate-900 text-sm truncate">{tx.publicationTitle}</h4>
        <p className="text-xs text-slate-500 font-mono mt-0.5">{tx.barcode} · {tx.branch}</p>
        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
          <span className="flex items-center gap-1"><Calendar size={10} /> Mượn: {formatDate(tx.borrowedDate)}</span>
        </div>
      </div>

      {/* Status + date */}
      <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-1 w-full sm:w-auto">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
          isOverdue ? 'bg-red-100 text-red-600' : isUrgent ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
        }`}>
          {isOverdue ? <AlertTriangle size={10} /> : <Clock size={10} />}
          {isOverdue ? `Quá hạn ${Math.abs(days)} ngày` : `Còn ${days} ngày`}
        </span>
        <p className="text-[10px] text-slate-500">
          Hạn trả: <span className={`font-bold ${isOverdue ? 'text-red-600' : 'text-slate-700'}`}>
            {formatDate(tx.dueDate)}
          </span>
        </p>
      </div>
    </div>
  );
};

// ─── Library Hours ───────────────────────────────────────────────────────────

const LibraryHoursCard = ({ address, hours }: any) => (
  <div className="bg-blue-600 text-white rounded-xl p-5 flex-1 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
    <h3 className="font-bold text-base mb-1">Giờ mở cửa thư viện</h3>
    <p className="text-[11px] text-blue-100 mb-4 leading-snug">{address}</p>
    <div className="space-y-2 text-xs mb-4">
      {hours.map((h: any, i: number) => (
        <div key={i} className="flex justify-between border-b border-blue-500/30 pb-1 last:border-0">
          <span className="text-blue-100">{h.days}</span>
          <span className="font-bold">{h.time}</span>
        </div>
      ))}
    </div>
    <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Đang mở cửa
    </span>
  </div>
);

// ─── Main Page ───────────────────────────────────────────────────────────────

const DashboardPage = () => {
  const [userName, setUserName] = useState('');
  const [transactions, setTransactions] = useState<UserTransaction[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profileRes, txRes, resRes] = await Promise.all([
          usersService.getMyProfile(),
          transactionsService.getMyTransactions(0, 50),
          getMyReservations(0, 20),
        ]);
        if (profileRes.code === 200) setUserName(profileRes.data.fullName);
        if (txRes.code === 200) setTransactions(txRes.data.content);
        setReservations(resRes.content.filter(r => r.status === 'PENDING' || r.status === 'READY_FOR_PICKUP'));
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ── Computed stats ──────────────────────────────────────────────────────
  const active = transactions.filter(t => ['BORROWING', 'OVERDUE'].includes(t.status));
  const waiting = transactions.filter(t => t.status === 'WAITING_FOR_PICKUP');
  const overdue = transactions.filter(t => t.status === 'OVERDUE');
  const dueSoon = transactions.filter(t => t.status === 'BORROWING' && daysUntil(t.dueDate) <= 3 && daysUntil(t.dueDate) >= 0);

  // Sách sắp hết hạn: BORROWING + OVERDUE, sort by dueDate ASC, top 5
  const dueSoonList = [...active].sort((a, b) =>
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  ).slice(0, 5);

  const stats: Stat[] = [
    {
      label: 'Đang mượn',
      value: active.length,
      sub: 'Sách đang trong tay',
      icon: <BookOpen size={20} className="text-blue-600" />,
      bg: 'text-blue-700',
      iconBg: 'bg-blue-100',
    },
    {
      label: 'Chờ lấy sách',
      value: waiting.length,
      sub: 'Cần đến thư viện nhận',
      icon: <Hourglass size={20} className="text-yellow-600" />,
      bg: 'text-yellow-700',
      iconBg: 'bg-yellow-100',
    },
    {
      label: 'Quá hạn',
      value: overdue.length,
      sub: 'Cần trả gấp',
      icon: <AlertTriangle size={20} className="text-red-600" />,
      bg: 'text-red-700',
      iconBg: 'bg-red-100',
    },
    {
      label: 'Sắp đến hạn',
      value: dueSoon.length,
      sub: 'Còn ≤ 3 ngày',
      icon: <Clock size={20} className="text-orange-600" />,
      bg: 'text-orange-700',
      iconBg: 'bg-orange-100',
    },
  ];

  return (
    <>
      <div className="animate-fade-in space-y-8 max-w-7xl mx-auto pb-10">

        {/* 1. Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-white relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-80 h-full bg-white/10 transform skew-x-12 translate-x-20" />
          <div className="relative z-10">
            <h1 className="text-2xl font-bold mb-2">
              Xin chào, {isLoading ? '...' : firstName(userName || 'bạn')}! 👋
            </h1>
            <p className="text-blue-100 mb-6 text-sm">
              {dueSoon.length + overdue.length > 0 ? (
                <>Bạn có <strong className="text-white">{dueSoon.length + overdue.length} sách</strong> cần chú ý — sắp đến hạn hoặc quá hạn.</>
              ) : active.length > 0 ? (
                <>Bạn đang mượn <strong className="text-white">{active.length} cuốn</strong>. Tiếp tục đọc sách nào!</>
              ) : (
                <>Chào mừng trở lại thư viện HCMUT. Khám phá sách mới ngay!</>
              )}
            </p>
            <div className="flex gap-3">
              <Link to="/userpage/my-books"
                className="bg-white text-blue-800 border border-white/80 text-xs font-semibold px-5 py-2 rounded-lg shadow-sm hover:bg-blue-50 transition-all">
                Xem sách đang mượn
              </Link>
            </div>
          </div>
        </div>

        {/* 2. Summary Stats */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-slate-200 h-24 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => <StatCard key={i} stat={s} />)}
          </div>
        )}

        {/* 3. Sách sắp hết hạn */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Sách sắp đến hạn</h3>
              <p className="text-xs text-slate-500">Các sách cần trả sớm nhất, ưu tiên theo ngày hạn</p>
            </div>
            <Link to="/userpage/my-books"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center hover:underline">
              Xem tất cả <ArrowRight size={12} className="ml-1" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 h-20 border border-slate-100 animate-pulse" />
              ))}
            </div>
          ) : dueSoonList.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col items-center text-center text-slate-400">
              <CheckCircle size={32} className="mb-2 text-green-400" />
              <p className="text-sm font-medium text-slate-600">Tuyệt vời! Không có sách nào sắp đến hạn.</p>
              <p className="text-xs mt-1">Bạn đang quản lý sách rất tốt.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {dueSoonList.map(tx => <DueBookItem key={tx.transactionId} tx={tx} />)}
            </div>
          )}
        </div>

        {/* 4. Đặt trước đang chờ */}
        {!isLoading && reservations.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Đặt trước đang chờ</h3>
                <p className="text-xs text-slate-500">Theo dõi hàng chờ và sách đã sẵn sàng để nhận</p>
              </div>
              <Link to="/userpage/reservations"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center hover:underline">
                Xem tất cả <ArrowRight size={12} className="ml-1" />
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {reservations.slice(0, 4).map(r => (
                <div key={r.reservationId}
                  className={`flex items-center gap-4 p-4 rounded-xl border ${r.status === 'READY_FOR_PICKUP' ? 'bg-green-50 border-green-200' : 'bg-white border-slate-100'}`}>
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${r.status === 'READY_FOR_PICKUP' ? 'bg-green-200 text-green-700' : 'bg-blue-100 text-blue-500'}`}>
                    <Clock size={18} />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">{r.publicationTitle}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {r.preferredBranch === 'ANY' ? 'Bất kỳ cơ sở' : r.preferredBranch}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {r.status === 'READY_FOR_PICKUP' ? (
                      <span className="text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                        Sẵn sàng nhận
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">
                        Hàng chờ #{r.queuePosition}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Footer Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col md:flex-row gap-4">
            <LibraryHoursCard
              address="268 Lý Thường Kiệt, Phường 14, Quận 10, TP.HCM"
              hours={[
                { days: 'Thứ Hai - Thứ Sáu', time: '07:30 - 20:00' },
                { days: 'Thứ Bảy', time: '07:30 - 17:00' },
                { days: 'Chủ Nhật', time: 'ĐÓNG CỬA' },
              ]}
            />
            <LibraryHoursCard
              address="Khu phố Tân Lập, Phường Đông Hòa, TP. Dĩ An, Bình Dương"
              hours={[
                { days: 'Thứ Hai - Thứ Sáu', time: '7:30-11:30 | 13:00-17:00' },
                { days: 'Thứ Bảy - Chủ Nhật', time: 'ĐÓNG CỬA' },
              ]}
            />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Phone size={20} /></div>
              <div>
                <h3 className="font-bold text-slate-900">Liên hệ hỗ trợ</h3>
                <p className="text-xs text-slate-500">Chúng tôi luôn sẵn sàng giúp đỡ</p>
              </div>
            </div>
            <div className="space-y-3">
              <a href="mailto:library@hcmut.edu.vn"
                className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                <Mail size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-sm font-bold text-slate-800">thang.hokhmtk22@hcmut.edu.vn</p>
                </div>
              </a>
              <div className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                <Phone size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">Điện thoại</p>
                  <p className="text-sm font-bold text-slate-800">088 676 5392</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
