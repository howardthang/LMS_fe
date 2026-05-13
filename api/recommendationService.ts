import axiosInstance from './axiosInstance';
import { ApiResponse } from './publicationTypes';

export interface RecommendedPublication {
  publicationId: string;
  title: string;
  coverImageUrl: string | null;
  publicationYear: number | null;
  availableItems: number;
  ratingAverage: number;
  ratingCount: number;
  authorNames: string[];
}

const recommendationService = {
  getRecommendations: async (limit = 10): Promise<ApiResponse<RecommendedPublication[]>> => {
    return axiosInstance.get(`/recommendations?limit=${limit}`);
  },
};

export default recommendationService;
