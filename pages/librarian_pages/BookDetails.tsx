import {
  AlertTriangle,
  ArrowLeft,
  Copy,
  Edit2,
  ExternalLink,
  Eye,
  Image as ImageIcon,
  Plus,
  QrCode,
  RotateCcw,
  Save,
  Star,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import axiosInstance from '../../api/axiosInstance';
import AsyncCreatableSelectField from '../../components/AsyncCreatableSelectField';
import publicationsService from '../../api/publicationsService';
import { Author, Category, Publisher, Tag } from '../../api/publicationTypes';

type FormState = {
  title: string;
  authors: { id: number | null; name: string }[];
  isbn: string;
  publisher: string;
  publicationYear: string;
  language: string;
  edition: string;
  size: string;
  weight: string;
  pages: string;
  subtitle: string;
  description: string;
  aiSummary: string;
  aiTargetAudience: string;
  fileUrl: string;
  categories: string[];
  tags: string[];
  coverImageUrl: string | null;
  totalItems: number;
  availableItems: number;
  borrowedItems: number;
  averageRating: number;
  totalRatings: number;
};

const FACULTY_TARGET_OPTIONS = [
  { value: 'KHOA_KHOA_HOC_VA_KY_THUAT_MAY_TINH', label: 'Khoa Khoa học và Kỹ thuật Máy tính' },
  { value: 'KHOA_DIEN_DIEN_TU', label: 'Khoa Điện - Điện tử' },
  { value: 'KHOA_CO_KHI', label: 'Khoa Cơ khí' },
  { value: 'KHOA_KY_THUAT_HOA_HOC', label: 'Khoa Kỹ thuật Hóa học' },
  { value: 'KHOA_KY_THUAT_XAY_DUNG', label: 'Khoa Kỹ thuật Xây dựng' },
  { value: 'KHOA_KY_THUAT_GIAO_THONG', label: 'Khoa Kỹ thuật Giao thông' },
  { value: 'KHOA_QUAN_LY_CONG_NGHIEP', label: 'Khoa Quản lý Công nghiệp' },
  { value: 'KHOA_MOI_TRUONG_VA_TAI_NGUYEN', label: 'Khoa Môi trường và Tài nguyên' },
  { value: 'KHOA_CONG_NGHE_VAT_LIEU', label: 'Khoa Công nghệ Vật liệu' },
  { value: 'KHOA_KHOA_HOC_UNG_DUNG', label: 'Khoa Khoa học Ứng dụng' },
  { value: 'KHOA_KY_THUAT_DIA_CHAT_VA_DAU_KHI', label: 'Khoa Kỹ thuật Địa chất và Dầu khí' },
];

const emptyForm: FormState = {
  title: '',
  authors: [{ id: null, name: '' }],
  isbn: '',
  publisher: '',
  publicationYear: '',
  language: '',
  edition: '',
  size: '',
  weight: '',
  pages: '',
  subtitle: '',
  description: '',
  aiSummary: '',
  aiTargetAudience: '',
  fileUrl: '',
  categories: [],
  tags: [],
  coverImageUrl: null,
  totalItems: 0,
  availableItems: 0,
  borrowedItems: 0,
  averageRating: 0,
  totalRatings: 0,
};

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isCreate = !id || id === 'new';
  const [loading, setLoading] = useState(!isCreate);
  const [form, setForm] = useState<FormState>(emptyForm);

  // New Data States
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [saving, setSaving] = useState(false);
  const [isEditingMetadata, setIsEditingMetadata] = useState(isCreate);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Fetch publication by id
  useEffect(() => {
    const fetchData = async () => {
      if (isCreate) return;
      try {
        setLoading(true);
        const res = await publicationsService.getLibrarianPublicationById(Number(id));
        if (res.code === 200 && res.data) {
          const detail = res.data;
          const pub = detail.publication;
          setForm({
            title: pub.title ?? '',
            subtitle: pub.subtitle ?? '',
            authors: detail.authors?.length
              ? detail.authors.map((a: any) => ({ id: a.id, name: a.name }))
              : [{ id: null, name: '' }],
            isbn: pub.isbn ?? '',
            publisher: detail.publisher?.name ?? '',
            publicationYear: pub.publicationYear?.toString() ?? '',
            language: pub.language ?? '',
            edition: pub.edition?.toString() ?? '',
            size: pub.size ?? '',
            weight: pub.weight?.toString() ?? '',
            pages: pub.numberOfPages?.toString() ?? '',
            description: pub.description ?? '',
            aiSummary: pub.aiSummary ?? '',
            aiTargetAudience: pub.aiTargetAudience ?? '',
            fileUrl: pub.fileUrl ?? '',
            categories: detail.categories?.map((c: any) => c.name) ?? [],
            tags: detail.tags?.map((t: any) => t.name) ?? [],
            coverImageUrl: pub.coverImageUrl ?? null,
            totalItems: detail.items?.totalItems ?? 0,
            availableItems: detail.items?.totalAvailableItems ?? 0,
            borrowedItems: detail.items?.totalBorrowedItems ?? 0,
            averageRating: detail.ratings?.averageRating ?? 0,
            totalRatings: detail.ratings?.totalRatings ?? 0,
          });
        }
      } catch (error) {
        console.error('Error fetching publication', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isCreate]);

  const authorsList = useMemo(
    () => (form.authors.length ? form.authors : [{ id: null, name: '' }]),
    [form.authors]
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!id || id === 'new') {
      alert('Vui lòng lưu ấn phẩm trước khi upload file.');
      return;
    }

    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];

    // validate
    if (file.size > 20 * 1024 * 1024) {
      alert('File không được vượt quá 20MB');
      return;
    }

    try {
      setUploadingFile(true);

      const res = await publicationsService.uploadFile(Number(id), file);

      if (res.code === 200) {
        setForm(prev => ({
          ...prev,
          fileUrl: res.data.url,
        }));

        setUploadedFileName(file.name);
      } else {
        alert('Upload thất bại');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi upload file');
    } finally {
      setUploadingFile(false);
    }
  };

  const previewAuthors = useMemo(
    () => {
      const names = form.authors
        .map((a) => a.name?.trim())
        .filter((a) => a)
        .join(', ');
      return names || 'Chưa có tác giả';
    },
    [form.authors]
  );

  const loadAuthorOptions = async (input: string) => {
    const res = await publicationsService.searchAuthors(input);
    return res.data.map((a: any) => ({
      value: a.id,
      label: a.name,
    }));
  };

  const createAuthorOption = async (name: string) => {
    const res = await publicationsService.createAuthor(name);
    return {
      value: res.data.id,
      label: res.data.name,
    };
  };


  const loadCategoryOptions = async (input: string) => {
    const res = await publicationsService.searchCategories(input);
    return res.data.map((c: any) => ({
      value: c.id,
      label: c.name,
    }));
  };

  const createCategoryOption = async (name: string) => {
    const res = await publicationsService.createCategory(name);
    return {
      value: res.data.id,
      label: res.data.name,
    };
  };

  const loadTagOptions = async (input: string) => {
    const res = await publicationsService.searchTags(input);
    return res.data.map((t: any) => ({
      value: t.id,
      label: t.name,
    }));
  };

  const createTagOption = async (name: string) => {
    const res = await publicationsService.createTag(name);
    return {
      value: res.data.id,
      label: res.data.name,
    };
  };

  const loadPublisherOptions = async (input: string) => {
    const res = await publicationsService.searchPublishers(input);
    return res.data.map((p: any) => ({
      value: p.id,
      label: p.name,
    }));
  };

  const createPublisherOption = async (name: string) => {
    const res = await publicationsService.createPublisher(name);
    return {
      value: res.data.id,
      label: res.data.name,
    };
  };

  const updateAuthor = (idx: number, name: string, matchedId?: number | null) => {
    setForm((prev) => {
      const next = [...authorsList];
      next[idx] = { id: matchedId ?? next[idx]?.id ?? null, name: name };
      return { ...prev, authors: next };
    });
  };

  const addAuthor = () => {
    // Check if last author is selected and duplicate
    const lastAuthor = authorsList[authorsList.length - 1];
    if (lastAuthor && lastAuthor.id) {
      // Check if this author id already exists in the list (except at the last position)
      const isDuplicate = authorsList.slice(0, -1).some(a => a.id === lastAuthor.id);
      if (isDuplicate) {
        alert('Tác giả này đã có trong danh sách. Vui lòng chọn tác giả khác.');
        return;
      }
    }
    setForm((prev) => ({ ...prev, authors: [...authorsList, { id: null, name: '' }] }));
  };

  const removeAuthor = (idx: number) =>
    setForm((prev) => {
      const next = authorsList.filter((_, i) => i !== idx);
      return { ...prev, authors: next.length ? next : [{ id: null, name: '' }] };
    });

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!id || id === 'new') {
      alert('Vui lòng lưu thông tin ấn phẩm trước khi tải lên trang bìa.');
      return;
    }

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Basic validation
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn tệp hình ảnh.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước ảnh không được vượt quá 5MB.');
        return;
      }

      try {
        setIsUploadingCover(true);
        const res = await publicationsService.updatePublicationCover(Number(id), file);
        if (res.code === 200 && res.data) {
          setForm(prev => ({ ...prev, coverImageUrl: res.data }));
          alert('Cập nhật trang bìa thành công!');
        } else {
          alert('Cập nhật thất bại: ' + (res.message || 'Lỗi không xác định'));
        }
      } catch (error: any) {
        console.error('Error uploading cover', error);
        alert('Lỗi khi tải lên: ' + (error.message || 'Vui lòng thử lại sau'));
      } finally {
        setIsUploadingCover(false);
      }
    }
  };

  const handleUpdateMetadata = async () => {
    if (!id || id === 'new') {
      alert('Vui lòng tạo ấn phẩm trước.');
      return;
    }

    if (!form.title.trim()) {
      alert('Tiêu đề không được để trống.');
      return;
    }

    const payload = {
      title: form.title.trim(),
      subtitle: form.subtitle?.trim() || null,
      description: form.description || null,
      language: form.language || null,
      numberOfPages: form.pages ? Number(form.pages) : null,
      publicationYear: form.publicationYear
        ? Number(form.publicationYear)
        : null,
      edition: form.edition ? Number(form.edition) : null,
      size: form.size || null,
      weight: form.weight ? Number(form.weight) : null,
      aiTargetAudience: form.aiTargetAudience || null,
    };

    try {
      setSaving(true);

      const res = await publicationsService.updateMetadata(
        Number(id),
        payload
      );

      if (res.code === 200) {
        alert('Cập nhật metadata thành công');

        // 🔥 QUAN TRỌNG
        setIsEditingMetadata(false);
      } else {
        alert(res.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Lỗi update metadata', error);
      alert('Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  // Styles for React Select
  const selectStyles = {
    control: (baseStyles: any) => ({
      ...baseStyles,
      borderColor: '#e2e8f0',
      borderRadius: '0.5rem',
      outline: 'none',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#cbd5e1',
      },
      '&:focus-within': {
        borderColor: '#3b82f6',
        boxShadow: '0 0 0 1px #3b82f6',
      },
      minHeight: '42px',
      backgroundColor: '#ffffff',
    }),
    menu: (baseStyles: any) => ({
      ...baseStyles,
      borderRadius: '0.5rem',
      zIndex: 9999,
    }),
    option: (baseStyles: any, state: any) => ({
      ...baseStyles,
      backgroundColor: state.isSelected ? '#bfdbfe' : state.isFocused ? '#f1f5f9' : undefined,
      color: '#334155',
      '&:active': {
        backgroundColor: '#93c5fd',
      },
    }),
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto"></div>
            <p className="mt-4 text-slate-600">Đang tải dữ liệu ấn phẩm...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/librarian/books"
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <div className="text-sm text-slate-500 flex items-center gap-2">
              Đầu sách <span className="text-slate-300">/</span>{' '}
              {isCreate ? 'Thêm mới' : form.title || 'Đang tải'}
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isCreate ? 'Thêm đầu sách' : 'Chi Tiết Đầu Sách'}
            </h1>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50">
            ... Thêm
          </button>
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 flex items-center gap-2">
            <X size={16} /> Hủy
          </button>
          <button className="px-4 py-2 bg-secondary text-white font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2">
            <Save size={18} /> Lưu Thay Đổi
          </button>
          <button className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 flex items-center gap-2">
            <Plus size={18} /> Lưu & Thêm đầu sách
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-secondary px-6 py-3 border-b border-indigo-700 flex justify-between items-center">
              <div>
                <h2 className="text-white font-semibold flex items-center gap-2">
                  <Copy size={18} /> Publication Metadata
                </h2>
                <p className="text-indigo-200 text-xs">
                  Quản lý các thông tin cơ bản về ấn phẩm
                </p>
              </div>
              {!isCreate && (
                <button
                  type="button"
                  onClick={() => setIsEditingMetadata(!isEditingMetadata)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${isEditingMetadata
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-white text-secondary hover:bg-slate-50'
                    }`}
                >
                  {isEditingMetadata ? (
                    <>
                      <X size={14} /> Hủy Chỉnh Sửa
                    </>
                  ) : (
                    <>
                      <Edit2 size={14} /> Chỉnh Sửa
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  readOnly={!isEditingMetadata}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  className={`w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900 ${!isEditingMetadata ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                />
                <p className="text-xs text-slate-400 mt-1">
                  Main title of the publication
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    ISBN <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.isbn}
                    readOnly={!isEditingMetadata}
                    onChange={(e) => setForm((prev) => ({ ...prev, isbn: e.target.value }))}
                    className={`w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${!isEditingMetadata ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                      }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Số trang
                  </label>
                  <input
                    type="number"
                    value={form.pages}
                    readOnly={!isEditingMetadata}
                    onChange={(e) => setForm((prev) => ({ ...prev, pages: e.target.value }))}
                    className={`w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${!isEditingMetadata ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                      }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Năm xuất bản <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={form.publicationYear}
                    readOnly={!isEditingMetadata}
                    onChange={(e) => setForm((prev) => ({ ...prev, publicationYear: e.target.value }))}
                    className={`w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${!isEditingMetadata ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                      }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Ngôn ngữ <span className="text-red-500">*</span>
                  </label>
                  <select
                    disabled={!isEditingMetadata}
                    value={form.language}
                    onChange={(e) => setForm((prev) => ({ ...prev, language: e.target.value }))}
                    className={`w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white ${!isEditingMetadata ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                      }`}
                  >
                    <option value="">Chọn ngôn ngữ</option>
                    <option value="Vietnamese">Tiếng Việt</option>
                    <option value="English">English</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Tái bản lần thứ
                  </label>
                  <input
                    type="text"
                    value={form.edition}
                    readOnly={!isEditingMetadata}
                    onChange={(e) => setForm((prev) => ({ ...prev, edition: e.target.value }))}
                    className={`w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${!isEditingMetadata ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                      }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Kích cỡ (A x A x A cm)
                  </label>
                  <input
                    type="text"
                    value={form.size}
                    readOnly={!isEditingMetadata}
                    onChange={(e) => setForm((prev) => ({ ...prev, size: e.target.value }))}
                    className={`w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${!isEditingMetadata ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                      }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Khối lượng (g)
                  </label>
                  <input
                    type="number"
                    value={form.weight}
                    readOnly={!isEditingMetadata}
                    onChange={(e) => setForm((prev) => ({ ...prev, weight: e.target.value }))}
                    className={`w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${!isEditingMetadata ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                      }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Đặc tả
                </label>
                <textarea
                  rows={4}
                  readOnly={!isEditingMetadata}
                  className={`w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none ${!isEditingMetadata ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>



              {/* Thay thế block aiSummary hiện tại bằng đoạn dưới */}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Đối tượng độc giả (Khoa)
                </label>
                <select
                  disabled={!isEditingMetadata}
                  value={form.aiTargetAudience}
                  onChange={(e) => setForm((prev) => ({ ...prev, aiTargetAudience: e.target.value }))}
                  className={`w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${!isEditingMetadata ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                >
                  <option value="">-- Chưa phân loại --</option>
                  {FACULTY_TARGET_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">
                  Khoa / ngành phù hợp với nội dung ấn phẩm này
                </p>
              </div>

              {form.aiSummary && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                    <Star size={16} className="text-yellow-500" /> AI Summary & Tóm Tắt Nội Dung
                  </label>
                  <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    {form.aiSummary}
                  </p>
                </div>
              )}
            </div>

            {isEditingMetadata && (
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
                <div className="text-xs text-slate-500">
                  Đã được đồng bộ với hệ thống.
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditingMetadata(false)}
                    className="px-4 py-2 bg-white border border-slate-300 text-slate-600 font-medium rounded-lg hover:bg-slate-100 flex items-center gap-2"
                  >
                    <X size={16} /> Hủy
                  </button>
                  <button
                    className="px-6 py-2 bg-secondary text-white font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    onClick={handleUpdateMetadata}
                    disabled={saving}
                  >
                    <Save size={16} /> {saving ? 'Đang lưu...' : 'Lưu Metadata'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Cover Image Management Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
            <div className="bg-indigo-600 px-6 py-3 border-b border-indigo-700">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <ImageIcon size={18} /> Quản Lý Trang Bìa
              </h2>
              <p className="text-indigo-100 text-xs">
                Tải lên và thay đổi ảnh bìa của ấn phẩm
              </p>
            </div>
            <div className="p-6">
              {isCreate ? (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center">
                  <ImageIcon size={48} className="text-slate-300 mx-auto mb-3" />
                  <h3 className="text-slate-600 font-medium">Vui lòng tạo ấn phẩm trước</h3>
                  <p className="text-slate-400 text-sm mt-1">
                    Bạn cần lưu thông tin ấn phẩm cơ bản trước khi có thể tải lên trang bìa.
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-6">
                  <div className="w-32 h-44 bg-slate-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-200">
                    {form.coverImageUrl ? (
                      <img
                        src={form.coverImageUrl}
                        alt="Current cover"
                        className="w-full h-full object-cover transition-all hover:scale-105"
                      />
                    ) : (
                      <ImageIcon size={32} className="text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800 mb-1">Cập nhật ảnh bìa mới</h3>
                      <p className="text-xs text-slate-500">
                        Tải lên một tệp hình ảnh để làm ảnh bìa cho ấn phẩm này.
                        Định dạng hỗ trợ: JPG, PNG, WEBP. Tối đa 5MB.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => document.getElementById('cover-upload-input')?.click()}
                        disabled={isUploadingCover}
                        className="px-4 py-2 bg-secondary text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50"
                      >
                        {isUploadingCover ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                            Đang tải lên...
                          </>
                        ) : (
                          <>
                            <Upload size={16} /> Thay đổi ảnh bìa
                          </>
                        )}
                      </button>
                      <input
                        id="cover-upload-input"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleCoverUpload}
                      />
                      {form.coverImageUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Bạn có chắc chắn muốn gỡ bỏ ảnh bìa hiện tại?')) {
                              setForm(prev => ({ ...prev, coverImageUrl: null }));
                            }
                          }}
                          className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                        >
                          Gỡ bỏ
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* File URL Management Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
            <div className="bg-teal-600 px-6 py-3 border-b border-teal-700">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <Upload size={18} /> Quản Lý File Đính Kèm
              </h2>
              <p className="text-teal-100 text-xs">
                Tải file nội dung trực tiếp lên hệ thống (PDF, EPUB...)
              </p>
            </div>

            <div className="p-6 space-y-4">
              {!form.fileUrl ? (
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">
                  <Upload size={40} className="mx-auto text-slate-300 mb-3" />

                  <p className="text-slate-600 font-medium">
                    Kéo thả file hoặc chọn file để upload
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Hỗ trợ PDF, EPUB, tối đa 20MB
                  </p>

                  <button
                    onClick={() => document.getElementById('file-upload-input')?.click()}
                    className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700"
                  >
                    Chọn file
                  </button>

                  <input
                    id="file-upload-input"
                    type="file"
                    className="hidden"
                    accept=".pdf,.epub"
                    onChange={handleFileUpload}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-4 bg-teal-50 border border-teal-200 rounded-lg px-4 py-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-teal-100 rounded">
                    📄
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-medium text-teal-800">
                      {uploadedFileName || 'File đã upload'}
                    </p>
                    <p className="text-xs text-teal-600 truncate">
                      {form.fileUrl}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={form.fileUrl}
                      target="_blank"
                      className="text-teal-600 hover:text-teal-800"
                    >
                      <ExternalLink size={16} />
                    </a>

                    <button
                      onClick={() => {
                        setForm(prev => ({ ...prev, fileUrl: '' }));
                        setUploadedFileName(null);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>

                    <button
                      onClick={() => document.getElementById('file-upload-input')?.click()}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      <RotateCcw size={16} />
                    </button>
                  </div>
                </div>
              )}

              {uploadingFile && (
                <div className="flex items-center gap-2 text-sm text-teal-600">
                  <div className="w-4 h-4 border-2 border-teal-300 border-t-teal-600 animate-spin rounded-full" />
                  Đang upload file...
                </div>
              )}
            </div>
          </div>


          {/* Relationships & Classification Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
            <div className="bg-blue-600 px-6 py-3 border-b border-blue-700">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <Copy size={18} /> Phân loại & Liên kết
              </h2>
              <p className="text-blue-100 text-xs">
                Quản lý tác giả, nhà xuất bản, danh mục và thẻ phân loại
              </p>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Nhà xuất bản <span className="text-red-500">*</span>
                </label>
                <AsyncCreatableSelectField
                  value={
                    form.publisher
                      ? { value: null, label: form.publisher }
                      : null
                  }
                  loadOptions={loadPublisherOptions}
                  onCreate={createPublisherOption}
                  onChange={(selected: any) => {
                    setForm(prev => ({
                      ...prev,
                      publisher: selected?.label || '',
                    }));
                  }}
                  placeholder="Chọn hoặc nhập nhà xuất bản"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Tác giả <span className="text-red-500">*</span>
                </label>
                <AsyncCreatableSelectField
                  isMulti
                  value={form.authors.map(a => ({
                    value: a.id,
                    label: a.name,
                  }))}
                  loadOptions={loadAuthorOptions}
                  onCreate={createAuthorOption}
                  onChange={(selected: any[]) => {
                    const mapped = selected.map(s => ({
                      id: typeof s.value === 'number' ? s.value : null,
                      name: s.label,
                    }));

                    setForm(prev => ({ ...prev, authors: mapped }));
                  }}
                  placeholder="Chọn hoặc nhập tác giả"
                />
              </div>


              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Danh mục
                </label>
                <AsyncCreatableSelectField
                  isMulti
                  value={form.categories.map(name => ({
                    value: null,
                    label: name,
                  }))}
                  loadOptions={loadCategoryOptions}
                  onCreate={createCategoryOption}
                  onChange={(selected: any[]) => {
                    setForm(prev => ({
                      ...prev,
                      categories: selected.map(s => s.label),
                    }));
                  }}
                  placeholder="Chọn hoặc nhập danh mục"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tags
                </label>
                <AsyncCreatableSelectField
                  isMulti
                  value={form.tags.map(name => ({
                    value: null,
                    label: name,
                  }))}
                  loadOptions={loadTagOptions}
                  onCreate={createTagOption}
                  onChange={(selected: any[]) => {
                    setForm(prev => ({
                      ...prev,
                      tags: selected.map(s => s.label),
                    }));
                  }}
                  placeholder="Chọn hoặc nhập tag"
                />
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end items-center">
              <button
                className="px-6 py-2 bg-secondary text-white font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                onClick={handleUpdateMetadata}
                disabled={saving}
              >
                <Save size={16} /> {saving ? 'Đang lưu...' : 'Lưu Thay Đổi Nhanh'}
              </button>
            </div>
          </div>

          {/* Advanced Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-orange-200 overflow-hidden">
            <div className="bg-orange-600 px-6 py-3 border-b border-orange-700">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <AlertTriangle size={18} /> Thao Tác Nâng Cao
              </h2>
              <p className="text-orange-100 text-xs">
                Additional tools and operations
              </p>
            </div>
            <div className="p-6 space-y-6">
              {/* Merge */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Copy size={16} className="text-indigo-500" /> Sát Nhập Đầu
                  Sách Trùng Lặp
                </h3>
                <p className="text-xs text-slate-500 mt-1 mb-3">
                  Gộp ấn phẩm này với một bản trùng lặp khác. Tất cả bản sao
                  (items) và dữ liệu mô tả (metadata) sẽ được hợp nhất.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập ID ấn phẩm cần gộp..."
                    className="flex-1 px-3 py-2 border border-slate-200 rounded text-sm outline-none"
                  />
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-1 hover:bg-indigo-700">
                    <Copy size={14} /> Merge
                  </button>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Sync */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <RotateCcw size={16} className="text-green-500" /> Sync
                  Metadata from External API
                </h3>
                <p className="text-xs text-slate-500 mt-1 mb-3">
                  Automatically update metadata from Google Books, Open Library,
                  or other sources using ISBN.
                </p>
                <div className="flex gap-2">
                  <div className="px-3 py-2 border border-slate-200 rounded text-sm bg-slate-50 text-slate-700 flex-1">
                    Google Books API
                  </div>
                  <button className="bg-green-500 text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-1 hover:bg-green-600">
                    <Upload size={14} /> Sync Now
                  </button>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* QR */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <QrCode size={16} className="text-blue-500" /> Sinh mã QR Code
                </h3>
                <p className="text-xs text-slate-500 mt-1 mb-3">
                  Tạo mã QR liên kết đến ấn phẩm này để dễ dàng truy cập trên
                  thiết bị di động.
                </p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2 hover:bg-blue-700">
                  <QrCode size={16} /> Sinh mã QR Code
                </button>
              </div>

              <div className="bg-red-50 p-4 rounded-lg border border-red-100 mt-4">
                <h3 className="text-sm font-bold text-red-700 flex items-center gap-2 mb-1">
                  <AlertTriangle size={16} /> Vùng Nguy Hiểm
                </h3>
                <p className="text-xs text-red-600 mb-3">
                  Xóa vĩnh viễn ấn phẩm này và tất cả các mục liên quan. Hành
                  động này không thể hoàn tác.
                </p>
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2 hover:bg-red-700 disabled:opacity-70 disabled:cursor-not-allowed"
                  onClick={async () => {
                    if (isCreate) {
                      alert('Ấn phẩm chưa được lưu, không có gì để xoá.');
                      return;
                    }
                    const confirmed = window.confirm(
                      'Bạn chắc chắn muốn xoá ấn phẩm này? Hành động không thể hoàn tác.'
                    );
                    if (!confirmed) return;
                    try {
                      setSaving(true);
                      await publicationsService.deletePublication(Number(id));
                      alert('Đã xoá ấn phẩm.');
                      navigate('/librarian/books');
                    } catch (error) {
                      console.error('Lỗi xoá ấn phẩm', error);
                      alert('Xoá thất bại. Vui lòng thử lại.');
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                >
                  <Trash2 size={16} /> {saving ? 'Đang xoá...' : 'Xóa ấn phẩm'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Preview Column */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg sticky top-6">
            <div className="p-4 border-b border-slate-700 flex items-center gap-2">
              <Eye className="text-white" size={20} />
              <span className="text-white font-semibold">Xem Trước</span>
            </div>
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-48 h-64 rounded-lg shadow-2xl mb-6 overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                {form.coverImageUrl ? (
                  <img
                    src={form.coverImageUrl}
                    alt={form.title || 'Book cover'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full p-4 relative flex flex-col justify-between text-white text-opacity-90">
                    <div className="text-2xl font-bold tracking-widest border-b-2 border-white pb-2 mb-2 line-clamp-3">
                      {form.title || 'Chưa có tiêu đề'}
                    </div>
                    <div className="text-xs opacity-80 line-clamp-2">
                      {form.publisher || 'Chưa có NXB'}
                    </div>
                    <div className="mt-auto text-xs font-mono opacity-70">
                      {form.publicationYear || '----'}
                    </div>
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold text-white mb-1">
                {form.title || 'Chưa có tiêu đề'}
              </h3>
              <p className="text-slate-400 text-sm mb-3">
                {previewAuthors} • {form.publicationYear || 'N/A'}
              </p>

              <div className="flex items-center gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={16}
                    className={
                      s <= 4
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-slate-600'
                    }
                  />
                ))}
                <span className="text-slate-400 text-xs ml-2">
                  {form.averageRating} ({form.totalRatings} đánh giá)
                </span>
              </div>

              <div className="w-full space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Available:</span>
                  <span className="text-green-400 font-medium">{form.availableItems} bản sao</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">On Loan:</span>
                  <span className="text-yellow-400 font-medium">{form.borrowedItems} bản sao</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-slate-700">
                  <span className="text-white">Total:</span>
                  <span className="text-white font-medium">{form.totalItems} bản sao</span>
                </div>
              </div>

              <button className="w-full py-3 bg-secondary hover:bg-indigo-600 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors">
                <ExternalLink size={18} /> Xem Trang Công Khai
              </button>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};

export default BookDetails;
