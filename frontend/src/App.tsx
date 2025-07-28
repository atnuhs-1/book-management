// src/App.tsx

import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { HomePage } from "./pages/HomePage";
import { BooksPage } from "./pages/BooksPage";
import { RegisterPage } from "./pages/RegisterPage";
import { BookDetailPage } from "./pages/BookDetailPage";
import { SettingsPage } from "./pages/SettingsPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { TermsPage } from "./pages/TermsPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { useAuthStore } from "./stores/authStore";

function App() {
  const { checkAuth, isLoading } = useAuthStore();

  // ✅ 修正: 依存配列を空にして初回のみ実行
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("App - 認証チェック開始"); // デバッグ情報
        await checkAuth();
        console.log("App - 認証チェック完了"); // デバッグ情報
      } catch (error) {
        console.error("Authentication check failed:", error);
      }
    };

    initializeAuth();
  }, []); // ✅ 空の依存配列に変更

  // ✅ 認証チェック中はローディング表示
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">アプリを初期化中...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* 認証不要のページ */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        {/* 通常のページ（レイアウト付き） */}
        <Route
          path="*"
          element={
            <Layout>
              <Routes>
                {/* 公開ページ */}
                <Route path="/" element={<HomePage />} />
                <Route path="/books" element={<BooksPage />} />
                <Route path="/books/:id" element={<BookDetailPage />} />
                <Route path="/settings" element={<SettingsPage />} />

                {/* 認証が必要なページ */}
                <Route
                  path="/register"
                  element={
                    <ProtectedRoute>
                      <RegisterPage />
                    </ProtectedRoute>
                  }
                />

                {/* 404ページ */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

// 404ページコンポーネント
const NotFoundPage = () => {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">📖</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        ページが見つかりません
      </h1>
      <p className="text-gray-600 mb-6">
        お探しのページは存在しないか、移動された可能性があります。
      </p>
      <a
        href="/"
        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
      >
        🏠 ホームに戻る
      </a>
    </div>
  );
};

export default App;
