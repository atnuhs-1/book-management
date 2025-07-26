// src/components/Layout.tsx

import { Link, useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

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

            {/* ナビゲーション */}
            <nav className="hidden md:flex space-x-1">
              <Link to="/" className={getLinkClassName("/")}>
                🏠 ホーム
              </Link>
              <Link to="/books" className={getLinkClassName("/books")}>
                📖 書籍一覧
              </Link>
              <Link to="/register" className={getLinkClassName("/register")}>
                ➕ 書籍追加
              </Link>
              <Link to="/settings" className={getLinkClassName("/settings")}>
                ⚙️ 設定
              </Link>
            </nav>

            {/* モバイルメニューボタン */}
            <div className="md:hidden">
              <button className="text-gray-500 hover:text-gray-700">
                <span className="text-xl">☰</span>
              </button>
            </div>

            {/* ステータスバッジ */}
            <div className="hidden lg:flex space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                PWA対応
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Zustand + Router
              </span>
            </div>
          </div>

          {/* モバイルナビゲーション */}
          <div className="md:hidden border-t border-gray-200 py-2">
            <div className="flex flex-wrap gap-2">
              <Link to="/" className={getLinkClassName("/")}>
                🏠 ホーム
              </Link>
              <Link to="/books" className={getLinkClassName("/books")}>
                📖 書籍一覧
              </Link>
              <Link to="/register" className={getLinkClassName("/register")}>
                ➕ 追加
              </Link>
              <Link to="/settings" className={getLinkClassName("/settings")}>
                ⚙️ 設定
              </Link>
            </div>
          </div>
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
              書籍管理PWA - 効率的な状態管理とルーティング 📚
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
