"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getPersonalModels, Model, deletePersonalModel, downloadManual } from "@/services/modelService";
import { isAuthenticated } from "@/services/authService";

export default function PersonalModels() {
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const router = useRouter();

  // 인증 확인 및 모델 로드
  useEffect(() => {
    const checkAuthAndLoadModels = async () => {
      // 인증 확인
      const authenticated = isAuthenticated();
      setIsAuth(authenticated);

      if (!authenticated) {
        router.push("/login");
        return;
      }

      try {
        setIsLoading(true);
        const data = await getPersonalModels();
        setModels(data);
      } catch (error) {
        console.error("Failed to load models:", error);
        setError("개인 모델을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndLoadModels();
  }, [router]);

  // 모델 삭제 처리
  const handleDelete = async (id: number) => {
    try {
      setDeleteId(id);
      setIsDeleting(true);
      await deletePersonalModel(id);
      setModels(models.filter((model) => model.id !== id));
    } catch (error) {
      console.error("Failed to delete model:", error);
      setError("모델 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  // 매뉴얼 다운로드 처리
  const handleDownload = async (modelId: number, fileName: string) => {
    try {
      const blob = await downloadManual(modelId);

      // 다운로드 링크 생성 및 클릭
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();

      // 정리
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download manual:", error);
      setError("매뉴얼 다운로드 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 사용자 인증 상태 표시 및 로그인/로그아웃 버튼 */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-gray-800 hover:opacity-80">
            가전제품 설명서 Q&A
          </Link>
          <div>
            {isAuth ? (
              <div className="flex items-center space-x-4">
                <Link href="/models" className="text-blue-600 hover:text-blue-800">
                  내 모델 관리
                </Link>
                <Link href="/logout" className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
                  로그아웃
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  로그인
                </Link>
                <Link href="/signup" className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
                  회원가입
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">내 제품 모델 관리</h1>
          <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            홈으로 돌아가기
          </Link>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">{error}</div>}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : models.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">모델명</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">매뉴얼</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {models.map((model) => (
                  <tr key={model.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{model.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {model.manual && (
                        <button onClick={() => handleDownload(model.id, model.manual?.fileName || "manual.pdf")} className="text-blue-600 hover:text-blue-800">
                          {model.manual.fileName}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <Link href={`/chat/${model.id}`} className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                        Q&A
                      </Link>
                      <button onClick={() => handleDelete(model.id)} disabled={isDeleting && deleteId === model.id} className={`px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 ${isDeleting && deleteId === model.id ? "opacity-50 cursor-not-allowed" : ""}`}>
                        {isDeleting && deleteId === model.id ? "삭제 중..." : "삭제"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h2 className="text-xl font-semibold mb-2">등록된 개인 모델이 없습니다</h2>
            <p className="text-gray-600 mb-4">홈 화면에서 PDF 파일을 업로드하여 개인 모델을 생성해보세요.</p>
            <Link href="/" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              홈으로 이동
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
