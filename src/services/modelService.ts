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
export const createPersonalModel = async (name: string, manualFile: File): Promise<Model> => {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("manualFile", manualFile);

  const response = await api.post("/models/personal", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data;
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
