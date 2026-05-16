import React from 'react';
import { Search, Filter, Bell, MoreVertical, CheckCircle, XCircle, Clock } from 'lucide-react';

const Requests = () => {
  const requests = [
    {
      id: 1,
      user: { name: 'Trần Minh Hoàng', id: 'SV2021001234' },
      book: { title: 'Deep Learning with PyTorch', author: 'Eli Stevens, Luca Antiga' },
      date: '10/12/2025',
      status: 'Mới',
      actionState: 'Pending'
    },
    {
      id: 2,
      user: { name: 'Nguyễn Thu Hà', id: 'SV2020005678' },
      book: { title: 'Pharmacology for Nurses', author: 'Michael Adams, Norman Holland' },
      date: '09/12/2025',
      status: 'Đang xử lý',
      actionState: 'Reviewing'
    },
    {
      id: 3,
      user: { name: 'Lê Văn Đức', id: 'SV2021002456' },
      book: { title: 'Principles of Macroeconomics', author: 'N. Gregory Mankiw' },
      date: '08/12/2025',
      status: 'Đã chấp nhận',
      actionState: 'Accepted'
    },
     {
      id: 4,
      user: { name: 'Phạm Mai Anh', id: 'SV2020003789' },
      book: { title: 'The Design of Everyday Things', author: 'Don Norman' },
      date: '07/12/2025',
      status: 'Mới',
      actionState: 'Pending'
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Yêu cầu từ độc giả</h1>
          <p className="text-slate-500">Quản lý các yêu cầu mua sách, gia hạn và khiếu nại</p>
        </div>
        <div className="flex items-center gap-4">
           <button className="p-2 text-slate-400 hover:text-slate-600"><Bell /></button>
           <button className="p-2 text-slate-400 hover:text-slate-600"><MoreVertical /></button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          <button className="py-4 px-2 text-blue-600 font-medium border-b-2 border-blue-600 flex items-center gap-2">
            Yêu cầu đặt sách <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">8</span>
          </button>
           <button className="py-4 px-2 text-slate-500 font-medium hover:text-slate-700 flex items-center gap-2">
            Yêu cầu gia hạn
          </button>
           <button className="py-4 px-2 text-slate-500 font-medium hover:text-slate-700 flex items-center gap-2">
            Khiếu nại / Báo lỗi
          </button>
        </nav>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm theo tên tài liệu hoặc người yêu cầu..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div className="flex gap-2">
          <select className="px-4 py-2 border border-slate-200 rounded-lg outline-none bg-white text-slate-600 text-sm">
            <option>Tất cả trạng thái</option>
            <option>Mới</option>
            <option>Đang xử lý</option>
          </select>
          <button className="bg-secondary text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-indigo-700">
            <Filter size={16} /> Lọc
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 w-12"><input type="checkbox" className="rounded border-gray-300" /></th>
              <th className="px-6 py-4 font-semibold">Người yêu cầu</th>
              <th className="px-6 py-4 font-semibold">Tên tài liệu đề xuất</th>
              <th className="px-6 py-4 font-semibold">Ngày gửi</th>
              <th className="px-6 py-4 font-semibold">Trạng thái</th>
              <th className="px-6 py-4 font-semibold text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4"><input type="checkbox" className="rounded border-gray-300" /></td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-semibold">
                      {req.user.name.split(' ').slice(-2).map(part => part[0]).join('')}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">{req.user.name}</div>
                      <div className="text-xs text-slate-500">{req.user.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-slate-900">{req.book.title}</div>
                  <div className="text-xs text-slate-500">{req.book.author}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{req.date}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${req.status === 'Mới' ? 'bg-blue-100 text-blue-700' : 
                      req.status === 'Đang xử lý' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${req.status === 'Mới' ? 'bg-blue-500' : req.status === 'Đang xử lý' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                    {req.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {req.actionState === 'Pending' && (
                    <span className="inline-flex items-center px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-full border border-yellow-100">Đang xử lý</span>
                  )}
                  {req.actionState === 'Reviewing' && (
                    <div className="flex justify-end gap-2">
                       <button className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-medium rounded transition-colors flex items-center gap-1">
                         Chấp nhận
                       </button>
                       <button className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium rounded transition-colors flex items-center gap-1">
                         Từ chối
                       </button>
                    </div>
                  )}
                  {req.actionState === 'Accepted' && (
                     <span className="inline-flex items-center px-3 py-1 bg-white text-slate-500 text-xs hover:text-blue-600 cursor-pointer">Xem chi tiết</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
         {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-white">
           <span className="text-sm text-slate-500">Hiển thị 1-4 trong 8 yêu cầu</span>
           <div className="flex items-center gap-2">
             <button className="px-3 py-1 border border-slate-200 rounded text-sm text-slate-600 hover:bg-slate-50">Trước</button>
             <button className="w-8 h-8 flex items-center justify-center rounded bg-secondary text-white text-sm">1</button>
             <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-600 text-sm hover:bg-slate-50">2</button>
             <button className="px-3 py-1 border border-slate-200 rounded text-sm text-slate-600 hover:bg-slate-50">Sau</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Requests;
