import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "가전제품 설명서 Q&A 챗봇",
  description: "가전제품 사용설명서 기반 AI 질의응답 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="min-h-screen flex flex-col">
          <header className="bg-white border-b border-gray-200 shadow-sm py-4">
            <div className="container mx-auto px-4 flex justify-between items-center">
              <a href="/" className="hover:opacity-80">
                <h1 className="text-xl font-bold text-gray-800">가전제품 설명서 Q&A 챗봇</h1>
              </a>
              <nav className="flex space-x-4">
                <a href="/login" className="text-gray-600 hover:text-gray-900">
                  로그인
                </a>
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="bg-gray-100 py-4 border-t border-gray-200">
            <div className="container mx-auto px-4 text-center text-gray-500 text-sm">© 25-1 클라우드 컴퓨팅 텀 프로젝트 - 가전제품 설명서 Q&A 챗봇</div>
          </footer>
        </div>
      </body>
    </html>
  );
}
