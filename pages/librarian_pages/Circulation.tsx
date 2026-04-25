import {
  AlertTriangle,
  BookOpen,
  CalendarCheck,
  CheckCircle,
  Hash,
  Info,
  Scan,
  User as UserIcon,
} from 'lucide-react';
import { useRef, useState } from 'react';
import transactionsService, {
  DirectBorrowResponse,
  LookupResponse,
} from '../../api/transactionsService';

type MainTab = 'pickup' | 'direct';
type LookupMode = 'qr' | 'manual';

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
            <button onClick={() => setError(null)} className="text-xs text-red-600 underline mt-1 hover:text-red-800">Thử lại</button>
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
          <p className="font-semibold text-slate-900">{lookupResult.branch} — {lookupResult.shelf}</p>
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

// ─── Main page ───────────────────────────────────────────────────────────────

const Circulation = () => {
  const [mainTab, setMainTab] = useState<MainTab>('pickup');

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Quản lý mượn sách</h1>
        <p className="text-slate-500 text-sm mt-1">Xác nhận giao sách và mượn trực tiếp tại thư viện.</p>
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
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {mainTab === 'pickup' ? <PickupTab /> : <DirectBorrowTab />}
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
          ) : (
            <>
              <p><span className="font-semibold">Mượn trực tiếp:</span> Áp dụng khi độc giả đến thư viện mà không đặt trước.</p>
              <p>Sách được ghi nhận <span className="font-semibold">BORROWING ngay</span>, hạn trả 14 ngày kể từ hôm nay.</p>
              <p>Hệ thống sẽ kiểm tra: giới hạn 5 cuốn, phí phạt chưa trả, và không mượn trùng sách.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Circulation;
