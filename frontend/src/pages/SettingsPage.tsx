// src/pages/SettingsPage.tsx

import { useThemeStore } from "../stores/themeStore";

export const SettingsPage = () => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* ページヘッダー */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          ⚙️ 設定
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          アプリの設定を管理します
        </p>
      </div>

      {/* 設定項目 */}
      <div className="space-y-6">
        {/* アカウント設定 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            👤 アカウント設定
          </h2>
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🚧</div>
            <p className="text-gray-500 dark:text-gray-400">
              ユーザー認証機能は開発中です
            </p>
          </div>
        </div>

        {/* 表示設定 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            🎨 表示設定
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  ダークモード
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  暗いテーマに切り替え
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className={`${
                  theme === "dark" ? "bg-indigo-600" : "bg-gray-200"
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    theme === "dark" ? "translate-x-6" : "translate-x-1"
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* データ管理 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            💾 データ管理
          </h2>
          <div className="space-y-4">
            <button className="w-full text-left p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center">
                <span className="text-2xl mr-3">📤</span>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    データをエクスポート
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    書籍データをJSONファイルで保存
                  </p>
                </div>
              </div>
            </button>

            <button className="w-full text-left p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center">
                <span className="text-2xl mr-3">📥</span>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    データをインポート
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    JSONファイルから書籍データを復元
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* アプリ情報 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            ℹ️ アプリ情報
          </h2>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex justify-between">
              <span>バージョン</span>
              <span>v1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>技術スタック</span>
              <span>React + TypeScript + Zustand</span>
            </div>
            <div className="flex justify-between">
              <span>開発チーム</span>
              <span>5人チーム</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
