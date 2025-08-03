// src/pages/ResetPasswordPage.tsx
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";

// APIエラーレスポンスの型定義
interface ApiErrorResponse {
  detail: string | Array<{ msg: string; type: string }>;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setIsSubmitting(true);

    try {
      await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        token,
        new_password: newPassword,
      });
      setMessage("パスワードを再設定しました。ログインしてください。");
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      let errorMessage = "パスワード再設定に失敗しました。";

      if (error instanceof AxiosError) {
        const responseData = error.response?.data as
          | ApiErrorResponse
          | undefined;

        if (responseData?.detail) {
          if (typeof responseData.detail === "string") {
            errorMessage = responseData.detail;
          } else if (
            Array.isArray(responseData.detail) &&
            responseData.detail.length > 0
          ) {
            errorMessage = responseData.detail[0]?.msg || errorMessage;
          }
        } else if (error.message) {
          errorMessage = `ネットワークエラー: ${error.message}`;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">🔒 パスワード再設定</h1>
        <p className="text-sm text-gray-600 mb-6">
          新しいパスワードを入力してください。
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              新しいパスワード
            </label>
            <input
              id="newPassword"
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="6文字以上"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex justify-center py-2 px-4 rounded-md text-white font-medium ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            }`}
          >
            {isSubmitting ? "再設定中..." : "パスワードを再設定"}
          </button>
        </form>

        {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
};
