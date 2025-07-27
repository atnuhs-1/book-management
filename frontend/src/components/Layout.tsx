// src/components/Layout.tsx

import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // アクティブなナビゲーションリンクのスタイル
  const getLinkClassName = (path: string) => {
    const baseClasses =
      "px-3 py-2 rounded-md text-sm font-medium transition-colors";
    const isActive = location.pathname === path;

    if (isActive) {
      return `${baseClasses} bg-indigo-600 text-white`;
    }
    return `${baseClasses} text-gray-700 hover:text-indigo-600 hover:bg-indigo-50`;
  };

  // ログアウト処理
  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* ロゴ */}
            <Link to="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                📚 Book Management PWA
              </h1>
            </Link>

            {/* デスクトップナビゲーション */}
            <nav className="hidden md:flex space-x-1">
              <Link to="/" className={getLinkClassName("/")}>
                🏠 ホーム
              </Link>
              <Link to="/books" className={getLinkClassName("/books")}>
                📖 書籍一覧
              </Link>
              {isAuthenticated && (
                <Link to="/register" className={getLinkClassName("/register")}>
                  ➕ 書籍追加
                </Link>
              )}
              <Link to="/settings" className={getLinkClassName("/settings")}>
                ⚙️ 設定
              </Link>
            </nav>

            {/* ユーザー情報・認証ボタン */}
            <div className="flex items-center space-x-4">
              {/* ステータスバッジ */}
              <div className="hidden lg:flex space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  PWA対応
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  React + Zustand
                </span>
              </div>

              {/* 認証状態による表示切り替え */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  {/* ユーザー情報 */}
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.username}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>

                  {/* ユーザーアバター */}
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* ログアウトボタン */}
                  <button
                    onClick={handleLogout}
                    className="hidden md:block px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    ログアウト
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex space-x-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 border border-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
                  >
                    ログイン
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
                  >
                    新規登録
                  </Link>
                </div>
              )}

              {/* モバイルメニューボタン */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <span className="text-xl">☰</span>
                </button>
              </div>
            </div>
          </div>

          {/* モバイルナビゲーション */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-2">
              <div className="flex flex-col space-y-2">
                <Link
                  to="/"
                  className={getLinkClassName("/")}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  🏠 ホーム
                </Link>
                <Link
                  to="/books"
                  className={getLinkClassName("/books")}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  📖 書籍一覧
                </Link>
                {isAuthenticated && (
                  <Link
                    to="/register"
                    className={getLinkClassName("/register")}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    ➕ 書籍追加
                  </Link>
                )}
                <Link
                  to="/settings"
                  className={getLinkClassName("/settings")}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  ⚙️ 設定
                </Link>

                {/* モバイル認証ボタン */}
                <div className="border-t border-gray-200 pt-2 mt-2">
                  {isAuthenticated ? (
                    <div className="space-y-2">
                      <div className="px-3 py-2">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.username}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        ログアウト
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        to="/login"
                        className="block px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        ログイン
                      </Link>
                      <Link
                        to="/signup"
                        className="block px-3 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        新規登録
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* フッター */}
      <footer className="bg-gray-800 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-300">
              Built with ❤️ using React + TypeScript + Tailwind CSS + FastAPI +
              Zustand + React Router
            </p>
            <p className="text-sm text-gray-400 mt-2">
              書籍管理PWA - JWT認証対応 📚
            </p>

            {/* フッターリンク */}
            <div className="mt-4 flex justify-center space-x-6 text-sm">
              <Link
                to="/terms"
                className="text-gray-400 hover:text-white transition-colors"
              >
                利用規約
              </Link>
              <Link
                to="/privacy"
                className="text-gray-400 hover:text-white transition-colors"
              >
                プライバシーポリシー
              </Link>
              <a
                href="mailto:support@book-management-pwa.com"
                className="text-gray-400 hover:text-white transition-colors"
              >
                お問い合わせ
              </a>
              <a
                href="https://github.com/your-team/book-management-pwa"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
