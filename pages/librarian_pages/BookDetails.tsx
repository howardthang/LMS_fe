import {
  AlertTriangle,
  ArrowLeft,
  Copy,
  ExternalLink,
  Eye,
  Plus,
  QrCode,
  RotateCcw,
  Save,
  Star,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import publicationsService from '../../api/publicationsService';
import categoriesService from '../../api/categoriesService';
import publishersService from '../../api/publishersService';
import authorsService from '../../api/authorsService';
import tagsService from '../../api/tagsService';
import { Publication, Publisher, Author, Category, Tag } from '../../api/publicationTypes';
import axiosInstance from '../../api/axiosInstance';

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

  // Fetch dropdown data
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [pubRes, authRes, catRes, tagRes] = await Promise.all([
          publishersService.getAllPublishers(),
          authorsService.getAllAuthors(),
          categoriesService.getAllCategories(),
          tagsService.getAllTags()
        ]);

        if (pubRes.data) setPublishers(pubRes.data);
        if (authRes.data) setAuthors(authRes.data);
        if (catRes.data) setCategories(catRes.data);
        if (tagRes.data) setTags(tagRes.data);
      } catch (error) {
        console.error("Error fetching dropdown data", error);
      }
    };
    fetchDropdownData();
  }, []);

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

  const handleSave = async () => {
    const publisherId = publishers.find((p) => p.publisherName === form.publisher)?.id;
    const authorIds = authorsList
      .map((a) => a.id)
      .filter((id): id is number => typeof id === 'number');
    const categoryIds = form.categories
      .map((name) => categories.find((c) => c.categoryName === name)?.id)
      .filter((id): id is number => typeof id === 'number');
    const tagIds = form.tags
      .map((name) => tags.find((t) => t.tagName === name)?.id)
      .filter((id): id is number => typeof id === 'number');

    if (!form.title.trim()) {
      alert('Tiêu đề không được để trống.');
      return;
    }
    if (!publisherId) {
      alert('Vui lòng chọn nhà xuất bản.');
      return;
    }
    if (!authorIds.length) {
      alert('Vui lòng chọn ít nhất 1 tác giả.');
      return;
    }

    const numberOfPages = form.pages ? Number(form.pages) : undefined;
    const publicationYear = form.publicationYear ? Number(form.publicationYear) : undefined;
    const weight = form.weight ? Number(form.weight) : undefined;

    const payload = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim() || '',
      description: form.description || '',
      aiSummary: form.aiSummary || '',
      aiTargetAudience: form.aiTargetAudience || '',
      fileUrl: form.fileUrl || '',
      language: form.language || '',
      numberOfPages,
      publicationYear,
      edition: form.edition || '',
      coverImageUrl: form.coverImageUrl || '',
      size: form.size || '',
      weight,
      publisherId,
      authorIds,
      categoryIds,
      tagIds,
      isbn: form.isbn || '',
    };

    try {
      setSaving(true);
      if (isCreate) {
        await axiosInstance.post('/publications', payload);
        alert('Đã tạo ấn phẩm mới.');
        setForm(emptyForm);
        navigate('/librarian/books');
      } else {
        await publicationsService.updatePublication(Number(id), payload as any);
        alert('Đã lưu thành công.');
      }
    } catch (error) {
      console.error('Lỗi lưu ấn phẩm', error);
      alert('Lưu thất bại. Vui lòng thử lại.');
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
          {/* Metadata Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-secondary px-6 py-3 border-b border-indigo-700">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <Copy size={18} /> Publication Metadata
              </h2>
              <p className="text-indigo-200 text-xs">
                Quản lý các thông tin cơ bản về ấn phẩm
              </p>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Main title of the publication
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tải lên trang bìa
                  </label>
                  <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                    <Upload size={16} /> Tải lên trang bìa
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    ISBN <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.isbn}
                    onChange={(e) => setForm((prev) => ({ ...prev, isbn: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Số trang
                  </label>
                  <input
                    type="number"
                    value={form.pages}
                    onChange={(e) => setForm((prev) => ({ ...prev, pages: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Năm xuất bản <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={form.publicationYear}
                    onChange={(e) => setForm((prev) => ({ ...prev, publicationYear: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Ngôn ngữ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.language}
                    onChange={(e) => setForm((prev) => ({ ...prev, language: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
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
                    onChange={(e) => setForm((prev) => ({ ...prev, edition: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Kích cỡ (A x A x A cm)
                  </label>
                  <input
                    type="text"
                    value={form.size}
                    onChange={(e) => setForm((prev) => ({ ...prev, size: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Khối lượng (g)
                  </label>
                  <input
                    type="number"
                    value={form.weight}
                    onChange={(e) => setForm((prev) => ({ ...prev, weight: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Đặc tả
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {/* AI Details could optionally go here, but omitted based on form mapping to simplify the page initially, or we leave it. Let me just add the ones actually mapped in form like aiSummary */}
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

            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
              <div className="text-xs text-slate-500">
                Đã được đồng bộ với hệ thống.
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-white border border-slate-300 text-slate-600 font-medium rounded-lg hover:bg-slate-100 flex items-center gap-2">
                  <RotateCcw size={16} /> Reset
                </button>
                <button
                  className="px-6 py-2 bg-secondary text-white font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save size={16} /> {saving ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
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
                  Tác giả <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  {authorsList.map((author, idx) => {
                    const selectedIds = authorsList
                      .map((a) => a.id)
                      .filter((id): id is number => id !== null && id !== undefined);
                    const availableOptions = authors
                      .filter((a) => !selectedIds.includes(a.id) || a.id === author.id)
                      .map((a) => ({ value: a.id, label: a.authorName }));

                    return (
                      <div className="flex gap-2" key={idx}>
                        <div className="flex-1">
                          <Select
                            options={availableOptions}
                            value={
                              author.name
                                ? { value: author.id || 0, label: author.name }
                                : null
                            }
                            onChange={(option) =>
                              updateAuthor(idx, option?.label || '', option?.value)
                            }
                            isSearchable
                            placeholder="Chọn tác giả"
                            styles={selectStyles}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (authorsList.length <= 1) {
                              alert('Không thể xóa tác giả. Phải có ít nhất 1 tác giả.');
                              return;
                            }
                            removeAuthor(idx);
                          }}
                          className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    onClick={addAuthor}
                    className="text-secondary text-sm font-medium flex items-center gap-1 hover:underline"
                  >
                    <Plus size={16} /> Add Another Author
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Nhà xuất bản <span className="text-red-500">*</span>
                </label>
                <Select
                  options={publishers.map(p => ({ value: p.id, label: p.publisherName }))}
                  value={
                    publishers.find(p => p.publisherName === form.publisher)
                      ? { value: publishers.find(p => p.publisherName === form.publisher)!.id, label: form.publisher }
                      : form.publisher
                        ? { value: 0, label: form.publisher }
                        : null
                  }
                  onChange={(option) => setForm(prev => ({ ...prev, publisher: option?.label || '' }))}
                  isSearchable
                  isClearable
                  placeholder="Chọn nhà xuất bản"
                  styles={selectStyles}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Danh mục
                </label>
                <Select
                  isMulti
                  options={categories.map(c => ({ value: c.id, label: c.categoryName }))}
                  value={form.categories.map(catName => {
                    const cat = categories.find(c => c.categoryName === catName);
                    return cat ? { value: cat.id, label: cat.categoryName } : { value: 0, label: catName };
                  })}
                  onChange={(options) => {
                     const selectedNames = options.map(o => o.label);
                     setForm(prev => ({ ...prev, categories: selectedNames }));
                  }}
                  placeholder="Chọn danh mục"
                  styles={selectStyles}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tags
                </label>
                <Select
                  isMulti
                  options={tags.map(t => ({ value: t.id, label: t.tagName }))}
                  value={form.tags.map(tagName => {
                    const tag = tags.find(t => t.tagName === tagName);
                    return tag ? { value: tag.id, label: tag.tagName } : { value: 0, label: tagName };
                  })}
                  onChange={(options) => {
                     const selectedNames = options.map(o => o.label);
                     setForm(prev => ({ ...prev, tags: selectedNames }));
                  }}
                  placeholder="Chọn tags"
                  styles={selectStyles}
                />
              </div>
            </div>
            
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end items-center">
              <button
                className="px-6 py-2 bg-secondary text-white font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                onClick={handleSave}
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
    </div>
  );
};

export default BookDetails;
