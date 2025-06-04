"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { logout } from "@/services/authService";

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
        router.push("/");
      } catch (error) {
        console.error("Logout failed:", error);

        // 오류가 발생해도 로컬 스토리지의 토큰은 삭제하고 홈으로 이동
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
        }
        router.push("/");
      }
    };

    performLogout();
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 헤더 */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-gray-800 hover:opacity-80">
            가전제품 설명서 Q&A
          </Link>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">로그아웃 중입니다...</h2>
          <p className="text-gray-600 mt-2">잠시만 기다려주세요.</p>
        </div>
      </div>
    </div>
  );
}
