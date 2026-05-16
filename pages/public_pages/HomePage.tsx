import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BarChart,
  Book,
  CheckCircle,
  ChevronRight,
  Code,
  Database,
  Globe,
  Scale,
  Search,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import searchHistoryService from '../../api/searchHistoryService';
import { useAuth } from '../../contexts/AuthContext';
import { Badge, Button, StarRating } from '../../components/ui';
import publicationsService from '../../api/publicationsService';
import categoriesService from '../../api/categoriesService';
import recommendationService, { RecommendedPublication } from '../../api/recommendationService';
import {
  Category,
  MostBorrowedPublication,
  NewestPublication,
  PublicLibraryStats,
  PublicTestimonial,
} from '../../api/publicationTypes';

const BOOK_COVER_PLACEHOLDER = '/books/book-placeholder.svg';

const HeroSection = () => {
  const navigate = useNavigate();
  const { userType } = useAuth();
  const [searchInput, setSearchInput] = useState('');
  const [history, setHistory] = useState<import('../../api/searchHistoryService').SearchHistoryItem[]>([]);

  useEffect(() => {
    if (!userType) return;
    searchHistoryService.getHistory()
      .then(res => setHistory(res.data ?? []))
      .catch(() => {});
  }, [userType]);

  const handleSearch = (kw?: string) => {
    const q = (kw ?? searchInput).trim();
    navigate(q ? `/publicpage/search?q=${encodeURIComponent(q)}` : '/publicpage/search');
  };

  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(h => h.id !== id));
    searchHistoryService.deleteHistory(id).catch(() => {});
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-100/50 rounded-bl-[100px] -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 bg-white rounded-full px-3 py-1 border border-blue-100 shadow-sm">
              <Sparkles size={14} className="text-blue-600" />
              <span className="text-xs font-medium text-blue-800">
                Được hỗ trợ bởi AI
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight text-gray-900">
              Tìm sách bằng <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                ngôn ngữ tự nhiên
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-lg">
              Khám phá hàng ngàn tài liệu học thuật với công nghệ tìm kiếm ngữ
              nghĩa AI. Không cần từ khóa chính xác, chỉ cần mô tả những gì bạn
              muốn tìm.
            </p>

            <div className="bg-white p-2 rounded-xl shadow-xl border border-gray-100 max-w-xl">
              <div className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Nhập tên sách, tác giả, ISBN hoặc mô tả nội dung..."
                  className="w-full pl-4 pr-28 py-3 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-900"
                />
                <Button
                  className="absolute right-1 top-1 bottom-1"
                  size="sm"
                  onClick={() => handleSearch()}
                >
                  <Search size={16} className="mr-1" /> Tìm kiếm
                </Button>
              </div>
              <div className="mt-3 px-2 flex flex-wrap gap-2 text-xs items-center">
                {history.length > 0 ? (
                  <>
                    <span className="text-gray-400 font-medium">Tìm gần đây:</span>
                    {history.map(item => (
                      <span
                        key={item.id}
                        onClick={() => handleSearch(item.keyword)}
                        className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-md cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors group"
                      >
                        {item.keyword}
                        <button
                          onClick={(e) => handleDeleteHistory(item.id, e)}
                          className="opacity-0 group-hover:opacity-100 ml-0.5 text-gray-400 hover:text-red-500 transition-opacity"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </>
                ) : (
                  <>
                    <span className="text-gray-400 font-medium">Gợi ý:</span>
                    {['Python cơ bản', 'Machine learning', 'Kinh tế vi mô'].map(kw => (
                      <span
                        key={kw}
                        onClick={() => handleSearch(kw)}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        {kw}
                      </span>
                    ))}
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-6 text-sm font-medium pt-2">
              <Link
                to="/publicpage/search?sort=newest"
                className="text-blue-600 hover:text-blue-800 flex items-center group"
              >
                Xem tất cả sách mới{' '}
                <ArrowRight
                  size={16}
                  className="ml-1 group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <Link
                to="/publicpage/categories"
                className="text-gray-600 hover:text-gray-900 flex items-center group"
              >
                Khám phá theo chủ đề{' '}
                <ArrowRight
                  size={16}
                  className="ml-1 group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Library"
                className="w-full h-auto object-cover transform scale-105"
              />

              {/* Floating Card 1 */}
              <div className="absolute bottom-8 left-8 bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-lg flex items-center space-x-4 border border-white/50 animate-bounce-slow">
                <div className="p-3 bg-green-100 rounded-full text-green-600">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">15,000+</p>
                  <p className="text-sm text-gray-500 font-medium">
                    Tài liệu khả dụng
                  </p>
                </div>
              </div>

              {/* Floating Card 2 */}
              <div
                className="absolute top-8 right-8 bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-lg flex items-center space-x-4 border border-white/50 animate-bounce-slow"
                style={{ animationDelay: '1s' }}
              >
                <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">5,000+</p>
                  <p className="text-sm text-gray-500 font-medium">
                    Sinh viên đang sử dụng
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SectionHeader = ({
  title,
  subtitle,
  linkText,
  linkUrl,
}: {
  title: string;
  subtitle?: string;
  linkText?: string;
  linkUrl?: string;
}) => (
  <div className="flex justify-between items-end mb-8">
    <div>
      {subtitle && (
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">
            {subtitle}
          </span>
        </div>
      )}
      <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">{title}</h2>
    </div>
    {linkText && linkUrl && (
      <Link
        to={linkUrl}
        className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center group"
      >
        {linkText}{' '}
        <ArrowRight
          size={16}
          className="ml-1 group-hover:translate-x-1 transition-transform"
        />
      </Link>
    )}
  </div>
);

const BookCard = ({
  id,
  title,
  author,
  rating,
  reviews,
  image,
  available,
  tag,
  color = 'blue',
}: any) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
    <Link to={`/publicpage/book/${id || 1}`} className="relative aspect-[3/4] w-full overflow-hidden rounded-t-xl bg-gray-100 block">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute top-3 left-3 flex flex-col gap-2">
        {tag && (
          <span
            className={`bg-${color}-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm`}
          >
            {tag}
          </span>
        )}
      </div>
      <div className="absolute bottom-3 left-3">
        <span className="bg-white/90 backdrop-blur text-gray-800 text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center">
          <span
            className={`w-1.5 h-1.5 rounded-full bg-${
              available > 0 ? 'green' : 'red'
            }-500 mr-1.5`}
          ></span>
          {available} bản khả dụng
        </span>
      </div>
    </Link>
    <div className="p-4 flex flex-col flex-grow">
      <h3 className="font-bold text-gray-900 line-clamp-2 text-base mb-1 leading-snug group-hover:text-blue-600 transition-colors">
        <Link to={`/publicpage/book/${id || 1}`}>{title}</Link>
      </h3>
      <p className="text-xs text-gray-500 mb-3 truncate">{author}</p>

      <div className="mt-auto pt-3 border-t border-gray-50">
        <div className="flex items-center mb-4">
          <StarRating rating={rating} size={14} />
          <span className="text-[10px] text-gray-400 ml-1">({reviews})</span>
        </div>
      </div>
        <Link to={`/publicpage/book/${id || 1}`}>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs py-1 px-2 h-8 text-blue-600 bg-blue-50 hover:bg-blue-100"
          >
            Xem chi tiết
          </Button>
        </Link>
    </div>
  </div>
);

const CATEGORY_ACCENTS = [
  { icon: <Sparkles size={20} />, color: 'bg-blue-500' },
  { icon: <Code size={20} />, color: 'bg-indigo-500' },
  { icon: <Database size={20} />, color: 'bg-red-500' },
  { icon: <BarChart size={20} />, color: 'bg-green-500' },
  { icon: <Globe size={20} />, color: 'bg-pink-500' },
  { icon: <Book size={20} />, color: 'bg-yellow-500' },
  { icon: <Scale size={20} />, color: 'bg-gray-600' },
  { icon: <CheckCircle size={20} />, color: 'bg-purple-500' },
];

const getCategoryName = (category: Category) =>
  category.name || category.categoryName || 'Danh mục chưa đặt tên';

const formatCompactNumber = (value?: number) => {
  const numericValue = value ?? 0;
  return numericValue.toLocaleString('vi-VN');
};

const CategoryItem = ({ category, accent }: { category: Category; accent: typeof CATEGORY_ACCENTS[number] }) => (
  <Link
    to={`/publicpage/search?categoryId=${category.id}`}
    className="block bg-white border border-gray-100 rounded-xl p-5 hover:border-blue-200 hover:shadow-lg transition-all cursor-pointer group"
  >
    <div
      className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${accent.color} text-white shadow-md group-hover:scale-110 transition-transform`}
    >
      {accent.icon}
    </div>
    <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 mb-1">
      {getCategoryName(category)}
    </h3>
    <p className="text-xs text-gray-500 mb-3 line-clamp-2 min-h-[32px]">
      {category.bio || 'Tài liệu đang được phân loại trong danh mục này'}
    </p>
    <div className="flex items-center justify-between text-xs font-medium text-blue-600">
      <span>{formatCompactNumber(category.publicationCount)} sách</span>
      <ArrowRight size={12} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  </Link>
);

const TrendingItem = ({
  id,
  rank,
  title,
  author,
  loans,
  available,
  rating,
  category,
  image,
}: any) => (
  <div className="flex items-start bg-white p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-purple-500"></div>
    <Link to={`/publicpage/book/${id || 1}`} className="mr-4 relative flex-shrink-0">
      <img
        src={image || BOOK_COVER_PLACEHOLDER}
        alt={title}
        className="w-20 h-28 object-cover rounded shadow-sm"
      />
      <div className="absolute -top-2 -left-2 w-8 h-8 bg-gray-900 text-white flex items-center justify-center rounded-full font-bold text-sm border-2 border-white shadow">
        #{rank}
      </div>
    </Link>
    <div className="flex-grow min-w-0">
      <div className="flex items-center space-x-2 mb-1">
        <Badge variant="secondary" className="text-[10px] py-0">
          {category}
        </Badge>
      </div>
      <h3 className="font-bold text-gray-900 text-sm mb-1 truncate pr-2 group-hover:text-blue-600">
        <Link to={`/publicpage/book/${id || 1}`}>{title}</Link>
      </h3>
      <p className="text-xs text-gray-500 mb-2">{author}</p>
      <div className="flex items-center space-x-3 text-xs text-gray-500 mb-2">
        <span className="flex items-center">
          <Users size={12} className="mr-1" /> {loans} lượt mượn
        </span>
        <span className="flex items-center">
          <CheckCircle size={12} className="mr-1 text-green-500" /> {available}{' '}
          bản
        </span>
      </div>
      <StarRating rating={rating} size={12} />
    </div>
    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
      <Link
        to={`/publicpage/book/${id || 1}`}
        className="text-xs font-bold text-blue-600 hover:underline"
      >
        Xem chi tiết
      </Link>
    </div>
  </div>
);

const FeatureBox = ({ icon, title, desc }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-shadow text-center group">
    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 transition-colors">
      <div className="text-blue-600 group-hover:text-white transition-colors">
        {icon}
      </div>
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    <Link
      to="/publicpage/guide"
      className="inline-flex items-center text-sm font-medium text-blue-600 mt-4 hover:underline"
    >
      Tìm hiểu thêm <ChevronRight size={14} />
    </Link>
  </div>
);

const statColors: Record<string, { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
  green: { bg: 'bg-green-50', text: 'text-green-600' },
  pink: { bg: 'bg-pink-50', text: 'text-pink-600' },
};

const StatBox = ({ number, label, icon: Icon, color }: any) => {
  const colorClass = statColors[color] || statColors.blue;
  return (
  <div className={`flex flex-col items-center justify-center p-8 ${colorClass.bg} rounded-2xl`}>
    <Icon size={32} className={`${colorClass.text} mb-4`} />
    <span className="text-4xl font-extrabold text-gray-900 mb-2">{number}</span>
    <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
      {label}
    </span>
  </div>
  );
};

const TestimonialCard = ({ quote, name, role, avatar, star = 5 }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
    <div className="flex gap-1 text-yellow-400 mb-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={16}
          fill={index < star ? 'currentColor' : 'none'}
          className={index < star ? 'text-yellow-400' : 'text-gray-300'}
        />
      ))}
    </div>
    <p className="text-gray-700 italic mb-6 text-sm leading-relaxed">
      "{quote}"
    </p>
    <div className="flex items-center">
      <img
        src={avatar}
        alt={name}
        className="w-10 h-10 rounded-full object-cover mr-3"
      />
      <div>
        <h4 className="font-bold text-gray-900 text-sm">{name}</h4>
        <p className="text-xs text-gray-500">{role}</p>
      </div>
    </div>
  </div>
);

const fallbackStats: PublicLibraryStats = {
  totalPublications: 0,
  activeUsers: 0,
  totalBorrows: 0,
  totalCategories: 0,
  averageRating: 0,
  totalRatings: 0,
  satisfactionPercent: 0,
};

const fallbackTestimonials = [
  {
    quote: 'Tìm kiếm AI thực sự thay đổi cách tôi học tập. Trước đây mất cả tiếng để tìm tài liệu phù hợp, giờ chỉ cần vài phút.',
    name: 'Nguyễn Thị Mai',
    role: 'Sinh viên Công nghệ thông tin',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    star: 5,
  },
  {
    quote: 'Hệ thống quản lý mượn trả rất tiện lợi. Tôi có thể theo dõi sách đang mượn, gia hạn online và nhận thông báo tự động.',
    name: 'Trần Văn Nam',
    role: 'Sinh viên thư viện',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    star: 5,
  },
  {
    quote: 'Gợi ý cá nhân hóa giúp tôi khám phá nhiều sách hay mà trước đây không biết tới. Giao diện đẹp và dễ sử dụng.',
    name: 'Lê Thị Hương',
    role: 'Sinh viên',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    star: 5,
  },
];

const HomePage = () => {
  const { userType } = useAuth();
  const [newestPublications, setNewestPublications] = useState<NewestPublication[]>([]);
  const [loadingNewest, setLoadingNewest] = useState(true);

  const [mostBorrowedPublications, setMostBorrowedPublications] = useState<MostBorrowedPublication[]>([]);
  const [loadingMostBorrowed, setLoadingMostBorrowed] = useState(true);

  const [recommendations, setRecommendations] = useState<RecommendedPublication[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [stats, setStats] = useState<PublicLibraryStats>(fallbackStats);
  const [testimonials, setTestimonials] = useState<PublicTestimonial[]>([]);

  useEffect(() => {
    if (userType !== 'student') return;
    setLoadingRecs(true);
    recommendationService.getRecommendations(10)
      .then(res => { if (res.code === 200) setRecommendations(res.data ?? []); })
      .catch(() => {})
      .finally(() => setLoadingRecs(false));
  }, [userType]);

  useEffect(() => {
    const fetchNewest = async () => {
      try {
        const response = await publicationsService.getNewestPublications(4);
        if (response && response.code === 200) {
          setNewestPublications(response.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch newest publications", error);
      } finally {
        setLoadingNewest(false);
      }
    };

    const fetchMostBorrowed = async () => {
      try {
        setLoadingMostBorrowed(true);
        const response = await publicationsService.getMostBorrowedPublications(4);
        if (response && response.code === 200) {
          setMostBorrowedPublications(response.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch most borrowed publications", error);
      } finally {
        setLoadingMostBorrowed(false);
      }
    };

    fetchNewest();
    fetchMostBorrowed();

    categoriesService.getAllCategories()
      .then(res => {
        if (res.code === 200) setCategories(res.data ?? []);
      })
      .catch(() => setCategories([]))
      .finally(() => setLoadingCategories(false));

    publicationsService.getPublicStats()
      .then(res => {
        if (res.code === 200 && res.data) setStats(res.data);
      })
      .catch(() => setStats(fallbackStats));

    publicationsService.getPublicTestimonials(3)
      .then(res => {
        if (res.code === 200) setTestimonials(res.data ?? []);
      })
      .catch(() => setTestimonials([]));
  }, []);

  const featuredCategories = [...categories]
    .sort((a, b) => (b.publicationCount ?? 0) - (a.publicationCount ?? 0) || getCategoryName(a).localeCompare(getCategoryName(b), 'vi'))
    .slice(0, 8);

  const displayTestimonials = testimonials.length > 0
    ? testimonials.map((item) => ({
        quote: item.comment,
        name: item.fullName,
        role: item.role,
        avatar: item.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.fullName)}&background=2563eb&color=fff`,
        star: item.star,
      }))
    : fallbackTestimonials;

  return (
    <div className="bg-white">
      <HeroSection />

      {/* Recommended Section - Gợi ý cho bạn */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white">
        <div className="flex justify-between items-end mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-1 h-4 bg-purple-600 rounded-full"></div>
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wide">
                Dành riêng cho bạn
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Gợi ý cho bạn
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Được cá nhân hóa dựa trên sở thích và lịch sử của bạn
            </p>
          </div>
          <Link
            to="/publicpage/search"
            className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center group"
          >
            Xem tất cả{' '}
            <ArrowRight
              size={16}
              className="ml-1 group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>

        {!userType ? (
          <p className="text-sm text-gray-400 italic">Đăng nhập để xem gợi ý cá nhân hóa.</p>
        ) : loadingRecs ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Hãy mượn hoặc lưu sách để nhận gợi ý phù hợp hơn.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {recommendations.map((pub) => (
              <BookCard
                key={pub.publicationId}
                id={pub.publicationId}
                title={pub.title}
                author={pub.authorNames.join(', ')}
                rating={pub.ratingAverage}
                reviews={pub.ratingCount}
                available={pub.availableItems}
                image={pub.coverImageUrl ?? BOOK_COVER_PLACEHOLDER}
                color="purple"
              />
            ))}
          </div>
        )}
      </section>

      {/* Categories - Khám phá theo chủ đề */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Danh mục phong phú
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">
              Khám phá theo Chủ đề
            </h2>
            <p className="text-gray-500 mt-2">
              Tìm kiếm tài liệu theo lĩnh vực chuyên môn của bạn
            </p>
          </div>

          {loadingCategories ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-40 rounded-xl bg-white border border-gray-100 animate-pulse" />
              ))}
            </div>
          ) : featuredCategories.length === 0 ? (
            <div className="rounded-xl bg-white border border-gray-100 p-8 text-center text-gray-500">
              Chưa có danh mục nào trong hệ thống.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featuredCategories.map((category, index) => (
                <CategoryItem
                  key={category.id}
                  category={category}
                  accent={CATEGORY_ACCENTS[index % CATEGORY_ACCENTS.length]}
                />
              ))}
            </div>
          )}
          <div className="text-center mt-10">
            <Link to="/publicpage/categories">
              <Button variant="outline" className="px-8">
                Xem tất cả chủ đề
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* New Books & Trending - Sách mới & Được mượn nhiều */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Sách Mới (Left - Carousel/Grid style) */}
          <div className="lg:col-span-2">
            <SectionHeader
              title="Sách mới"
              subtitle="Mới cập nhật"
              linkText="Xem tất cả"
              linkUrl="/publicpage/search?sort=newest"
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {loadingNewest ? (
                <div className="col-span-full py-10 text-center">Đang tải sách mới...</div>
              ) : newestPublications.length > 0 ? (
                newestPublications.slice(0, 4).map(pub => (
                  <BookCard
                    key={pub.publicationId}
                    id={pub.publicationId}
                    title={pub.title}
                    author={pub.authorNames.join(', ')}
                    rating={pub.ratingAverage}
                    reviews={pub.ratingCount}
                    available={pub.availableItems}
                    image={pub.coverImageUrl || BOOK_COVER_PLACEHOLDER}
                    tag="MỚI"
                    color="green"
                  />
                ))
              ) : (
                <div className="col-span-full py-10 text-center text-gray-500">Không có sách mới nào.</div>
              )}
            </div>
          </div>

          {/* Được mượn nhiều (Right - List style) */}
          <div>
            <SectionHeader
              title="Được mượn nhiều"
              subtitle="Xu hướng"
              linkText="Xem tất cả"
              linkUrl="/publicpage/search?sort=popular"
            />
            <div className="space-y-4">
              {loadingMostBorrowed ? (
                <div className="py-10 text-center">Đang tải sách mượn nhiều...</div>
              ) : mostBorrowedPublications.length > 0 ? (
                mostBorrowedPublications.slice(0, 4).map((pub, index) => (
                  <TrendingItem
                    key={pub.publicationId}
                    id={pub.publicationId}
                    rank={index + 1}
                    title={pub.title}
                    author={pub.authorNames.join(', ')}
                    loans={pub.borrowCount || 0}
                    available={pub.availableItems}
                    rating={pub.ratingAverage}
                    category="Sách" // Dữ liệu MostBorrowedPublication không trả về category, tạm để "Sách"
                    image={pub.coverImageUrl}
                  />
                ))
              ) : (
                <div className="py-10 text-center text-gray-500">Không có sách mượn nhiều.</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* AI Features - Công nghệ AI */}
      <section className="bg-gray-50 py-20 relative overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center space-x-2 bg-white rounded-full px-3 py-1 border border-purple-100 shadow-sm mb-4">
              <Sparkles size={14} className="text-purple-600" />
              <span className="text-xs font-bold text-purple-700 uppercase">
                CÔNG NGHỆ AI
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              AI giúp gì cho bạn?
            </h2>
            <p className="text-lg text-gray-600">
              Trải nghiệm sức mạnh của trí tuệ nhân tạo trong việc tìm kiếm và
              khám phá tri thức học thuật một cách hiệu quả.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureBox
              icon={<Search size={32} />}
              title="Hiểu ngữ cảnh"
              desc="AI phân tích và hiểu ý nghĩa sâu xa của câu truy vấn, không chỉ dừng lại ở việc khớp từ khóa đơn thuần. Kết quả tìm kiếm chính xác hơn nhiều so với phương pháp truyền thống."
            />
            <FeatureBox
              icon={<BarChart size={32} />}
              title="Học từ hành vi"
              desc="Hệ thống ghi nhận sở thích đọc, lịch sử mượn và tương tác của bạn để ngày càng hiểu rõ nhu cầu. Mỗi lần sử dụng, gợi ý càng trở nên phù hợp và cá nhân hóa hơn."
            />
            <FeatureBox
              icon={<Sparkles size={32} />}
              title="Khám phá thông minh"
              desc="AI tự động kết nối các tài liệu liên quan, gợi ý các chủ đề mở rộng và giúp bạn khám phá những nguồn tài liệu mà bạn chưa từng nghĩ tới nhưng rất hữu ích."
            />
          </div>

          {!userType && (
            <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <div className="relative z-10 max-w-2xl">
                <h3 className="text-2xl font-bold mb-4">
                  Trải nghiệm sức mạnh AI ngay hôm nay
                </h3>
                <p className="text-blue-100 mb-6">
                  Hơn 5,000 sinh viên đã sử dụng SmartLibrary để cải thiện hiệu
                  quả học tập. Đăng ký miễn phí và khám phá cách AI có thể giúp
                  bạn tìm kiếm tri thức nhanh hơn.
                </p>
                <ul className="space-y-2 mb-0">
                  <li className="flex items-center">
                    <CheckCircle size={16} className="text-green-400 mr-2" /> Miễn
                    phí 100% cho sinh viên
                  </li>
                  <li className="flex items-center">
                    <CheckCircle size={16} className="text-green-400 mr-2" />{' '}
                    Không giới hạn số lượng tìm kiếm
                  </li>
                  <li className="flex items-center">
                    <CheckCircle size={16} className="text-green-400 mr-2" /> Hỗ
                    trợ 24/7
                  </li>
                </ul>
              </div>
              <div className="relative z-10 mt-8 md:mt-0 flex-shrink-0">
                <Link to="/publicpage/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="
        bg-white
        text-blue-800
        border border-white/80
        text-xs font-semibold
        px-5 py-2
        shadow-sm
        transition-all duration-200
        hover:bg-emerald-50
        hover:text-emerald-700
        hover:shadow-md
        hover:-translate-y-[1px]
      "
                  >
                    Đăng ký miễn phí <ArrowRight size={18} className="ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Stats - Con số ấn tượng */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Con số ấn tượng
          </h2>
          <p className="text-gray-500 mb-12">
            SmartLibrary đang phục vụ cộng đồng sinh viên mỗi ngày
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatBox
              number={formatCompactNumber(stats.totalPublications)}
              label="Tài liệu"
              icon={Book}
              color="blue"
            />
            <StatBox
              number={formatCompactNumber(stats.activeUsers)}
              label="Người dùng"
              icon={Users}
              color="purple"
            />
            <StatBox
              number={formatCompactNumber(stats.totalBorrows)}
              label="Lượt mượn"
              icon={ChevronRight}
              color="green"
            />
            <StatBox
              number={stats.totalRatings > 0 ? `${stats.satisfactionPercent}%` : '0'}
              label="Hài lòng"
              icon={CheckCircle}
              color="pink"
            />
          </div>
        </div>
      </section>

      {/* Testimonials - Sinh viên nói gì */}
      <section className="bg-gray-50 py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 mb-2">
              <Star size={14} className="text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-bold text-gray-500 uppercase">
                ĐÁNH GIÁ TỪ NGƯỜI DÙNG
              </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Sinh viên nói gì về chúng tôi
            </h2>
            <p className="text-gray-500 mt-2">
              Những phản hồi chân thực từ cộng đồng người dùng
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayTestimonials.map((testimonial, index) => (
              <TestimonialCard key={`${testimonial.name}-${index}`} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {!userType && (
        <section className="bg-blue-700 py-16 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-700 to-indigo-800 opacity-90"></div>
          <div className="relative z-10 max-w-4xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Sẵn sàng bắt đầu?
            </h2>
            <p className="text-blue-100 text-lg mb-8">
              Tham gia cùng hàng ngàn sinh viên đang sử dụng SmartLibrary để nâng
              cao hiệu quả học tập.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/publicpage/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="
        bg-white
        text-blue-800
        border border-white/80
        text-xs font-semibold
        px-5 py-2
        shadow-sm
        transition-all duration-200
        hover:bg-emerald-50
        hover:text-emerald-700
        hover:shadow-md
        hover:-translate-y-[1px]
      "
                >
                  Đăng ký miễn phí
                </Button>
              </Link>
              <Link to="/publicpage/search">
                <Button
                  size="lg"
                  variant="outline"
                  className="
        bg-white
        text-blue-800
        border border-white/80
        text-xs font-semibold
        px-5 py-2
        shadow-sm
        transition-all duration-200
        hover:bg-emerald-50
        hover:text-emerald-700
        hover:shadow-md
        hover:-translate-y-[1px]
      "
                >
                  Khám phá ngay
                </Button>
              </Link>
            </div>
            <p className="text-xs text-blue-300 mt-6">
              Không cần thẻ tín dụng • Miễn phí vĩnh viễn cho sinh viên • Bắt đầu
              trong 30 giây
            </p>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
