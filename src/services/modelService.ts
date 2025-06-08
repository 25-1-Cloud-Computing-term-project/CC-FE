import api from "./api";
import { Brand, Category } from "./brandService";

// 매뉴얼 타입 정의
export interface Manual {
  id: number;
  fileName: string;
}

// 사용자 타입 정의
export interface Owner {
  id: number;
  email: string;
}

// 모델 타입 정의
export interface Model {
  id: number;
  name: string;
  category: Category | null;
  brand: Brand | null;
  owner: Owner | null;
  manual: Manual | null;
}

// 공용 모델 목록 조회
export const getPublicModels = async (): Promise<Model[]> => {
  const response = await api.get("/models/public");
  return response.data;
};

// 특정 카테고리의 공용 모델 조회
export const getPublicModelsByCategoryId = async (categoryId: number): Promise<Model[]> => {
  const response = await api.get(`/models/category/${categoryId}`);
  return response.data;
};

// 내 개인 모델 목록 조회 (로그인 사용자 전용)
export const getPersonalModels = async (): Promise<Model[]> => {
  const response = await api.get("/models/personal");
  return response.data;
};

// 개인 모델 생성 (로그인 사용자 전용)
export const createPersonalModel = async (name: string, manualFile: File, onUploadProgress?: (progressEvent: any) => void): Promise<Model> => {
  console.log("Creating personal model:", { name, fileSize: manualFile.size });

  // 파일 크기 검증 (20MB 제한)
  const maxSize = 20 * 1024 * 1024; // 20MB
  if (manualFile.size > maxSize) {
    throw new Error("파일 크기가 20MB를 초과합니다.");
  }

  // 파일 타입 검증
  if (manualFile.type !== "application/pdf") {
    throw new Error("PDF 파일만 업로드 가능합니다.");
  }

  const formData = new FormData();
  formData.append("name", name);
  formData.append("manualFile", manualFile);

  try {
    const response = await api.post("/models/personal", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 300000, // 5분 타임아웃
      onUploadProgress: onUploadProgress,
    });

    console.log("Personal model created successfully:", response.data);
    return response.data.data;
  } catch (error: any) {
    console.error("Failed to create personal model:", error);

    // 네트워크 에러 처리
    if (error.name === "NetworkError") {
      throw new Error("서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.");
    }

    // 타임아웃 에러 처리
    if (error.code === "ECONNABORTED") {
      throw new Error("업로드 시간이 초과되었습니다. 파일 크기를 확인하고 다시 시도해주세요.");
    }

    // 서버 응답 에러 처리
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || "알 수 없는 오류가 발생했습니다.";

      switch (status) {
        case 400:
          throw new Error(`잘못된 요청: ${message}`);
        case 401:
          throw new Error("로그인이 필요합니다.");
        case 403:
          throw new Error("권한이 없습니다.");
        case 413:
          throw new Error("파일 크기가 너무 큽니다. 20MB 이하의 파일을 업로드해주세요.");
        case 500:
          throw new Error("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        default:
          throw new Error(`서버 오류 (${status}): ${message}`);
      }
    }

    // 기타 에러
    throw new Error("파일 업로드 중 오류가 발생했습니다. 다시 시도해주세요.");
  }
};

// 개인 모델 수정 (로그인 사용자 전용)
export const updatePersonalModel = async (id: number, name: string): Promise<Model> => {
  const response = await api.put(`/models/personal/${id}`, { name });
  return response.data.data;
};

// 개인 모델 삭제 (로그인 사용자 전용)
export const deletePersonalModel = async (id: number): Promise<void> => {
  await api.delete(`/models/personal/${id}`);
};

// 모든 제품 모델 조회 (관리자 전용)
export const getAllModels = async (): Promise<Model[]> => {
  const response = await api.get("/models/admin/all");
  return response.data;
};

// 공용 모델 생성 (관리자 전용)
export const createPublicModel = async (name: string, categoryId: number, manualFile: File): Promise<Model> => {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("categoryId", categoryId.toString());
  formData.append("manualFile", manualFile);

  const response = await api.post("/models/public", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data;
};

// 공용 모델 수정 (관리자 전용)
export const updatePublicModel = async (id: number, name: string, categoryId: number): Promise<Model> => {
  const response = await api.put(`/models/public/${id}`, { name, categoryId });
  return response.data.data;
};

// 모델 삭제 (관리자 전용)
export const deleteModel = async (id: number): Promise<void> => {
  await api.delete(`/models/admin/${id}`);
};

// 매뉴얼 다운로드
export const downloadManual = async (modelId: number): Promise<Blob> => {
  const response = await api.get(`/manuals/model/${modelId}/download`, {
    responseType: "blob",
  });

  return response.data;
};
