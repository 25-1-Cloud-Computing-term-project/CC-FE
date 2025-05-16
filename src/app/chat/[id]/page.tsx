"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

// 임시 가전제품 데이터
const appliances = [
  { id: "1", name: "삼성 냉장고 RS27T5200", category: "냉장고", brand: "삼성" },
  { id: "2", name: "LG 세탁기 F2WV9S8P2", category: "세탁기", brand: "LG" },
  { id: "3", name: "위니아 에어컨 ERV-16EPH", category: "에어컨", brand: "위니아" },
  { id: "4", name: "삼성 전자레인지 MS23K3513", category: "전자레인지", brand: "삼성" },
  { id: "5", name: "LG TV OLED65C1", category: "TV", brand: "LG" },
  { id: "6", name: "코웨이 공기청정기 AP-1019C", category: "공기청정기", brand: "코웨이" },
];

// 메시지 타입 정의
type MessageType = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type PageProps = {
  params: {
    id: string;
  };
};

export default function ChatPage({ params }: PageProps) {
  const { id } = params;
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: "1",
      role: "assistant",
      content: "안녕하세요! 제품 사용에 관해 어떤 도움이 필요하신가요?",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 현재 선택된 제품 찾기
  const selectedAppliance = appliances.find((appliance) => appliance.id === id);

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 메시지 전송 처리
  const handleSendMessage = async () => {
    if (!message.trim()) return;

    // 사용자 메시지 추가
    const userMessage: MessageType = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      // 실제 구현에서는 백엔드 API를 호출해야 합니다
      // 임시 응답 딜레이 적용
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 가상의 응답 메시지
      let responseContent = "";

      // 간단한 키워드 기반 응답 (실제로는 RAG 기반 응답 구현 필요)
      if (message.toLowerCase().includes("사용법") || message.toLowerCase().includes("어떻게")) {
        responseContent = `${selectedAppliance?.name}의 기본 사용법은 다음과 같습니다. 먼저 전원 버튼을 눌러 제품을 켠 다음, 원하는 모드를 선택하세요. 자세한 내용은 제품 설명서의 10-15페이지를 참고하시기 바랍니다.`;
      } else if (message.toLowerCase().includes("오류") || message.toLowerCase().includes("에러")) {
        responseContent = `오류가 발생했군요. ${selectedAppliance?.name}에서 자주 발생하는 오류는 전원 연결 문제일 수 있습니다. 전원 케이블을 확인하시고, 다시 연결해보세요. 문제가 지속되면 고객 센터로 연락 주시기 바랍니다.`;
      } else if (message.toLowerCase().includes("청소") || message.toLowerCase().includes("관리")) {
        responseContent = `${selectedAppliance?.name}의 청소 및 유지 관리는 매우 중요합니다. 한 달에 한 번 정도 제품을 청소하시는 것이 좋습니다. 청소 전에는 반드시 전원을 끄고 전원 플러그를 뽑으세요.`;
      } else {
        responseContent = `죄송합니다, ${selectedAppliance?.name}에 관한 해당 질문에 대한 정확한 답변을 찾지 못했습니다. 질문을 더 구체적으로 해주시거나 다른 질문을 해주시면 도움드리겠습니다.`;
      }

      // 챗봇 응답 추가
      const botResponse: MessageType = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Failed to get response:", error);
    } finally {
      setIsLoading(false);
      // 메시지 입력 후 포커스
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

  if (!selectedAppliance) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold mb-4">존재하지 않는 제품입니다</h2>
        <Link href="/" className="text-blue-600 hover:underline">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* 제품 정보 헤더 */}
        <div className="bg-blue-50 p-4 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/" className="mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
              </Link>
              <div>
                <h2 className="text-xl font-semibold">{selectedAppliance.name}</h2>
                <p className="text-sm text-gray-600">
                  {selectedAppliance.brand} | {selectedAppliance.category}
                </p>
              </div>
            </div>
            <button className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* 채팅 영역 */}
        <div className="flex flex-col h-[60vh]">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"}`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.role === "user" ? "text-blue-100" : "text-gray-500"}`}>
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
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
            <div ref={messagesEndRef} />
          </div>

          {/* 메시지 입력 영역 */}
          <div className="border-t p-4">
            <div className="flex items-end gap-2">
              <textarea ref={inputRef} className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={2} placeholder="질문을 입력하세요..." value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={handleKeyDown} />
              <button onClick={handleSendMessage} disabled={!message.trim() || isLoading} className={`bg-blue-600 text-white p-2 rounded-full ${!message.trim() || isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
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
