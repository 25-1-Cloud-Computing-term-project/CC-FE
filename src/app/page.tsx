"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function Home() {
  // 브랜드, 카테고리, 모델 상태 관리
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<{ id: number; name: string } | null>(null);

  // 채팅 관련 상태
  const [messages, setMessages] = useState<Array<{ id: string; content: string; isUser: boolean }>>([
    {
      id: "1",
      content: "안녕하세요! 가전제품 설명서 Q&A 챗봇입니다. 제품 사용 중 궁금한 점이 있으신가요?\n\n왼쪽에서 제품을 선택하시거나, PDF 설명서를 업로드하시면 질문에 답변해드리겠습니다.\n\n다음과 같은 질문에 답변할 수 있습니다:\n• 제품 사용법 및 기능 안내\n• 문제 해결 및 오류 코드 설명\n• 유지 관리 및 청소 방법\n• 안전 주의사항",
      isUser: false,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // PDF 업로드 관련 상태
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 데이터 (실제로는 API에서 가져올 예정)
  const brands = [
    { id: "samsung", name: "삼성" },
    { id: "lg", name: "LG" },
    { id: "winia", name: "위니아" },
    { id: "coway", name: "코웨이" },
  ];

  const categories = {
    samsung: [
      { id: "refrigerator", name: "냉장고" },
      { id: "washingmachine", name: "세탁기" },
      { id: "tv", name: "TV" },
      { id: "microwave", name: "전자레인지" },
    ],
    lg: [
      { id: "refrigerator", name: "냉장고" },
      { id: "washingmachine", name: "세탁기" },
      { id: "tv", name: "TV" },
      { id: "airconditioner", name: "에어컨" },
    ],
    winia: [
      { id: "refrigerator", name: "냉장고" },
      { id: "airconditioner", name: "에어컨" },
      { id: "microwave", name: "전자레인지" },
    ],
    coway: [
      { id: "airpurifier", name: "공기청정기" },
      { id: "waterpurifier", name: "정수기" },
    ],
  };

  const models = {
    samsung_refrigerator: [
      { id: 1, name: "삼성 냉장고 RS27T5200" },
      { id: 2, name: "삼성 냉장고 RF85A9113AP" },
    ],
    samsung_washingmachine: [{ id: 3, name: "삼성 세탁기 WW90T3000KW" }],
    samsung_tv: [{ id: 4, name: "삼성 TV QN85B" }],
    samsung_microwave: [{ id: 5, name: "삼성 전자레인지 MS23K3513" }],
    lg_refrigerator: [{ id: 6, name: "LG 냉장고 F873SN55E" }],
    lg_washingmachine: [{ id: 7, name: "LG 세탁기 F2WV9S8P2" }],
    lg_tv: [{ id: 8, name: "LG TV OLED65C1" }],
    lg_airconditioner: [{ id: 9, name: "LG 에어컨 FQ17HDKNP1" }],
    winia_refrigerator: [{ id: 10, name: "위니아 냉장고 WKRS122DPS" }],
    winia_airconditioner: [{ id: 11, name: "위니아 에어컨 ERV-16EPH" }],
    winia_microwave: [{ id: 12, name: "위니아 전자레인지 KR-M201" }],
    coway_airpurifier: [{ id: 13, name: "코웨이 공기청정기 AP-1019C" }],
    coway_waterpurifier: [{ id: 14, name: "코웨이 정수기 P-6310L" }],
  };

  // 브랜드 선택 처리
  const handleBrandSelect = (brandId: string) => {
    setSelectedBrand(brandId);
    setSelectedCategory(null);
    setSelectedModel(null);
  };

  // 카테고리 선택 처리
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedModel(null);
  };

  // 모델 선택 처리
  const handleModelSelect = (model: { id: number; name: string }) => {
    setSelectedModel(model);

    // 모델 선택 시 초기 메시지 설정
    setMessages([
      {
        id: "1",
        content: `안녕하세요! ${model.name}에 관해 어떤 도움이 필요하신가요?\n\n다음과 같은 질문을 해보세요:\n• 이 제품의 기본 사용법은 어떻게 되나요?\n• 에러 코드가 발생했을 때 해결 방법은?\n• 청소와 유지보수는 어떻게 하나요?`,
        isUser: false,
      },
    ]);
  };

  // 메시지 보내기 처리
  const handleSendMessage = () => {
    if (!inputMessage.trim() || !selectedModel) return;

    // 새 사용자 메시지 추가
    const userMessageId = Date.now().toString();
    setMessages((prev) => [
      ...prev,
      {
        id: userMessageId,
        content: inputMessage,
        isUser: true,
      },
    ]);

    setInputMessage("");
    setIsLoading(true);

    // 챗봇 응답 처리 (임시 구현)
    setTimeout(() => {
      const botResponse = {
        id: (Date.now() + 1).toString(),
        content: generateResponse(inputMessage, selectedModel),
        isUser: false,
      };

      setMessages((prev) => [...prev, botResponse]);
      setIsLoading(false);
    }, 1000);
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

    // 업로드된 PDF로 모델 설정
    setSelectedModel({
      id: 100,
      name: file.name.replace(".pdf", ""),
    });

    setMessages([
      {
        id: "1",
        content: `${file.name} 파일이 업로드 되었습니다. 이 설명서에 관해 어떤 도움이 필요하신가요?`,
        isUser: false,
      },
    ]);
  };

  // 임시 응답 생성 함수
  const generateResponse = (message: string, model: { id: number; name: string }) => {
    if (message.toLowerCase().includes("사용법") || message.toLowerCase().includes("어떻게")) {
      return `${model.name}의 기본 사용법은 다음과 같습니다. 먼저 전원 버튼을 눌러 제품을 켠 다음, 원하는 모드를 선택하세요. 자세한 내용은 제품 설명서의 10-15페이지를 참고하시기 바랍니다.`;
    } else if (message.toLowerCase().includes("오류") || message.toLowerCase().includes("에러")) {
      return `오류가 발생했군요. ${model.name}에서 자주 발생하는 오류는 전원 연결 문제일 수 있습니다. 전원 케이블을 확인하시고, 다시 연결해보세요. 문제가 지속되면 고객 센터로 연락 주시기 바랍니다.`;
    } else if (message.toLowerCase().includes("청소") || message.toLowerCase().includes("관리")) {
      return `${model.name}의 청소 및 유지 관리는 매우 중요합니다. 한 달에 한 번 정도 제품을 청소하시는 것이 좋습니다. 청소 전에는 반드시 전원을 끄고 전원 플러그를 뽑으세요.`;
    } else {
      return `${model.name}에 관한 질문을 주셨네요. 좀 더 구체적인 정보가 필요합니다. 제품의 특정 기능이나 문제에 대해 질문해 주시면 더 정확한 답변을 드릴 수 있습니다.`;
    }
  };

  // 엔터키로 메시지 보내기
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-132px)]" ref={containerRef}>
      {/* 드래그 중 오버레이 표시 */}
      {isDragging && (
        <div className="fixed inset-0 bg-gray-400 bg-opacity-10 z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl text-center">
            <svg className="mx-auto h-16 w-16 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <h3 className="text-xl font-bold mb-2">PDF 파일 놓기</h3>
            <p className="text-gray-600">PDF 파일을 여기에 놓아서 업로드하세요</p>
          </div>
        </div>
      )}

      {/* 상단 타이틀 제거 */}

      <div className="flex flex-1 overflow-hidden">
        {/* 왼쪽 패널: 제품 선택 */}
        <div className="w-1/3 border-r border-gray-200 bg-gray-50 overflow-y-auto p-4">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">브랜드 선택</h2>
            <div className="flex flex-wrap gap-2">
              {brands.map((brand) => (
                <button key={brand.id} className={`px-4 py-2 rounded-md ${selectedBrand === brand.id ? "bg-blue-600 text-white" : "bg-white border border-gray-300 hover:bg-gray-100"}`} onClick={() => handleBrandSelect(brand.id)}>
                  {brand.name}
                </button>
              ))}
            </div>
          </div>

          {selectedBrand && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">카테고리 선택</h2>
              <div className="flex flex-wrap gap-2">
                {categories[selectedBrand as keyof typeof categories].map((category) => (
                  <button key={category.id} className={`flex flex-col items-center p-3 rounded-md ${selectedCategory === category.id ? "bg-blue-600 text-white" : "bg-white border border-gray-300 hover:bg-gray-100"}`} onClick={() => handleCategorySelect(category.id)}>
                    <img src={`/icons/${category.id}.svg`} alt={category.name} className="w-12 h-12 mb-2" />
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedBrand && selectedCategory && (
            <div>
              <h2 className="text-lg font-semibold mb-2">모델 선택</h2>
              <div className="space-y-2">
                {models[`${selectedBrand}_${selectedCategory}` as keyof typeof models]?.map((model) => (
                  <button key={model.id} className={`block w-full text-left px-4 py-3 rounded-md ${selectedModel?.id === model.id ? "bg-blue-600 text-white" : "bg-white border border-gray-300 hover:bg-gray-100"}`} onClick={() => handleModelSelect(model)}>
                    {model.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PDF 업로드 영역 */}
          <div className="mt-8 pt-4 border-t border-gray-300">
            <h2 className="text-lg font-semibold mb-2">직접 설명서 업로드</h2>
            <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50" onClick={() => fileInputRef.current?.click()}>
              <svg className="mx-auto h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-gray-600">클릭하여 PDF 파일 선택하기</p>
              <p className="text-xs text-gray-500 mt-1">또는 화면에 직접 PDF 파일을 끌어서 놓으세요</p>
              <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
            </div>
          </div>
        </div>

        {/* 오른쪽 패널: 채팅 인터페이스 */}
        <div className="w-2/3 flex flex-col">
          {/* 제품 정보 헤더 */}
          {selectedModel ? (
            <div className="bg-blue-50 p-4 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">{selectedModel.name}</h2>
                  <p className="text-sm text-gray-600">{selectedModel.id === 100 ? "업로드된 PDF 설명서" : `${brands.find((b) => b.id === selectedBrand)?.name} | ${selectedCategory && categories[selectedBrand as keyof typeof categories].find((c) => c.id === selectedCategory)?.name}`}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 p-4 border-b">
              <h2 className="text-xl font-semibold">제품을 선택해주세요</h2>
              <p className="text-sm text-gray-600">왼쪽에서 브랜드, 카테고리, 모델을 순서대로 선택하거나 PDF 설명서를 업로드하세요</p>
            </div>
          )}

          {/* 채팅 영역 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${msg.isUser ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"}`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg p-3 bg-gray-100 text-gray-800">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-75"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 메시지 입력 영역 */}
          <div className="border-t p-4">
            <div className="flex items-end gap-2">
              <input type="text" className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={selectedModel ? "질문을 입력하세요..." : "먼저 제품을 선택해주세요"} value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyDown={handleKeyDown} disabled={!selectedModel} />
              <button onClick={handleSendMessage} disabled={!inputMessage.trim() || !selectedModel || isLoading} className={`bg-blue-600 text-white p-2 rounded-full ${!inputMessage.trim() || !selectedModel || isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">* 이 챗봇은 제품 사용설명서 데이터를 기반으로 답변합니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
