// src/services/api.ts
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Axiosインスタンスを作成
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    // ngrok warning を回避
    "ngrok-skip-browser-warning": "any",
  },
});

// リクエストインターセプター（認証トークンを自動付与）
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ngrok警告回避ヘッダーを確実に追加
    config.headers["ngrok-skip-browser-warning"] = "any";

    // デバッグログ
    console.log("🚀 API Request:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers,
    });

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// レスポンスインターセプター（エラーハンドリング）
apiClient.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("❌ API Error:", {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data,
    });

    // ngrok警告ページを検出した場合
    if (
      error.response?.data &&
      typeof error.response.data === "string" &&
      error.response.data.includes("ngrok.com")
    ) {
      console.warn(
        "⚠️ ngrok警告ページが返されました。authトークンの設定を確認してください"
      );
    }

    // 401エラーの場合はログアウト処理
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default apiClient;
