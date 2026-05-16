import {
  BookOpen,
  CheckCircle,
  Filter,
  Grid,
  ListFilter,
  Search,
  X,
} from 'lucide-react';
import debounce from 'lodash/debounce';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import publicationsService from '../../api/publicationsService';
import { Category, PageResponse, PublicSearchResult } from '../../api/publicationTypes';
import searchHistoryService, { SearchHistoryItem } from '../../api/searchHistoryService';
import { useAuth } from '../../contexts/AuthContext';
import { Badge, Button } from '../../components/ui';
import categoriesService from '../../api/categoriesService';

const BRANCHES = [
  { value: '', label: 'Tất cả cơ sở' },
  { value: 'Cơ sở 1 - Lý Thường Kiệt', label: 'Cơ sở 1 - Lý Thường Kiệt' },
  { value: 'Cơ sở 2 - Dĩ An', label: 'Cơ sở 2 - Dĩ An' },
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Liên quan nhất' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'most_borrowed', label: 'Mượn nhiều nhất' },
  { value: 'most_viewed', label: 'Xem nhiều nhất' },
];

const getCategoryName = (category: Category) =>
  category.name || category.categoryName || 'Danh mục chưa đặt tên';

const toSearchResult = (detail: any): PublicSearchResult => ({
  publicationId: String(detail.publication.id),
  title: detail.publication.title,
  coverImageUrl: detail.publication.coverImageUrl ?? null,
  publicationYear: detail.publication.publicationYear ?? null,
  language: detail.publication.language ?? null,
  description: detail.publication.aiSummary || detail.publication.description || null,
  publisherName: detail.publisher?.name ?? null,
  authorNames: (detail.authors ?? []).map((author: any) => author.name).join(', ') || null,
  categoryNames: (detail.categories ?? []).map((category: any) => category.name).join(', ') || null,
  totalItems: detail.items?.totalItems ?? detail.publication.totalItems ?? 0,
  availableItems: detail.items?.totalAvailableItems ?? detail.publication.availableItems ?? 0,
  avgRating: detail.ratings?.averageRating ?? 0,
  borrowCount: detail.publication.borrowCount ?? 0,
  viewCount: detail.publication.viewCount ?? 0,
});

