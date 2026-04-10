import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

/**
 * Axios Instance Configuration
 *
 * File này cấu hình base Axios instance với:
 * - BaseURL từ environment variable
 * - Request interceptor: Tự động thêm token vào header
 * - Response interceptor: Tự động trả về data và xử lý lỗi
 */

// Tạo Axios instance với cấu hình base
const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000
});

/**
 * REQUEST INTERCEPTOR
 * Tự động thêm Authorization token vào mỗi request nếu có
 */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Lấy token từ localStorage
    const token = localStorage.getItem("accessToken");

    // Nếu có token, thêm vào Authorization header
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request trong môi trường development
    if (import.meta.env.DEV) {
      console.log("🚀 Request:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }

    return config;
  },
  (error: AxiosError) => {
    // Xử lý lỗi request
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: { resolve: any; reject: any }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

/**
 * RESPONSE INTERCEPTOR
 * Tự động unwrap data và xử lý lỗi chung (Bao gồm Auto-Refresh Token)
 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response trong môi trường development
    if (import.meta.env.DEV) {
      console.log("✅ Response:", {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    // Trả về trực tiếp phần data thay vì toàn bộ response
    // Component chỉ cần: const books = await api.get('/books')
    // Thay vì: const books = (await api.get('/books')).data
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Xử lý lỗi response
    if (error.response) {
      // Server trả về response với status code lỗi (4xx, 5xx)
      const { status, data } = error.response;

      const isTokenExpired = status === 401 || (data && (data as any).code === 1403);

      if (isTokenExpired) {
        // Unauthorized hoặc Token hết hạn -> Tiến hành Refresh
        if (originalRequest && !originalRequest._retry) {
          if (isRefreshing) {
            return new Promise(function (resolve, reject) {
              failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                if (originalRequest.headers) {
                  originalRequest.headers['Authorization'] = 'Bearer ' + token;
                }
                return axiosInstance(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          const refreshToken = localStorage.getItem('refreshToken');
          // Nếu không có refresh token thì buộc đăng xuất ngay
          if (!refreshToken) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userType');
            window.location.href = '/#/publicpage/login';
            window.location.reload();
            return Promise.reject(error);
          }

          try {
            const baseURL =
              import.meta.env.VITE_API_BASE_URL ||
              'http://localhost:8080/api/v1';

            const res = await axios.post(
              `${baseURL}/auth/refresh-accesstoken`,
              {},
              {
                headers: {
                  're-token': refreshToken,
                  'ngrok-skip-browser-warning': '69420', // Bypass màn hình cảnh báo của ngrok
                },
              }
            );

            if ((res.data && res.data.code === 1403) || res.status === 401) {
              throw new Error('Refresh token expired (1403)');
            }

            if (res.data && res.data.data) {
              const newAccessToken = res.data.data.accessToken;
              const newRefreshToken = res.data.data.refreshToken;

              localStorage.setItem('accessToken', newAccessToken);
              localStorage.setItem('refreshToken', newRefreshToken);

              if (originalRequest.headers) {
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
              }

              processQueue(null, newAccessToken);
              return axiosInstance(originalRequest);
            } else {
              throw new Error('Refresh failed (No data)');
            }
          } catch (err) {
            processQueue(err, null);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userType');
            window.location.href = '/#/publicpage/login';
            window.location.reload();
            return Promise.reject(err);
          } finally {
            isRefreshing = false;
          }
        }

        // Rớt xuống đây nghĩa là refresh bị sai chính bản thân nó hoặc bị lỗi nặng
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userType');
        window.location.href = '/#/publicpage/login';
        window.location.reload();
        return Promise.reject(error);
      }

      switch (status) {

        case 403:
          // Forbidden - Không có quyền truy cập
          console.error("🚫 Forbidden: Không có quyền truy cập");
          break;

        case 404:
          // Not Found
          console.error("🔍 Not Found: Không tìm thấy tài nguyên");
          break;

        case 500:
          // Internal Server Error
          console.error("💥 Server Error: Lỗi server nội bộ");
          break;

        default:
          console.error(`❌ Error ${status}:`, data);
      }

      // Trả về error với message từ server hoặc message mặc định
      return Promise.reject({
        status,
        message: (data as any)?.message || "Đã có lỗi xảy ra",
        data,
      });
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      console.error("📡 Network Error: Không kết nối được với server");
      return Promise.reject({
        message:
          "Không kết nối được với server. Vui lòng kiểm tra kết nối mạng.",
      });
    } else {
      // Lỗi khi setup request
      console.error("⚠️ Request Setup Error:", error.message);
      return Promise.reject({
        message: error.message || "Đã có lỗi xảy ra khi gửi request",
      });
    }
  }
);

export default axiosInstance;
