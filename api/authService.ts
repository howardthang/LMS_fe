import axiosInstance from './axiosInstance';

export interface LoginResponse {
  code: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface AuthUrlResponse {
  code: number;
  message: string;
  data: string;
}

const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return axiosInstance.post('/auth/login', { email, password });
  },

  getGoogleLoginUrl: async (): Promise<AuthUrlResponse> => {
    return axiosInstance.get('/auth/login-with-social?loginType=google');
  },

  socialLoginCallback: async (registrationId: string, code: string): Promise<LoginResponse> => {
    return axiosInstance.post(`/auth/social-callback/${registrationId}?code=${code}`);
  },

  logout: async (refreshToken: string): Promise<any> => {
    // Gọi API logout nhưng dùng config thứ 3 để ghi đè header
    return axiosInstance.post('/auth/logout', {}, {
      headers: {
        're-token': refreshToken
      }
    });
  }
};

export default authService;
