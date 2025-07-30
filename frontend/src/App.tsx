// src/App.tsx - ルーティング追加版

import { useEffect, useState } from "react";
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
import { WishlistPage } from "./pages/WishlistPage";
import { useAuthStore } from "./stores/authStore";

// ✅ 新規追加: 食品管理関連ページ
import { FoodListPage, ExpiryPage, AddFoodPage } from "./pages/FoodPages";
import { AddBookPage } from "./pages/AddBookPage";

// ✅ 新機能: グローバル認証エラー通知コンポーネント
const AuthErrorNotification = () => {
  const isTokenExpired = useAuthStore((state) => state.isTokenExpired);
  const lastAuthError = useAuthStore((state) => state.lastAuthError);
  const setTokenExpired = useAuthStore((state) => state.setTokenExpired);
  const setLastAuthError = useAuthStore((state) => state.setLastAuthError);

  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (isTokenExpired && lastAuthError) {
      setShowNotification(true);
    }
  }, [isTokenExpired, lastAuthError]);

  const handleClose = () => {
    setShowNotification(false);
    setTokenExpired(false);
    setLastAuthError(null);
  };

  const handleLoginRedirect = () => {
    handleClose();
    window.location.href = "/login";
  };

  if (!showNotification) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <span className="text-2xl">⚠️</span>
          </div>
          <div>
            <h4 className="font-semibold">セッション期限切れ</h4>
            <p className="text-sm text-red-100">{lastAuthError}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleLoginRedirect}
            className="bg-white text-red-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-50 transition-colors"
          >
            ログイン
          </button>
          <button
            onClick={handleClose}
            className="text-red-100 hover:text-white text-xl font-bold w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

function App() {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error("Authentication check failed:", error);
      }
    };

    initializeAuth();
  }, []);

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
      {/* ✅ グローバル認証エラー通知 */}
      <AuthErrorNotification />

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

                {/* 書籍管理関連 */}
                <Route path="/books" element={<BooksPage />} />
                <Route path="/book-list" element={<BooksPage />} />
                <Route path="/books/:id" element={<BookDetailPage />} />
                <Route path="/book-detail/:id" element={<BookDetailPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/add-book" element={<AddBookPage />} />

                {/* 食品管理関連 */}
                <Route path="/food" element={<FoodListPage />} />
                <Route path="/food-list" element={<FoodListPage />} />
                <Route path="/expiry" element={<ExpiryPage />} />
                <Route path="/add-food" element={<AddFoodPage />} />

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
