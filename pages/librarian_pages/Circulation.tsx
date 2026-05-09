import {
  AlertTriangle,
  BookOpen,
  CalendarCheck,
  CheckCircle,
  DollarSign,
  Hash,
  Info,
  RotateCcw,
  Scan,
  TriangleAlert,
  User as UserIcon,
} from 'lucide-react';
import { useRef, useState } from 'react';
import fineService, { Fine } from '../../api/fineService';
import transactionsService, {
  ActiveTransactionResponse,
  DirectBorrowResponse,
  IssueType,
  LookupResponse,
  ReportIssueResponse,
  ReturnResponse,
  StudentActiveTransactionsResponse,
} from '../../api/transactionsService';

type MainTab = 'pickup' | 'direct' | 'return' | 'fines';
type LookupMode = 'qr' | 'manual';
type ReturnMode = 'normal' | 'issue';

const formatVND = (amount: number) => new Intl.NumberFormat('vi-VN').format(amount) + 'đ';

// ─── Tab: Xác nhận giao sách ────────────────────────────────────────────────

const PickupTab = () => {
  const [mode, setMode] = useState<LookupMode>('qr');
  const [qrInput, setQrInput] = useState('');
  const [mssvInput, setMssvInput] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [lookupResult, setLookupResult] = useState<LookupResponse['data'] | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    dueDate: string; fullName: string; publicationTitle: string;
  } | null>(null);
  const qrRef = useRef<HTMLInputElement>(null);

  const reset = () => { setLookupResult(null); setLookupError(null); setSuccessData(null); };

  const handleLookup = async () => {
    const params =
      mode === 'qr'
        ? { transactionId: qrInput.trim() }
        : { studentId: mssvInput.trim(), barcode: barcodeInput.trim() };

    if (mode === 'qr' && !qrInput.trim()) return;
    if (mode === 'manual' && (!mssvInput.trim() || !barcodeInput.trim())) return;

    setIsLookingUp(true);
    reset();
    try {
      const res = await transactionsService.lookup(params);
      res.data ? setLookupResult(res.data) : setLookupError('Không tìm thấy phiếu mượn hoặc đã hết hạn.');
    } catch (err: any) {
      setLookupError(err.status === 404 ? 'Không tìm thấy phiếu mượn hoặc đã hết hạn.' : err.message || 'Lỗi tra cứu.');
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleConfirm = async () => {
    if (!lookupResult) return;
    setIsConfirming(true);
    try {
      const res = await transactionsService.confirmPickup(lookupResult.transactionId);
      if (res.code === 200) {
        setSuccessData({ dueDate: res.data.dueDate, fullName: lookupResult.fullName, publicationTitle: lookupResult.publicationTitle });
        setLookupResult(null);
        setQrInput(''); setMssvInput(''); setBarcodeInput('');
        setTimeout(() => qrRef.current?.focus(), 100);
      }
    } catch (err: any) {
      setLookupError(err.message || 'Lỗi xác nhận giao sách.');
      setLookupResult(null);
    } finally {
      setIsConfirming(false);
    }
  };

  const switchMode = (m: LookupMode) => { setMode(m); reset(); setQrInput(''); setMssvInput(''); setBarcodeInput(''); };

  return (
    <div className="space-y-5">
      {/* Mode switcher */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-lg w-fit">
        <button onClick={() => switchMode('qr')}
          className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium transition-all ${mode === 'qr' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
          <Scan size={16} /> Quét QR
        </button>
        <button onClick={() => switchMode('manual')}
          className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium transition-all ${mode === 'manual' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
          <UserIcon size={16} /> Nhập thủ công
        </button>
      </div>

      {/* Input */}
      {mode === 'qr' ? (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">
            Mã giao dịch
            <span className="ml-2 text-xs text-slate-400 font-normal">(scanner tự điền khi quét QR)</span>
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Hash className="absolute left-3 top-3 text-slate-400" size={18} />
              <input ref={qrRef} type="text" autoFocus value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                placeholder="Quét QR hoặc nhập mã giao dịch..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono" />
            </div>
            <button onClick={handleLookup} disabled={isLookingUp || !qrInput.trim()}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 transition-colors">
              {isLookingUp ? 'Đang tra...' : 'Tra cứu'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">MSSV độc giả</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 text-slate-400" size={18} />
                <input type="text" autoFocus value={mssvInput}
                  onChange={(e) => setMssvInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                  placeholder="Nhập MSSV..."
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Barcode bản sao</label>
              <div className="relative">
                <Scan className="absolute left-3 top-3 text-slate-400" size={18} />
                <input type="text" value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                  placeholder="Quét hoặc nhập barcode..."
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono" />
              </div>
            </div>
          </div>
          <button onClick={handleLookup} disabled={isLookingUp || !mssvInput.trim() || !barcodeInput.trim()}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 transition-colors">
            {isLookingUp ? 'Đang tra cứu...' : 'Tra cứu phiếu mượn'}
          </button>
        </div>
      )}

      {/* Result */}
      <ResultArea
        successData={successData} lookupResult={lookupResult} lookupError={lookupError}
        isConfirming={isConfirming}
        onConfirm={handleConfirm}
        onCancel={() => { reset(); setQrInput(''); }}
        onNext={() => { setSuccessData(null); qrRef.current?.focus(); }}
        idleText={mode === 'qr' ? 'Quét mã QR hoặc nhập mã giao dịch rồi nhấn Enter' : 'Nhập MSSV và barcode sách rồi nhấn Tra cứu'}
      />
    </div>
  );
};

// ─── Tab: Mượn trực tiếp ────────────────────────────────────────────────────

const DirectBorrowTab = () => {
  const [mssvInput, setMssvInput] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [successData, setSuccessData] = useState<DirectBorrowResponse['data'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mssvRef = useRef<HTMLInputElement>(null);

  const handleBorrow = async () => {
    if (!mssvInput.trim() || !barcodeInput.trim()) return;
    setIsBorrowing(true);
    setError(null);
    setSuccessData(null);
    try {
      const res = await transactionsService.borrowDirect({ studentId: mssvInput.trim(), barcode: barcodeInput.trim() });
      if (res.code === 201) {
        setSuccessData(res.data);
        setMssvInput('');
        setBarcodeInput('');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi mượn sách.');
    } finally {
      setIsBorrowing(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Chú thích nghiệp vụ */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800 space-y-1">
        <p className="font-semibold text-amber-900">Lưu ý khi mượn trực tiếp</p>
        <ul className="list-disc list-inside space-y-0.5 text-amber-700">
          <li>Áp dụng khi độc giả <span className="font-medium">đến thư viện mà không đặt trước</span> qua hệ thống.</li>
          <li>Sách được ghi nhận trạng thái <span className="font-medium">Đang mượn</span> ngay lập tức, hạn trả <span className="font-medium">14 ngày</span> kể từ hôm nay.</li>
          <li>Hệ thống tự động kiểm tra: tối đa <span className="font-medium">5 cuốn</span> đang mượn, không có <span className="font-medium">phí phạt chưa trả</span>, và chưa mượn <span className="font-medium">bản sao khác của cùng đầu sách</span>.</li>
        </ul>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">MSSV độc giả</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-3 text-slate-400" size={18} />
              <input ref={mssvRef} type="text" autoFocus value={mssvInput}
                onChange={(e) => setMssvInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleBorrow()}
                placeholder="Nhập MSSV..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Barcode sách</label>
            <div className="relative">
              <Scan className="absolute left-3 top-3 text-slate-400" size={18} />
              <input type="text" value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleBorrow()}
                placeholder="Quét hoặc nhập barcode..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none font-mono" />
            </div>
          </div>
        </div>
        <button onClick={handleBorrow} disabled={isBorrowing || !mssvInput.trim() || !barcodeInput.trim()}
          className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50 transition-colors">
          {isBorrowing ? 'Đang xử lý...' : 'Cho mượn ngay'}
        </button>
      </div>

      {/* Result */}
      {successData ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CalendarCheck size={28} className="text-emerald-600" />
          </div>
          <h3 className="font-bold text-emerald-900 text-lg mb-1">Mượn sách thành công!</h3>
          <p className="text-sm text-emerald-700 mb-4">
            Đã ghi nhận mượn <span className="font-semibold">{successData.publicationTitle}</span>
          </p>
          <div className="bg-white rounded-lg border border-emerald-200 grid grid-cols-2 divide-x divide-emerald-100 mb-5 text-sm">
            <div className="px-4 py-3">
              <p className="text-xs text-slate-500 mb-0.5">Barcode</p>
              <p className="font-semibold font-mono text-slate-900">{successData.barcode}</p>
            </div>
            <div className="px-4 py-3">
              <p className="text-xs text-slate-500 mb-0.5">Hạn trả</p>
              <p className="font-bold text-slate-900">
                {new Date(successData.dueDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </p>
            </div>
          </div>
          <button onClick={() => { setSuccessData(null); setError(null); setTimeout(() => mssvRef.current?.focus(), 100); }}
            className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
            Giao dịch tiếp theo
          </button>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800 text-sm">{error}</p>
            {error.toLowerCase().includes('not available for borrowing') && (
              <p className="text-xs text-red-700 mt-1.5">
                Bản sao này đang ở trạng thái không thể mượn:{' '}
                <span className="font-medium">Đang được mượn, Đã đặt trước, Đang bảo trì</span> hoặc{' '}
                <span className="font-medium">Mất/thất lạc</span>. Vui lòng chọn bản sao khác.
              </p>
            )}
            <button onClick={() => setError(null)} className="text-xs text-red-600 underline mt-1.5 hover:text-red-800">Thử lại</button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center text-center text-slate-400">
          <BookOpen size={32} className="mb-2 opacity-40" />
          <p className="text-sm">Nhập MSSV và barcode sách để mượn trực tiếp tại thư viện</p>
        </div>
      )}
    </div>
  );
};

// ─── Quy định tính phí hư/mất ───────────────────────────────────────────────

const IssueFineGuide = () => (
  <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800 space-y-1">
    <p className="font-semibold text-amber-900 text-sm">Quy định tính phí phạt hư hỏng / mất sách</p>
    <ul className="list-disc list-inside space-y-1 text-amber-700">
      <li>Mua lại tài liệu đó theo cuốn tái bản mới nhất kèm chi phí xử lý sách.</li>
      <li>Đối với sách <span className="font-medium">không mua lại được</span>: đền gấp <span className="font-medium">3 lần giá sách</span>.</li>
      <li>Đối với sách <span className="font-medium">không ghi giá tiền</span>: tính theo giá photo <span className="font-medium">(600đ/trang + chi phí đóng bìa) × 3</span>.</li>
    </ul>
  </div>
);

// ─── Tab: Trả sách ──────────────────────────────────────────────────────────

type ActiveItem = StudentActiveTransactionsResponse['data']['items'][0];
type ActionType = 'return' | 'damaged' | 'lost';

const ReturnTab = () => {
  // MSSV search
  const [mssvInput, setMssvInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [student, setStudent] = useState<StudentActiveTransactionsResponse['data'] | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const mssvRef = useRef<HTMLInputElement>(null);

  // Action panel
  const [selectedItem, setSelectedItem] = useState<ActiveItem | null>(null);
  const [action, setAction] = useState<ActionType | null>(null);
  const [fineAmount, setFineAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [returnSuccess, setReturnSuccess] = useState<ReturnResponse['data'] | null>(null);
  const [issueSuccess, setIssueSuccess] = useState<ReportIssueResponse['data'] | null>(null);

  const handleSearch = async () => {
    if (!mssvInput.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    setStudent(null);
    setSelectedItem(null);
    setAction(null);
    try {
      const res = await transactionsService.getStudentActive(mssvInput.trim());
      if (res.code === 200) setStudent(res.data);
    } catch (err: any) {
      setSearchError(err.message || 'Không tìm thấy sinh viên hoặc không có sách đang mượn.');
    } finally {
      setIsSearching(false);
    }
  };

  const openAction = (item: ActiveItem, act: ActionType) => {
    setSelectedItem(item);
    setAction(act);
    setFineAmount('');
    setActionError(null);
    setReturnSuccess(null);
    setIssueSuccess(null);
  };

  const closeAction = () => { setSelectedItem(null); setAction(null); setActionError(null); };

  const handleReturn = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);
    setActionError(null);
    try {
      const res = await transactionsService.returnBook(selectedItem.barcode);
      if (res.code === 200) {
        setReturnSuccess(res.data);
        setStudent(prev => prev ? { ...prev, items: prev.items.filter(i => i.transactionId !== selectedItem.transactionId) } : null);
      }
    } catch (err: any) {
      setActionError(err.message || 'Lỗi trả sách.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportIssue = async () => {
    if (!selectedItem) return;
    const amount = parseFloat(fineAmount);
    if (isNaN(amount) || amount <= 0) return;
    setIsSubmitting(true);
    setActionError(null);
    try {
      const issueType: IssueType = action === 'damaged' ? 'DAMAGED_BOOK' : 'LOST_BOOK';
      const res = await transactionsService.reportIssue(selectedItem.transactionId, issueType, amount);
      if (res.code === 200) {
        setIssueSuccess(res.data);
        setStudent(prev => prev ? { ...prev, items: prev.items.filter(i => i.transactionId !== selectedItem.transactionId) } : null);
      }
    } catch (err: any) {
      setActionError(err.message || 'Lỗi báo sự cố.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calcOverdueDays = (dueDate: string) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate); due.setHours(0, 0, 0, 0);
    return Math.max(0, Math.floor((today.getTime() - due.getTime()) / 86_400_000));
  };

  return (
    <div className="space-y-5">
      {/* MSSV search */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">MSSV độc giả</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <UserIcon className="absolute left-3 top-3 text-slate-400" size={18} />
            <input ref={mssvRef} type="text" autoFocus value={mssvInput}
              onChange={(e) => setMssvInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Nhập MSSV rồi nhấn Enter..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
          </div>
          <button onClick={handleSearch} disabled={isSearching || !mssvInput.trim()}
            className="bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50 transition-colors">
            {isSearching ? 'Đang tra...' : 'Tìm kiếm'}
          </button>
        </div>
      </div>

      {/* Search error */}
      {searchError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800 text-sm">{searchError}</p>
            <button onClick={() => setSearchError(null)} className="text-xs text-red-600 underline mt-1 hover:text-red-800">Thử lại</button>
          </div>
        </div>
      )}

      {/* Student book list */}
      {student ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900">{student.fullName}</p>
              <p className="text-xs text-slate-500 font-mono">{student.studentId}</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">
              {student.items.length} cuốn đang mượn
            </span>
          </div>

          {student.items.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400">
              <BookOpen size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Sinh viên không có sách nào đang mượn.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {student.items.map(item => {
                const overdueDays = calcOverdueDays(item.dueDate);
                const isOverdue = item.status === 'OVERDUE';
                return (
                  <div key={item.transactionId}
                    className={`border rounded-xl p-4 ${isOverdue ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{item.publicationTitle}</p>
                        <p className="text-xs font-mono text-slate-500">{item.barcode} · {item.branch}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-slate-500'}`}>
                            Hạn: {new Date(item.dueDate).toLocaleDateString('vi-VN')}
                          </span>
                          {isOverdue && (
                            <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full">
                              Trễ {overdueDays} ngày · Phí: {formatVND(overdueDays * 1000)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button onClick={() => openAction(item, 'return')}
                          className="flex items-center gap-1 bg-purple-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-purple-700 font-medium transition-colors">
                          <RotateCcw size={13} /> Trả
                        </button>
                        <button onClick={() => openAction(item, 'damaged')}
                          className="flex items-center gap-1 bg-orange-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-orange-600 font-medium transition-colors">
                          <TriangleAlert size={13} /> Hư
                        </button>
                        <button onClick={() => openAction(item, 'lost')}
                          className="flex items-center gap-1 bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-red-700 font-medium transition-colors">
                          <AlertTriangle size={13} /> Mất
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : !searchError && (
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center text-center text-slate-400">
          <UserIcon size={32} className="mb-2 opacity-40" />
          <p className="text-sm">Nhập MSSV để xem danh sách sách đang mượn</p>
        </div>
      )}

      {/* Action modal */}
      {selectedItem && action && (
        <ActionPanel
          item={selectedItem}
          action={action}
          fineAmount={fineAmount}
          setFineAmount={setFineAmount}
          isSubmitting={isSubmitting}
          error={actionError}
          returnSuccess={returnSuccess}
          issueSuccess={issueSuccess}
          onReturn={handleReturn}
          onIssue={handleReportIssue}
          onClose={() => { closeAction(); setReturnSuccess(null); setIssueSuccess(null); }}
          calcOverdueDays={calcOverdueDays}
        />
      )}
    </div>
  );
};


const ActionPanel = ({ item, action, fineAmount, setFineAmount, isSubmitting, error,
  returnSuccess, issueSuccess, onReturn, onIssue, onClose, calcOverdueDays }: {
  item: ActiveItem; action: ActionType; fineAmount: string;
  setFineAmount: (v: string) => void; isSubmitting: boolean; error: string | null;
  returnSuccess: ReturnResponse['data'] | null;
  issueSuccess: ReportIssueResponse['data'] | null;
  onReturn: () => void; onIssue: () => void; onClose: () => void;
  calcOverdueDays: (d: string) => number;
}) => {
  const overdueDays = calcOverdueDays(item.dueDate);
  const isOverdue = item.status === 'OVERDUE';
  const isIssue = action === 'damaged' || action === 'lost';
  const succeeded = !!returnSuccess || !!issueSuccess;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={succeeded ? undefined : onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-bold text-slate-900">{item.publicationTitle}</p>
              <p className="text-xs font-mono text-slate-500 mt-0.5">{item.barcode}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 ml-3 text-lg leading-none">✕</button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* SUCCESS: trả sách */}
          {returnSuccess && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-purple-600" />
              </div>
              <div>
                <p className="font-bold text-purple-900 text-lg">Trả sách thành công!</p>
                <p className="text-sm text-slate-500 mt-1">
                  Ngày trả: {new Date(returnSuccess.returnedDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
              {returnSuccess.overdue && returnSuccess.overdueFineAmount != null && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-sm">
                  <p className="text-orange-700">Sách trả trễ hạn — phí phạt đã ghi nhận:</p>
                  <p className="font-bold text-orange-600 text-lg mt-1">{formatVND(returnSuccess.overdueFineAmount)}</p>
                </div>
              )}
              <button onClick={onClose}
                className="w-full bg-purple-600 text-white py-2.5 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                Giao dịch tiếp theo
              </button>
            </div>
          )}

          {/* SUCCESS: hư/mất */}
          {issueSuccess && (
            <div className="text-center space-y-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${action === 'damaged' ? 'bg-orange-100' : 'bg-red-100'}`}>
                <CheckCircle size={32} className={action === 'damaged' ? 'text-orange-600' : 'text-red-600'} />
              </div>
              <div>
                <p className={`font-bold text-lg ${action === 'damaged' ? 'text-orange-900' : 'text-red-900'}`}>
                  {action === 'damaged' ? 'Ghi nhận hư hỏng thành công!' : 'Ghi nhận mất sách thành công!'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Trạng thái sách: <span className="font-medium">{issueSuccess.itemStatus === 'IN_MAINTENANCE' ? 'Đang bảo trì' : 'Mất / thất lạc'}</span>
                </p>
              </div>
              <div className="space-y-2 text-left">
                {issueSuccess.finesCreated.map(f => (
                  <div key={f.fineId} className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm">
                    <span className="text-slate-600">
                      {f.type === 'DAMAGED_BOOK' ? 'Phí hư hỏng' : f.type === 'LOST_BOOK' ? 'Phí mất sách' : 'Phí trễ hạn'}
                    </span>
                    <span className="font-bold text-slate-900">{formatVND(f.amount)}</span>
                  </div>
                ))}
              </div>
              <button onClick={onClose}
                className={`w-full text-white py-2.5 rounded-lg font-semibold transition-colors ${action === 'damaged' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-red-600 hover:bg-red-700'}`}>
                Giao dịch tiếp theo
              </button>
            </div>
          )}

          {/* FORM: chưa submit */}
          {!succeeded && (
            <>
              {isOverdue && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-700">
                  Sách trễ <span className="font-bold">{overdueDays} ngày</span> — hệ thống tự tính thêm phí trễ hạn{' '}
                  <span className="font-bold">{formatVND(overdueDays * 1000)}</span>.
                </div>
              )}

              {action === 'return' && (
                <div className="text-center space-y-3">
                  <RotateCcw size={36} className="text-purple-500 mx-auto" />
                  <p className="text-slate-700 text-sm">Xác nhận trả sách này?</p>
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-700 text-left">{error}</div>
                  )}
                  <button onClick={onReturn} disabled={isSubmitting}
                    className="w-full bg-purple-600 text-white py-2.5 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors">
                    {isSubmitting ? 'Đang xử lý...' : 'Xác nhận trả sách'}
                  </button>
                </div>
              )}

              {isIssue && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      {action === 'damaged' ? 'Phí phạt hư hỏng (đ)' : 'Phí phạt mất sách (đ)'}
                    </label>
                    <input type="number" min="1" autoFocus value={fineAmount}
                      onChange={e => setFineAmount(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && onIssue()}
                      placeholder="Nhập số tiền do thủ thư định..."
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                  </div>
                  <IssueFineGuide />
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-700">{error}</div>
                  )}
                  <button onClick={onIssue}
                    disabled={isSubmitting || !fineAmount.trim() || parseFloat(fineAmount) <= 0}
                    className={`w-full text-white py-2.5 rounded-lg font-semibold disabled:opacity-50 transition-colors ${action === 'damaged' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-red-600 hover:bg-red-700'}`}>
                    {isSubmitting ? 'Đang xử lý...' : action === 'damaged' ? 'Xác nhận hư hỏng' : 'Xác nhận mất sách'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Shared result area (dùng cho PickupTab) ────────────────────────────────

const ResultArea = ({ successData, lookupResult, lookupError, isConfirming, onConfirm, onCancel, onNext, idleText }: {
  successData: { dueDate: string; fullName: string; publicationTitle: string } | null;
  lookupResult: LookupResponse['data'] | null;
  lookupError: string | null;
  isConfirming: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onNext: () => void;
  idleText: string;
}) => {
  if (successData) return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
      <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <CalendarCheck size={28} className="text-emerald-600" />
      </div>
      <h3 className="font-bold text-emerald-900 text-lg mb-1">Giao sách thành công!</h3>
      <p className="text-sm text-emerald-700 mb-4">
        <span className="font-semibold">{successData.fullName}</span> đã nhận{' '}
        <span className="font-semibold">{successData.publicationTitle}</span>
      </p>
      <div className="bg-white rounded-lg border border-emerald-200 px-4 py-2.5 inline-flex flex-col items-center mb-5">
        <span className="text-xs text-slate-500">Hạn trả sách</span>
        <span className="font-bold text-slate-900 text-lg">
          {new Date(successData.dueDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
        </span>
      </div>
      <button onClick={onNext} className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
        Giao dịch tiếp theo
      </button>
    </div>
  );

  if (lookupResult) return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <BookOpen size={20} className="text-blue-600" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-slate-900 truncate">{lookupResult.publicationTitle}</p>
          <p className="text-xs text-slate-500 font-mono">#{lookupResult.transactionId}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm mb-5">
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Độc giả</p>
          <p className="font-semibold text-slate-900">{lookupResult.fullName}</p>
          <p className="text-xs text-slate-500 font-mono">{lookupResult.studentId}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Barcode bản sao</p>
          <p className="font-semibold text-slate-900 font-mono">{lookupResult.barcode}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Vị trí</p>
          <p className="font-semibold text-slate-900">{lookupResult.branch} — {lookupResult.location}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Hạn lấy sách</p>
          <p className="font-semibold text-red-600">
            {new Date(lookupResult.pickedUpDeadline).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={onConfirm} disabled={isConfirming}
          className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
          {isConfirming ? 'Đang xử lý...' : 'Xác nhận giao sách'}
        </button>
        <button onClick={onCancel}
          className="px-5 py-2.5 bg-white border border-slate-300 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors">
          Huỷ
        </button>
      </div>
    </div>
  );

  if (lookupError) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
      <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-red-800 text-sm">{lookupError}</p>
        <button onClick={onCancel} className="text-xs text-red-600 underline mt-1 hover:text-red-800">Thử lại</button>
      </div>
    </div>
  );

  return (
    <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center text-center text-slate-400">
      <Scan size={32} className="mb-2 opacity-40" />
      <p className="text-sm">{idleText}</p>
    </div>
  );
};

// ─── Tab: Thu phí phạt ──────────────────────────────────────────────────────

const FINE_TYPE_LABEL: Record<string, string> = {
  OVERDUE_RETURN: 'Trễ hạn',
  DAMAGED_BOOK:   'Hư hỏng',
  LOST_BOOK:      'Mất sách',
};

const FineTab = () => {
  const [mssvInput, setMssvInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<{ studentId: string; fullName: string; totalUnpaidAmount: number; fines: Fine[] } | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payingAll, setPayingAll] = useState(false);
  const mssvRef = useRef<HTMLInputElement>(null);

  const handleSearch = async () => {
    if (!mssvInput.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    setStudentData(null);
    try {
      const res = await fineService.getStudentFines(mssvInput.trim());
      if (res.code === 200) setStudentData(res.data);
    } catch (err: any) {
      setSearchError(err.message || 'Không tìm thấy sinh viên.');
    } finally {
      setIsSearching(false);
    }
  };

  const handlePayOne = async (fineId: string) => {
    setPayingId(fineId);
    try {
      const res = await fineService.payFine(fineId);
      if (res.code === 200 && studentData) {
        const updated = studentData.fines.filter(f => f.fineId !== fineId);
        const newTotal = updated.reduce((s, f) => s + f.fineAmount, 0);
        setStudentData({ ...studentData, fines: updated, totalUnpaidAmount: newTotal });
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi thanh toán.');
    } finally {
      setPayingId(null);
    }
  };

  const handlePayAll = async () => {
    if (!studentData) return;
    setPayingAll(true);
    try {
      const res = await fineService.payAllFines(studentData.studentId);
      if (res.code === 200) {
        setStudentData({ ...studentData, fines: [], totalUnpaidAmount: 0 });
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi thanh toán.');
    } finally {
      setPayingAll(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* MSSV input */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">MSSV độc giả</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <UserIcon className="absolute left-3 top-3 text-slate-400" size={18} />
            <input ref={mssvRef} type="text" autoFocus value={mssvInput}
              onChange={e => setMssvInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Nhập MSSV rồi nhấn Enter..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none" />
          </div>
          <button onClick={handleSearch} disabled={isSearching || !mssvInput.trim()}
            className="bg-yellow-500 text-white px-6 py-2.5 rounded-lg hover:bg-yellow-600 font-medium disabled:opacity-50 transition-colors">
            {isSearching ? 'Đang tra...' : 'Tìm kiếm'}
          </button>
        </div>
      </div>

      {searchError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800 text-sm">{searchError}</p>
            <button onClick={() => setSearchError(null)} className="text-xs text-red-600 underline mt-1">Thử lại</button>
          </div>
        </div>
      )}

      {studentData && (
        <div className="space-y-4">
          {/* Student summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900">{studentData.fullName}</p>
              <p className="text-xs text-slate-500 font-mono">{studentData.studentId}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Tổng nợ chưa trả</p>
              <p className="font-bold text-red-600 text-lg">
                {new Intl.NumberFormat('vi-VN').format(studentData.totalUnpaidAmount)}đ
              </p>
            </div>
          </div>

          {studentData.fines.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center text-slate-400">
              <CheckCircle size={28} className="mb-2 text-green-400" />
              <p className="text-sm font-medium text-slate-600">Sinh viên không có phí phạt nào chưa thanh toán.</p>
            </div>
          ) : (
            <>
              <button onClick={handlePayAll} disabled={payingAll}
                className="w-full bg-yellow-500 text-white py-2.5 rounded-lg hover:bg-yellow-600 font-semibold disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                <DollarSign size={16} />
                {payingAll ? 'Đang xử lý...' : `Thanh toán tất cả (${studentData.fines.length} khoản)`}
              </button>

              <div className="space-y-2">
                {studentData.fines.map(fine => (
                  <div key={fine.fineId} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4">
                    <div className="flex-grow min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{fine.publicationTitle}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">
                          {FINE_TYPE_LABEL[fine.type] ?? fine.type}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(fine.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="font-bold text-slate-900">
                        {new Intl.NumberFormat('vi-VN').format(fine.fineAmount)}đ
                      </span>
                      <button
                        onClick={() => handlePayOne(fine.fineId)}
                        disabled={payingId === fine.fineId}
                        className="bg-green-600 text-white text-xs px-4 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold transition-colors">
                        {payingId === fine.fineId ? '...' : 'Thanh toán'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {!studentData && !searchError && (
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center text-center text-slate-400">
          <DollarSign size={32} className="mb-2 opacity-40" />
          <p className="text-sm">Nhập MSSV để xem và thu phí phạt của sinh viên</p>
        </div>
      )}
    </div>
  );
};

// ─── Main page ───────────────────────────────────────────────────────────────

const Circulation = () => {
  const [mainTab, setMainTab] = useState<MainTab>('pickup');

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Quản lý mượn sách</h1>
        <p className="text-slate-500 text-sm mt-1">Xác nhận giao sách, mượn trực tiếp và xử lý trả sách tại thư viện.</p>
      </div>

      {/* Main tab */}
      <div className="flex gap-3 border-b border-slate-200">
        <button
          onClick={() => setMainTab('pickup')}
          className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-colors ${
            mainTab === 'pickup' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Xác nhận giao sách
        </button>
        <button
          onClick={() => setMainTab('direct')}
          className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-colors ${
            mainTab === 'direct' ? 'border-green-600 text-green-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Mượn trực tiếp
        </button>
        <button
          onClick={() => setMainTab('return')}
          className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-colors ${
            mainTab === 'return' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Trả sách
        </button>
        <button
          onClick={() => setMainTab('fines')}
          className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-colors ${
            mainTab === 'fines' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Thu phí phạt
        </button>
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {mainTab === 'pickup' ? <PickupTab /> : mainTab === 'direct' ? <DirectBorrowTab /> : mainTab === 'return' ? <ReturnTab /> : <FineTab />}
      </div>

      {/* Info card */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
        <Info size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700 space-y-1">
          {mainTab === 'pickup' ? (
            <>
              <p><span className="font-semibold">Quét QR:</span> User mang QR từ app — scanner tự điền mã giao dịch.</p>
              <p><span className="font-semibold">Nhập thủ công:</span> User không có QR — nhập MSSV + barcode sách.</p>
              <p>Chỉ tra được phiếu đang ở trạng thái <span className="font-semibold">Chờ lấy sách</span>.</p>
            </>
          ) : mainTab === 'direct' ? (
            <>
              <p><span className="font-semibold">Mượn trực tiếp:</span> Áp dụng khi độc giả đến thư viện mà không đặt trước.</p>
              <p>Sách được ghi nhận <span className="font-semibold">BORROWING ngay</span>, hạn trả 14 ngày kể từ hôm nay.</p>
              <p>Hệ thống sẽ kiểm tra: giới hạn 5 cuốn, phí phạt chưa trả, và không mượn trùng sách.</p>
            </>
          ) : mainTab === 'return' ? (
            <>
              <p>Nhập <span className="font-semibold">MSSV</span> để xem danh sách sách đang mượn của sinh viên.</p>
              <p>Chọn từng cuốn để <span className="font-semibold">Trả</span>, <span className="font-semibold">Báo hư</span> hoặc <span className="font-semibold">Báo mất</span>. Phí trễ hạn (<span className="font-semibold">1.000đ/ngày</span>) được tính tự động khi trả.</p>
            </>
          ) : (
            <>
              <p>Nhập <span className="font-semibold">MSSV</span> để xem danh sách phí phạt chưa thanh toán của sinh viên.</p>
              <p>Có thể thanh toán từng khoản riêng lẻ hoặc <span className="font-semibold">thanh toán tất cả</span> cùng lúc.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Circulation;
