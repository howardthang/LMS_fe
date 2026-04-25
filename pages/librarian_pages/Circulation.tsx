import {
  AlertTriangle,
  BookOpen,
  CalendarCheck,
  CheckCircle,
  Clock,
  FileSpreadsheet,
  LayoutDashboard,
  Printer,
  RotateCcw,
  Scan,
  Search,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Transaction, User } from '../../types';
import transactionsService, { LookupResponse } from '../../api/transactionsService';

const Circulation = () => {
  const [activeTab, setActiveTab] = useState<
    'borrow' | 'return' | 'renew' | 'lost'
  >('borrow');
  const [selectedUser, setSelectedUser] = useState<boolean>(true); // Simulate user selected by default
  const [selectedItemForReport, setSelectedItemForReport] = useState<
    string | null
  >(null);

  const [mssvInput, setMssvInput] = useState('');
  const [scanInput, setScanInput] = useState('');
  const [lookupResult, setLookupResult] = useState<LookupResponse['data'] | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmSuccessData, setConfirmSuccessData] = useState<{ dueDate: string; fullName: string; publicationTitle: string } | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const handleLookup = async () => {
    if (!scanInput.trim()) return;
    setIsLookingUp(true);
    setLookupResult(null);
    setLookupError(null);
    setConfirmSuccessData(null);
    try {
      let params: any = {};
      if (/^\d+$/.test(scanInput.trim())) {
        params = { transactionId: scanInput.trim() };
      } else {
        if (!mssvInput.trim()) {
          setLookupError('Vui lòng nhập MSSV ở ô "Mã độc giả" trước khi quét barcode sách.');
          return;
        }
        params = { studentId: mssvInput.trim(), barcode: scanInput.trim() };
      }
      const response = await transactionsService.lookup(params);
      if (response.data) {
        setLookupResult(response.data);
      } else {
        setLookupError('Không tìm thấy phiếu mượn hoặc đã hết hạn.');
      }
    } catch (error: any) {
      if (error.status === 404) {
        setLookupError('Không tìm thấy phiếu mượn hoặc đã hết hạn.');
      } else {
        setLookupError(error.message || 'Lỗi tra cứu giao dịch.');
      }
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleConfirmPickup = async () => {
    if (!lookupResult) return;
    setIsConfirming(true);
    try {
      const response = await transactionsService.confirmPickup(lookupResult.transactionId);
      if (response.code === 200) {
        setConfirmSuccessData({
          dueDate: response.data.dueDate,
          fullName: lookupResult.fullName,
          publicationTitle: lookupResult.publicationTitle,
        });
        setLookupResult(null);
        setScanInput('');
      }
    } catch (error: any) {
      setLookupError(error.message || 'Lỗi xác nhận giao sách.');
      setLookupResult(null);
    } finally {
      setIsConfirming(false);
    }
  };

  // Mock Data
  const currentUser: User = {
    id: '2021050123',
    name: 'Trần Minh Thắng',
    studentId: '2021050123',
    department: 'Công nghệ Thông tin',
    avatar: 'https://picsum.photos/id/64/100/100',
    stats: {
      borrowing: 3,
      overdue: 1,
      fines: 45000,
    },
  };

  const borrowedBooks = [
    {
      id: 'ITM-001',
      title: 'Machine Learning Basics',
      dueDate: '15/12/2025',
      status: 'Normal',
    },
    {
      id: 'ITM-002',
      title: 'Python for Data Science',
      dueDate: '10/12/2025',
      status: 'Overdue',
    },
    {
      id: 'ITM-003',
      title: 'Introduction to Algorithms',
      dueDate: '20/12/2025',
      status: 'Normal',
    },
  ];

  const recentTransactions: Transaction[] = [
    {
      id: 'TX001',
      time: '11:23 AM',
      date: '11/12/2025',
      user: {
        name: 'Lê Thị Hương',
        id: '2021050456',
        avatar: 'https://picsum.photos/id/32/40/40',
      },
      item: { code: 'ITEM005678', title: 'Python for Data Science' },
      type: 'Borrow',
      status: 'Success',
    },
    {
      id: 'TX002',
      time: '11:18 AM',
      date: '11/12/2025',
      user: {
        name: 'Phạm Văn Nam',
        id: '2020050123',
        avatar: 'https://picsum.photos/id/55/40/40',
      },
      item: { code: 'ITEM003421', title: 'Deep Learning Fundamentals' },
      type: 'Return',
      status: 'Success',
    },
    {
      id: 'TX003',
      time: '11:05 AM',
      date: '11/12/2025',
      user: {
        name: 'Trần Minh Thắng',
        id: '2021050123',
        avatar: 'https://picsum.photos/id/64/40/40',
      },
      item: { code: 'ITEM002234', title: 'Machine Learning Cơ Bản' },
      type: 'Renew',
      status: 'Success',
    },
    {
      id: 'TX004',
      time: '10:38 AM',
      date: '11/12/2025',
      user: {
        name: 'Hoàng Minh Tuấn',
        id: '2021050234',
        avatar: 'https://picsum.photos/id/77/40/40',
      },
      item: { code: 'ITEM004567', title: 'Database Systems Concepts' },
      type: 'Return',
      status: 'Late',
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Quản lý mượn - trả sách
        </h1>
        <p className="text-slate-500">
          Xử lý mượn – trả nhanh chóng và hiệu quả
        </p>
      </div>

      {/* Action Tabs */}
      <div className="flex space-x-4 bg-white p-2 rounded-xl shadow-sm border border-slate-100 w-fit">
        <button
          onClick={() => setActiveTab('borrow')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === 'borrow'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <BookOpen size={18} /> Mượn sách
        </button>
        <button
          onClick={() => setActiveTab('return')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === 'return'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <RotateCcw size={18} /> Trả sách
        </button>
        <button
          onClick={() => setActiveTab('renew')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === 'renew'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Clock size={18} /> Gia hạn
        </button>
        <button
          onClick={() => setActiveTab('lost')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === 'lost'
              ? 'bg-red-50 text-red-600 shadow-md'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle size={18} /> Báo mất/hỏng
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: User Selection */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <UserIcon className="text-blue-600" size={20} />
            <h2 className="font-bold text-lg text-slate-800">Chọn độc giả</h2>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Mã độc giả / MSSV
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Scan
                  className="absolute left-3 top-3 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Scan hoặc nhập MSSV..."
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  value={mssvInput}
                  onChange={(e) => setMssvInput(e.target.value)}
                />
              </div>
              <button className="bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700">
                <Search size={20} />
              </button>
            </div>
          </div>

          {/* User Card */}
          <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
            <div className="flex items-start gap-4">
              <img
                src={currentUser.avatar}
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
              />
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-lg">
                  {currentUser.name}
                </h3>
                <p className="text-slate-500 text-sm">
                  MSSV:{' '}
                  <span className="font-medium text-slate-700">
                    {currentUser.studentId}
                  </span>
                </p>
                <p className="text-slate-500 text-sm">
                  Khoa: {currentUser.department}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                <p className="text-xs text-slate-500 uppercase font-semibold">
                  Đang mượn
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {currentUser.stats.borrowing}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-red-100 shadow-sm">
                <p className="text-xs text-slate-500 uppercase font-semibold">
                  Quá hạn
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {currentUser.stats.overdue}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-blue-200 flex justify-between items-center">
              <span className="text-slate-600 font-medium">
                Phí phạt hiện tại
              </span>
              <span className="text-red-600 font-bold text-lg">
                {currentUser.stats.fines.toLocaleString()} VNĐ
              </span>
            </div>

            <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
              <UserIcon size={18} /> Xem hồ sơ độc giả
            </button>
          </div>
        </div>

        {/* Right Column: Dynamic Content */}
        {activeTab !== 'lost' ? (
          /* Standard Scan Interface for Borrow/Return/Renew */
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <Scan className="text-green-600" size={20} />
                <h2 className="font-bold text-lg text-slate-800">Scan Item</h2>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Barcode Item
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LayoutDashboard
                      className="absolute left-3 top-3 text-slate-400"
                      size={18}
                    />
                    <input
                      type="text"
                      value={scanInput}
                      onChange={(e) => setScanInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleLookup();
                      }}
                      placeholder="Scan barcode hoặc mã giao dịch..."
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      autoFocus
                    />
                  </div>
                  <button 
                    onClick={handleLookup}
                    disabled={isLookingUp}
                    className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                  >
                    {isLookingUp ? 'Đang xử lý...' : 'Xác nhận'}
                  </button>
                </div>
              </div>

              {/* Scan State / Result */}
              {confirmSuccessData ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalendarCheck size={28} className="text-emerald-600" />
                  </div>
                  <h3 className="font-bold text-emerald-900 text-lg mb-1">Giao sách thành công!</h3>
                  <p className="text-sm text-emerald-700 mb-4">{confirmSuccessData.fullName} đã nhận <span className="font-semibold">{confirmSuccessData.publicationTitle}</span></p>
                  <div className="bg-white rounded-lg border border-emerald-200 px-4 py-3 inline-block mb-5">
                    <span className="text-xs text-slate-500 block">Hạn trả sách</span>
                    <span className="font-bold text-slate-900">
                      {new Date(confirmSuccessData.dueDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                  </div>
                  <button
                    onClick={() => setConfirmSuccessData(null)}
                    className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    Giao dịch tiếp theo
                  </button>
                </div>
              ) : lookupResult ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4 border-b border-green-200 pb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-green-900">{lookupResult.publicationTitle}</h3>
                      <p className="text-sm text-green-700">Mã giao dịch: #{lookupResult.transactionId}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm mb-6">
                    <div>
                      <span className="text-slate-500 block mb-1">Độc giả</span>
                      <span className="font-semibold text-slate-900">{lookupResult.fullName} ({lookupResult.studentId})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">Barcode bản sao</span>
                      <span className="font-semibold text-slate-900">{lookupResult.barcode}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">Vị trí</span>
                      <span className="font-semibold text-slate-900">{lookupResult.branch} - {lookupResult.shelf}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">Hạn lấy sách</span>
                      <span className="font-semibold text-red-600">
                        {new Date(lookupResult.pickedUpDeadline).toLocaleString('vi-VN', {
                          hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleConfirmPickup}
                      disabled={isConfirming}
                      className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {isConfirming ? 'Đang xử lý...' : 'Giao sách'}
                    </button>
                    <button
                      onClick={() => { setLookupResult(null); setScanInput(''); setLookupError(null); }}
                      className="px-4 py-2.5 bg-white border border-green-200 text-green-700 rounded-lg font-medium hover:bg-green-100 transition-colors"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : lookupError ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex flex-col items-center text-center gap-3">
                  <AlertTriangle size={32} className="text-red-500" />
                  <p className="font-semibold text-red-800">{lookupError}</p>
                  <button
                    onClick={() => setLookupError(null)}
                    className="text-sm text-red-600 underline hover:text-red-800"
                  >
                    Thử lại
                  </button>
                </div>
              ) : (
                <div className="bg-green-50 border-2 border-dashed border-green-200 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <Scan className="text-green-500 w-8 h-8" />
                  </div>
                  <h3 className="font-semibold text-green-800 mb-1">
                    Sẵn sàng scan
                  </h3>
                  <p className="text-green-600 text-sm">
                    Quét QR (mã giao dịch) hoặc nhập MSSV + barcode sách để tra cứu
                  </p>
                </div>
              )}
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <RotateCcw className="text-blue-600" size={20} />
                <h2 className="font-bold text-lg text-slate-800">
                  Quy định mượn sách
                </h2>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-slate-600">
                  <CheckCircle size={16} className="text-green-500" />
                  Thời hạn mượn:{' '}
                  <span className="font-semibold text-slate-800">14 ngày</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-600">
                  <CheckCircle size={16} className="text-green-500" />
                  Tối đa:{' '}
                  <span className="font-semibold text-slate-800">
                    5 cuốn/độc giả
                  </span>
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-600">
                  <CheckCircle size={16} className="text-green-500" />
                  Gia hạn:{' '}
                  <span className="font-semibold text-slate-800">1 lần</span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          /* Lost/Damaged Interface */
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full">
            <div className="flex items-center gap-2 mb-4 text-red-600 pb-4 border-b border-slate-100">
              <AlertTriangle size={24} />
              <h2 className="font-bold text-lg">Báo mất / Hỏng tài liệu</h2>
            </div>

            {!selectedItemForReport ? (
              <>
                <p className="text-slate-600 mb-4 text-sm">
                  Chọn một cuốn sách từ danh sách đang mượn của độc giả để báo
                  cáo:
                </p>
                <div className="space-y-3">
                  {borrowedBooks.map((book) => (
                    <div
                      key={book.id}
                      className="p-4 border border-slate-200 rounded-lg flex justify-between items-center hover:bg-slate-50 transition-colors group"
                    >
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {book.title}
                        </h4>
                        <div className="text-xs text-slate-500 mt-1 flex gap-3">
                          <span className="font-mono bg-slate-100 px-1 rounded">
                            {book.id}
                          </span>
                          <span
                            className={
                              book.status === 'Overdue'
                                ? 'text-red-500 font-medium'
                                : 'text-slate-500'
                            }
                          >
                            Hạn: {book.dueDate}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedItemForReport(book.id)}
                        className="px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 group-hover:border-red-300 transition-colors"
                      >
                        Xử lý
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              /* Report Form */
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                  <span className="font-medium text-slate-700 text-sm">
                    Đang xử lý:{' '}
                    <span className="font-bold">
                      {
                        borrowedBooks.find(
                          (b) => b.id === selectedItemForReport
                        )?.title
                      }
                    </span>
                  </span>
                  <button
                    onClick={() => setSelectedItemForReport(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Loại sự cố
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="border border-slate-200 rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 has-[:checked]:bg-red-50 has-[:checked]:border-red-200 has-[:checked]:text-red-700 transition-all">
                      <input
                        type="radio"
                        name="issueType"
                        className="w-4 h-4 text-red-600"
                        defaultChecked
                      />
                      <span className="text-sm font-medium">Làm mất sách</span>
                    </label>
                    <label className="border border-slate-200 rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 has-[:checked]:bg-orange-50 has-[:checked]:border-orange-200 has-[:checked]:text-orange-700 transition-all">
                      <input
                        type="radio"
                        name="issueType"
                        className="w-4 h-4 text-orange-600"
                      />
                      <span className="text-sm font-medium">
                        Làm hỏng / Rách
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Phí đền bù / Phạt (VNĐ)
                  </label>
                  <input
                    type="number"
                    defaultValue="150000"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-red-500 font-bold text-red-600"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Đã bao gồm giá trị sách và phí xử lý.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 min-h-[80px] text-sm"
                    placeholder="Mô tả chi tiết tình trạng..."
                  ></textarea>
                </div>

                <div className="pt-4 flex gap-3">
                  <button className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">
                    Xác nhận xử lý
                  </button>
                  <button
                    onClick={() => setSelectedItemForReport(null)}
                    className="flex-1 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
                  >
                    Huỷ bỏ
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Transactions Table - Keep at bottom */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock className="text-purple-600" size={20} />
            <h2 className="font-bold text-lg text-slate-800">
              Giao dịch gần đây
            </h2>
          </div>
          <button className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center gap-1">
            Xem tất cả <span aria-hidden="true">&rarr;</span>
          </button>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Thời gian</th>
              <th className="px-6 py-4 font-semibold">Độc giả</th>
              <th className="px-6 py-4 font-semibold">Item</th>
              <th className="px-6 py-4 font-semibold">Tên sách</th>
              <th className="px-6 py-4 font-semibold">Loại</th>
              <th className="px-6 py-4 font-semibold text-right">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {recentTransactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-slate-900">
                    {tx.time}
                  </div>
                  <div className="text-xs text-slate-500">{tx.date}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={tx.user.avatar}
                      alt=""
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        {tx.user.name}
                      </div>
                      <div className="text-xs text-slate-500">{tx.user.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                  {tx.item.code}
                </td>
                <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                  {tx.item.title}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${
                      tx.type === 'Borrow'
                        ? 'bg-green-100 text-green-700'
                        : tx.type === 'Return'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {tx.type === 'Borrow' && <BookOpen size={12} />}
                    {tx.type === 'Return' && <RotateCcw size={12} />}
                    {tx.type === 'Renew' && <Clock size={12} />}
                    {tx.type === 'Borrow'
                      ? 'Mượn'
                      : tx.type === 'Return'
                      ? 'Trả'
                      : 'Gia hạn'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${
                      tx.status === 'Success'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}
                  >
                    {tx.status === 'Success' ? (
                      <CheckCircle size={12} />
                    ) : (
                      <AlertTriangle size={12} />
                    )}
                    {tx.status === 'Success' ? 'Thành công' : 'Trễ hạn'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50">
          <span className="text-sm text-slate-500">
            Hiển thị 5 giao dịch gần nhất
          </span>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded text-sm text-slate-600 hover:bg-slate-50 shadow-sm">
              <FileSpreadsheet size={16} /> Xuất Excel
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded text-sm text-slate-600 hover:bg-slate-50 shadow-sm">
              <Printer size={16} /> In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Circulation;
