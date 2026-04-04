import axiosInstance from './axiosInstance';

export interface LoginResponse {
  code: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return axiosInstance.post('/auths/login', { email, password });
  },
};

export default authService;
