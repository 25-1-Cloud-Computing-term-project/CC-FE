"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/services/authService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // URL 파라미터에서 registered=true 확인
    const registered = searchParams.get("registered");
    if (registered === "true") {
      setSuccessMessage("회원가입이 완료되었습니다. 로그인해주세요.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await login(email, password);
      setIsLoading(false);
      router.push("/");
    } catch (error: any) {
      console.error("Login failed:", error);
      setIsLoading(false);
      setErrorMessage(error.response?.data?.message || "로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 헤더 */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-gray-800 hover:opacity-80">
            가전제품 설명서 Q&A
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/signup" className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
              회원가입
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">로그인</h2>
            <p className="mt-2 text-gray-600">계정에 로그인하여 가전제품 설명서 Q&A 서비스를 이용하세요</p>
          </div>

          {successMessage && <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">{successMessage}</div>}
          {errorMessage && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{errorMessage}</div>}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  이메일
                </label>
                <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="your-email@example.com" />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  비밀번호
                </label>
                <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <label htmlFor="remember-me" className="block ml-2 text-sm text-gray-700">
                  자동 로그인
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  비밀번호 찾기
                </a>
              </div>
            </div>

            <div>
              <button type="submit" className={`w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`} disabled={isLoading}>
                {isLoading ? "로그인 중..." : "로그인"}
              </button>
            </div>
          </form>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              계정이 없으신가요?{" "}
              <Link href="/signup" className="text-blue-600 hover:text-blue-500">
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
