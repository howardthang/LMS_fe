import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Heart,
  Layers,
  List,
  MessageSquare,
  PenTool,
  Printer,
  Send,
  Share2,
  Sparkles,
  Star,
  ThumbsUp,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  Badge,
  Button,
  StarRating,
  StatusIndicator,
} from '../../components/ui';
import publicationsService from '../../api/publicationsService';
import { PublicationDetailResponse } from '../../api/publicationTypes';

// --- Sub-components for Tabs ---

const OverviewTab = ({ data }: { data: PublicationDetailResponse }) => (
  <div className="animate-fade-in">
    {/* Description */}
    <div className="mb-10 max-w-4xl">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Mô tả chi tiết</h3>
      <div className="text-gray-700 text-sm leading-7 space-y-4 text-justify whitespace-pre-line">
        {data.publication.description || 'Chưa có mô tả.'}
      </div>
    </div>

    {/* Publication Info Table */}
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-200 pb-2">
        Thông tin xuất bản
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4">
        <div className="col-span-1">
          <span className="block text-xs text-gray-500 uppercase font-semibold mb-1">
            ISBN
          </span>
          <span className="font-medium text-gray-900">{data.publication.isbn || 'N/A'}</span>
        </div>
        <div className="col-span-1">
          <span className="block text-xs text-gray-500 uppercase font-semibold mb-1">
            Số trang
          </span>
          <span className="font-medium text-gray-900">{data.publication.numberOfPages ? `${data.publication.numberOfPages} trang` : 'N/A'}</span>
        </div>
        <div className="col-span-1">
          <span className="block text-xs text-gray-500 uppercase font-semibold mb-1">
            Phiên bản
          </span>
          <span className="font-medium text-gray-900">{data.publication.edition ? `Lần xuất bản thứ ${data.publication.edition}` : 'N/A'}</span>
        </div>
        <div className="col-span-1">
          <span className="block text-xs text-gray-500 uppercase font-semibold mb-1">
            Năm xuất bản
          </span>
          <span className="font-medium text-gray-900">{data.publication.publicationYear || 'N/A'}</span>
        </div>

        <div className="col-span-1">
          <span className="block text-xs text-gray-500 uppercase font-semibold mb-1">
            Nhà xuất bản
          </span>
          <span className="font-medium text-gray-900">
            {data.publisher?.name || 'N/A'}
          </span>
        </div>
        <div className="col-span-1">
          <span className="block text-xs text-gray-500 uppercase font-semibold mb-1">
            Ngôn ngữ
          </span>
          <span className="font-medium text-gray-900">{data.publication.language || 'N/A'}</span>
        </div>
        <div className="col-span-1">
          <span className="block text-xs text-gray-500 uppercase font-semibold mb-1">
            Kích thước / Trọng lượng
          </span>
          <span className="font-medium text-gray-900">
            {data.publication.size || '?'} / {data.publication.weight ? `${data.publication.weight}kg` : '?'}
          </span>
        </div>

        {data.tags && data.tags.length > 0 && (
          <div className="col-span-2 md:col-span-4 border-t border-gray-200 pt-4 mt-2">
            <span className="block text-xs text-gray-500 uppercase font-semibold mb-2">
              Từ khóa (Subject Headings)
            </span>
            <div className="flex flex-wrap gap-2">
              {data.tags.map((k) => (
                <span
                  key={k.id}
                  className="bg-white border border-gray-200 text-gray-600 text-xs px-2 py-1 rounded hover:border-blue-300 hover:text-blue-600 cursor-pointer transition-colors"
                >
                  {k.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

const ChapterItem = ({ number, title, pages, sections, children }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 transition-colors px-4 rounded-lg"
      >
        <div className="flex items-center">
          <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded font-bold text-sm mr-4">
            {number}
          </span>
          <div>
            <h4 className="font-semibold text-gray-900">{title}</h4>
            <p className="text-xs text-gray-500 mt-0.5">
              {sections} sections • {pages} trang
            </p>
          </div>
        </div>
        {isOpen ? (
          <ChevronDown size={18} className="text-gray-400" />
        ) : (
          <ChevronRight size={18} className="text-gray-400" />
        )}
      </button>
      {isOpen && <div className="pl-16 pr-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
};

const TableOfContentsTab = () => (
  <div className="animate-fade-in">
    <h3 className="text-xl font-bold text-gray-900 mb-6">Mục lục chi tiết</h3>
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <ChapterItem
        number="1"
        title="Giới thiệu Machine Learning"
        pages="45"
        sections="4"
      >
        <div className="text-sm text-gray-600 flex justify-between group cursor-pointer hover:text-blue-600">
          <span>
            <strong>1.1</strong> Machine Learning là gì?
          </span>
          <span className="text-gray-400 text-xs">Trang 5</span>
        </div>
        <div className="text-sm text-gray-600 flex justify-between group cursor-pointer hover:text-blue-600">
          <span>
            <strong>1.2</strong> Phân loại Machine Learning
          </span>
          <span className="text-gray-400 text-xs">Trang 12</span>
        </div>
        <div className="text-sm text-gray-600 flex justify-between group cursor-pointer hover:text-blue-600">
          <span>
            <strong>1.3</strong> Quy trình xây dựng hệ thống ML
          </span>
          <span className="text-gray-400 text-xs">Trang 24</span>
        </div>
        <div className="text-sm text-gray-600 flex justify-between group cursor-pointer hover:text-blue-600">
          <span>
            <strong>1.4</strong> Các thách thức và ứng dụng
          </span>
          <span className="text-gray-400 text-xs">Trang 38</span>
        </div>
      </ChapterItem>
      <ChapterItem
        number="2"
        title="Đại số tuyến tính cho ML"
        pages="68"
        sections="6"
      >
        <div className="text-sm text-gray-600">
          Nội dung chi tiết chương 2...
        </div>
      </ChapterItem>
      <ChapterItem
        number="3"
        title="Giải tích và Tối ưu hóa"
        pages="52"
        sections="5"
      >
        <div className="text-sm text-gray-600">
          Nội dung chi tiết chương 3...
        </div>
      </ChapterItem>
      <ChapterItem
        number="4"
        title="Xác suất và Thống kê"
        pages="75"
        sections="8"
      >
        <div className="text-sm text-gray-600">
          Nội dung chi tiết chương 4...
        </div>
      </ChapterItem>
      <ChapterItem number="5" title="Linear Regression" pages="48" sections="4">
        <div className="text-sm text-gray-600">
          Nội dung chi tiết chương 5...
        </div>
      </ChapterItem>
      <ChapterItem
        number="6"
        title="Logistic Regression & Classification"
        pages="56"
        sections="5"
      >
        <div className="text-sm text-gray-600">
          Nội dung chi tiết chương 6...
        </div>
      </ChapterItem>
    </div>
  </div>
);

const ReviewBar = ({
  star,
  count,
  total,
}: {
  star: number;
  count: number;
  total: number;
}) => {
  const percentage = (count / total) * 100;
  return (
    <div className="flex items-center text-sm mb-2">
      <span className="w-12 text-gray-600 font-medium flex items-center">
        {star} <Star size={12} className="ml-1 fill-gray-400 text-gray-400" />
      </span>
      <div className="flex-grow mx-3 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-400 rounded-full"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <span className="w-8 text-right text-gray-500 text-xs">{count}</span>
    </div>
  );
};

const ReviewsTab = () => (
  <div className="animate-fade-in">
    <div className="grid md:grid-cols-3 gap-8 mb-10">
      {/* Stats */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div className="text-center mb-6">
          <div className="text-5xl font-bold text-gray-900 mb-2">4.6</div>
          <div className="flex justify-center mb-2">
            <StarRating rating={4.6} size={20} />
          </div>
          <p className="text-sm text-gray-500">Dựa trên 128 đánh giá</p>
        </div>
        <div>
          <ReviewBar star={5} count={83} total={128} />
          <ReviewBar star={4} count={32} total={128} />
          <ReviewBar star={3} count={10} total={128} />
          <ReviewBar star={2} count={2} total={128} />
          <ReviewBar star={1} count={1} total={128} />
        </div>
      </div>

      {/* Write Review */}
      <div className="md:col-span-2">
        <h4 className="font-bold text-gray-900 mb-4 flex items-center">
          <PenTool size={16} className="mr-2 text-blue-600" /> Viết đánh giá của
          bạn
        </h4>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đánh giá của bạn
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={24}
                  className="text-gray-300 hover:text-yellow-400 cursor-pointer transition-colors"
                />
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhận xét
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
              rows={4}
              placeholder="Chia sẻ trải nghiệm của bạn về cuốn sách này. Nội dung có dễ hiểu không? Bài tập có hữu ích không?"
            ></textarea>
          </div>
          <div className="flex justify-end">
            <Button className="flex items-center">
              <Send size={16} className="mr-2" /> Gửi đánh giá
            </Button>
          </div>
        </div>
      </div>
    </div>

    {/* Review List */}
    <div className="space-y-6">
      <h4 className="font-bold text-lg text-gray-900 border-b border-gray-200 pb-2">
        Đánh giá từ cộng đồng
      </h4>
      <ReviewItem
        name="Nguyễn Minh Tuấn"
        role="Sinh viên năm 3 - CNTT"
        date="15/12/2024"
        rating={5}
        text="Cuốn sách rất hay và dễ hiểu! Tác giả giải thích các khái niệm phức tạp một cách đơn giản, phù hợp cho người mới bắt đầu. Phần code Python rất chi tiết và có thể chạy được ngay. Đặc biệt thích phần về Neural Networks ở cuối sách."
        likes={24}
      />
      <ReviewItem
        name="Trần Thị Hương"
        role="Giảng viên - Khoa CNTT"
        date="10/12/2024"
        rating={5}
        text="Một giáo trình xuất sắc cho sinh viên Việt Nam. Nội dung cập nhật, cách trình bày khoa học. Tôi đã sử dụng làm tài liệu giảng dạy cho môn Machine Learning và sinh viên phản hồi rất tích cực. Đề xuất bổ sung thêm phần Deep Learning trong tái bản sau."
        likes={18}
      />
      <ReviewItem
        name="Lê Văn Hải"
        role="Data Analyst"
        date="05/12/2024"
        rating={4}
        text="Sách tốt cho người mới bắt đầu. Phần toán học giải thích khá dễ hiểu. Tuy nhiên mình mong muốn có thêm nhiều ví dụ thực tế hơn từ các dự án thực tế ở Việt Nam. Overall vẫn đáng đọc!"
        likes={12}
      />
    </div>

    <div className="mt-8 text-center">
      <Button variant="outline">Xem thêm đánh giá</Button>
    </div>
  </div>
);

const ReviewItem = ({ name, role, date, rating, text, likes }: any) => (
  <div className="flex space-x-4 border-b border-gray-100 last:border-0 pb-6">
    <div className="flex-shrink-0">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-bold shadow-sm">
        {name.charAt(0)}
      </div>
    </div>
    <div className="flex-grow">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-gray-900 text-sm">{name}</h4>
          <p className="text-xs text-gray-500">{role}</p>
        </div>
        <span className="text-xs text-gray-400">{date}</span>
      </div>
      <div className="mt-1 mb-2">
        <StarRating rating={rating} size={14} />
      </div>
      <p className="text-sm text-gray-700 leading-relaxed mb-3">{text}</p>
      <div className="flex items-center space-x-4 text-xs text-gray-500">
        <button className="flex items-center hover:text-blue-600 space-x-1 transition-colors">
          <ThumbsUp size={14} /> <span>Hữu ích ({likes})</span>
        </button>
        <button className="flex items-center hover:text-blue-600 space-x-1 transition-colors">
          <MessageSquare size={14} /> <span>Trả lời</span>
        </button>
      </div>
    </div>
  </div>
);

const BookCardSimple = ({
  title,
  author,
  rating,
  image,
  tag,
  status,
  color = 'blue',
}: any) => (
  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col h-full">
    <div className="relative aspect-[2/3] bg-gray-100 overflow-hidden">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <span
        className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-1 rounded text-white bg-${color}-600 shadow-sm`}
      >
        {tag}
      </span>
    </div>
    <div className="p-3 flex flex-col flex-grow">
      <h4 className="font-bold text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
        <Link to="#">{title}</Link>
      </h4>
      <p className="text-xs text-gray-500 mb-2">{author}</p>
      <div className="mt-auto flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs font-medium">
          <Star size={12} className="text-yellow-400 fill-yellow-400" />{' '}
          {rating}
        </div>
        {status === 'available' ? (
          <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">
            Có sẵn
          </span>
        ) : (
          <span className="text-[10px] text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
            Đang mượn
          </span>
        )}
      </div>
      <Button size="sm" variant="outline" className="w-full mt-3 text-xs h-8">
        Xem chi tiết
      </Button>
    </div>
  </div>
);

const RelatedBooksTab = () => (
  <div className="animate-fade-in">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl font-bold text-gray-900">Sách cùng chủ đề</h3>
      <Link
        to="/publicpage/search"
        className="text-sm text-blue-600 hover:underline flex items-center"
      >
        Xem tất cả <ArrowRight size={14} className="ml-1" />
      </Link>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <BookCardSimple
        title="Deep Learning từ cơ bản đến nâng cao"
        author="Nguyễn Thanh Tuấn"
        rating={4.8}
        image="public/avatar/Avatar.JPG"
        tag="Có sẵn"
        status="available"
        color="green"
      />
      <BookCardSimple
        title="Python cho Data Science"
        author="Phạm Đình Khánh"
        rating={4.5}
        image="public/avatar/Avatar.JPG"
        tag="Có sẵn"
        status="available"
        color="green"
      />
      <BookCardSimple
        title="Trí tuệ nhân tạo hiện đại"
        author="Trần Minh Quang"
        rating={4.7}
        image="public/avatar/Avatar.JPG"
        tag="Đang mượn"
        status="loan"
        color="orange"
      />
      <BookCardSimple
        title="Thống kê cho Machine Learning"
        author="Lê Thị Mai"
        rating={4.4}
        image="public/avatar/Avatar.JPG"
        tag="Có sẵn"
        status="available"
        color="green"
      />
      <BookCardSimple
        title="Computer Vision với OpenCV"
        author="Hoàng Văn Nam"
        rating={4.6}
        image="public/avatar/Avatar.JPG"
        tag="Có sẵn"
        status="available"
        color="blue"
      />
    </div>

    <div className="mt-12">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          Người mượn cuốn này cũng mượn...
        </h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <BookCardSimple
          title="Xử lý ngôn ngữ tự nhiên"
          author="Đặng Thị Hoa"
          rating={4.3}
          image="public/avatar/Avatar.JPG"
          tag="Có sẵn"
          status="available"
          color="purple"
        />
        <BookCardSimple
          title="Khai phá dữ liệu và ứng dụng"
          author="Ngô Đức Thành"
          rating={4.5}
          image="public/avatar/Avatar.JPG"
          tag="Có sẵn"
          status="available"
          color="red"
        />
        <BookCardSimple
          title="Reinforcement Learning cơ bản"
          author="Bùi Văn Toàn"
          rating={4.7}
          image="public/avatar/Avatar.JPG"
          tag="Đang mượn"
          status="loan"
          color="yellow"
        />
      </div>
    </div>
  </div>
);

// --- Main Page Component ---

const BookDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const prefix = location.pathname.startsWith('/userpage')
    ? '/userpage'
    : '/publicpage';
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState<PublicationDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPublicationDetail = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const response = await publicationsService.getPublicationById(id);
        if (response.code === 200) {
          setData(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch publication detail:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPublicationDetail();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Không tìm thấy thông tin ấn phẩm</h2>
        <Link to={prefix} className="mt-4 text-blue-600 hover:underline">
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-sm text-gray-500 flex items-center">
          <Link to={prefix} className="hover:text-blue-600 cursor-pointer">
            Trang chủ
          </Link>
          <ChevronRight size={14} className="mx-2 text-gray-400" />
          <Link
            to={`${prefix}/search`}
            className="hover:text-blue-600 cursor-pointer"
          >
            Trí tuệ nhân tạo
          </Link>
          <ChevronRight size={14} className="mx-2 text-gray-400" />
          <span className="text-gray-900 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-xs">
            {data.publication.title}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Top Section */}
          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
            {/* Left: Cover & Actions */}
            <div className="w-full md:w-1/4 flex-shrink-0">
              <div className="rounded-lg overflow-hidden shadow-lg border border-gray-100 relative group">
                {data.items.totalAvailableItems > 0 && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm z-10 flex items-center">
                    <CheckCircle size={12} className="mr-1" /> Có sẵn
                  </div>
                )}
                <img
                  src={data.publication.coverImageUrl || "public/avatar/Avatar.JPG"}
                  alt={data.publication.title}
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Right: Info */}
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2 leading-tight">
                  {data.publication.title}
                </h1>
                <div className="flex items-center space-x-1 bg-blue-50 px-2 py-1 rounded text-blue-700 font-bold text-lg">
                  <span>{data.ratings.averageRating}</span> <Star size={16} fill="currentColor" />{' '}
                  <span className="text-xs font-normal text-gray-500 ml-1">
                    ({data.ratings.totalRatings} đánh giá)
                  </span>
                </div>
              </div>
              {data.publication.subtitle && (
                <p className="text-xl text-gray-600 mb-4 font-light">
                  {data.publication.subtitle}
                </p>
              )}

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 mb-6 border-b border-gray-100 pb-6">
                <div className="flex items-center font-medium">
                  <User size={16} className="mr-2 text-blue-500" />{' '}
                  <span className="text-gray-900 mr-1">Tác giả:</span> {data.authors.map(a => a.name).join(', ')}
                </div>
                <div className="flex items-center font-medium">
                  <Calendar size={16} className="mr-2 text-blue-500" />{' '}
                  <span className="text-gray-900 mr-1">Năm:</span> {data.publication.publicationYear}
                </div>
                <div className="flex items-center font-medium">
                  <BookOpen size={16} className="mr-2 text-blue-500" />{' '}
                  <span className="text-gray-900 mr-1">NXB:</span> {data.publisher.name}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {data.publication.language && (
                  <Badge variant="primary" className="text-sm py-1 px-3">
                    {data.publication.language}
                  </Badge>
                )}
                {data.categories && data.categories.map((cat) => (
                  <Badge key={cat.id} variant="secondary" className="text-sm py-1 px-3">
                    {cat.name}
                  </Badge>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 mb-8">
                <Button
                  size="lg"
                  className="px-8 shadow-blue-200 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <BookOpen size={18} className="mr-2" /> Đặt trước
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-gray-600 hover:text-red-500 hover:border-red-200"
                >
                  <Heart size={18} className="mr-2" /> Wishlist
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-gray-600 hover:text-blue-500 hover:border-blue-200"
                >
                  <Share2 size={18} className="mr-2" /> Chia sẻ
                </Button>
                <Button
                  variant="ghost"
                  className="ml-auto text-gray-400 hover:text-gray-600"
                >
                  <span className="text-xl mr-2">❝</span> Trích dẫn tài liệu
                </Button>
              </div>

              {/* AI Summary Section - Box Style */}
              <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-6 border border-indigo-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Sparkles size={120} className="text-indigo-900" />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg text-white">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        AI Summary & Target Audience
                      </h3>
                      <p className="text-xs text-indigo-600 font-medium">
                        Phân tích thông minh bởi AI
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-grow">
                      <p className="text-gray-700 leading-relaxed text-sm text-justify whitespace-pre-line">
                        {data.publication.aiSummary || "Chưa có AI Summary cho ấn phẩm này."}
                      </p>
                    </div>
                    {data.publication.aiTargetAudience && (
                      <div className="lg:w-1/3 flex-shrink-0 bg-white/60 rounded-xl p-4 border border-indigo-100 backdrop-blur-sm">
                        <h4 className="font-bold text-indigo-900 text-sm mb-3 flex items-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2"></div>
                          Đối tượng phù hợp
                        </h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                          {data.publication.aiTargetAudience.split(',').map((item, idx) => (
                            <li key={idx} className="flex items-start">
                              <CheckCircle
                                size={14}
                                className="mr-2 mt-0.5 text-green-500 flex-shrink-0"
                              />{' '}
                              {item.trim()}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Copy Status Section (Moved ABOVE tabs as per request/design best practice) */}
          <div className="px-6 md:px-8 py-6 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center text-lg font-bold text-gray-900">
                <Layers size={20} className="mr-2 text-blue-600" /> Tình trạng
                bản sao
              </h3>
              <div className="flex items-center space-x-4 text-sm font-medium">
                <span className="flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2"></span>{' '}
                  Có sẵn: <span className="ml-1 font-bold">{data.items.totalAvailableItems}</span>
                </span>
                <span className="flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 mr-2"></span>{' '}
                  Đang mượn: <span className="ml-1 font-bold">{data.items.totalBorrowedItems}</span>
                </span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-5 flex items-start text-sm text-blue-800">
              <div className="bg-blue-100 p-1 rounded-full mr-3 text-blue-600 flex-shrink-0 mt-0.5">
                <Clock size={14} />
              </div>
              <span>
                <strong>Thông báo:</strong> Có {data.items.totalItems} bản giấy ({data.items.totalAvailableItems} bản khả dụng).
                {data.items.totalAvailableItems === 0 && data.items.totalItems > 0 && " Hiện đã được mượn hết. Vui lòng đặt trước để giữ chỗ."}
              </span>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/5">
                      Mã Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/6">
                      Định dạng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/4">
                      Vị trí
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/5">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[
                    {
                      id: 'ML-2023-001',
                      loc: 'Thư viện Trung tâm',
                      sub: 'Kệ A3 - Tầng 2',
                      status: 'Available',
                    },
                    {
                      id: 'ML-2023-002',
                      loc: 'Thư viện Trung tâm',
                      sub: 'Kệ A3 - Tầng 2',
                      status: 'On Loan',
                      return: '12/01/2026',
                    },
                    {
                      id: 'ML-2023-003',
                      loc: 'Thư viện Cơ sở B',
                      sub: 'Kệ B2 - Tầng 1',
                      status: 'Available',
                    },
                  ].map((item, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 flex items-center">
                        <Printer size={14} className="mr-2 text-gray-400" />
                        {item.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                          Print
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="font-medium text-gray-900">
                          {item.loc}
                        </div>
                        <div className="text-xs text-gray-400">{item.sub}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <StatusIndicator status={item.status as any} />
                        {item.return && (
                          <div className="text-[10px] text-orange-600 font-medium mt-1 ml-1">
                            Trả: {item.return}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {item.status === 'Available' ? (
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 shadow-sm w-24"
                          >
                            Đặt trước
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="w-24 text-gray-400 bg-gray-100 border border-gray-200"
                            disabled
                          >
                            Đang mượn
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="border-b border-gray-200 px-6 md:px-8 mt-4">
            <div className="flex space-x-8 overflow-x-auto scrollbar-hide">
              {[
                { id: 'overview', label: 'Tổng quan', icon: AlertCircle },
                { id: 'toc', label: 'Mục lục chi tiết', icon: List },
                { id: 'reviews', label: `Đánh giá (${data.ratings.totalRatings})`, icon: Star },
                { id: 'related', label: 'Sách liên quan', icon: BookOpen },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`py-4 text-sm font-medium border-b-2 transition-colors flex items-center whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <tab.icon
                    size={16}
                    className={`mr-2 ${
                      activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'
                    }`}
                  />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8">
            {activeTab === 'overview' && <OverviewTab data={data} />}
            {activeTab === 'toc' && <TableOfContentsTab />}
            {activeTab === 'reviews' && <ReviewsTab />}
            {activeTab === 'related' && <RelatedBooksTab />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;
