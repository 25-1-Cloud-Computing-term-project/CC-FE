import api from "./api";

// 사용자 타입 정의
export interface User {
  id: number;
  email: string;
}

// 회원가입 서비스
export const signup = async (email: string, password: string) => {
  const response = await api.post("/users/signup", { email, password });
  return response.data;
};

// 로그인 서비스
export const login = async (email: string, password: string) => {
  const response = await api.post("/users/login", { email, password });
  const { token } = response.data;

  // 토큰을 로컬 스토리지에 저장
  if (token && typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }

  return response.data;
};

// 로그아웃 서비스
export const logout = async () => {
  const response = await api.post("/users/logout");

  // 토큰 삭제
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }

  return response.data;
};

// 현재 로그인된 사용자 확인
export const isAuthenticated = () => {
  if (typeof window !== "undefined") {
    return !!localStorage.getItem("token");
  }
  return false;
};

// 관리자 권한 확인 (임시 구현, 실제로는 백엔드 API 통해 확인해야 함)
export const isAdmin = () => {
  // TODO: 실제 관리자 확인 로직 구현
  return false;
};
