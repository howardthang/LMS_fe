import axios from 'axios';
import axiosInstance from './axiosInstance';
import {
  ApiResponse,
  GetPublicationsParams,
  PublicationDetailResponse,
  MostBorrowedPublication,
  NewestPublication,
  PaginatedPublications,
  PaginatedPublicationItems,
  PaginatedPublicationRatings,
  Publication,
  PublicationRatingSummary,
  PageResponse,
  PublicSearchParams,
  PublicSearchResult,
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

    queryParams.append('page', (params?.page ?? 0).toString());
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

  getPublicationById: async (
    id: string
  ): Promise<ApiResponse<PublicationDetailResponse>> => {
    return axiosInstance.get(`/publications/${id}`);
  },

  createPublication: async (
    data: Partial<Publication>
  ): Promise<ApiResponse<any>> => {
    return axiosInstance.post('/publications', data);
  },

  deletePublication: async (id: string): Promise<ApiResponse<void>> => {
    return axiosInstance.delete(`/publications/${id}`);
  },

  getDocumentUploadUrl: async (
    id: string,
    filename: string
  ): Promise<ApiResponse<{ uploadUrl: string; s3Key: string }>> => {
    return axiosInstance.get(`/publications/${id}/document-upload-url?filename=${encodeURIComponent(filename)}`);
  },

  uploadDocumentToS3: async (
    uploadUrl: string,
    file: File,
    onProgress?: (percent: number) => void,
    signal?: AbortSignal
  ): Promise<void> => {
    // Dùng axios thuần (không phải axiosInstance) để tránh gắn Authorization header vào presigned URL
    await axios.put(uploadUrl, file, {
      headers: { 'Content-Type': 'application/pdf' },
      signal,
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      }
    });
  },

  saveDocumentUrl: async (
    id: string,
    s3Key: string
  ): Promise<ApiResponse<string>> => {
    return axiosInstance.put(`/publications/${id}/document-url`, { s3Key });
  },

  uploadCover: async (
    id: string,
    file: File,
    onProgress?: (percent: number) => void,
    signal?: AbortSignal
  ): Promise<ApiResponse<string>> => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post(`/publications/${id}/cover`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      signal,
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      }
    });
  },

  searchPublications: async (
    params: PublicSearchParams
  ): Promise<ApiResponse<PageResponse<PublicSearchResult>>> => {
    const q = new URLSearchParams();
    if (params.keyword)   q.append('keyword',  params.keyword);
    if (params.categoryId) q.append('categoryId', params.categoryId);
    if (params.language)  q.append('language', params.language);
    if (params.yearFrom)  q.append('yearFrom', String(params.yearFrom));
    if (params.yearTo)    q.append('yearTo',   String(params.yearTo));
    if (params.available) q.append('available', 'true');
    if (params.branch)    q.append('branch',   params.branch);
    if (params.sortBy)    q.append('sortBy',   params.sortBy);
    q.append('page', String(params.page ?? 0));
    q.append('size', String(params.size ?? 12));
    return axiosInstance.get(`/publications/search?${q.toString()}`);
  },

  getPublicationItems: async (
    id: string,
    page: number = 0,
    limit: number = 5
  ): Promise<ApiResponse<PaginatedPublicationItems>> => {
    return axiosInstance.get(`/publications/${id}/items?page=${page}&limit=${limit}`);
  },

  getPublicationRatings: async (
    id: string,
    page: number = 0,
    size: number = 10
  ): Promise<ApiResponse<PaginatedPublicationRatings>> => {
    return axiosInstance.get(`/publications/${id}/ratings?page=${page}&size=${size}`);
  },

  createPublicationRating: async (
    id: string,
    data: { star: number; comment: string }
  ): Promise<ApiResponse<void>> => {
    return axiosInstance.post(`/publications/${id}/ratings`, data);
  },

  getPublicationRatingSummary: async (
    id: string
  ): Promise<ApiResponse<PublicationRatingSummary>> => {
    return axiosInstance.get(`/publications/${id}/ratings/summary`);
  },
};

export default publicationsService;
