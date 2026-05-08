import {
  AlertCircle,
  AlertTriangle,
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
import QRCode from 'react-qr-code';
import {
  Badge,
  Button,
  StarRating,
} from '../../components/ui';
import publicationsService from '../../api/publicationsService';
import transactionsService from '../../api/transactionsService';
import { PublicationDetailResponse, PaginatedPublicationItems, PaginatedPublicationRatings, PublicationRatingSummary } from '../../api/publicationTypes';

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
              Từ khóa (Tags)
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

const ReviewBar = ({ star, count, total }: { star: number; count: number; total: number }) => {
  const percentage = (count / total) * 100 || 0;
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

const ReviewsTab = ({
  publicationId,
  ratingsData,
  summaryData,
  isLoading,
  onPageChange,
  onRefresh,
  averageRating,
  totalRatings,
}: {
  publicationId: string;
  ratingsData: PaginatedPublicationRatings | null;
  summaryData: PublicationRatingSummary | null;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  averageRating: number;
  totalRatings: number;
}) => {
  const [selectedStars, setSelectedStars] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập nhận xét của bạn.' });
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage(null);
      const response = await publicationsService.createPublicationRating(publicationId, {
        star: selectedStars,
        comment: comment.trim(),
      });

      if (response.code === 200) {
        setMessage({ type: 'success', text: 'Gửi đánh giá thành công!' });
        setComment('');
        setSelectedStars(5);
        onRefresh();
      } else {
        setMessage({ type: 'error', text: response.message || 'Gửi đánh giá thất bại.' });
      }
    } catch (error: any) {
      console.error('Failed to submit rating:', error);
      // axiosInstance rejects with { status, message, data }
      const errorMsg = error.message || 'Có lỗi xảy ra khi gửi đánh giá.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="grid md:grid-cols-3 gap-8 mb-10">
        {/* Stats */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-gray-900 mb-2">{averageRating}</div>
            <div className="flex justify-center mb-2">
              <StarRating rating={averageRating} size={20} />
            </div>
            <p className="text-sm text-gray-500">Dựa trên {totalRatings} đánh giá</p>
          </div>
          {summaryData ? (
            <div>
              <ReviewBar star={5} count={summaryData.fiveStarCount} total={summaryData.totalCount} />
              <ReviewBar star={4} count={summaryData.fourStarCount} total={summaryData.totalCount} />
              <ReviewBar star={3} count={summaryData.threeStarCount} total={summaryData.totalCount} />
              <ReviewBar star={2} count={summaryData.twoStarCount} total={summaryData.totalCount} />
              <ReviewBar star={1} count={summaryData.oneStarCount} total={summaryData.totalCount} />
            </div>
          ) : (
            <div className="space-y-2 animate-pulse">
              {[5, 4, 3, 2, 1].map((s) => (
                <div key={s} className="h-4 bg-gray-200 rounded-full w-full"></div>
              ))}
            </div>
          )}
        </div>

        {/* Write Review */}
        <div className="md:col-span-2">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center">
            <PenTool size={16} className="mr-2 text-blue-600" /> Viết đánh giá của
            bạn
          </h4>
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            {message && (
              <div className={`mb-4 p-3 rounded-lg text-sm flex items-center ${
                message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
              }`}>
                {message.type === 'success' ? <CheckCircle size={16} className="mr-2" /> : <AlertCircle size={16} className="mr-2" />}
                {message.text}
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đánh giá của bạn
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={24}
                    onClick={() => setSelectedStars(s)}
                    className={`${
                      s <= selectedStars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    } cursor-pointer transition-colors`}
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
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về cuốn sách này..."
              ></textarea>
            </div>
            <div className="flex justify-end">
              <Button 
                className="flex items-center" 
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <Send size={16} className="mr-2" />
                )}
                Gửi đánh giá
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
        
        {isLoading ? (
          <div className="py-12 text-center text-gray-500">Đang tải đánh giá...</div>
        ) : ratingsData?.content && ratingsData.content.length > 0 ? (
          <>
            <div className="space-y-6">
              {ratingsData.content.map((rating) => (
                <ReviewItem
                  key={rating.ratingId}
                  name={rating.fullName}
                  studentId={rating.studentId}
                  faculty={rating.faculty || 'Sinh viên'}
                  date={new Date(rating.createdAt).toLocaleDateString('vi-VN')}
                  rating={rating.star}
                  text={rating.comment}
                  likes={rating.helpfulCount}
                  avatar={rating.profilePictureUrl}
                />
              ))}
            </div>

            {/* Pagination for Ratings */}
            {ratingsData.totalPages > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 pt-6">
                <div className="text-sm text-gray-500">
                  Hiển thị <span className="font-medium text-gray-900">{ratingsData.currentPage * ratingsData.pageSize + 1}</span> -{' '}
                  <span className="font-medium text-gray-900">
                    {Math.min((ratingsData.currentPage + 1) * ratingsData.pageSize, ratingsData.totalElements)}
                  </span>{' '}
                  trong <span className="font-medium text-gray-900">{ratingsData.totalElements}</span> đánh giá
                </div>
                <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => onPageChange(Math.max(0, ratingsData.currentPage - 1))}
                    disabled={ratingsData.first}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      ratingsData.first ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                  </button>
                  {Array.from({ length: ratingsData.totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => onPageChange(i)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        ratingsData.currentPage === i
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => onPageChange(ratingsData.currentPage + 1)}
                    disabled={ratingsData.last}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      ratingsData.last ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </nav>
              </div>
            )}
          </>
        ) : (
          <div className="py-12 text-center text-gray-500">Chưa có đánh giá nào cho ấn phẩm này.</div>
        )}
      </div>
    </div>
  );
};

const ReviewItem = ({ name, faculty, date, rating, text, likes, avatar, studentId }: any) => (
  <div className="flex space-x-4 border-b border-gray-100 last:border-0 pb-6">
    <div className="flex-shrink-0">
      {avatar ? (
        <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover shadow-sm" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-bold shadow-sm">
          {name.charAt(0)}
        </div>
      )}
    </div>
    <div className="flex-grow">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-gray-900 text-sm">{name}</h4>
          <p className="text-xs text-gray-500">{studentId} - {faculty}</p>
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

const ITEM_STATUS_MAP: Record<string, { label: string; dot: string; badge: string }> = {
  AVAILABLE:      { label: 'Có sẵn',           dot: 'bg-green-500',  badge: 'bg-green-100 text-green-800' },
  RESERVED:       { label: 'Đã có người đặt',  dot: 'bg-blue-500',   badge: 'bg-blue-100 text-blue-800' },
  BORROWED:       { label: 'Đang được mượn',   dot: 'bg-yellow-500', badge: 'bg-yellow-100 text-yellow-800' },
  IN_MAINTENANCE: { label: 'Đang bảo trì',     dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-800' },
  LOST:           { label: 'Mất / Thất lạc',   dot: 'bg-red-500',    badge: 'bg-red-100 text-red-800' },
};

const ItemStatusBadge = ({ status, dueDate }: { status: string; dueDate?: string | null }) => {
  const cfg = ITEM_STATUS_MAP[status] ?? { label: status, dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-700' };
  return (
    <div className="flex flex-col gap-1">
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit ${cfg.badge}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${cfg.dot}`}></span>
        {cfg.label}
      </span>
      {status === 'BORROWED' && dueDate && (
        <span className="text-[10px] text-gray-500 ml-1">
          Trả dự kiến: {new Date(dueDate).toLocaleDateString('vi-VN')}
        </span>
      )}
    </div>
  );
};

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

  const [itemsData, setItemsData] = useState<PaginatedPublicationItems | null>(null);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [itemsPage, setItemsPage] = useState(0);

  const [ratingsData, setRatingsData] = useState<PaginatedPublicationRatings | null>(null);
  const [summaryData, setSummaryData] = useState<PublicationRatingSummary | null>(null);
  const [isLoadingRatings, setIsLoadingRatings] = useState(false);
  const [ratingsPage, setRatingsPage] = useState(0);
  const [borrowSuccessData, setBorrowSuccessData] = useState<import('../../api/transactionsService').BorrowResponse['data'] | null>(null);

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

  useEffect(() => {
    const fetchSummary = async () => {
      if (!id) return;
      try {
        const response = await publicationsService.getPublicationRatingSummary(id);
        if (response.code === 200) {
          setSummaryData(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch rating summary:', error);
      }
    };
    fetchSummary();
  }, [id]);

  useEffect(() => {
    const fetchItems = async () => {
      if (!id) return;
      try {
        setIsLoadingItems(true);
        const response = await publicationsService.getPublicationItems(id, itemsPage, 5);
        if (response.code === 200) {
          setItemsData(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch items:', error);
      } finally {
        setIsLoadingItems(false);
      }
    };
    fetchItems();
  }, [id, itemsPage]);

  useEffect(() => {
    const fetchRatings = async () => {
      if (!id) return;
      try {
        setIsLoadingRatings(true);
        const response = await publicationsService.getPublicationRatings(id, ratingsPage, 10);
        if (response.code === 200) {
          setRatingsData(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch ratings:', error);
      } finally {
        setIsLoadingRatings(false);
      }
    };
    fetchRatings();
  }, [id, ratingsPage]);

  const handleBorrow = async (itemId: string) => {
    try {
      // Just a simple confirm, optional
      const confirmBorrow = window.confirm("Bạn có chắc chắn muốn mượn sách này?");
      if (!confirmBorrow) return;

      const response = await transactionsService.borrow({ itemId });
      if (response.code === 201) {
        setBorrowSuccessData(response.data);
        // Refresh the items list
        const fetchItems = async () => {
          if (!id) return;
          try {
            setIsLoadingItems(true);
            const res = await publicationsService.getPublicationItems(id, itemsPage, 5);
            if (res.code === 200) {
              setItemsData(res.data);
            }
          } catch (error) {
            console.error('Failed to fetch items:', error);
          } finally {
            setIsLoadingItems(false);
          }
        };
        fetchItems();
      }
    } catch (error: any) {
      console.error('Borrow failed:', error);
      alert(error.message || "Không thể mượn sách lúc này. Vui lòng thử lại sau.");
    }
  };

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
                <strong>Thông báo:</strong> Có {data.items.totalItems} bản ({data.items.totalAvailableItems} bản khả dụng).
                {data.items.totalAvailableItems === 0 && data.items.totalItems > 0 && " Hiện đã được mượn hết. Vui lòng đặt trước để giữ chỗ."}
              </span>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/5">
                      Barcode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/6">
                      Tình trạng
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
                  {isLoadingItems ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        Đang tải danh sách bản sao...
                      </td>
                    </tr>
                  ) : itemsData?.content && itemsData.content.length > 0 ? (
                    itemsData.content.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 flex items-center">
                          <Printer size={14} className="mr-2 text-gray-400" />
                          {item.barcode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                            {item.condition || 'Sách in'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="font-medium text-gray-900">
                            {item.branch}
                          </div>
                          <div className="text-xs text-gray-400">{item.shelf}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <ItemStatusBadge status={item.status} dueDate={item.dueDate} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {item.status === 'AVAILABLE' ? (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 shadow-sm w-28" onClick={() => handleBorrow(item.id)}>
                              Mượn ngay
                            </Button>
                          ) : item.status === 'BORROWED' || item.status === 'RESERVED' ? (
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-sm w-28">
                              Đặt trước
                            </Button>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Không khả dụng</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        Không có bản sao nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              
              {/* Phân trang danh sách copy */}
              {itemsData && itemsData.totalPages > 1 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-500 order-2 sm:order-1">
                    Hiển thị <span className="font-semibold text-gray-900">{itemsData.currentPage * itemsData.pageSize + 1}</span> -{' '}
                    <span className="font-semibold text-gray-900">
                      {Math.min((itemsData.currentPage + 1) * itemsData.pageSize, itemsData.totalElements)}
                    </span>{' '}
                    trong tổng số <span className="font-semibold text-gray-900">{itemsData.totalElements}</span> bản sao
                  </div>
                  
                  <nav className="inline-flex rounded-md shadow-sm -space-x-px order-1 sm:order-2" aria-label="Pagination">
                    <button
                      onClick={() => setItemsPage((prev) => Math.max(0, prev - 1))}
                      disabled={itemsData.first}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        itemsData.first ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Trước</span>
                      <ChevronRight className="h-4 w-4 rotate-180" />
                    </button>
                    
                    {Array.from({ length: itemsData.totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setItemsPage(i)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          itemsData.currentPage === i
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setItemsPage((prev) => prev + 1)}
                      disabled={itemsData.last}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        itemsData.last ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Sau</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="border-b border-gray-200 px-6 md:px-8 mt-4">
            <div className="flex space-x-8 overflow-x-auto scrollbar-hide">
              {[
                { id: 'overview', label: 'Tổng quan', icon: AlertCircle },
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
            {activeTab === 'reviews' && (
              <ReviewsTab
                publicationId={id || ''}
                ratingsData={ratingsData}
                summaryData={summaryData}
                isLoading={isLoadingRatings}
                onPageChange={setRatingsPage}
                onRefresh={() => {
                  // Re-fetch ratings and summary to show new data
                  const refreshData = async () => {
                    if (!id) return;
                    try {
                      setIsLoadingRatings(true);
                      const [ratingsRes, summaryRes] = await Promise.all([
                        publicationsService.getPublicationRatings(id, 0, 10),
                        publicationsService.getPublicationRatingSummary(id)
                      ]);
                      
                      if (ratingsRes.code === 200) {
                        setRatingsData(ratingsRes.data);
                        setRatingsPage(0);
                      }
                      if (summaryRes.code === 200) {
                        setSummaryData(summaryRes.data);
                      }
                    } catch (error) {
                      console.error('Failed to refresh data:', error);
                    } finally {
                      setIsLoadingRatings(false);
                    }
                  };
                  refreshData();
                }}
                averageRating={data.ratings.averageRating}
                totalRatings={data.ratings.totalRatings}
              />
            )}
            {activeTab === 'related' && <RelatedBooksTab />}
          </div>
        </div>
      </div>

      {/* Borrow Success Modal */}
      {borrowSuccessData && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto p-6">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md my-auto overflow-hidden animate-fade-in-up">
            <div className="bg-blue-600 p-6 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-white">Yêu cầu mượn thành công!</h2>
              <p className="text-blue-100 mt-2 text-sm">Vui lòng đưa mã QR này cho thủ thư để nhận sách.</p>
            </div>
            
            <div className="p-8">
              <div className="flex justify-center mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <QRCode value={String(borrowSuccessData.transactionId)} size={200} />
              </div>
              
              <div className="space-y-3 mb-8">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500 font-medium">Mã giao dịch</span>
                    <span className="font-mono font-bold text-gray-900">#{borrowSuccessData.transactionId}</span>
                  </div>
                  <h4 className="font-bold text-gray-900 leading-tight mb-2">{borrowSuccessData.publicationTitle}</h4>
                  <p className="text-sm text-gray-600 flex items-center gap-1.5 mb-1">
                    <Layers size={14} className="text-gray-400" /> Vị trí: <span className="font-medium text-gray-800">{borrowSuccessData.branch} - {borrowSuccessData.shelf}</span>
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-1.5">
                    <Printer size={14} className="text-gray-400" /> Barcode: <span className="font-medium text-gray-800">{borrowSuccessData.barcode}</span>
                  </p>
                </div>
                
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3">
                  <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-sm font-bold text-red-800 mb-1">Hạn chót đến lấy sách</span>
                    <span className="text-sm text-red-700">{new Date(borrowSuccessData.pickedUpDeadline).toLocaleString('vi-VN', {
                      hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
                    })}</span>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={() => setBorrowSuccessData(null)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3 rounded-xl shadow-md"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetailPage;
