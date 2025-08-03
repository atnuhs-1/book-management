// src/pages/SignupPage.tsx

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import type { RegisterRequest, FormErrors } from "../types/auth";

export const SignupPage = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError, isAuthenticated } =
    useAuthStore();

  // フォーム状態
  const [formData, setFormData] = useState<RegisterRequest>({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 既にログイン済みの場合はリダイレクト
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

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

  // メールアドレスのバリデーション
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // フォームバリデーション
  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    // メールアドレス
    if (!formData.email.trim()) {
      errors.email = "メールアドレスを入力してください";
    } else if (!isValidEmail(formData.email)) {
      errors.email = "有効なメールアドレスを入力してください";
    }

    // ユーザー名
    if (!formData.username.trim()) {
      errors.username = "ユーザー名を入力してください";
    } else if (formData.username.length < 3) {
      errors.username = "ユーザー名は3文字以上で入力してください";
    } else if (formData.username.length > 20) {
      errors.username = "ユーザー名は20文字以下で入力してください";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = "ユーザー名は英数字とアンダースコアのみ使用できます";
    }

    // パスワード
    if (!formData.password) {
      errors.password = "パスワードを入力してください";
    } else if (formData.password.length < 6) {
      errors.password = "パスワードは6文字以上で入力してください";
    } else if (formData.password.length > 50) {
      errors.password = "パスワードは50文字以下で入力してください";
    }

    // パスワード確認
    if (!formData.confirmPassword) {
      errors.confirmPassword = "パスワード確認を入力してください";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "パスワードが一致しません";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 新規登録処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // confirmPasswordを除いてバックエンドに送信
      const registerData = {
        email: formData.email,
        username: formData.username,
        password: formData.password,
      };
      await register(registerData);
      navigate("/", { replace: true });
    } catch {
      // エラーは authStore で管理されるので、ここでは何もしない
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* ヘッダー */}
        <div className="text-center">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📚 Book Management PWA
            </h1>
          </Link>
          <h2 className="text-xl text-gray-600">新規登録</h2>
          <p className="mt-2 text-sm text-gray-500">
            アカウントを作成して書籍管理を始めましょう
          </p>
        </div>

        {/* 新規登録フォーム */}
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

            {/* メールアドレス */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  formErrors.email
                    ? "border-red-300 focus:border-red-500"
                    : "border-gray-300 focus:border-transparent"
                }`}
                placeholder="example@email.com"
                disabled={isLoading}
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  formErrors.username
                    ? "border-red-300 focus:border-red-500"
                    : "border-gray-300 focus:border-transparent"
                }`}
                placeholder="3-20文字の英数字とアンダースコア"
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
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    formErrors.password
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-300 focus:border-transparent"
                  }`}
                  placeholder="6文字以上のパスワード"
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

            {/* パスワード確認 */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                パスワード確認
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    formErrors.confirmPassword
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-300 focus:border-transparent"
                  }`}
                  placeholder="パスワードを再入力"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {formErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* 利用規約同意 */}
            <div className="flex items-center">
              <input
                id="agree-terms"
                name="agree-terms"
                type="checkbox"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                disabled={isLoading}
                required
              />
              <label
                htmlFor="agree-terms"
                className="ml-2 block text-sm text-gray-700"
              >
                <span className="text-red-500">*</span>
                <Link
                  to="/terms"
                  className="text-green-600 hover:text-green-500 underline"
                >
                  利用規約
                </Link>
                に同意します
              </label>
            </div>

            {/* 新規登録ボタン */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                } transition-colors`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    アカウント作成中...
                  </div>
                ) : (
                  "アカウントを作成"
                )}
              </button>
            </div>
          </form>

          {/* ログインリンク */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              既にアカウントをお持ちの場合は{" "}
              <Link
                to="/login"
                className="font-medium text-green-600 hover:text-green-500"
              >
                ログイン
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
