"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { sendQuestion, ChatResponse } from "@/services/chatService";
import { isAuthenticated } from "@/services/authService";

// 메시지 타입 정의
type MessageType = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  images?: string[]; // 이미지 URL 배열 추가
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
  const [isAuth, setIsAuth] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 인증 확인
  useEffect(() => {
    setIsAuth(isAuthenticated());
  }, []);

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
      // 챗봇 API 호출
      const modelId = parseInt(id);
      const response = await sendQuestion(modelId, message);

      // 챗봇 응답 추가
      const botResponse: MessageType = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.answer,
        timestamp: new Date(),
        images: response.images, // base64 이미지 배열
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

  if (!id) {
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

      <div className="container mx-auto px-4 py-6 flex-1">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* 제품 정보 헤더 */}
          <div className="bg-blue-50 p-4 border-b">
            <div className="flex items-center">
              <Link href="/" className="mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
              </Link>
              <div>
                <h2 className="text-xl font-semibold">제품 매뉴얼 Q&A</h2>
                <p className="text-sm text-gray-600">제품 ID: {id}</p>
              </div>
            </div>
          </div>

          {/* 채팅 영역 */}
          <div className="flex flex-col h-[60vh]">
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
                            <img src={`data:image/png;base64,${base64}`} alt={`챗봇 응답 이미지 ${index + 1}`} className="max-w-full h-auto" />
                          </div>
                        ))}
                      </div>
                    )}

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
    </div>
  );
}
