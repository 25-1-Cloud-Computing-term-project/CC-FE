"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
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

    // 실제 구현에서는 백엔드 API 호출이 필요합니다
    try {
      // 로그인 성공을 가정하고 메인 페이지로 이동
      setTimeout(() => {
        setIsLoading(false);
        router.push("/");
      }, 1000);
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">로그인</h2>
          <p className="mt-2 text-gray-600">계정에 로그인하여 가전제품 설명서 Q&A 서비스를 이용하세요</p>
        </div>

        {successMessage && <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">{successMessage}</div>}

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
  );
}
