import axiosInstance from './axiosInstance';
import {
  ApiResponse,
  GetPublicationsParams,
  PaginatedPublications,
  Publication,
  LibrarianPublicationDetailResponse,
  UpdatePublicationMetadataRequest
} from './publicationTypes';

/**
 * Publications Service
 *
 * Service để gọi API Publications (Books) cho Librarian
 */

const publicationsService = {
  /**
   * Lấy danh sách publications với search, filter, sort, pagination
   *
   * @example
   * const result = await publicationsService.getAllPublications({
   *   keyword: 'Software',
   *   sortBy: 'createdAt',
   *   direction: 'DESC',
   *   page: 0,
   *   size: 10
   * });
   */
  getAllPublications: async (
    params?: GetPublicationsParams
  ): Promise<ApiResponse<PaginatedPublications>> => {
    // Build query params
    const queryParams = new URLSearchParams();

    if (params?.keyword) {
      queryParams.append('keyword', params.keyword);
    }

    if (params?.categoryId) {
      queryParams.append('categoryId', params.categoryId.toString());
    }

    if (params?.sortBy) {
      queryParams.append('sortBy', params.sortBy);
    }

    if (params?.year) {
      queryParams.append('year', params.year.toString());
    }

    if (params?.hasItems !== undefined) {
      queryParams.append('hasItems', params.hasItems.toString());
    }

    if (params?.sortDir) {
      queryParams.append('sortDir', params.sortDir);
    }

    // Page mặc định là 0 (page đầu tiên)
    queryParams.append('page', (params?.page ?? 0).toString());

    // Size mặc định là 10
    queryParams.append('size', (params?.size ?? 10).toString());

    const queryString = queryParams.toString();
    const url = `/publications/librarian${queryString ? `?${queryString}` : ''}`;

    return axiosInstance.get(url);
  },

  searchAuthors: async (keyword: string) => {
    return axiosInstance.get(`/authors?keyword=${keyword}`);
  },

  createAuthor: async (name: string) => {
    return axiosInstance.post('/authors', { name });
  },

  // ===== CATEGORY =====
  searchCategories: async (keyword: string) => {
    return axiosInstance.get(`/categories?keyword=${keyword}`);
  },

  createCategory: async (name: string) => {
    return axiosInstance.post('/categories', { name });
  },

  // ===== TAG =====
  searchTags: async (keyword: string) => {
    return axiosInstance.get(`/tags?keyword=${keyword}`);
  },

  createTag: async (name: string) => {
    return axiosInstance.post('/tags', { name });
  },

  // ===== PUBLISHER =====
  searchPublishers: async (keyword: string) => {
    return axiosInstance.get(`/publishers?keyword=${keyword}`);
  },

  createPublisher: async (name: string) => {
    return axiosInstance.post('/publishers', { name });
  },


  uploadFile: async (
    id: number,
    file: File
  ): Promise<ApiResponse<{ url: string }>> => {
    const formData = new FormData();
    formData.append('file', file);

    return axiosInstance.post(`/publications/${id}/file`, formData);
  },

  /**
   * Lấy chi tiết một publication theo ID
   *
   * @example
   * const publication = await publicationsService.getPublicationById(8);
   */
  getLibrarianPublicationById: async (
    id: number
  ): Promise<ApiResponse<LibrarianPublicationDetailResponse>> => {
    return axiosInstance.get(`/publications/librarian/${id}`);
  },

  /**
   * Tạo publication mới
   *
   * @example
   * const newPublication = await publicationsService.createPublication({
   *   isbn: '978-0-123456-78-9',
   *   title: 'New Book',
   *   ...
   * });
   */
  createPublication: async (
    data: Partial<Publication>
  ): Promise<ApiResponse<Publication>> => {
    return axiosInstance.post('/publications', data);
  },

  /**
   * Cập nhật publication
   *
   * @example
   * const updated = await publicationsService.updatePublication(8, {
   *   title: 'Updated Title'
   * });a
   */
  updateMetadata: async (
    id: number,
    data: UpdatePublicationMetadataRequest
  ): Promise<ApiResponse<void>> => {
    return axiosInstance.put(`/publications/${id}/metadata`, data);
  },

  /**
   * Xóa publication
   *
   * @example
   * await publicationsService.deletePublication(8);
   */
  deletePublication: async (id: number): Promise<ApiResponse<void>> => {
    return axiosInstance.delete(`/publications/${id}`);
  },

  /**
   * Cập nhật ảnh bìa publication
   *
   * @example
   * await publicationsService.updatePublicationCover(8, file);
   */
  updatePublicationCover: async (
    id: number,
    file: File
  ): Promise<ApiResponse<string>> => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post(`/publications/${id}/cover`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default publicationsService;
