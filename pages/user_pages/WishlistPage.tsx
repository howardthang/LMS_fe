import { BookOpen, Heart, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import wishlistService, { WishlistItem } from '../../api/wishlistService';
import { Button } from '../../components/ui';

const WishlistPage = () => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    wishlistService.getMyWishlist()
      .then(res => setItems(res.data ?? []))
      .catch(() => toast.error('Không thể tải danh sách yêu thích.'))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (publicationId: string) => {
    try {
      await wishlistService.removeFromWishlist(publicationId);
      setItems(prev => prev.filter(i => i.publicationId !== publicationId));
      toast.success('Đã xóa khỏi danh sách yêu thích.');
    } catch {
      toast.error('Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500 mx-auto" />
          <p className="mt-3 text-gray-500 text-sm">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Heart className="text-red-500 fill-red-500" /> Wishlist của bạn
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {items.length > 0 ? `${items.length} cuốn sách đã lưu` : 'Chưa có sách nào'}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <Heart size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-500 font-medium">Danh sách yêu thích trống</p>
          <p className="text-gray-400 text-sm mt-1">Vào trang chi tiết sách và nhấn Wishlist để lưu sách</p>
          <Link to="/userpage/dashboard">
            <Button className="mt-4" size="sm">Khám phá sách</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(item => (
            <div
              key={item.publicationId}
              className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4 hover:shadow-md transition-shadow"
            >
              <div className="w-20 h-28 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                {item.coverImageUrl ? (
                  <img
                    src={item.coverImageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen size={24} className="text-gray-300" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{item.title}</h3>
                    {item.authorNames && (
                      <p className="text-sm text-gray-500 mt-0.5 truncate">{item.authorNames}</p>
                    )}
                    {item.publicationYear && (
                      <p className="text-xs text-gray-400 mt-0.5">{item.publicationYear}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemove(item.publicationId)}
                    className="text-gray-400 hover:text-red-500 p-1 flex-shrink-0 transition-colors"
                    title="Xóa khỏi wishlist"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="mt-3">
                  <Link to={`/publicpage/book/${item.publicationId}`}>
                    <Button size="sm" variant="outline" className="text-xs">
                      Xem chi tiết
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
