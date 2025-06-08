"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isAuthenticated, isAdmin } from "@/services/authService";
import { getBrands, createBrand, updateBrand, deleteBrand, Brand } from "@/services/brandService";
import { createCategory, updateCategory, deleteCategory, Category } from "@/services/categoryService";
import { getAllModels, createPublicModel, updatePublicModel, deleteModel, Model } from "@/services/modelService";

type TabType = "brands" | "categories" | "models";

export default function AdminPage() {
  const [isAuth, setIsAuth] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("brands");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 브랜드 관련 상태
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandName, setBrandName] = useState("");
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  // 카테고리 관련 상태
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [selectedBrandForCategory, setSelectedBrandForCategory] = useState<number | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // 모델 관련 상태
  const [models, setModels] = useState<Model[]>([]);
  const [modelName, setModelName] = useState("");
  const [selectedCategoryForModel, setSelectedCategoryForModel] = useState<number | null>(null);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [editingModel, setEditingModel] = useState<Model | null>(null);

  // 인증 확인
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      const adminUser = isAdmin();

      setIsAuth(authenticated);
      setIsAdminUser(adminUser);

      if (!authenticated || !adminUser) {
        router.push("/");
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  // 데이터 로드
  useEffect(() => {
    if (isAuth && isAdminUser) {
      loadData();
    }
  }, [isAuth, isAdminUser]);

  const loadData = async () => {
    try {
      const [brandsData, modelsData] = await Promise.all([getBrands(), getAllModels()]);

      setBrands(brandsData);
      setModels(modelsData);

      // 모든 카테고리 수집
      const allCategories: Category[] = [];
      brandsData.forEach((brand) => {
        if (brand.categories) {
          allCategories.push(...brand.categories);
        }
      });
      setCategories(allCategories);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  // 브랜드 관리 함수들
  const handleCreateBrand = async () => {
    if (!brandName.trim()) return;

    try {
      await createBrand(brandName);
      setBrandName("");
      loadData();
    } catch (error) {
      console.error("Failed to create brand:", error);
    }
  };

  const handleUpdateBrand = async () => {
    if (!editingBrand || !brandName.trim()) return;

    try {
      await updateBrand(editingBrand.id, brandName);
      setEditingBrand(null);
      setBrandName("");
      loadData();
    } catch (error) {
      console.error("Failed to update brand:", error);
    }
  };

  const handleDeleteBrand = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      await deleteBrand(id);
      loadData();
    } catch (error) {
      console.error("Failed to delete brand:", error);
    }
  };

  // 카테고리 관리 함수들
  const handleCreateCategory = async () => {
    if (!categoryName.trim() || !selectedBrandForCategory) return;

    try {
      await createCategory(categoryName, selectedBrandForCategory);
      setCategoryName("");
      setSelectedBrandForCategory(null);
      loadData();
    } catch (error) {
      console.error("Failed to create category:", error);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !categoryName.trim() || !selectedBrandForCategory) return;

    try {
      await updateCategory(editingCategory.id, categoryName, selectedBrandForCategory);
      setEditingCategory(null);
      setCategoryName("");
      setSelectedBrandForCategory(null);
      loadData();
    } catch (error) {
      console.error("Failed to update category:", error);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      await deleteCategory(id);
      loadData();
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  // 모델 관리 함수들
  const handleCreateModel = async () => {
    if (!modelName.trim() || !selectedCategoryForModel || !modelFile) return;

    try {
      await createPublicModel(modelName, selectedCategoryForModel, modelFile);
      setModelName("");
      setSelectedCategoryForModel(null);
      setModelFile(null);
      loadData();
    } catch (error) {
      console.error("Failed to create model:", error);
    }
  };

  const handleUpdateModel = async () => {
    if (!editingModel || !modelName.trim() || !selectedCategoryForModel) return;

    try {
      await updatePublicModel(editingModel.id, modelName, selectedCategoryForModel);
      setEditingModel(null);
      setModelName("");
      setSelectedCategoryForModel(null);
      loadData();
    } catch (error) {
      console.error("Failed to update model:", error);
    }
  };

  const handleDeleteModel = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      await deleteModel(id);
      loadData();
    } catch (error) {
      console.error("Failed to delete model:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* 헤더 */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">관리자 대시보드</h1>
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              메인 페이지
            </Link>
            <Link href="/logout" className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
              로그아웃
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* 탭 네비게이션 */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { key: "brands", label: "브랜드 관리" },
                  { key: "categories", label: "카테고리 관리" },
                  { key: "models", label: "모델 관리" },
                ].map((tab) => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key as TabType)} className={`py-4 px-2 border-b-2 font-medium text-sm ${activeTab === tab.key ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* 브랜드 관리 탭 */}
              {activeTab === "brands" && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">브랜드 관리</h2>

                  {/* 브랜드 생성/수정 폼 */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">브랜드명</label>
                        <input type="text" value={brandName} onChange={(e) => setBrandName(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="브랜드명을 입력하세요" />
                      </div>
                      <div className="flex gap-2">
                        {editingBrand ? (
                          <>
                            <button onClick={handleUpdateBrand} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                              수정
                            </button>
                            <button
                              onClick={() => {
                                setEditingBrand(null);
                                setBrandName("");
                              }}
                              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                            >
                              취소
                            </button>
                          </>
                        ) : (
                          <button onClick={handleCreateBrand} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                            생성
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 브랜드 목록 */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">브랜드명</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">카테고리 수</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">액션</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {brands.map((brand) => (
                          <tr key={brand.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{brand.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{brand.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{brand.categories?.length || 0}개</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                              <button
                                onClick={() => {
                                  setEditingBrand(brand);
                                  setBrandName(brand.name);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                수정
                              </button>
                              <button onClick={() => handleDeleteBrand(brand.id)} className="text-red-600 hover:text-red-900">
                                삭제
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 카테고리 관리 탭 */}
              {activeTab === "categories" && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">카테고리 관리</h2>

                  {/* 카테고리 생성/수정 폼 */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">카테고리명</label>
                        <input type="text" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="카테고리명을 입력하세요" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">브랜드 선택</label>
                        <select value={selectedBrandForCategory || ""} onChange={(e) => setSelectedBrandForCategory(Number(e.target.value))} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="">브랜드를 선택하세요</option>
                          {brands.map((brand) => (
                            <option key={brand.id} value={brand.id}>
                              {brand.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {editingCategory ? (
                        <>
                          <button onClick={handleUpdateCategory} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            수정
                          </button>
                          <button
                            onClick={() => {
                              setEditingCategory(null);
                              setCategoryName("");
                              setSelectedBrandForCategory(null);
                            }}
                            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                          >
                            취소
                          </button>
                        </>
                      ) : (
                        <button onClick={handleCreateCategory} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                          생성
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 카테고리 목록 */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">카테고리명</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">브랜드</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">액션</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {categories.map((category) => (
                          <tr key={category.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{category.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{brands.find((b) => b.id === category.brandId)?.name || "알 수 없음"}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                              <button
                                onClick={() => {
                                  setEditingCategory(category);
                                  setCategoryName(category.name);
                                  setSelectedBrandForCategory(category.brandId);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                수정
                              </button>
                              <button onClick={() => handleDeleteCategory(category.id)} className="text-red-600 hover:text-red-900">
                                삭제
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 모델 관리 탭 */}
              {activeTab === "models" && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">모델 관리</h2>

                  {/* 모델 생성/수정 폼 */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">모델명</label>
                        <input type="text" value={modelName} onChange={(e) => setModelName(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="모델명을 입력하세요" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">카테고리 선택</label>
                        <select value={selectedCategoryForModel || ""} onChange={(e) => setSelectedCategoryForModel(Number(e.target.value))} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="">카테고리를 선택하세요</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {brands.find((b) => b.id === category.brandId)?.name} - {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {!editingModel && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">PDF 파일</label>
                        <input type="file" accept=".pdf" onChange={(e) => setModelFile(e.target.files?.[0] || null)} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    )}
                    <div className="flex gap-2">
                      {editingModel ? (
                        <>
                          <button onClick={handleUpdateModel} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            수정
                          </button>
                          <button
                            onClick={() => {
                              setEditingModel(null);
                              setModelName("");
                              setSelectedCategoryForModel(null);
                            }}
                            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                          >
                            취소
                          </button>
                        </>
                      ) : (
                        <button onClick={handleCreateModel} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                          생성
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 모델 목록 */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">모델명</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">브랜드</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">카테고리</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">소유자</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">액션</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {models.map((model) => (
                          <tr key={model.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{model.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{model.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{model.brand?.name || "-"}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{model.category?.name || "-"}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{model.owner ? model.owner.email : "공용"}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                              <Link href={`/chat/${model.id}`} className="text-green-600 hover:text-green-900">
                                테스트
                              </Link>
                              {!model.owner && (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingModel(model);
                                      setModelName(model.name);
                                      setSelectedCategoryForModel(model.category?.id || null);
                                    }}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    수정
                                  </button>
                                  <button onClick={() => handleDeleteModel(model.id)} className="text-red-600 hover:text-red-900">
                                    삭제
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
