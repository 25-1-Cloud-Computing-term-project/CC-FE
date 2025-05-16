"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productBrand, setProductBrand] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError("");

    // 파일 타입 검증
    if (file.type !== "application/pdf") {
      setError("PDF 파일만 업로드할 수 있습니다.");
      return;
    }

    // 파일 크기 검증 (20MB 제한)
    if (file.size > 20 * 1024 * 1024) {
      setError("파일 크기는 20MB를 초과할 수 없습니다.");
      return;
    }

    setFile(file);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("업로드할 PDF 파일을 선택해주세요.");
      return;
    }

    if (!productName.trim()) {
      setError("제품명을 입력해주세요.");
      return;
    }

    if (!productCategory) {
      setError("제품 카테고리를 선택해주세요.");
      return;
    }

    if (!productBrand) {
      setError("제품 브랜드를 선택해주세요.");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      // 실제 구현에서는 백엔드 API 호출이 필요합니다
      // FormData를 사용하여 파일과 메타데이터 업로드
      const formData = new FormData();
      formData.append("file", file);
      formData.append("productName", productName);
      formData.append("productCategory", productCategory);
      formData.append("productBrand", productBrand);

      // 업로드 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 성공 시 채팅 페이지로 이동 (임시 ID 사용)
      router.push("/chat/uploaded-1");
    } catch (error) {
      console.error("Upload failed:", error);
      setError("파일 업로드 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">설명서 PDF 업로드</h2>
          <p className="text-gray-600 mt-2">직접 제품 사용설명서를 업로드하고 질문해보세요</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          {/* 제품 정보 입력 */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b">제품 정보 입력</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">제품명</label>
                <input type="text" className="w-full p-2 border rounded-md" placeholder="제품명을 입력하세요 (예: 삼성 냉장고 RS27T5200)" value={productName} onChange={(e) => setProductName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                <select className="w-full p-2 border rounded-md" value={productCategory} onChange={(e) => setProductCategory(e.target.value)}>
                  <option value="">카테고리 선택</option>
                  <option value="refrigerator">냉장고</option>
                  <option value="washingmachine">세탁기</option>
                  <option value="airconditioner">에어컨</option>
                  <option value="tv">TV</option>
                  <option value="microwave">전자레인지</option>
                  <option value="airpurifier">공기청정기</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">브랜드</label>
                <select className="w-full p-2 border rounded-md" value={productBrand} onChange={(e) => setProductBrand(e.target.value)}>
                  <option value="">브랜드 선택</option>
                  <option value="samsung">삼성</option>
                  <option value="lg">LG</option>
                  <option value="winia">위니아</option>
                  <option value="coway">코웨이</option>
                  <option value="other">기타</option>
                </select>
              </div>
            </div>
          </div>

          {/* 파일 업로드 영역 */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b">PDF 파일 업로드</h3>
            <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging ? "border-blue-500 bg-blue-50" : file ? "border-green-500 bg-green-50" : "border-gray-300"}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
              {file ? (
                <div className="flex flex-col items-center">
                  <svg className="w-12 h-12 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-lg font-medium">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button onClick={() => setFile(null)} className="mt-4 text-red-600 hover:text-red-800">
                    파일 제거
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-2">PDF 파일을 여기에 드래그하거나</p>
                  <button onClick={() => fileInputRef.current?.click()} className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md text-gray-700">
                    파일 선택하기
                  </button>
                  <p className="text-xs text-gray-500 mt-2">PDF 파일만 지원됩니다 (최대 20MB)</p>
                </>
              )}
              <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileInputChange} className="hidden" />
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">{error}</div>}

          <div className="flex justify-between">
            <Link href="/">
              <button className="px-6 py-2 border border-gray-300 rounded-md">취소</button>
            </Link>
            <button onClick={handleUpload} className={`bg-blue-600 text-white px-6 py-2 rounded-md ${isUploading || !file ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"}`} disabled={isUploading || !file}>
              {isUploading ? "업로드 중..." : "업로드 후 질문하기"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
