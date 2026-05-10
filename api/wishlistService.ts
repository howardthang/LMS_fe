import axiosInstance from './axiosInstance';

export interface WishlistItem {
  publicationId: string;
  title: string;
  coverImageUrl: string | null;
  authorNames: string | null;
  publicationYear: number | null;
  addedAt: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

const wishlistService = {
  getMyWishlist: (): Promise<ApiResponse<WishlistItem[]>> =>
    axiosInstance.get('/wishlist'),

  addToWishlist: (publicationId: string): Promise<ApiResponse<void>> =>
    axiosInstance.post(`/wishlist/${publicationId}`),

  removeFromWishlist: (publicationId: string): Promise<ApiResponse<void>> =>
    axiosInstance.delete(`/wishlist/${publicationId}`),

  getWishlistStatus: (publicationId: string): Promise<ApiResponse<boolean>> =>
    axiosInstance.get(`/wishlist/${publicationId}/status`),
};

export default wishlistService;
