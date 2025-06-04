import api from "./api";

// 챗봇 응답 타입 정의
export interface ChatResponse {
  message: string;
  answer: string;
  images: string[];
}

// 챗봇 질문 전송
export const sendQuestion = async (modelId: number, question: string): Promise<ChatResponse> => {
  const response = await api.post("/chat/manual", {
    modelId,
    question,
  });

  return response.data;
};
