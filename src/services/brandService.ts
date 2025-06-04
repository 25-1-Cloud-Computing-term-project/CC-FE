import api from "./api";

// 브랜드 타입 정의
export interface Brand {
  id: number;
  name: string;
  categories?: Category[];
}

// 카테고리 타입 정의
export interface Category {
  id: number;
  name: string;
  brandId: number;
}

// 브랜드 목록 조회
export const getBrands = async (): Promise<Brand[]> => {
  const response = await api.get("/brands");
  return response.data;
};

// 브랜드 상세 조회
export const getBrandById = async (id: number): Promise<Brand> => {
  const response = await api.get(`/brands/${id}`);
  return response.data;
};

// 브랜드 생성 (관리자 전용)
export const createBrand = async (name: string): Promise<Brand> => {
  const response = await api.post("/brands", { name });
  return response.data.data;
};

// 브랜드 수정 (관리자 전용)
export const updateBrand = async (id: number, name: string): Promise<Brand> => {
  const response = await api.put(`/brands/${id}`, { name });
  return response.data.data;
};

// 브랜드 삭제 (관리자 전용)
export const deleteBrand = async (id: number): Promise<void> => {
  await api.delete(`/brands/${id}`);
};
