"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getBrands, Brand, Category } from "@/services/brandService";
import { getCategoriesByBrandId } from "@/services/categoryService";
import { getPublicModels, getPublicModelsByCategoryId, getPersonalModels, Model, createPersonalModel } from "@/services/modelService";
import { isAuthenticated, isAdmin } from "@/services/authService";
import { sendQuestion } from "@/services/chatService";

// 메시지 타입 정의
type MessageType = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  images?: string[];
};

export default function Home() {
  // 브랜드, 카테고리, 모델 상태 관리
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [personalModels, setPersonalModels] = useState<Model[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  // PDF 업로드 관련 상태
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 채팅 관련 상태
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: "1",
      role: "assistant",
      content: "안녕하세요! 가전제품 사용에 관해 궁금한 점이 있으시면 언제든 질문해주세요. 먼저 왼쪽에서 제품을 선택하거나 PDF 파일을 업로드해주세요.",
      timestamp: new Date(),
    },
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 인증 확인
  const checkAuth = () => {
    const authenticated = isAuthenticated();
    setIsAuth(authenticated);
  };

  // 로그아웃 핸들러
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuth(false);
    window.location.href = "/";
  };

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

    const loadPersonalModels = async () => {
      if (isAuthenticated()) {
        try {
          const personalModelsData = await getPersonalModels();
          setPersonalModels(personalModelsData);
        } catch (error) {
          console.error("Failed to load personal models:", error);
        }
      }
    };

    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsAuth(authenticated);
      if (authenticated) {
        loadPersonalModels();
      }
    };

    loadBrands();
    loadModels();
    checkAuth();
  }, []);

  // 인증 상태 변경 시 개인 모델 로드
  useEffect(() => {
    const loadPersonalModels = async () => {
      if (isAuth) {
        try {
          const personalModelsData = await getPersonalModels();
          setPersonalModels(personalModelsData);
        } catch (error) {
          console.error("Failed to load personal models:", error);
        }
      } else {
        setPersonalModels([]);
      }
    };

    loadPersonalModels();
  }, [isAuth]);

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
    // 모델 선택 시 채팅 시작 메시지 추가
    const welcomeMessage: MessageType = {
      id: Date.now().toString(),
      role: "assistant",
      content: `${model.name}에 대한 질문을 시작하겠습니다. 무엇이 궁금하신가요?`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 메시지 전송 처리
  const handleSendMessage = async () => {
    if (!message.trim() || !selectedModel) return;

    // 사용자 메시지 추가
    const userMessage: MessageType = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setChatLoading(true);

    try {
      // 챗봇 API 호출
      const response = await sendQuestion(selectedModel.id, message);

      // 챗봇 응답 추가
      const botResponse: MessageType = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.answer,
        timestamp: new Date(),
        images: response.images,
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Failed to get response:", error);

      // 에러 메시지 추가
      const errorResponse: MessageType = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "죄송합니다. 현재 응답을 처리하는 중에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setChatLoading(false);
      inputRef.current?.focus();
    }
  };

  // 엔터키로 메시지 전송
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 전체 페이지에 드래그 앤 드롭 이벤트 처리
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // 드래그가 완전히 페이지를 벗어났을 때만 상태 변경
      const rect = document.documentElement.getBoundingClientRect();
      if (e.clientX <= rect.left || e.clientX >= rect.right || e.clientY <= rect.top || e.clientY >= rect.bottom) {
        setIsDragging(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      console.log("File dropped, processing...");

      if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        console.log("Dropped file:", file.name, file.type);

        // 파일 타입 검증
        if (file.type !== "application/pdf") {
          alert("PDF 파일만 업로드 가능합니다.");
          return;
        }

        setPdfFile(file);

        // 로그인 확인
        if (!isAuthenticated()) {
          alert("파일 업로드는 로그인이 필요합니다. 로그인 페이지로 이동합니다.");
          window.location.href = "/login";
          return;
        }

        // 업로드 처리
        handleUploadSubmit(file);
      } else {
        console.log("No files found in drop event");
      }
    };

    // 이벤트 리스너 등록
    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("dragenter", handleDragEnter);
    document.addEventListener("dragleave", handleDragLeave);
    document.addEventListener("drop", handleDrop);

    return () => {
      // 이벤트 리스너 정리
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("dragenter", handleDragEnter);
      document.removeEventListener("dragleave", handleDragLeave);
      document.removeEventListener("drop", handleDrop);
    };
  }, [isAuth]); // isAuth를 의존성으로 추가

  // PDF 파일 처리
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFileUpload(file);
    }
  };

  // 파일 업로드 처리 통합 함수
  const handleFileUpload = (file: File) => {
    console.log("handleFileUpload called with:", file.name, file.type);

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
    setUploadProgress(0);
    setUploadError(null);

    try {
      // 파일 이름에서 확장자 제거
      const fileName = file.name.replace(/\.[^/.]+$/, "");

      // 개인 모델 생성 API 호출 (진행 상황 콜백 추가)
      const response = await createPersonalModel(fileName, file, (progressEvent: any) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });

      // 성공 시 해당 모델 선택
      if (response && response.id) {
        setSelectedModel(response);
        const welcomeMessage: MessageType = {
          id: Date.now().toString(),
          role: "assistant",
          content: `${fileName} 설명서 업로드가 완료되었습니다! 이제 무엇이든 질문해주세요.`,
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
        setUploadProgress(100);

        // 성공 후 상태 초기화
        setTimeout(() => {
          setUploadProgress(0);
          setPdfFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }, 2000);
      }
    } catch (error: any) {
      console.error("Failed to upload file:", error);
      setUploadError(error.message || "파일 업로드에 실패했습니다. 다시 시도해주세요.");
      setUploadProgress(0);
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 사용자 인증 상태 표시 및 로그인/로그아웃 버튼 */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">가전제품 Q&A 챗봇</h1>
          <div>
            {isAuth ? (
              <div className="flex items-center space-x-4">
                <Link href="/models" className="text-blue-600 hover:text-blue-800">
                  내 모델
                </Link>
                {isAdmin() && (
                  <Link href="/admin" className="text-red-600 hover:text-red-800 font-semibold">
                    관리자
                  </Link>
                )}
                <button onClick={handleLogout} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
                  로그아웃
                </button>
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

      <div className="flex-1 flex h-screen">
        {/* 왼쪽 사이드바: 브랜드, 카테고리, 모델 선택 */}
        <div className="w-80 flex flex-col" style={{ backgroundColor: "#F9F9F9" }}>
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-black">제품 선택</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* 개인 모델 (로그인한 사용자만) */}
            {isAuth && personalModels.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-black mb-3">내 모델</h3>
                <div className="space-y-2">
                  {personalModels.map((model) => (
                    <button key={`personal-${model.id}`} onClick={() => handleModelSelect(model)} className={`w-full px-3 py-3 text-sm rounded-md text-left transition-colors ${selectedModel?.id === model.id ? "bg-green-600 text-white" : "bg-white hover:bg-gray-100 text-black border border-gray-200"}`}>
                      <div className="font-medium">{model.name}</div>
                      <div className={`text-xs mt-1 ${selectedModel?.id === model.id ? "text-green-100" : "text-gray-600"}`}>개인 모델</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 브랜드 선택 */}
            <div>
              <h3 className="text-sm font-medium text-black mb-3">브랜드</h3>
              <div className="grid grid-cols-2 gap-2">
                {brands.map((brand) => (
                  <button key={brand.id} onClick={() => handleBrandSelect(brand.id)} className={`px-3 py-2 text-sm rounded-md transition-colors ${selectedBrand === brand.id ? "bg-blue-600 text-white" : "bg-white hover:bg-gray-100 text-black border border-gray-200"}`}>
                    {brand.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 카테고리 선택 */}
            {selectedBrand && categories.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-black mb-3">카테고리</h3>
                <div className="grid grid-cols-1 gap-2">
                  {categories.map((category) => (
                    <button key={category.id} onClick={() => handleCategorySelect(category.id)} className={`px-3 py-2 text-sm rounded-md text-left transition-colors ${selectedCategory === category.id ? "bg-blue-600 text-white" : "bg-white hover:bg-gray-100 text-black border border-gray-200"}`}>
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 공용 모델 목록 */}
            {models.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-black mb-3">공용 모델</h3>
                <div className="space-y-2">
                  {models.map((model) => (
                    <button key={`public-${model.id}`} onClick={() => handleModelSelect(model)} className={`w-full px-3 py-3 text-sm rounded-md text-left transition-colors ${selectedModel?.id === model.id ? "bg-blue-600 text-white" : "bg-white hover:bg-gray-100 text-black border border-gray-200"}`}>
                      <div className="font-medium">{model.name}</div>
                      <div className={`text-xs mt-1 ${selectedModel?.id === model.id ? "text-blue-100" : "text-gray-600"}`}>
                        {model.brand?.name} | {model.category?.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 파일 업로드 */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-black mb-3">내 설명서 업로드</h3>
              <p className="text-xs text-gray-600 mb-3">PDF 파일을 업로드하여 AI와 대화하세요</p>

              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center justify-center">
                  <svg className="w-6 h-6 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  <p className="text-xs text-gray-600">PDF 업로드</p>
                </div>
                <input ref={fileInputRef} type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
              </label>

              {uploadLoading && (
                <div className="mt-3 text-center">
                  <div className="inline-flex items-center px-3 py-1 text-xs rounded-md text-blue-600 bg-blue-100">
                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    업로드 중... {uploadProgress}%
                  </div>
                  {/* 진행 바 */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}

              {uploadError && <p className="mt-2 text-xs text-red-600">{uploadError}</p>}
            </div>
          </div>
        </div>

        {/* 오른쪽 채팅 영역 */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedModel ? (
            <>
              {/* 채팅 헤더 */}
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{selectedModel.name}</h2>
                    <p className="text-sm text-gray-500">
                      {selectedModel.brand?.name} | {selectedModel.category?.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* 채팅 메시지 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-lg p-3 ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"}`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>

                      {/* 이미지 표시 */}
                      {msg.images && msg.images.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {msg.images.map((base64, index) => (
                            <div key={index} className="rounded overflow-hidden">
                              <img src={`data:image/png;base64,${base64}`} alt={`응답 이미지 ${index + 1}`} className="max-w-full h-auto" />
                            </div>
                          ))}
                        </div>
                      )}

                      <p className={`text-xs mt-2 ${msg.role === "user" ? "text-blue-100" : "text-gray-500"}`}>
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-3 bg-gray-100">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-75"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-150"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* 메시지 입력 */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-end gap-2">
                  <textarea ref={inputRef} className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={2} placeholder="메시지를 입력하세요..." value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={handleKeyDown} />
                  <button onClick={handleSendMessage} disabled={!message.trim() || chatLoading} className={`bg-blue-600 text-white p-2 rounded-full transition-colors ${!message.trim() || chatLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* 초기 화면 */
            <div className="flex-1 flex items-center justify-center bg-white">
              <div className="text-center max-w-md">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">가전제품 Q&A 챗봇</h3>
                <p className="text-gray-500">
                  왼쪽에서 제품을 선택하거나
                  <br />
                  PDF 파일을 업로드하여 시작하세요
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 드래그 앤 드롭 오버레이 */}
      {isDragging && (
        <div className="fixed inset-0 bg-white/70 flex items-center justify-center z-50 pointer-events-none">
          <div className="text-center pointer-events-none">
            <svg className="w-20 h-20 mx-auto mb-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <h3 className="text-xl font-bold text-black mb-2">PDF 파일을 놓으세요</h3>
            <p className="text-black">PDF 형식만 지원 (최대 20MB)</p>
          </div>
        </div>
      )}
    </div>
  );
}
