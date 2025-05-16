"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    agreeTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // 입력 시 해당 필드의 오류 메시지 제거
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // 이메일 검증
    if (!formData.email) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다.";
    }

    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요.";
    } else if (formData.password.length < 6) {
      newErrors.password = "비밀번호는 최소 6자 이상이어야 합니다.";
    }

    // 비밀번호 확인 검증
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }

    // 이름 검증
    if (!formData.name) {
      newErrors.name = "이름을 입력해주세요.";
    }

    // 약관 동의 검증
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "서비스 이용 약관에 동의해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // 실제 구현에서는 백엔드 API 호출이 필요합니다
      // 임시로 회원가입 성공을 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 회원가입 성공 후 로그인 페이지로 이동
      router.push("/login?registered=true");
    } catch (error) {
      console.error("회원가입 실패:", error);
      setErrors({
        general: "회원가입 중 오류가 발생했습니다. 다시 시도해주세요.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] py-10">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">회원가입</h2>
          <p className="mt-2 text-gray-600">계정을 생성하여 가전제품 설명서 Q&A 서비스를 이용하세요</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.general && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{errors.general}</div>}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                이메일
              </label>
              <input id="email" name="email" type="email" autoComplete="email" value={formData.email} onChange={handleChange} className={`w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? "border-red-500" : "border-gray-300"}`} placeholder="your-email@example.com" />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                이름
              </label>
              <input id="name" name="name" type="text" autoComplete="name" value={formData.name} onChange={handleChange} className={`w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? "border-red-500" : "border-gray-300"}`} placeholder="홍길동" />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                전화번호 (선택)
              </label>
              <input id="phone" name="phone" type="tel" autoComplete="tel" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="01012345678" />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <input id="password" name="password" type="password" autoComplete="new-password" value={formData.password} onChange={handleChange} className={`w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? "border-red-500" : "border-gray-300"}`} />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
              <p className="mt-1 text-xs text-gray-500">비밀번호는 최소 6자 이상이어야 합니다</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                비밀번호 확인
              </label>
              <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" value={formData.confirmPassword} onChange={handleChange} className={`w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.confirmPassword ? "border-red-500" : "border-gray-300"}`} />
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
            </div>

            <div className="flex items-center">
              <input id="agreeTerms" name="agreeTerms" type="checkbox" checked={formData.agreeTerms} onChange={handleChange} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <label htmlFor="agreeTerms" className="block ml-2 text-sm text-gray-700">
                <span className={errors.agreeTerms ? "text-red-600" : ""}>서비스 이용약관 및 개인정보처리방침에 동의합니다</span>
              </label>
            </div>
            {errors.agreeTerms && <p className="text-xs text-red-600">{errors.agreeTerms}</p>}
          </div>

          <div>
            <button type="submit" className={`w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`} disabled={isLoading}>
              {isLoading ? "처리 중..." : "회원가입"}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-500">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
