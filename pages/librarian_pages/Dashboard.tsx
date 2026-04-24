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

      {/* Group 1: Tài nguyên & Độc giả */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Tài nguyên & Độc giả</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Đầu sách */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-500 uppercase">Tổng đầu sách</p>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><BookOpen size={20} /></div>
            </div>
            <h3 className="text-3xl font-bold text-slate-900">{summary?.overview.totalPublications?.toLocaleString() || 0}</h3>
          </div>

          {/* Card 2: Bản sao */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-500 uppercase">Bản sao (Items)</p>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><BookOpen size={20} /></div>
            </div>
            <h3 className="text-3xl font-bold text-indigo-600">{summary?.overview.availableItems?.toLocaleString() || 0} <span className="text-sm text-slate-400 font-normal">/ {summary?.overview.totalItems?.toLocaleString() || 0} sẵn sàng</span></h3>
          </div>

          {/* Card 3: Độc giả */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-500 uppercase">Độc giả</p>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Users size={20} /></div>
            </div>
            <h3 className="text-3xl font-bold text-emerald-600">{summary?.overview.activeUsers?.toLocaleString() || 0} <span className="text-sm text-slate-400 font-normal">/ {summary?.overview.totalUsers?.toLocaleString() || 0} active</span></h3>
          </div>

          {/* Card 4: Tiền phạt */}
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

      {/* Group 2: Hoạt động & Tác vụ */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Hoạt động trong ngày & Cần xử lý</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 5: Giao dịch hôm nay */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-500 uppercase">Giao dịch (Hôm nay)</p>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><TrendingUp size={20} /></div>
            </div>
            <div className="flex gap-6">
              <div>
                <h3 className="text-2xl font-bold text-emerald-600">{summary?.todayTransaction.borrowedToday || 0}</h3>
                <p className="text-xs text-slate-500">Đã mượn</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-indigo-600">{summary?.todayTransaction.returnedToday || 0}</h3>
                <p className="text-xs text-slate-500">Đã trả</p>
              </div>
            </div>
          </div>

          {/* Card 6: Chờ lấy & Đặt trước */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-500 uppercase">Yêu cầu mượn</p>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Clock size={20} /></div>
            </div>
            <div className="flex gap-6">
              <div>
                <h3 className="text-2xl font-bold text-amber-600">{summary?.pendingActions.waitingForPickup || 0}</h3>
                <p className="text-xs text-slate-500">Chờ lấy sách</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-amber-600">{summary?.pendingActions.reservationsPending || 0}</h3>
                <p className="text-xs text-slate-500">Đặt trước</p>
              </div>
            </div>
          </div>

          {/* Card 7: Quá hạn */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-500 uppercase">Quá hạn</p>
              <div className="p-2 bg-red-50 text-red-600 rounded-lg"><AlertTriangle size={20} /></div>
            </div>
            <div className="flex gap-6">
              <div>
                <h3 className="text-2xl font-bold text-red-600">{summary?.pendingActions.overdueTransactions || 0}</h3>
                <p className="text-xs text-slate-500">Tổng đang trễ</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-red-500">+{summary?.todayTransaction.newlyOverdueToday || 0}</h3>
                <p className="text-xs text-slate-500">Phát sinh hôm nay</p>
              </div>
            </div>
          </div>

          {/* Card 8: Rủi ro khác */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-500 uppercase">Sự cố (Hôm nay)</p>
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><ShieldAlert size={20} /></div>
            </div>
            <div className="flex gap-6">
              <div>
                <h3 className="text-2xl font-bold text-orange-600">{summary?.todayTransaction.damagedToday || 0}</h3>
                <p className="text-xs text-slate-500">Hỏng</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-orange-600">{summary?.todayTransaction.lostToday || 0}</h3>
                <p className="text-xs text-slate-500">Mất</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Group 3: Độc giả rủi ro cao */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center">
            <ShieldAlert size={20} className="mr-2 text-rose-600" /> Độc giả cần lưu ý (Rủi ro cao)
          </h2>
          <Link to="/librarian/users" className="text-sm text-blue-600 hover:underline font-medium flex items-center gap-1">
            Xem tất cả độc giả <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {riskyUsers.length === 0 ? (
            <div className="col-span-full bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500">
              Hiện tại không có độc giả nào nằm trong danh sách cảnh báo.
            </div>
          ) : (
            riskyUsers.map((user) => (
              <div key={user.userId} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-rose-200 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden">
                    {user.profilePictureUrl ? <img src={user.profilePictureUrl} className="w-full h-full object-cover" alt=""/> : <span className="font-bold text-slate-400">{user.fullName.charAt(0)}</span>}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-slate-800 truncate">{user.fullName}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Điểm uy tín</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${user.creditScore < 50 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                    {user.creditScore}
                  </span>
                </div>
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Quá hạn:</span>
                    <span className="font-bold text-rose-600">{user.riskyMetrics.overdueCount} lần</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Sự cố sách:</span>
                    <span className="font-bold text-slate-700">{user.riskyMetrics.damagedCount} lần</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Nợ phạt:</span>
                    <span className="font-bold text-amber-600">{user.riskyMetrics.totalUnpaidAmount.toLocaleString()}đ</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Group 4: Phân tích & Thống kê */}
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
                  chartPeriod === p.id 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {/* Row 1: Full Width Trend Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col w-full">
            <div className="mb-6">
              <h3 className="font-bold text-slate-800 text-lg">Xu hướng Mượn / Trả</h3>
              <p className="text-sm text-slate-500">Dữ liệu biến động chi tiết trong {chartPeriod === 'WEEKLY' ? '7 ngày' : chartPeriod === 'MONTHLY' ? '30 ngày' : chartPeriod === 'SIX_MONTHS' ? '6 tháng' : '1 năm'} qua</p>
            </div>

            <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
              <div 
                className="h-72 flex items-end justify-between px-2 mt-4 min-w-[600px] lg:min-w-0"
                style={{ gap: chartPeriod === 'MONTHLY' || chartPeriod === 'YEARLY' ? '4px' : '12px' }}
              >
                {charts?.weeklyBorrowReturnTrend?.map((d, i) => {
                  const showLabel = 
                    chartPeriod === 'WEEKLY' || 
                    (chartPeriod === 'MONTHLY' && i % 5 === 0) || 
                    (chartPeriod === 'SIX_MONTHS') ||
                    (chartPeriod === 'YEARLY' && i % 2 === 0) ||
                    i === (charts?.weeklyBorrowReturnTrend?.length || 0) - 1;

                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                      <div className="w-full flex items-end gap-px h-full relative">
                        <div className="w-1/2 bg-blue-400 hover:bg-blue-600 transition-all rounded-t-[2px] relative group" style={{ height: `${(d.borrowed / maxBorrow) * 100}%`, minHeight: '2px' }}>
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 hidden md:block whitespace-nowrap shadow-lg">
                            Mượn: {d.borrowed} ({d.date})
                          </div>
                        </div>
                        <div className="w-1/2 bg-indigo-300 hover:bg-indigo-500 transition-all rounded-t-[2px] relative group" style={{ height: `${(d.returned / maxBorrow) * 100}%`, minHeight: '2px' }}>
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 hidden md:block whitespace-nowrap shadow-lg">
                            Trả: {d.returned} ({d.date})
                          </div>
                        </div>
                      </div>
                      <div className="h-6 flex items-start justify-center">
                        {showLabel && (
                          <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">
                            {chartPeriod === 'WEEKLY' || chartPeriod === 'MONTHLY' 
                              ? d.date.substring(8) 
                              : d.date.substring(5)}
                          </span>
                        )}
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

          {/* Row 2: Secondary Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Top Borrowed Publications */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="mb-6">
                <h3 className="font-bold text-slate-800">Sách mượn nhiều nhất</h3>
                <p className="text-xs text-slate-500">Top 5 đầu sách trong {chartPeriod === 'WEEKLY' ? '7 ngày' : chartPeriod === 'MONTHLY' ? '30 ngày' : chartPeriod === 'SIX_MONTHS' ? '6 tháng' : '1 năm'} qua</p>
              </div>
              <div className="space-y-5">
                {charts?.topBorrowedPublications.map((pub, i) => {
                  const maxCount = charts.topBorrowedPublications[0]?.borrowCount || 1;
                  return (
                    <div key={pub.publicationId} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-slate-700 truncate max-w-[180px]" title={pub.title}>{pub.title}</span>
                        <span className="text-slate-500 font-bold">{pub.borrowCount} lượt</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full rounded-full transition-all duration-1000" 
                          style={{ width: `${(pub.borrowCount / maxCount) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
                {(!charts?.topBorrowedPublications || charts.topBorrowedPublications.length === 0) && (
                  <div className="py-10 text-center text-slate-400 text-sm">Chưa có dữ liệu mượn sách</div>
                )}
              </div>
            </div>

            {/* Item Status Distribution */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="mb-6">
                <h3 className="font-bold text-slate-800">Trạng thái bản sao</h3>
                <p className="text-xs text-slate-500">Dữ liệu thực tế tại thời điểm hiện tại</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    {(() => {
                      const data = charts?.itemStatusDistribution || { available: 0, borrowed: 0, reserved: 0, inMaintenance: 0, lost: 0 };
                      const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;
                      let cumulativePercent = 0;
                      
                      const colors = {
                        available: '#10b981', 
                        borrowed: '#3b82f6',  
                        reserved: '#f59e0b',  
                        inMaintenance: '#6366f1', 
                        lost: '#ef4444'      
                      };

                      return Object.entries(data).map(([key, value]) => {
                        const percent = (value / total) * 100;
                        if (percent === 0) return null;
                        const strokeDasharray = `${percent} ${100 - percent}`;
                        const strokeDashoffset = -cumulativePercent;
                        cumulativePercent += percent;
                        
                        return (
                          <circle
                            key={key}
                            cx="18"
                            cy="18"
                            r="15.915"
                            fill="transparent"
                            stroke={colors[key as keyof typeof colors]}
                            strokeWidth="4"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-500"
                          />
                        );
                      });
                    })()}
                    <circle cx="18" cy="18" r="12" fill="white" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-slate-800">
                      {Object.values(charts?.itemStatusDistribution || {}).reduce((a, b) => a + b, 0)}
                    </span>
                    <span className="text-[8px] text-slate-500 uppercase font-medium text-center leading-tight">Tổng<br/>bản sao</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-6 w-full">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                    <span className="text-[11px] text-slate-600 truncate">Sẵn sàng ({charts?.itemStatusDistribution.available})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                    <span className="text-[11px] text-slate-600 truncate">Đang mượn ({charts?.itemStatusDistribution.borrowed})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                    <span className="text-[11px] text-slate-600 truncate">Đặt trước ({charts?.itemStatusDistribution.reserved})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                    <span className="text-[11px] text-slate-600 truncate">Bảo trì ({charts?.itemStatusDistribution.inMaintenance})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                    <span className="text-[11px] text-slate-600 truncate">Đã mất ({charts?.itemStatusDistribution.lost})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fine Type Distribution */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="mb-6">
                <h3 className="font-bold text-slate-800">Phân bổ vi phạm</h3>
                <p className="text-xs text-slate-500">Thống kê trong {chartPeriod === 'WEEKLY' ? '7 ngày' : chartPeriod === 'MONTHLY' ? '30 ngày' : chartPeriod === 'SIX_MONTHS' ? '6 tháng' : '1 năm'} qua</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    {(() => {
                      const data = charts?.fineTypeDistribution || { overdueReturn: 0, damagedBook: 0, lostBook: 0 };
                      const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;
                      let cumulativePercent = 0;
                      
                      const colors = {
                        overdueReturn: '#f59e0b',
                        damagedBook: '#f97316',
                        lostBook: '#ef4444'
                      };

                      return Object.entries(data).map(([key, value]) => {
                        const percent = (value / total) * 100;
                        if (percent === 0) return null;
                        const strokeDasharray = `${percent} ${100 - percent}`;
                        const strokeDashoffset = -cumulativePercent;
                        cumulativePercent += percent;
                        
                        return (
                          <circle
                            key={key}
                            cx="18"
                            cy="18"
                            r="15.915"
                            fill="transparent"
                            stroke={colors[key as keyof typeof colors]}
                            strokeWidth="8"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-500"
                          />
                        );
                      });
                    })()}
                  </svg>
                </div>
                
                <div className="space-y-3 mt-8 w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <span className="text-xs text-slate-600">Trả trễ</span>
                    </div>
                    <span className="text-xs font-bold text-slate-700">{charts?.fineTypeDistribution.overdueReturn}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span className="text-xs text-slate-600">Làm hỏng sách</span>
                    </div>
                    <span className="text-xs font-bold text-slate-700">{charts?.fineTypeDistribution.damagedBook}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-xs text-slate-600">Làm mất sách</span>
                    </div>
                    <span className="text-xs font-bold text-slate-700">{charts?.fineTypeDistribution.lostBook}</span>
                  </div>
                </div>
              </div>
            </div>
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
