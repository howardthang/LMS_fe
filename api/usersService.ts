import axiosInstance from './axiosInstance';

export interface UserProfileResponse {
  code: number;
  message: string;
  data: {
    id: number;
    email: string;
    fullName: string;
    dateOfBirth: string | null;
    phoneNumber: string | null;
    address: string | null;
    profilePictureUrl: string | null;
    roles: {
      id: number;
      roleName: string;
      description: string;
    }[];
    status: string;
    aiPersonalizationEnabled: boolean;
    lastLoginAt: string | null;
  };
}

export interface UpdateProfileRequest {
  fullName?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  address?: string;
  aiPersonalizationEnabled?: boolean;
}

const usersService = {
  getMyProfile: async (): Promise<UserProfileResponse> => {
    return axiosInstance.get('/users/my-profile');
  },
  updateMyProfile: async (data: UpdateProfileRequest): Promise<UserProfileResponse> => {
    return axiosInstance.put('/users/my-profile', data);
  }
};

export default usersService;
