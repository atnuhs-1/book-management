// src/pages/SettingsPage.tsx

import { useEffect, useState } from "react";
import axios from "axios";
import { useThemeStore } from "../stores/themeStore";
import { useAuthStore } from "../stores/authStore";
import { useNavigate } from "react-router-dom";

export const SettingsPage = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { token, logout } = useAuthStore(); // ✅ logout を取得
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const API_BASE = "http://localhost:8000";

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUsername(res.data.username);
        setEmail(res.data.email);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [token]);

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(
        `${API_BASE}/api/auth/users/me`,
        { username, email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("ユーザー情報を更新しました。再ログインしてください。");
      logout(); // ✅ トークン削除
      navigate("/login"); // ✅ ログイン画面へ遷移
    } catch (err) {
      console.error(err);
      alert("ユーザー情報の更新に失敗しました。");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      alert("ログインしていません。");
      return;
    }

    if (newPassword.length < 6) {
      alert("新しいパスワードは6文字以上必要です。");
      return;
    }

    setChangingPassword(true);
    try {
      await axios.put(
        `${API_BASE}/api/auth/users/me/password`,
        {
          current_password: currentPassword,
          new_password: newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("パスワードを変更しました！");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      console.error("パスワード変更失敗:", err.response?.data || err);
      const detail =
        err.response?.data?.detail ||
        (Array.isArray(err.response?.data?.detail) &&
          err.response.data.detail[0]?.msg) ||
        "パスワードの変更に失敗しました";
      alert(detail);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          ⚙️ 設定
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          アプリの設定を管理します
        </p>
      </div>

      <div className="space-y-6">
        {/* アカウント設定 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            👤 アカウント設定
          </h2>

          {loading ? (
            <p className="text-gray-500 dark:text-gray-400">読み込み中...</p>
          ) : (
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  ユーザー名
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                />
              </div>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                更新する
              </button>
            </form>
          )}
        </div>

        {/* パスワード変更 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            🔑 パスワード変更
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* 現在のパスワード */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                現在のパスワード
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-gray-500"
                >
                  {showCurrentPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {/* 新しいパスワード */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                新しいパスワード
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-gray-500"
                >
                  {showNewPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {changingPassword ? "変更中..." : "パスワードを変更する"}
            </button>
          </form>
        </div>

        {/* 表示設定 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            🎨 表示設定
          </h2>
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
    </div>
  );
};
