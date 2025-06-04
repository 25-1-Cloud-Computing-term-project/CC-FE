import api from "./api";
import { Category } from "./brandService";

// 카테고리 목록 조회
export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get("/categories");
  return response.data;
};

// 카테고리 상세 조회
export const getCategoryById = async (id: number): Promise<Category> => {
  const response = await api.get(`/categories/${id}`);
  return response.data;
};

// 특정 브랜드의 카테고리 목록
export const getCategoriesByBrandId = async (brandId: number): Promise<Category[]> => {
  const response = await api.get(`/categories/brand/${brandId}`);
  return response.data;
};

// 카테고리 생성 (관리자 전용)
export const createCategory = async (name: string, brandId: number): Promise<Category> => {
  const response = await api.post("/categories", { name, brandId });
  return response.data.data;
};

// 카테고리 수정 (관리자 전용)
export const updateCategory = async (id: number, name: string, brandId: number): Promise<Category> => {
  const response = await api.put(`/categories/${id}`, { name, brandId });
  return response.data.data;
};

// 카테고리 삭제 (관리자 전용)
export const deleteCategory = async (id: number): Promise<void> => {
  await api.delete(`/categories/${id}`);
};
