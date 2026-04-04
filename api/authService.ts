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
    return axiosInstance.post('/auths/login', { email, password });
  },

  getGoogleLoginUrl: async (): Promise<AuthUrlResponse> => {
    return axiosInstance.get('/auths/login-with-social?loginType=google');
  },

  socialLoginCallback: async (registrationId: string, code: string): Promise<LoginResponse> => {
    return axiosInstance.post(`/auths/social-callback/${registrationId}?code=${code}`);
  }
};

export default authService;
