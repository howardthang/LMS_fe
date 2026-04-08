import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Clock,
  TrendingUp,
  Users,
  ShieldAlert
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import librarianDashboardService, { 
  DashboardSummaryResponse, 
  DashboardChartsResponse,
  RiskyUser
} from '../../api/librarianDashboardService';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  // Trạng thái load data
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<DashboardSummaryResponse['data'] | null>(null);
  const [charts, setCharts] = useState<DashboardChartsResponse['data'] | null>(null);
  const [riskyUsers, setRiskyUsers] = useState<RiskyUser[]>([]);
  const [chartPeriod, setChartPeriod] = useState<'WEEKLY' | 'MONTHLY' | 'SIX_MONTHS' | 'YEARLY'>('WEEKLY');

  // Load username
  const { userType } = useAuth(); // or pull full profile if available 

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [summaryRes, chartsRes, riskyRes] = await Promise.all([
          librarianDashboardService.getSummary(),
          librarianDashboardService.getCharts(chartPeriod),
          librarianDashboardService.getRiskyUsers(0, 5) // Lấy top 5
        ]);

        if (summaryRes.code === 200) setSummary(summaryRes.data);
        if (chartsRes.code === 200) setCharts(chartsRes.data);
        if (riskyRes.code === 200) setRiskyUsers(riskyRes.data.content || []);
        
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu trang Dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [chartPeriod]);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Calculate Max for chart
  const maxBorrow = charts?.weeklyBorrowReturnTrend?.reduce((max, d) => Math.max(max, d.borrowed, d.returned), 1) || 1;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tổng quan hệ thống</h1>
        <p className="text-slate-500">Giám sát tài nguyên thư viện và hoạt động độc giả</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase">
              Tổng số bản sao (Items)
            </p>
            <h3 className="text-3xl font-bold text-slate-900 mt-2">{summary?.overview.totalItems?.toLocaleString() || 0}</h3>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-2">
              <BookOpen size={14} /> Thuộc {summary?.overview.totalPublications?.toLocaleString() || 0} đầu sách
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <BookOpen size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase">
              Đang phân bổ / mượn
            </p>
            <h3 className="text-3xl font-bold text-indigo-600 mt-2">{charts?.itemStatusDistribution.borrowed?.toLocaleString() || 0}</h3>
            <p className="text-xs text-indigo-500 mt-2 font-medium">Hôm nay: mượn {summary?.todayActivity.borrowedToday} / trả {summary?.todayActivity.returnedToday}</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Clock size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase">
              Giao dịch quá hạn
            </p>
            <h3 className="text-3xl font-bold text-red-500 mt-2">{summary?.pendingActions.overdueTransactions || 0}</h3>
            <p className="text-xs text-red-500 mt-2 font-medium">
              +{summary?.todayActivity.overdueCount || 0} phát sinh hôm nay
            </p>
          </div>
          <div className="p-3 bg-red-50 text-red-500 rounded-lg">
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase">
              Độc giả hoạt động
            </p>
            <h3 className="text-3xl font-bold text-emerald-600 mt-2">{summary?.overview.activeUsers?.toLocaleString() || 0}</h3>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-2">
              <Users size={14} /> Trên tổng số {summary?.overview.totalUsers?.toLocaleString() || 0}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Users size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Section - Actual API rendering */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-lg text-slate-800">
              Xu hướng Mượn / Trả
            </h2>
            <select 
              className="text-sm border-slate-200 border rounded-lg px-2 py-1 outline-none text-slate-600 focus:ring-blue-500 focus:border-blue-500"
              value={chartPeriod}
              onChange={(e: any) => setChartPeriod(e.target.value)}
            >
              <option value="WEEKLY">Chi tiết 7 ngày qua</option>
              {/* Other options mocked down for API call */}
            </select>
          </div>

          <div className="h-64 flex items-end justify-between gap-4 px-2 mt-8">
            {charts?.weeklyBorrowReturnTrend?.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                 {/* Mượn - Cột Xanh Blue */}
                 <div className="w-full flex items-end gap-1 h-full relative">
                   <div className="w-1/2 bg-blue-400 hover:bg-blue-600 transition-all rounded-t-sm relative group" style={{ height: `${(d.borrowed / maxBorrow) * 100}%`, minHeight: '4px' }}>
                     <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 hidden md:block">
                       Mượn: {d.borrowed}
                     </div>
                   </div>
                   {/* Trả - Cột Tím Indigo */}
                   <div className="w-1/2 bg-indigo-300 hover:bg-indigo-500 transition-all rounded-t-sm relative group" style={{ height: `${(d.returned / maxBorrow) * 100}%`, minHeight: '4px' }}>
                     <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 hidden md:block">
                       Trả: {d.returned}
                     </div>
                   </div>
                 </div>
                 {/* Date Label (shortened) */}
                 <span className="text-[10px] md:text-xs text-slate-500 whitespace-nowrap">
                   {d.date.substring(5).replace('-', '/')}
                 </span>
              </div>
            ))}
            {(!charts?.weeklyBorrowReturnTrend || charts.weeklyBorrowReturnTrend.length === 0) && (
              <div className="w-full h-full flex justify-center items-center text-gray-400">Không có dữ liệu biểu đồ</div>
            )}
          </div>
          <div className="flex justify-center gap-6 mt-6 border-t border-slate-100 pt-4">
             <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-400 rounded-sm"></div><span className="text-xs text-slate-600">Sách được mượn</span></div>
             <div className="flex items-center gap-2"><div className="w-3 h-3 bg-indigo-300 rounded-sm"></div><span className="text-xs text-slate-600">Sách trả về</span></div>
          </div>
        </div>

        {/* Risky Users Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h2 className="font-bold text-rose-700 flex items-center">
              <ShieldAlert size={18} className="mr-2" /> Độc giả rủi ro cao
            </h2>
            <Link
              to="/librarian/users"
              className="text-xs text-blue-600 font-medium hover:underline"
            >
              Quản lý
            </Link>
          </div>
          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
            {riskyUsers.length === 0 ? (
               <div className="p-6 text-center text-slate-500">
                 Không có độc giả nào vượt mức cảnh báo.
               </div>
            ) : (
              riskyUsers.map((user, i) => (
                <div key={user.userId} className="p-4 flex flex-col gap-2 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 text-slate-500 font-bold overflow-hidden border border-slate-300">
                         {user.profilePictureUrl ? <img src={user.profilePictureUrl} className="w-full h-full object-cover"/> : user.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{user.fullName}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                    <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                      Điểm: {user.creditScore}
                    </span>
                  </div>
                  <div className="pl-11 grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-600 mt-1">
                    <p>Quá hạn: <strong className="text-rose-600">{user.riskyMetrics.overdueCount}</strong></p>
                    <p>Làm hỏng/mất: <strong>{user.riskyMetrics.damagedCount}</strong></p>
                    <p className="col-span-2">Nợ phạt: <strong className="text-amber-600">{user.riskyMetrics.totalUnpaidAmount.toLocaleString()} VNĐ</strong> ({user.riskyMetrics.unpaidFineCount} đơn)</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-3 border-t border-slate-100 bg-slate-50 mt-auto">
            <Link to="/librarian/users" className="w-full py-1 text-sm text-slate-600 font-medium hover:text-blue-600 flex items-center justify-center gap-1">
              Xem toàn bộ danh sách <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Links Section */}
      <div>
        <h2 className="font-bold text-lg text-slate-800 mb-4">
          Xử lý tác vụ nhanh & Fines ({summary?.pendingActions?.waitingForPickup || 0} đơn chờ lấy)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            to="/librarian/circulation"
            className="p-4 bg-blue-50 rounded-xl border border-blue-100 hover:shadow-md transition-all flex items-center gap-4 group"
          >
            <div className="bg-white p-3 rounded-lg text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <BookOpen size={20} />
            </div>
            <span className="font-medium text-slate-700">Mượn sách mới</span>
          </Link>
          <Link
            to="/librarian/circulation"
            className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 hover:shadow-md transition-all flex items-center gap-4 group"
          >
            <div className="bg-white p-3 rounded-lg text-indigo-600 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <TrendingUp size={20} />
            </div>
            <span className="font-medium text-slate-700">Trả sách nhanh</span>
          </Link>
          <Link
            to="/librarian/books"
            className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 hover:shadow-md transition-all flex items-center gap-4 group"
          >
            <div className="bg-white p-3 rounded-lg text-emerald-600 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <BookOpen size={20} />
            </div>
            <span className="font-medium text-slate-700">Thêm đầu sách</span>
          </Link>
          <Link
            to="/librarian/requests"
            className="p-4 bg-orange-50 rounded-xl border border-orange-100 hover:shadow-md transition-all flex items-center gap-4 group relative"
          >
            <div className="bg-white p-3 rounded-lg text-orange-600 shadow-sm group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <AlertTriangle size={20} />
            </div>
            <span className="font-medium text-slate-700 flex-1">Xử lý yêu cầu phạt</span>
            {summary?.pendingActions.overdueTransactions ? (
               <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{summary.pendingActions.overdueTransactions}</span>
            ) : null}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
