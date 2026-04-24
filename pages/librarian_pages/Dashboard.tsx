import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Clock,
  TrendingUp,
  Users,
  ShieldAlert,
  Phone,
  Mail,
  User as UserIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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

  // Tooltip state
  const [hoveredData, setHoveredData] = useState<{
    x: number;
    y: number;
    date: string;
    borrowed: number;
    returned: number;
  } | null>(null);

  // Load username
  const { userType } = useAuth(); 

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [summaryRes, chartsRes, riskyRes] = await Promise.all([
          librarianDashboardService.getSummary(),
          librarianDashboardService.getCharts(chartPeriod),
          librarianDashboardService.getRiskyUsers(0, 5) // Lấy top 5 rủi ro nhất
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

  const handleMouseEnter = (e: React.MouseEvent, data: any) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredData({
      x: rect.left + rect.width / 2,
      y: rect.top,
      ...data
    });
  };

  const handleMouseLeave = () => {
    setHoveredData(null);
  };

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
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in relative">
      {/* Portal Tooltip */}
      {hoveredData && createPortal(
        <div 
          className="fixed z-[9999] pointer-events-none"
          style={{ 
            left: `${hoveredData.x}px`, 
            top: `${hoveredData.y}px`,
            transform: 'translate(-50%, -115%)',
          }}
        >
          <div className="bg-slate-900 text-white text-[11px] py-2.5 px-4 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-700 min-w-[140px] animate-in fade-in zoom-in duration-200">
            <p className="font-bold border-b border-white/10 pb-2 mb-2 text-blue-200">{hoveredData.date}</p>
            <div className="space-y-1.5">
              <div className="flex justify-between gap-6">
                <span className="text-slate-400">Đã mượn:</span>
                <span className="font-bold text-blue-400">{hoveredData.borrowed}</span>
              </div>
              <div className="flex justify-between gap-6">
                <span className="text-slate-400">Đã trả:</span>
                <span className="font-bold text-indigo-300">{hoveredData.returned}</span>
              </div>
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[8px] border-transparent border-t-slate-900"></div>
          </div>
        </div>,
        document.body
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tổng quan hệ thống</h1>
        <p className="text-slate-500">Giám sát tài nguyên thư viện và hoạt động độc giả</p>
      </div>

      {/* Group 1: Tài nguyên & Độc giả */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Tài nguyên & Độc giả</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-500 uppercase">Tổng đầu sách</p>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><BookOpen size={20} /></div>
            </div>
            <h3 className="text-3xl font-bold text-slate-900">{summary?.overview.totalPublications?.toLocaleString() || 0}</h3>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-500 uppercase">Bản sao (Items)</p>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><BookOpen size={20} /></div>
            </div>
            <h3 className="text-3xl font-bold text-indigo-600">{summary?.overview.availableItems?.toLocaleString() || 0} <span className="text-sm text-slate-400 font-normal">/ {summary?.overview.totalItems?.toLocaleString() || 0} sẵn sàng</span></h3>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-500 uppercase">Độc giả</p>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Users size={20} /></div>
            </div>
            <h3 className="text-3xl font-bold text-emerald-600">{summary?.overview.activeUsers?.toLocaleString() || 0} <span className="text-sm text-slate-400 font-normal">/ {summary?.overview.totalUsers?.toLocaleString() || 0} active</span></h3>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-500 uppercase">Nợ tiền phạt</p>
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><AlertTriangle size={20} /></div>
            </div>
            <h3 className="text-2xl font-bold text-rose-600">{summary?.fineSummary.totalUnpaidAmount?.toLocaleString() || 0}đ</h3>
            <p className="text-xs text-slate-500 mt-1">{summary?.fineSummary.unpaidFineCount || 0} đơn chưa thu (Thu hôm nay: {summary?.fineSummary.collectedToday?.toLocaleString() || 0}đ)</p>
          </div>
        </div>
      </div>

      {/* Group 2: Hoạt động trong ngày */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Hoạt động trong ngày & Cần xử lý</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-500 uppercase">Giao dịch (Hôm nay)</p>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><TrendingUp size={20} /></div>
            </div>
            <div className="flex gap-6">
              <div><h3 className="text-2xl font-bold text-emerald-600">{summary?.todayTransaction.borrowedToday || 0}</h3><p className="text-xs text-slate-500">Đã mượn</p></div>
              <div><h3 className="text-2xl font-bold text-indigo-600">{summary?.todayTransaction.returnedToday || 0}</h3><p className="text-xs text-slate-500">Đã trả</p></div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-500 uppercase">Yêu cầu mượn</p>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Clock size={20} /></div>
            </div>
            <div className="flex gap-6">
              <div><h3 className="text-2xl font-bold text-amber-600">{summary?.pendingActions.waitingForPickup || 0}</h3><p className="text-xs text-slate-500">Chờ lấy sách</p></div>
              <div><h3 className="text-2xl font-bold text-amber-600">{summary?.pendingActions.reservationsPending || 0}</h3><p className="text-xs text-slate-500">Đặt trước</p></div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-500 uppercase">Quá hạn</p>
              <div className="p-2 bg-red-50 text-red-600 rounded-lg"><AlertTriangle size={20} /></div>
            </div>
            <div className="flex gap-6">
              <div><h3 className="text-2xl font-bold text-red-600">{summary?.pendingActions.overdueTransactions || 0}</h3><p className="text-xs text-slate-500">Tổng đang trễ</p></div>
              <div><h3 className="text-2xl font-bold text-red-500">+{summary?.todayTransaction.newlyOverdueToday || 0}</h3><p className="text-xs text-slate-500">Phát sinh hôm nay</p></div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-500 uppercase">Sự cố (Hôm nay)</p>
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><ShieldAlert size={20} /></div>
            </div>
            <div className="flex gap-6">
              <div><h3 className="text-2xl font-bold text-orange-600">{summary?.todayTransaction.damagedToday || 0}</h3><p className="text-xs text-slate-500">Hỏng</p></div>
              <div><h3 className="text-2xl font-bold text-orange-600">{summary?.todayTransaction.lostToday || 0}</h3><p className="text-xs text-slate-500">Mất</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Group 3: Độc giả rủi ro cao - Hiển thị TẤT CẢ các trường */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center">
            <ShieldAlert size={20} className="mr-2 text-rose-600" /> Độc giả cần lưu ý (Dữ liệu rủi ro chi tiết)
          </h2>
          <Link to="/librarian/users" className="text-sm text-blue-600 hover:underline font-medium flex items-center gap-1">
            Quản lý độc giả <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {riskyUsers.length === 0 ? (
            <div className="col-span-full bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500">
              Hiện tại không có độc giả nào nằm trong danh sách cảnh báo.
            </div>
          ) : (
            riskyUsers.map((user) => (
              <div key={user.userId} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-rose-300 hover:shadow-lg transition-all flex flex-col h-full relative overflow-hidden group">
                {/* Background Decoration */}
                <div className={`absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 rounded-full opacity-10 transition-transform group-hover:scale-150 ${user.creditScore < 50 ? 'bg-rose-600' : 'bg-amber-600'}`}></div>
                
                {/* User Header */}
                <div className="flex items-center gap-4 mb-4 relative">
                  <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border-2 border-white shadow-sm overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                    {user.profilePictureUrl ? <img src={user.profilePictureUrl} className="w-full h-full object-cover" alt=""/> : <UserIcon size={24} className="text-slate-400" />}
                  </div>
                  <div className="overflow-hidden flex-1">
                    <p className="text-base font-bold text-slate-800 truncate leading-tight mb-1">{user.fullName}</p>
                    <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 w-fit px-1.5 py-0.5 rounded text-[10px] font-bold">
                      <BookOpen size={10} />
                      <span className="truncate">{user.studentId || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-1.5 mb-5 text-[11px] text-slate-600 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 truncate">
                    <Mail size={12} className="text-slate-400 shrink-0" />
                    <span className="truncate" title={user.email}>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={12} className="text-slate-400 shrink-0" />
                    <span>{user.phoneNumber || "Chưa cập nhật SĐT"}</span>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex justify-between items-end mb-5">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Xếp loại rủi ro</span>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-tight shadow-sm ${
                      user.creditScore < 50 ? 'bg-rose-600 text-white' : 
                      user.creditScore < 80 ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'
                    }`}>
                      {user.creditScore < 50 ? 'Rất rủi ro' : user.creditScore < 80 ? 'Cảnh báo' : 'Theo dõi'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1 text-right">Điểm uy tín</span>
                    <span className={`text-2xl font-black italic ${user.creditScore < 50 ? 'text-rose-600' : 'text-amber-600'}`}>
                      {user.creditScore}<span className="text-[10px] font-normal text-slate-400 ml-0.5">/100</span>
                    </span>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 mt-auto">
                  <div className="bg-rose-50 p-2 rounded-lg border border-rose-100">
                    <p className="text-[9px] text-rose-500 font-bold uppercase mb-0.5">Quá hạn</p>
                    <p className="text-sm font-black text-rose-700">{user.riskyMetrics.overdueCount} <span className="text-[10px] font-normal">đơn</span></p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <p className="text-[9px] text-slate-500 font-bold uppercase mb-0.5">Sự cố sách</p>
                    <p className="text-sm font-black text-slate-700">{user.riskyMetrics.damagedCount} <span className="text-[10px] font-normal">lần</span></p>
                  </div>
                  <div className="col-span-2 bg-amber-50 p-2 rounded-lg border border-amber-100 flex justify-between items-center">
                    <div>
                      <p className="text-[9px] text-amber-600 font-bold uppercase">Tổng tiền nợ phạt</p>
                      <p className="text-sm font-black text-amber-700">{user.riskyMetrics.totalUnpaidAmount.toLocaleString()} VNĐ</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-amber-600/70 bg-white/50 px-1.5 py-0.5 rounded shadow-sm">{user.riskyMetrics.unpaidFineCount} phiếu</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Group 4: Báo cáo phân tích dữ liệu */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Báo cáo phân tích dữ liệu</h2>
            <p className="text-sm text-slate-500">Thống kê hiệu suất và phân bổ tài nguyên theo giai đoạn</p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
            {[
              { id: 'WEEKLY', label: '7 ngày' },
              { id: 'MONTHLY', label: '30 ngày' },
              { id: 'SIX_MONTHS', label: '6 tháng' },
              { id: 'YEARLY', label: '1 năm' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setChartPeriod(p.id as any)}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  chartPeriod === p.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {/* Row 1: Trend Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col w-full relative">
            <div className="mb-6">
              <h3 className="font-bold text-slate-800 text-lg">Xu hướng Mượn / Trả</h3>
              <p className="text-sm text-slate-500">Dữ liệu biến động trong {chartPeriod === 'WEEKLY' ? '7 ngày' : chartPeriod === 'MONTHLY' ? '30 ngày' : chartPeriod === 'SIX_MONTHS' ? '6 tháng' : '1 năm'} qua</p>
            </div>
            <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
              <div 
                className="h-72 flex items-end justify-between px-2 mt-4 min-w-[600px] lg:min-w-0"
                style={{ gap: chartPeriod === 'MONTHLY' || chartPeriod === 'YEARLY' ? '4px' : '12px' }}
              >
                {charts?.weeklyBorrowReturnTrend?.map((d, i) => {
                  const showLabel = chartPeriod === 'WEEKLY' || (chartPeriod === 'MONTHLY' && i % 5 === 0) || (chartPeriod === 'SIX_MONTHS') || (chartPeriod === 'YEARLY' && i % 2 === 0) || i === (charts?.weeklyBorrowReturnTrend?.length || 0) - 1;
                  return (
                    <div 
                      key={i} 
                      className="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative"
                      onMouseEnter={(e) => handleMouseEnter(e, d)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="w-full flex items-end gap-px h-full relative cursor-pointer">
                        <div className="w-1/2 bg-blue-400 group-hover:bg-blue-500 transition-all rounded-t-[2px] shadow-sm" style={{ height: `${(d.borrowed / maxBorrow) * 100}%`, minHeight: '2px' }}></div>
                        <div className="w-1/2 bg-indigo-300 group-hover:bg-indigo-400 transition-all rounded-t-[2px] shadow-sm" style={{ height: `${(d.returned / maxBorrow) * 100}%`, minHeight: '2px' }}></div>
                      </div>
                      <div className="h-6 flex items-start justify-center">
                        {showLabel && <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">{chartPeriod === 'WEEKLY' || chartPeriod === 'MONTHLY' ? d.date.substring(8) : d.date.substring(5)}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-center gap-8 mt-6 border-t border-slate-100 pt-6">
              <div className="flex items-center gap-3"><div className="w-4 h-4 bg-blue-400 rounded-sm"></div><span className="text-sm font-medium text-slate-600">Sách được mượn</span></div>
              <div className="flex items-center gap-3"><div className="w-4 h-4 bg-indigo-300 rounded-sm"></div><span className="text-sm font-medium text-slate-600">Sách trả về</span></div>
            </div>
          </div>

          {/* Row 2: Grid Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Top Borrowed */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="mb-6"><h3 className="font-bold text-slate-800 text-lg">Sách mượn nhiều nhất</h3><p className="text-xs text-slate-500">Top 5 đầu sách</p></div>
              <div className="space-y-6">
                {charts?.topBorrowedPublications.map((pub) => {
                  const maxCount = charts.topBorrowedPublications[0]?.borrowCount || 1;
                  return (
                    <div key={pub.publicationId} className="flex gap-4 items-center group">
                      <div className="w-12 h-16 rounded-md bg-slate-100 border border-slate-200 overflow-hidden shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                        {pub.coverImageUrl ? <img src={pub.coverImageUrl} className="w-full h-full object-cover" alt={pub.title} /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><BookOpen size={20} /></div>}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex justify-between items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-700 truncate group-hover:text-blue-600 transition-colors">{pub.title}</h4>
                          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{pub.borrowCount} lượt</span>
                        </div>
                        <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden"><div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(37,99,235,0.2)]" style={{ width: `${(pub.borrowCount / maxCount) * 100}%` }}></div></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Item Status */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="mb-6"><h3 className="font-bold text-slate-800">Trạng thái bản sao</h3><p className="text-xs text-slate-500">Hiện tại</p></div>
              <div className="flex flex-col items-center">
                <div className="relative w-44 h-44">
                  <svg className="w-full h-full" viewBox="0 0 42 42">
                    {(() => {
                      const data = charts?.itemStatusDistribution || { available: 0, borrowed: 0, reserved: 0, inMaintenance: 0, lost: 0 };
                      const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;
                      let cumulativePercent = 0;
                      const colors = { available: '#10b981', borrowed: '#3b82f6', reserved: '#f59e0b', inMaintenance: '#6366f1', lost: '#ef4444' };
                      return Object.entries(data).map(([key, value]) => {
                        const percent = (value / total) * 100; if (percent === 0) return null;
                        const strokeDasharray = `${percent} ${100 - percent}`;
                        const strokeDashoffset = -cumulativePercent; cumulativePercent += percent;
                        return <circle key={key} cx="21" cy="21" r="15.915" fill="transparent" stroke={colors[key as keyof typeof colors]} strokeWidth="5" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} className="transition-all duration-500" />;
                      });
                    })()}
                    <circle cx="21" cy="21" r="13" fill="white" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-xl font-bold text-slate-800">{Object.values(charts?.itemStatusDistribution || {}).reduce((a, b) => a + b, 0)}</span><span className="text-[8px] text-slate-500 uppercase font-medium text-center leading-tight">Tổng bản sao</span></div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-6 w-full text-[11px] text-slate-600">
                   <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>Sẵn sàng ({charts?.itemStatusDistribution.available})</div>
                   <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div>Đang mượn ({charts?.itemStatusDistribution.borrowed})</div>
                   <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div>Đặt trước ({charts?.itemStatusDistribution.reserved})</div>
                   <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500"></div>Bảo trì ({charts?.itemStatusDistribution.inMaintenance})</div>
                   <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div>Đã mất ({charts?.itemStatusDistribution.lost})</div>
                </div>
              </div>
            </div>

            {/* Fine Types */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="mb-6"><h3 className="font-bold text-slate-800">Phân bổ vi phạm</h3><p className="text-xs text-slate-500">Thống kê kỳ báo cáo</p></div>
              <div className="flex flex-col items-center">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full" viewBox="0 0 42 42">
                    {(() => {
                      const data = charts?.fineTypeDistribution || { overdueReturn: 0, damagedBook: 0, lostBook: 0 };
                      const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;
                      let cumulativePercent = 0;
                      const colors = { overdueReturn: '#f59e0b', damagedBook: '#f97316', lostBook: '#ef4444' };
                      return Object.entries(data).map(([key, value]) => {
                        const percent = (value / total) * 100; if (percent === 0) return null;
                        const strokeDasharray = `${percent} ${100 - percent}`;
                        const strokeDashoffset = -cumulativePercent; cumulativePercent += percent;
                        return <circle key={key} cx="21" cy="21" r="15.915" fill="transparent" stroke={colors[key as keyof typeof colors]} strokeWidth="8" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} className="transition-all duration-500" />;
                      });
                    })()}
                  </svg>
                </div>
                <div className="space-y-3 mt-8 w-full">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div>Trả trễ</div>
                    <span className="font-bold text-slate-700">{charts?.fineTypeDistribution.overdueReturn}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div>Hỏng sách</div>
                    <span className="font-bold text-slate-700">{charts?.fineTypeDistribution.damagedBook}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div>Mất sách</div>
                    <span className="font-bold text-slate-700">{charts?.fineTypeDistribution.lostBook}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links Section */}
      <div>
        <h2 className="font-bold text-lg text-slate-800 mb-4">Xử lý tác vụ nhanh & Fines ({summary?.pendingActions?.waitingForPickup || 0} đơn chờ lấy)</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link to="/librarian/circulation" className="p-4 bg-blue-50 rounded-xl border border-blue-100 hover:shadow-md transition-all flex items-center gap-4 group">
            <div className="bg-white p-3 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors"><BookOpen size={20} /></div>
            <span className="font-medium text-slate-700">Mượn sách mới</span>
          </Link>
          <Link to="/librarian/circulation" className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 hover:shadow-md transition-all flex items-center gap-4 group">
            <div className="bg-white p-3 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors"><TrendingUp size={20} /></div>
            <span className="font-medium text-slate-700">Trả sách nhanh</span>
          </Link>
          <Link to="/librarian/books" className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 hover:shadow-md transition-all flex items-center gap-4 group">
            <div className="bg-white p-3 rounded-lg text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors"><BookOpen size={20} /></div>
            <span className="font-medium text-slate-700">Thêm đầu sách</span>
          </Link>
          <Link to="/librarian/requests" className="p-4 bg-orange-50 rounded-xl border border-orange-100 hover:shadow-md transition-all flex items-center gap-4 group relative">
            <div className="bg-white p-3 rounded-lg text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors"><AlertTriangle size={20} /></div>
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