const sortResults = (items: PublicSearchResult[], sortBy: string) => {
  const sorted = [...items];
  switch (sortBy) {
    case 'relevance':
      return sorted;
    case 'rating':
      return sorted.sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));
    case 'title_az':
      return sorted.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
    case 'most_borrowed':
      return sorted.sort((a, b) => (b.borrowCount ?? 0) - (a.borrowCount ?? 0));
    case 'most_viewed':
      return sorted.sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
    case 'newest':
    default:
      return sorted.sort((a, b) => (b.publicationYear ?? 0) - (a.publicationYear ?? 0));
  }
};

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { userType } = useAuth();
  const canUseSearchHistory = () => Boolean(userType || localStorage.getItem('accessToken'));
  const prefix = useMemo(
    () => location.pathname.startsWith('/userpage') ? '/userpage' : '/publicpage',
    [location.pathname]
  );

  // Search state
  const [inputValue, setInputValue] = useState(() => searchParams.get('q') ?? '');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Filter state
  const [available, setAvailable] = useState(false);
  const [language, setLanguage] = useState('');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [branch, setBranch] = useState('');
  const [categoryId, setCategoryId] = useState(() => searchParams.get('categoryId') ?? '');
  const [sortBy, setSortBy] = useState(() => searchParams.get('sort') ?? 'relevance');
  const [page, setPage] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    categoriesService.getAllCategories()
      .then(res => setCategories(res.data ?? []))
      .catch(() => {});
  }, []);

  // Results
  const [result, setResult] = useState<PageResponse<PublicSearchResult> | null>(null);
  const [loading, setLoading] = useState(false);

  // Search suggestions
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounced fetch suggestions khi gõ
  const fetchSuggestions = useMemo(() =>
    debounce((kw: string) => {
      if (!canUseSearchHistory()) return;
      searchHistoryService.getHistory(kw || undefined)
        .then(res => setHistory(res.data ?? []))
        .catch(() => {});
    }, 300),
  [userType]);

  useEffect(() => () => fetchSuggestions.cancel(), [fetchSuggestions]);

  // Khi inputValue thay đổi → fetch suggestions
  useEffect(() => {
    if (showSuggestions) fetchSuggestions(inputValue);
  }, [inputValue, showSuggestions]);

  // Fetch recent khi focus lần đầu
  const handleInputFocus = () => {
    setShowSuggestions(true);
    if (!canUseSearchHistory()) return;
    searchHistoryService.getHistory()
      .then(res => setHistory(res.data ?? []))
      .catch(() => {});
  };

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current && !inputRef.current.contains(e.target as Node) &&
        suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Active keyword (only updates on submit)
  const [activeKeyword, setActiveKeyword] = useState(() => searchParams.get('q') ?? '');

  const doSearch = (kw: string, pg = 0) => {
    setLoading(true);
    setShowSuggestions(false);
    if (kw.trim() && canUseSearchHistory()) {
      searchHistoryService.saveHistory(kw.trim())
        .then(() => searchHistoryService.getHistory().then(r => setHistory(r.data ?? [])))
        .catch(() => {});
    }
    publicationsService.searchPublications({
      keyword: kw || undefined,
      available: available || undefined,
      language: language || undefined,
      yearFrom: yearFrom ? Number(yearFrom) : undefined,
      yearTo: yearTo ? Number(yearTo) : undefined,
      branch: branch || undefined,
      categoryId: categoryId || undefined,
      sortBy: sortBy === 'relevance' ? 'newest' : sortBy,
      page: pg,
      size: 12,
    })
      .then(res => setResult(res.data))
      .catch(() => setResult(null))
      .finally(() => setLoading(false));
  };

  const doHybridSearch = async (kw: string, pg = 0) => {
    const normalizedKeyword = kw.trim();
    if (!normalizedKeyword) {
      doSearch('', pg);
      return;
    }

    setLoading(true);
    setShowSuggestions(false);
    if (canUseSearchHistory()) {
      searchHistoryService.saveHistory(normalizedKeyword)
        .then(() => searchHistoryService.getHistory().then(r => setHistory(r.data ?? [])))
        .catch(() => {});
    }

    try {
      const semanticRes = await publicationsService.semanticSearch(normalizedKeyword, 50);
      const publicationIds = (semanticRes.data?.publicationIds ?? []).map(String);
      const detailResponses = await Promise.all(
        publicationIds.map(id =>
          publicationsService.getPublicationById(id)
            .then(res => res.data)
            .catch(() => null)
        )
      );

      let content = detailResponses
        .filter(Boolean)
        .map(detail => toSearchResult(detail));

      if (available) {
        content = content.filter(item => item.availableItems > 0);
      }
      if (language) {
        content = content.filter(item => item.language === language);
      }
      if (yearFrom) {
        content = content.filter(item => (item.publicationYear ?? 0) >= Number(yearFrom));
      }
      if (yearTo) {
        content = content.filter(item => (item.publicationYear ?? 0) <= Number(yearTo));
      }
      if (categoryId) {
        const selectedCategory = categories.find(category => String(category.id) === String(categoryId));
        if (selectedCategory) {
          content = content.filter(item => item.categoryNames?.includes(getCategoryName(selectedCategory)));
        }
      }

      content = sortResults(content, sortBy);

      const pageSize = 12;
      const totalElements = content.length;
      const totalPages = Math.ceil(totalElements / pageSize);
      const pageContent = content.slice(pg * pageSize, pg * pageSize + pageSize);

      setResult({
        content: pageContent,
        totalElements,
        totalPages,
        currentPage: pg,
        pageSize,
        isFirst: pg === 0,
        isLast: pg >= totalPages - 1,
      });
    } catch {
      toast.error('Không thể tìm kiếm ngữ nghĩa lúc này');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and when sort/page changes
  useEffect(() => {
    doHybridSearch(activeKeyword, page);
  }, [activeKeyword, sortBy, page]);

  const handleSearch = () => {
    const kw = inputValue.trim();
    setActiveKeyword(kw);
    setPage(0);
    const p = new URLSearchParams(searchParams);
    kw ? p.set('q', kw) : p.delete('q');
    categoryId ? p.set('categoryId', categoryId) : p.delete('categoryId');
    sortBy === 'relevance' ? p.delete('sort') : p.set('sort', sortBy);
    setSearchParams(p, { replace: true });
  };

  const handleApplyFilters = () => {
    setPage(0);
    const p = new URLSearchParams(searchParams);
    activeKeyword ? p.set('q', activeKeyword) : p.delete('q');
    categoryId ? p.set('categoryId', categoryId) : p.delete('categoryId');
    sortBy === 'relevance' ? p.delete('sort') : p.set('sort', sortBy);
    setSearchParams(p, { replace: true });
    doHybridSearch(activeKeyword, 0);
  };

  const handleClearFilters = () => {
    setAvailable(false);
    setLanguage('');
    setYearFrom('');
    setYearTo('');
    setBranch('');
    setCategoryId('');
    setPage(0);
    doHybridSearch(activeKeyword, 0);
    const p = new URLSearchParams(searchParams);
    p.delete('categoryId');
    setSearchParams(p, { replace: true });
  };

  const items = result?.content ?? [];
  const total = result?.totalElements ?? 0;
  const totalPages = result?.totalPages ?? 0;

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow flex flex-col">
              <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onFocus={handleInputFocus}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSearch();
                  if (e.key === 'Escape') setShowSuggestions(false);
                }}
                placeholder="Nhập tên sách, tác giả, ISBN hoặc mô tả nội dung bạn muốn tìm..."
                className="block w-full pl-10 pr-28 py-2.5 border border-gray-300 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-1">
                {inputValue && (
                  <button onClick={() => setInputValue('')} className="p-1.5 text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                )}
                <button
                  onClick={handleSearch}
                  className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 ml-1 mr-0.5"
                >
                  Tìm kiếm
                </button>
              </div>

              {/* Suggestions dropdown */}
              {showSuggestions && history.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
                >
                  <div className="px-3 py-2 text-xs text-gray-400 font-medium border-b border-gray-100">
                    Tìm kiếm gần đây
                  </div>
                  {history.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer group"
                      onMouseDown={() => {
                        setInputValue(item.keyword);
                        setActiveKeyword(item.keyword);
                        setPage(0);
                        setShowSuggestions(false);
                      }}
                    >
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Search size={13} className="text-gray-400 flex-shrink-0" />
                        {item.keyword}
                      </div>
                      <button
                        onMouseDown={e => {
                          e.stopPropagation();
                          setHistory(prev => prev.filter(h => h.id !== item.id));
                          searchHistoryService.deleteHistory(item.id).catch(() => {});
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center">
                <Filter size={18} className="mr-2" /> Bộ lọc
              </h3>
              <button onClick={handleClearFilters} className="text-xs text-blue-600 hover:underline">
                Xoá tất cả
              </button>
            </div>

            {/* Sắp xếp */}
            <div className="border-b border-gray-200 pb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Sắp xếp</h4>
              <div className="space-y-2">
                {SORT_OPTIONS.map(opt => (
                  <label key={opt.value} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="sort"
                      value={opt.value}
                      checked={sortBy === opt.value}
                      onChange={() => { setSortBy(opt.value); setPage(0); }}
                      className="border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tình trạng */}
            <div className="border-b border-gray-200 pb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Tình trạng</h4>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={available}
                  onChange={e => setAvailable(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">Có bản khả dụng</span>
              </label>
            </div>

            {/* Chủ đề */}
            {categories.length > 0 && (
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900">Danh mục</h4>
                  <Link to="/publicpage/categories" className="text-xs text-blue-600 hover:underline">
                    Xem tất cả
                  </Link>
                </div>
                <div className="space-y-2 mb-3">
                  {categories.slice(0, 6).map(category => (
                    <label key={category.id} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value={category.id}
                        checked={String(categoryId) === String(category.id)}
                        onChange={() => setCategoryId(String(category.id))}
                        className="border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-600 line-clamp-1">
                        {getCategoryName(category)}
                      </span>
                    </label>
                  ))}
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={!categoryId}
                      onChange={() => setCategoryId('')}
                      className="border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Tất cả danh mục</span>
                  </label>
                </div>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md text-sm px-3 py-2 bg-white focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Chọn danh mục khác...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{getCategoryName(c)}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Cơ sở */}
            <div className="border-b border-gray-200 pb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Cơ sở</h4>
              <select
                value={branch}
                onChange={e => setBranch(e.target.value)}
                className="w-full border border-gray-300 rounded-md text-sm px-3 py-2 bg-white focus:ring-blue-500 focus:border-blue-500"
              >
                {BRANCHES.map(b => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>

            {/* Năm xuất bản */}
            <div className="border-b border-gray-200 pb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Năm xuất bản</h4>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={yearFrom}
                  onChange={e => setYearFrom(e.target.value)}
                  placeholder="Từ"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  value={yearTo}
                  onChange={e => setYearTo(e.target.value)}
                  placeholder="Đến"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Ngôn ngữ */}
            <div className="border-b border-gray-200 pb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Ngôn ngữ</h4>
              <div className="space-y-2">
                {[{ value: '', label: 'Tất cả' }, { value: 'Vietnamese', label: 'Tiếng Việt' }, { value: 'English', label: 'English' }].map(opt => (
                  <label key={opt.value} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="language"
                      value={opt.value}
                      checked={language === opt.value}
                      onChange={() => setLanguage(opt.value)}
                      className="border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <Button fullWidth variant="primary" onClick={handleApplyFilters}>
              Áp dụng bộ lọc
            </Button>
          </div>

          {/* Main Results */}
          <div className="flex-grow min-w-0">
            {/* Controls & Count */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-lg font-bold text-gray-900">
                {loading ? 'Đang tìm...' : (
                  total > 0
                    ? `${total} kết quả${activeKeyword ? ` cho "${activeKeyword}"` : ''}`
                    : 'Không có kết quả'
                )}
              </h2>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Sắp xếp:</span>
                  <select
                    value={sortBy}
                    onChange={e => { setSortBy(e.target.value); setPage(0); }}
                    className="border-gray-200 rounded-md text-sm font-medium text-gray-700 focus:ring-blue-500 focus:border-blue-500 py-1.5 pl-2 pr-8"
                  >
                    {SORT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex bg-gray-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <ListFilter size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Grid size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
              </div>
            )}

            {/* Empty */}
            {!loading && items.length === 0 && (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                <BookOpen size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-500 font-medium">Không tìm thấy kết quả phù hợp</p>
                <p className="text-gray-400 text-sm mt-1">Thử thay đổi từ khoá hoặc bộ lọc</p>
              </div>
            )}

            {/* Results */}
            {!loading && items.length > 0 && (
              <div className={viewMode === 'grid'
                ? 'grid grid-cols-2 md:grid-cols-3 gap-4'
                : 'space-y-4'
              }>
                {items.map(item => (
                  viewMode === 'grid'
                    ? <SearchGridCard key={item.publicationId} item={item} prefix={prefix} />
                    : <SearchListCard key={item.publicationId} item={item} prefix={prefix} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="mt-10 flex justify-center gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                  &lt;
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pg = page < 3 ? i : page - 2 + i;
                  if (pg >= totalPages) return null;
                  return (
                    <Button
                      key={pg}
                      size="sm"
                      variant={pg === page ? 'primary' : 'outline'}
                      onClick={() => setPage(pg)}
                    >
                      {pg + 1}
                    </Button>
                  );
                })}
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                  &gt;
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SearchListCard = ({ item, prefix }: { item: PublicSearchResult; prefix: string }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-4 flex gap-5 hover:shadow-lg transition-all duration-300 group">
    <Link to={`${prefix}/book/${item.publicationId}`} className="flex-shrink-0 w-32 h-48 bg-gray-100 rounded-lg overflow-hidden shadow-sm">
      {item.coverImageUrl ? (
        <img src={item.coverImageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <BookOpen size={32} className="text-gray-300" />
        </div>
      )}
    </Link>
    <div className="flex-grow flex flex-col justify-between min-w-0">
      <div>
        <h3 className="text-lg font-bold text-gray-900 hover:text-blue-600 mb-1 leading-tight">
          <Link to={`${prefix}/book/${item.publicationId}`}>{item.title}</Link>
        </h3>
        <p className="text-sm text-gray-500 mb-2">
          {[item.authorNames, item.publicationYear, item.publisherName].filter(Boolean).join(' • ')}
        </p>
        {item.categoryNames && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {item.categoryNames.split(', ').slice(0, 3).map(cat => (
              <Badge key={cat} variant="secondary" className="bg-gray-100 text-gray-600 border border-gray-200 text-xs">
                {cat}
              </Badge>
            ))}
          </div>
        )}
        {item.description && (
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{item.description}</p>
        )}
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-gray-100 pt-3 mt-3 gap-3">
        <div className="flex items-center gap-3 text-sm">
          {item.availableItems > 0 ? (
            <span className="flex items-center text-green-700 font-medium bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
              <CheckCircle size={14} className="mr-1.5" /> {item.availableItems}/{item.totalItems} khả dụng
            </span>
          ) : (
            <span className="flex items-center text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
              <X size={14} className="mr-1.5" /> Hết sách
            </span>
          )}
        </div>
        <Link to={`${prefix}/book/${item.publicationId}`}>
          <Button variant="outline" size="sm">Xem chi tiết</Button>
        </Link>
      </div>
    </div>
  </div>
);

const SearchGridCard = ({ item, prefix }: { item: PublicSearchResult; prefix: string }) => (
  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col">
    <Link to={`${prefix}/book/${item.publicationId}`} className="h-48 bg-gray-100 overflow-hidden block">
      {item.coverImageUrl ? (
        <img src={item.coverImageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <BookOpen size={40} className="text-gray-300" />
        </div>
      )}
    </Link>
    <div className="p-3 flex flex-col flex-1">
      <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-1 hover:text-blue-600">
        <Link to={`${prefix}/book/${item.publicationId}`}>{item.title}</Link>
      </h3>
      <p className="text-xs text-gray-500 line-clamp-1 mb-2">{item.authorNames}</p>
      <div className="mt-auto flex items-center justify-between">
        {item.availableItems > 0 ? (
          <span className="text-xs text-green-700 font-medium">{item.availableItems} khả dụng</span>
        ) : (
          <span className="text-xs text-red-500 font-medium">Hết sách</span>
        )}
        <Link to={`${prefix}/book/${item.publicationId}`}>
          <Button variant="outline" size="sm" className="text-xs py-1">Chi tiết</Button>
        </Link>
      </div>
    </div>
  </div>
);

export default SearchPage;
