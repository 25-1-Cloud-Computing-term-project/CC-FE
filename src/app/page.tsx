"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getBrands, Brand, Category } from "@/services/brandService";
import { getCategoriesByBrandId } from "@/services/categoryService";
import { getPublicModels, getPublicModelsByCategoryId, Model, createPersonalModel } from "@/services/modelService";
import { isAuthenticated } from "@/services/authService";

export default function Home() {
  // 브랜드, 카테고리, 모델 상태 관리
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  // PDF 업로드 관련 상태
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 초기 데이터 로드
  useEffect(() => {
    const loadBrands = async () => {
      try {
        const brandsData = await getBrands();
        setBrands(brandsData);
      } catch (error) {
        console.error("Failed to load brands:", error);
      }
    };

    const loadModels = async () => {
      try {
        const modelsData = await getPublicModels();
        setModels(modelsData);
      } catch (error) {
        console.error("Failed to load models:", error);
      }
    };

    const checkAuth = () => {
      setIsAuth(isAuthenticated());
    };

    loadBrands();
    loadModels();
    checkAuth();
  }, []);

  // 브랜드 선택 시 카테고리 로드
  useEffect(() => {
    const loadCategories = async () => {
      if (selectedBrand) {
        try {
          const categoriesData = await getCategoriesByBrandId(selectedBrand);
          setCategories(categoriesData);
        } catch (error) {
          console.error("Failed to load categories:", error);
        }
      } else {
        setCategories([]);
      }
    };

    loadCategories();
  }, [selectedBrand]);

  // 카테고리 선택 시 모델 로드
  useEffect(() => {
    const loadModels = async () => {
      if (selectedCategory) {
        try {
          const modelsData = await getPublicModelsByCategoryId(selectedCategory);
          setModels(modelsData);
        } catch (error) {
          console.error("Failed to load models:", error);
        }
      } else if (selectedBrand) {
        // 브랜드만 선택된 경우 모든 모델 표시
        try {
          const modelsData = await getPublicModels();
          const filteredModels = modelsData.filter((model) => model.brand && model.brand.id === selectedBrand);
          setModels(filteredModels);
        } catch (error) {
          console.error("Failed to load models:", error);
        }
      } else {
        // 아무것도 선택되지 않은 경우 모든 모델 로드
        try {
          const modelsData = await getPublicModels();
          setModels(modelsData);
        } catch (error) {
          console.error("Failed to load models:", error);
        }
      }
    };

    loadModels();
  }, [selectedCategory, selectedBrand]);

  // 브랜드 선택 처리
  const handleBrandSelect = (brandId: number) => {
    setSelectedBrand(brandId);
    setSelectedCategory(null);
    setSelectedModel(null);
  };

  // 카테고리 선택 처리
  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategory(categoryId);
    setSelectedModel(null);
  };

  // 모델 선택 처리
  const handleModelSelect = (model: Model) => {
    setSelectedModel(model);
  };

  // 전체 페이지에 드래그 앤 드롭 이벤트 처리
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      // 마우스가 창 밖으로 나갔을 때만 isDragging 상태 변경
      if (e.clientX <= 0 || e.clientX >= window.innerWidth || e.clientY <= 0 || e.clientY >= window.innerHeight) {
        setIsDragging(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        handleFileUpload(file);
      }
    };

    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
    };
  }, []);

  // PDF 파일 처리
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFileUpload(file);
    }
  };

  // 파일 업로드 처리 통합 함수
  const handleFileUpload = (file: File) => {
    if (file.type !== "application/pdf") {
      alert("PDF 파일만 업로드 가능합니다.");
      return;
    }

    setPdfFile(file);

    // 로그인 확인
    if (!isAuth) {
      alert("파일 업로드는 로그인이 필요합니다. 로그인 페이지로 이동합니다.");
      window.location.href = "/login";
      return;
    }

    // 업로드 처리
    handleUploadSubmit(file);
  };

  // 파일 업로드 제출
  const handleUploadSubmit = async (file: File) => {
    setUploadLoading(true);
    setUploadError(null);

    try {
      // 파일 이름에서 확장자 제거
      const fileName = file.name.replace(/\.[^/.]+$/, "");

      // 개인 모델 생성 API 호출
      const response = await createPersonalModel(fileName, file);

      // 성공 시 챗봇 페이지로 이동
      if (response && response.id) {
        window.location.href = `/chat/${response.id}`;
      }
    } catch (error: any) {
      console.error("Failed to upload file:", error);
      setUploadError(error.response?.data?.message || "파일 업로드에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 사용자 인증 상태 표시 및 로그인/로그아웃 버튼 */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">가전제품 설명서 Q&A</h1>
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

      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* 왼쪽 사이드바: 브랜드, 카테고리, 모델 선택 */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">제품 선택</h2>

              {/* 브랜드 선택 */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">브랜드</h3>
                <div className="grid grid-cols-2 gap-2">
                  {brands.map((brand) => (
                    <button key={brand.id} onClick={() => handleBrandSelect(brand.id)} className={`px-3 py-2 text-sm rounded-md ${selectedBrand === brand.id ? "bg-blue-100 text-blue-800 font-medium" : "bg-gray-100 hover:bg-gray-200 text-gray-800"}`}>
                      {brand.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 카테고리 선택 */}
              {selectedBrand && categories.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">카테고리</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => (
                      <button key={category.id} onClick={() => handleCategorySelect(category.id)} className={`px-3 py-2 text-sm rounded-md ${selectedCategory === category.id ? "bg-blue-100 text-blue-800 font-medium" : "bg-gray-100 hover:bg-gray-200 text-gray-800"}`}>
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 개인 모델 추가 */}
              <div className="mt-8 border-t pt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">내 제품 설명서 업로드</h3>
                <p className="text-xs text-gray-500 mb-3">PDF 파일을 업로드하면 AI가 내용을 분석하여 답변해드립니다.</p>

                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <p className="mb-1 text-sm text-gray-500">
                      <span className="font-semibold">클릭하여 파일 선택</span> 또는 드래그 앤 드롭
                    </p>
                    <p className="text-xs text-gray-500">PDF 파일만 지원 (최대 20MB)</p>
                  </div>
                  <input ref={fileInputRef} type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                </label>

                {uploadLoading && (
                  <div className="mt-3 text-center">
                    <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm rounded-md text-white bg-blue-600 transition ease-in-out duration-150">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      업로드 중...
                    </div>
                  </div>
                )}

                {uploadError && <p className="mt-2 text-sm text-red-600">{uploadError}</p>}
              </div>
            </div>
          </div>

          {/* 오른쪽 메인 컨텐츠: 모델 목록 및 선택 */}
          <div className="w-full md:w-2/3 lg:w-3/4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">{selectedBrand ? (selectedCategory ? `${brands.find((b) => b.id === selectedBrand)?.name} > ${categories.find((c) => c.id === selectedCategory)?.name}` : `${brands.find((b) => b.id === selectedBrand)?.name} 제품`) : "모든 제품"}</h2>

              {/* 모델 목록 */}
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : models.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {models.map((model) => (
                    <div key={model.id} onClick={() => handleModelSelect(model)} className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedModel?.id === model.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"}`}>
                      <h3 className="font-medium text-gray-900">{model.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {model.brand?.name} | {model.category?.name}
                      </p>
                      {selectedModel?.id === model.id && (
                        <Link href={`/chat/${model.id}`} className="mt-3 inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                          Q&A 시작하기
                          <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                          </svg>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                  <p className="text-lg font-medium">해당 조건의 제품이 없습니다</p>
                  <p className="text-sm mt-1">다른 브랜드나 카테고리를 선택하거나 직접 PDF를 업로드해보세요</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 드래그 앤 드롭 오버레이 */}
      {isDragging && (
        <div className="fixed inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            <h3 className="text-xl font-bold mb-2">PDF 파일을 여기에 놓으세요</h3>
            <p className="text-gray-600">업로드한 PDF 파일을 분석하여 제품 질문에 답변해드립니다</p>
          </div>
        </div>
      )}
    </div>
  );
}
