// src/components/Layout.tsx - 修正版
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useState, useEffect, useRef } from "react";
import {
  GlassBackground,
  GlassNavItem,
  GlassMobileTab,
  GlassFAB,
} from "./ui/GlassUI";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    logout,
    isLoading,
    isTokenExpired,
    lastAuthError,
  } = useAuthStore();

  // 共通のユーザーメニュー状態管理
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // ✅ 固定メインナビゲーション（デスクトップ用）
  const mainNavigationItems = [
    { id: "/", label: "ホーム", emoji: "🏠" },
    { id: "/food-list", label: "食品", emoji: "🍎" },
    { id: "/book-list", label: "書籍", emoji: "📖" },
    { id: "/settings", label: "設定", emoji: "⚙️" },
  ];

  // ✅ モバイルナビゲーション（認証状態に応じて動的変更）
  const getMobileNavigationItems = () => {
    if (isAuthenticated) {
      return [
        { id: "/", label: "ホーム", emoji: "🏠" },
        { id: "/food-list", label: "食品", emoji: "🍎" },
        { id: "/book-list", label: "書籍", emoji: "📖" },
        { id: "/settings", label: "設定", emoji: "⚙️" },
      ];
    } else {
      return [
        { id: "/", label: "ホーム", emoji: "🏠" },
        { id: "/food-list", label: "食品", emoji: "🍎" },
        { id: "/book-list", label: "書籍", emoji: "📖" },
        { id: "/login", label: "ログイン", emoji: "🔑" },
      ];
    }
  };

  const mobileNavigationItems = getMobileNavigationItems();

  // ✅ ブレッドクラム生成
  const getBreadcrumbs = () => {
    switch (location.pathname) {
      case "/":
        return [{ label: "ホーム", path: "/" }];
      case "/food-list":
        return [
          { label: "ホーム", path: "/" },
          { label: "食品一覧", path: "/food-list" },
        ];
      case "/expiry":
        return [
          { label: "ホーム", path: "/" },
          { label: "食品一覧", path: "/food-list" },
          { label: "期限管理", path: "/expiry" },
        ];
      case "/add-food":
        return [
          { label: "ホーム", path: "/" },
          { label: "食品一覧", path: "/food-list" },
          { label: "食品追加", path: "/add-food" },
        ];

      case "/recipes":
        return [
          { label: "ホーム", path: "/" },
          { label: "食品一覧", path: "/food-list" },
          { label: "レシピ提案", path: "/recipes" },
        ];

      case "/book-list":
        return [
          { label: "ホーム", path: "/" },
          { label: "書籍一覧", path: "/book-list" },
        ];
      case "/search-books":
        return [
          { label: "ホーム", path: "/" },
          { label: "書籍一覧", path: "/book-list" },
          { label: "書籍検索", path: "/search-books" },
        ];
      case "/wishlist":
        return [
          { label: "ホーム", path: "/" },
          { label: "書籍一覧", path: "/book-list" },
          { label: "ウィッシュリスト", path: "/wishlist" },
        ];
      case "/add-book":
        return [
          { label: "ホーム", path: "/" },
          { label: "書籍一覧", path: "/book-list" },
          { label: "書籍追加", path: "/add-book" },
        ];
      default:
        if (location.pathname.startsWith("/books/")) {
          return [
            { label: "ホーム", path: "/" },
            { label: "書籍一覧", path: "/book-list" },
            { label: "書籍詳細", path: location.pathname },
          ];
        }
        return [{ label: "ホーム", path: "/" }];
    }
  };

  const breadcrumbs = getBreadcrumbs();

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleNavigation = (id: string) => {
    // 未認証時に食品/書籍関連ページにアクセスしようとした場合の処理
    if (!isAuthenticated && (id === "/food-list" || id === "/book-list")) {
      // ログインページに遷移してから元のページに戻れるようにする
      navigate("/login", { state: { from: id } });
      return;
    }
    navigate(id);
  };

  return (
    <GlassBackground variant="multi">
      {/* ヘッダー */}
      <header className="bg-white/20 dark:bg-gray-900/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* ロゴ */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-sm">🏠</span>
              </div>
              <h1 className="text-lg font-light text-gray-800">
                Life Manager PWA
              </h1>
            </Link>

            {/* デスクトップナビゲーション - 固定メインナビ */}
            <nav className="hidden md:flex items-center gap-1">
              {mainNavigationItems.map((item) => (
                <GlassNavItem
                  key={item.id}
                  id={item.id}
                  label={item.label}
                  emoji={item.emoji}
                  isActive={
                    location.pathname === item.id ||
                    (item.id === "/food-list" &&
                      location.pathname.startsWith("/food")) ||
                    (item.id === "/food-list" &&
                      ["/expiry", "/add-food"].includes(location.pathname)) ||
                    (item.id === "/book-list" &&
                      location.pathname.startsWith("/book")) ||
                    (item.id === "/book-list" &&
                      ["/wishlist", "/add-book"].includes(location.pathname))
                  }
                  onClick={handleNavigation}
                />
              ))}
            </nav>

            {/* ユーザー情報とアクション */}
            <div className="flex items-center space-x-4">
              {/* ローディング状態 */}
              {isLoading && (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                  <span className="text-sm text-gray-600">認証確認中...</span>
                </div>
              )}

              {/* 認証エラー状態の表示 */}
              {isTokenExpired && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-red-400/20 border border-red-400/30 rounded-md backdrop-blur-sm">
                  <span className="text-red-600 text-sm">⚠️</span>
                  <span className="text-sm text-red-700 font-medium">
                    セッション期限切れ
                  </span>
                </div>
              )}

              {/* 認証済みユーザー */}
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  {/* 共通ユーザーアイコン */}
                  <button
                    onClick={toggleUserMenu}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-lg transition-all duration-300 ${
                      isTokenExpired
                        ? "bg-red-400/30 border border-red-400/30"
                        : "bg-white/30 border border-white/20 hover:bg-white/40"
                    }`}
                  >
                    <span className="text-gray-800 text-sm font-bold">
                      {user?.username?.charAt(0).toUpperCase() || "?"}
                    </span>
                  </button>

                  {/* プロフィールカード */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 z-50">
                      <div className="bg-white/95 backdrop-blur-xl border border-white/30 rounded-xl shadow-2xl overflow-hidden">
                        {/* ヘッダー部分 */}
                        <div
                          className={`px-4 py-3 ${
                            isTokenExpired
                              ? "bg-red-50/80 border-b border-red-200/50"
                              : "bg-gray-50/80 border-b border-gray-200/50"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
                                isTokenExpired
                                  ? "bg-red-400/30 border border-red-400/30"
                                  : "bg-indigo-400/30 border border-indigo-400/30"
                              }`}
                            >
                              <span className="text-gray-800 text-lg font-bold">
                                {user?.username?.charAt(0).toUpperCase() || "?"}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {user?.username || "Unknown User"}
                              </p>
                              <p className="text-xs text-gray-600 truncate">
                                {user?.email || "No Email"}
                              </p>
                              {isTokenExpired && (
                                <p className="text-xs text-red-600 font-medium mt-1 flex items-center">
                                  <span className="mr-1">⚠️</span>
                                  再ログインが必要
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* メニュー項目 */}
                        <div className="py-2">
                          <Link
                            to="/settings"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100/80 transition-colors"
                          >
                            <span className="mr-3 text-base">👤</span>
                            <span>プロフィール</span>
                          </Link>

                          <button
                            onClick={handleLogout}
                            className={`w-full flex items-center px-4 py-3 text-sm transition-colors ${
                              isTokenExpired
                                ? "text-red-700 hover:bg-red-50/80"
                                : "text-red-600 hover:bg-red-50/80"
                            }`}
                          >
                            <span className="mr-3 text-base">
                              {isTokenExpired ? "🔄" : "🚪"}
                            </span>
                            <span>
                              {isTokenExpired ? "再ログイン" : "ログアウト"}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* 未認証ユーザー */
                <div className="hidden md:flex space-x-2">
                  <Link to="/login">
                    <button className="px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-400/20 border border-indigo-400/30 rounded-xl hover:bg-indigo-400/30 transition-all duration-300 backdrop-blur-sm shadow-lg">
                      ログイン
                    </button>
                  </Link>
                  <Link to="/signup">
                    <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600/80 hover:bg-indigo-600 rounded-xl transition-all duration-300 backdrop-blur-sm shadow-lg">
                      新規登録
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 relative px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8 bg-white dark:bg-gray-900 transition-colors">
        {/* ブレッドクラム */}
        {breadcrumbs.length > 1 && (
          <div className="max-w-6xl mx-auto mb-6">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.path} className="flex items-center">
                  {index > 0 && <span className="mx-2">›</span>}
                  {index < breadcrumbs.length - 1 ? (
                    <button
                      onClick={() => navigate(crumb.path)}
                      className="hover:text-gray-800 transition-colors hover:underline"
                    >
                      {crumb.label}
                    </button>
                  ) : (
                    <span className="text-gray-800 font-medium">
                      {crumb.label}
                    </span>
                  )}
                </div>
              ))}
            </nav>
          </div>
        )}

        {/* サブナビゲーション */}
        {(location.pathname.startsWith("/food") ||
          location.pathname === "/expiry" ||
          location.pathname === "/add-food" ||
          location.pathname === "/recipes") && (
          <div className="max-w-6xl mx-auto mb-6">
            <div className="bg-white/20 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-2 border border-white/20 shadow-lg">
              <div className="flex gap-2 overflow-x-auto">
                {[
                  { id: "/food-list", label: "一覧", emoji: "🍎" },
                  { id: "/expiry", label: "期限管理", emoji: "📅" },
                  { id: "/add-food", label: "追加", emoji: "➕" },
                  { id: "/recipes", label: "レシピ", emoji: "🔪" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-all ${
                      location.pathname === item.id
                        ? "bg-white/40 backdrop-blur-xl text-gray-800 shadow-lg border border-white/30"
                        : "text-gray-600 hover:text-gray-800 hover:bg-white/20"
                    }`}
                  >
                    <span className="mr-2">{item.emoji}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {(location.pathname.startsWith("/book") ||
          location.pathname === "/wishlist" ||
          location.pathname === "/search-books" ||
          location.pathname === "/add-book") && (
          <div className="max-w-6xl mx-auto mb-6">
            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-2 border border-white/20 shadow-lg">
              <div className="flex gap-2 overflow-x-auto">
                {[
                  { id: "/book-list", label: "一覧", emoji: "📚" },
                  { id: "/wishlist", label: "ウィッシュリスト", emoji: "💫" },
                  { id: "/search-books", label: "検索", emoji: "🔍" },
                  { id: "/barcode-scan", label: "バーコード", emoji: "📷" },
                  { id: "/add-book", label: "追加", emoji: "➕" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-all ${
                      location.pathname === item.id
                        ? "bg-white/40 backdrop-blur-xl text-gray-800 shadow-lg border border-white/30"
                        : "text-gray-600 hover:text-gray-800 hover:bg-white/20"
                    }`}
                  >
                    <span className="mr-2">{item.emoji}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {children}
      </main>

      {/* FAB (Floating Action Button) */}
      {(location.pathname === "/book-list" ||
        location.pathname === "/food-list" ||
        location.pathname === "/wishlist") && (
        <div className="fixed bottom-28 md:bottom-8 right-4 z-40">
          <GlassFAB
            onClick={() => {
              if (
                location.pathname === "/book-list" ||
                location.pathname === "/wishlist"
              ) {
                navigate("/add-book");
              } else if (location.pathname === "/food-list") {
                navigate("/add-food");
              }
            }}
          />
        </div>
      )}

      {/* モバイルナビゲーション - 認証状態に応じて動的変更 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/20 dark:bg-gray-900/80 backdrop-blur-xl border-t border-white/20 dark:border-gray-700 z-49">
        <div className="grid grid-cols-4 gap-2 p-4">
          {mobileNavigationItems.map((item) => (
            <GlassMobileTab
              key={item.id}
              id={item.id}
              label={item.label}
              emoji={item.emoji}
              isActive={
                location.pathname === item.id ||
                (item.id === "/food-list" &&
                  location.pathname.startsWith("/food")) ||
                (item.id === "/food-list" &&
                  ["/expiry", "/add-food"].includes(location.pathname)) ||
                (item.id === "/book-list" &&
                  location.pathname.startsWith("/book")) ||
                (item.id === "/book-list" &&
                  ["/wishlist", "/add-book"].includes(location.pathname))
              }
              onClick={handleNavigation}
            />
          ))}
        </div>
      </nav>
    </GlassBackground>
  );
};
