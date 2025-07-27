// src/pages/LoginPage.tsx

import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import type { LoginRequest, FormErrors } from "../types/auth";

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError, isAuthenticated } =
    useAuthStore();

  // フォーム状態
  const [formData, setFormData] = useState<LoginRequest>({
    username: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  // リダイレクト先を取得（ログイン後に元のページに戻る）
  const redirectTo = (location.state as any)?.from?.pathname || "/";

  // 既にログイン済みの場合はリダイレクト
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  // エラーのクリア
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  // フォーム入力のハンドリング
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // エラーをクリア
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // フォームバリデーション
  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.username.trim()) {
      errors.username = "ユーザー名を入力してください";
    }

    if (!formData.password) {
      errors.password = "パスワードを入力してください";
    } else if (formData.password.length < 6) {
      errors.password = "パスワードは6文字以上で入力してください";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ログイン処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await login(formData);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      // エラーは authStore で管理されるので、ここでは何もしない
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* ヘッダー */}
        <div className="text-center">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📚 Book Management PWA
            </h1>
          </Link>
          <h2 className="text-xl text-gray-600">ログイン</h2>
          <p className="mt-2 text-sm text-gray-500">
            アカウントにログインして書籍管理を始めましょう
          </p>
        </div>

        {/* ログインフォーム */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 全体エラー */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center">
                  <span className="text-red-400 mr-2">❌</span>
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* ユーザー名 */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                ユーザー名
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  formErrors.username
                    ? "border-red-300 focus:border-red-500"
                    : "border-gray-300 focus:border-transparent"
                }`}
                placeholder="ユーザー名を入力"
                disabled={isLoading}
              />
              {formErrors.username && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.username}
                </p>
              )}
            </div>

            {/* パスワード */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                パスワード
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    formErrors.password
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-300 focus:border-transparent"
                  }`}
                  placeholder="パスワードを入力"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.password}
                </p>
              )}
            </div>

            {/* ログインボタン */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                } transition-colors`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ログイン中...
                  </div>
                ) : (
                  "ログイン"
                )}
              </button>
            </div>
          </form>

          {/* 新規登録リンク */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              アカウントをお持ちでない場合は{" "}
              <Link
                to="/signup"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                新規登録
              </Link>
            </p>
          </div>
        </div>

        {/* ゲストアクセス */}
        <div className="text-center">
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            ← ゲストとしてアプリを見る
          </Link>
        </div>
      </div>
    </div>
  );
};
