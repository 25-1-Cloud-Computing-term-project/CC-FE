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
  try {
    console.log("Login attempt:", { email });
    const response = await api.post("/users/login", { email, password });
    console.log("Login response:", response.data);

    const { token } = response.data;

    // 토큰을 로컬 스토리지에 저장
    if (token && typeof window !== "undefined") {
      localStorage.setItem("token", token);
      console.log("Token saved to localStorage:", token);
    } else {
      console.error("No token received or not in browser environment");
    }

    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
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
    const token = localStorage.getItem("token");
    console.log("isAuthenticated check:", { hasToken: !!token, token: token?.substring(0, 20) + "..." });
    return !!token;
  }
  console.log("isAuthenticated check: not in browser environment");
  return false;
};

// 관리자 권한 확인
export const isAdmin = () => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      // JWT 토큰 디코딩 (간단한 방법)
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.role === "ROLE_ADMIN";
    } catch (error) {
      console.error("Error decoding token:", error);
      return false;
    }
  }
  return false;
};
