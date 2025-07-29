import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useState, useEffect, useRef } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { user, isAuthenticated, logout, isLoading } = useAuthStore();
  const [isMobileUserMenuOpen, setIsMobileUserMenuOpen] = useState(false);
  const mobileUserMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileUserMenuRef.current &&
        !mobileUserMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileUserMenuOpen(false);
      }
    };

    if (isMobileUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileUserMenuOpen]);

  const getLinkClassName = (path: string) => {
    const base = "px-3 py-2 rounded-md text-sm font-medium transition-colors";
    const isActive = location.pathname === path;
    return isActive
      ? `${base} bg-indigo-600 text-white`
      : `${base} text-gray-700 hover:text-indigo-600 hover:bg-indigo-50`;
  };

  const getMobileTabClass = (path: string) => {
    const isActive = location.pathname === path;
    return isActive
      ? "flex flex-col items-center text-sm text-indigo-600 font-semibold"
      : "flex flex-col items-center text-sm text-gray-700 hover:text-indigo-600";
  };

  const handleLogout = () => {
    logout();
    setIsMobileUserMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-24">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                📚 Book Management PWA
              </h1>
            </Link>

            <nav className="hidden md:flex space-x-1">
              <Link to="/" className={getLinkClassName("/")}>
                🏠 ホーム
              </Link>
              <Link to="/books" className={getLinkClassName("/books")}>
                📖 書籍一覧
              </Link>
              <Link to="/wishlist" className={getLinkClassName("/wishlist")}>
                💫 ウィッシュリスト
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

            <div className="flex items-center space-x-4">
              {isLoading && (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                  <span className="text-sm text-gray-600">認証確認中...</span>
                </div>
              )}

              <div className="hidden lg:flex space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  PWA対応
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  React + Zustand
                </span>
              </div>

              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.username || "Unknown User"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.email || "No Email"}
                    </p>
                  </div>

                  <div className="md:hidden relative" ref={mobileUserMenuRef}>
                    <button
                      onClick={() =>
                        setIsMobileUserMenuOpen(!isMobileUserMenuOpen)
                      }
                      className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center"
                    >
                      <span className="text-white text-sm font-bold">
                        {user?.username?.charAt(0).toUpperCase() || "?"}
                      </span>
                    </button>
                    {isMobileUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-md z-50">
                        <div className="px-4 py-2 text-sm text-gray-700">
                          <p>{user?.username || "Unknown User"}</p>
                          <p className="text-xs text-gray-500">
                            {user?.email || "No Email"}
                          </p>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          ログアウト
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="hidden md:flex items-center space-x-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {user?.username?.charAt(0).toUpperCase() || "?"}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      ログアウト
                    </button>
                  </div>
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
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
        {children}
      </main>

      {/* ✅ ボトムナビゲーションにもウィッシュリスト追加 */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-md md:hidden">
        <div className="flex justify-around items-center py-2">
          <Link to="/" className={getMobileTabClass("/")}>
            <span className="text-lg">🏠</span>
            <span className="text-xs">ホーム</span>
          </Link>
          <Link to="/books" className={getMobileTabClass("/books")}>
            <span className="text-lg">📖</span>
            <span className="text-xs">一覧</span>
          </Link>
          <Link to="/wishlist" className={getMobileTabClass("/wishlist")}>
            <span className="text-lg">💫</span>
            <span className="text-xs">欲しい本</span>
          </Link>
          {isAuthenticated && (
            <Link to="/register" className={getMobileTabClass("/register")}>
              <span className="text-lg">➕</span>
              <span className="text-xs">追加</span>
            </Link>
          )}
          <Link to="/settings" className={getMobileTabClass("/settings")}>
            <span className="text-lg">⚙️</span>
            <span className="text-xs">設定</span>
          </Link>
        </div>
      </nav>

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
