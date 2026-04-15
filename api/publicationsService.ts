import axiosInstance from './axiosInstance';
import {
  ApiResponse,
  GetPublicationsParams,
  PublicationDetailResponse,
  MostBorrowedPublication,
  NewestPublication,
  PaginatedPublications,
  PaginatedPublicationItems,
  Publication
} from './publicationTypes';

const publicationsService = {

  getMostBorrowedPublications: async (limit: number = 10): Promise<ApiResponse<MostBorrowedPublication[]>> => {
    return axiosInstance.get(`/publications/most-borrowed?limit=${limit}`);
  },

  getNewestPublications: async (limit: number = 10): Promise<ApiResponse<NewestPublication[]>> => {
    return axiosInstance.get(`/publications/newest?limit=${limit}`);
  },

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
    return axiosInstance.post('/authors', name, {
      headers: { 'Content-Type': 'text/plain' }
    });
  },

  // ===== CATEGORY =====
  searchCategories: async (keyword: string) => {
    return axiosInstance.get(`/categories/search?keyword=${keyword}`);
  },

  createCategory: async (name: string) => {
    return axiosInstance.post('/categories', name, {
      headers: { 'Content-Type': 'text/plain' }
    });
  },

  // ===== TAG =====
  searchTags: async (keyword: string) => {
    return axiosInstance.get(`/tags?keyword=${keyword}`);
  },

  createTag: async (name: string) => {
    return axiosInstance.post('/tags', name, {
      headers: { 'Content-Type': 'text/plain' }
    });
  },

  // ===== PUBLISHER =====
  searchPublishers: async (keyword: string) => {
    return axiosInstance.get(`/publishers?keyword=${keyword}`);
  },

  createPublisher: async (name: string) => {
    return axiosInstance.post('/publishers', name, {
      headers: { 'Content-Type': 'text/plain' }
    });
  },

  updatePublication: async (
    id: string,
    data: Partial<Publication>
  ): Promise<ApiResponse<Publication>> => {
    return axiosInstance.put(`/publications/${id}`, data);
  },


  uploadFile: async (
    id: string,
    file: File
  ): Promise<ApiResponse<string>> => {
    const formData = new FormData();
    formData.append('file', file);

    return axiosInstance.put(`/publications/${id}/file`, formData);
  },


  getPublicationById: async (
    id: string
  ): Promise<ApiResponse<PublicationDetailResponse>> => {
    return axiosInstance.get(`/publications/${id}`);
  },

  createPublication: async (
    data: Partial<Publication>
  ): Promise<ApiResponse<Publication>> => {
    return axiosInstance.post('/publications', data);
  },

  deletePublication: async (id: string): Promise<ApiResponse<void>> => {
    return axiosInstance.delete(`/publications/${id}`);
  },

  updatePublicationCover: async (
    id: string,
    file: File
  ): Promise<ApiResponse<string>> => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.put(`/publications/${id}/cover`, formData);
  },

  getPublicationItems: async (
    id: string,
    page: number = 0,
    limit: number = 5
  ): Promise<ApiResponse<PaginatedPublicationItems>> => {
    return axiosInstance.get(`/publications/${id}/items?page=${page}&limit=${limit}`);
  },
};

export default publicationsService;
