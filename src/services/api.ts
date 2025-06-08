import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from "axios";

// API 기본 URL 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

console.log("API_BASE_URL:", API_BASE_URL);

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5분 타임아웃 (파일 업로드용)
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터 설정 - JWT 토큰 추가
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    console.log("Request config:", { url: config.url, baseURL: config.baseURL, token: !!token });
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 설정 - 401 에러 처리
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log("Response received:", { status: response.status, url: response.config.url });
    return response;
  },
  (error: AxiosError) => {
    console.error("Response interceptor error:", error.message, error.code, error.response?.data);

    // 네트워크 연결 에러 처리
    if (error.code === "ECONNRESET" || error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
      console.error("네트워크 연결 오류:", error.code);
      // 사용자에게 더 친화적인 에러 메시지 제공
      const networkError = new Error("서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.");
      networkError.name = "NetworkError";
      return Promise.reject(networkError);
    }

    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
