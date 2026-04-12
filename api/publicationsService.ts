import axiosInstance from './axiosInstance';
import {
  ApiResponse,
  GetPublicationsParams,
  LibrarianPublicationDetailResponse,
  PaginatedPublications,
  Publication
} from './publicationTypes';

const publicationsService = {

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
    return axiosInstance.get(`/categories/search?keyword=${keyword}`);
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

 
  getLibrarianPublicationById: async (
    id: string
  ): Promise<ApiResponse<LibrarianPublicationDetailResponse>> => {
    return axiosInstance.get(`/publications/librarian/${id}`);
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
};

export default publicationsService;
