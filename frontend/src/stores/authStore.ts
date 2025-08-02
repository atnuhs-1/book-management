// src/stores/authStore.ts - 型安全版（error: any修正）

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import axios, { isAxiosError } from "axios";
import type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from "../types/auth";

// ✅ errorFormatterをインポート
import {
  formatAuthError,
  logError,
} from "../utils/errorFormatter";

// APIのベースURL
const API_BASE_URL = "http://localhost:8000/api";

// 認証ストアの状態の型定義
interface AuthStore {
  // 状態
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;

  // ✅ 既存: 期限切れ関連の状態
  isTokenExpired: boolean;
  lastAuthError: string | null;

  // アクション
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setInitialized: (initialized: boolean) => void;

  // ✅ 既存: 期限切れ関連のアクション
  setTokenExpired: (expired: boolean) => void;
  setLastAuthError: (error: string | null) => void;

  // 認証関連アクション
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
  getCurrentUser: () => Promise<void>;

  // トークンをAxiosヘッダーに設定
  setAuthHeader: (token: string) => void;
  clearAuthHeader: () => void;

  // ✅ 修正: 型安全なエラーハンドリング
  handleAuthError: (error: unknown) => boolean; // unknown型に変更
}

// ✅ 型安全なparseAuthError関数（errorFormatter活用版）
const parseAuthError = (
  error: unknown
): { message: string; isTokenExpired: boolean; shouldLogout: boolean } => {
  // errorFormatterを使用して基本的な解析
  const errorResult = formatAuthError(error);
  logError(error, "authStore.parseAuthError");

  // ネットワークエラーの場合
  if (!isAxiosError(error) || !error.response) {
    return {
      message: errorResult.message,
      isTokenExpired: false,
      shouldLogout: false,
    };
  }

  const { status, data } = error.response;

  if (status === 401) {
    const detail = data?.detail || "";

    // バックエンドからの期限切れメッセージを検出
    if (
      typeof detail === "string" &&
      (detail.includes("有効期限が切れました") || detail.includes("expired"))
    ) {
      return {
        message: "セッションの有効期限が切れました。再度ログインしてください。",
        isTokenExpired: true,
        shouldLogout: true,
      };
    }

    if (
      typeof detail === "string" &&
      (detail.includes("トークンが無効です") || detail.includes("invalid"))
    ) {
      return {
        message: "認証情報が無効です。再度ログインしてください。",
        isTokenExpired: true,
        shouldLogout: true,
      };
    }

    if (
      typeof detail === "string" &&
      detail.includes("ユーザーが見つかりません")
    ) {
      return {
        message: "ユーザー情報が見つかりません。再度ログインしてください。",
        isTokenExpired: false,
        shouldLogout: true,
      };
    }

    return {
      message: typeof detail === "string" ? detail : "認証に失敗しました",
      isTokenExpired: true,
      shouldLogout: true,
    };
  }

  return {
    message: errorResult.message,
    isTokenExpired: false,
    shouldLogout: false,
  };
};

// Zustand認証ストアの作成
export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // 初期状態
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        isInitialized: false,
        isTokenExpired: false,
        lastAuthError: null,

        // 基本的な状態操作
        setUser: (user) =>
          set({ user, isAuthenticated: !!user }, false, "setUser"),

        setToken: (token) => set({ token }, false, "setToken"),

        setLoading: (isLoading) => set({ isLoading }, false, "setLoading"),

        setError: (error) => set({ error }, false, "setError"),

        clearError: () => set({ error: null }, false, "clearError"),

        setInitialized: (isInitialized) =>
          set({ isInitialized }, false, "setInitialized"),

        // ✅ 既存: 期限切れ状態管理
        setTokenExpired: (expired) =>
          set({ isTokenExpired: expired }, false, "setTokenExpired"),

        setLastAuthError: (error) =>
          set({ lastAuthError: error }, false, "setLastAuthError"),

        // Axiosヘッダー管理
        setAuthHeader: (token) => {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        },

        clearAuthHeader: () => {
          delete axios.defaults.headers.common["Authorization"];
        },

        // ✅ 修正: 型安全な認証エラーハンドリング
        handleAuthError: (error: unknown) => {
          const { message, isTokenExpired, shouldLogout } =
            parseAuthError(error);

          const { setError, setTokenExpired, setLastAuthError } = get();

          // ✅ エラー状態を設定してからログアウト
          setLastAuthError(message);
          setTokenExpired(isTokenExpired);
          setError(message);

          if (shouldLogout) {
            // ✅ ログアウト処理（ユーザー情報とトークンのみクリア）
            const { setUser, setToken, clearAuthHeader } = get();
            setUser(null);
            setToken(null);
            clearAuthHeader();

            return true; // 認証エラーであることを示す
          } else {
            return false; // 認証エラーではない
          }
        },

        // ✅ 修正1: 型安全なログイン処理
        login: async (credentials) => {
          const {
            setLoading,
            setError,
            setUser,
            setToken,
            setAuthHeader,
            setTokenExpired,
          } = get();

          try {
            setLoading(true);
            setError(null);
            setTokenExpired(false);

            // FormDataでログインデータを送信（OAuth2PasswordRequestForm対応）
            const formData = new FormData();
            formData.append("username", credentials.username);
            formData.append("password", credentials.password);

            const response = await axios.post<AuthResponse>(
              `${API_BASE_URL}/auth/login`,
              formData,
              {
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
              }
            );

            const { access_token, user } = response.data;

            // トークンを保存してヘッダーに設定
            setToken(access_token);
            setAuthHeader(access_token);
            setUser(user);
          } catch (error: unknown) {
            console.error("Login failed:", error);

            // ✅ errorFormatterを使用した型安全なエラーハンドリング
            const errorResult = formatAuthError(error);
            logError(error, "authStore.login");

            // 認証固有のエラーメッセージ
            if (isAxiosError(error) && error.response?.status === 401) {
              setError("ユーザー名またはパスワードが間違っています");
            } else {
              setError(errorResult.message);
            }

            throw error;
          } finally {
            setLoading(false);
          }
        },

        // ✅ 修正2: 型安全な新規登録処理
        register: async (userData) => {
          const {
            setLoading,
            setError,
            setUser,
            setToken,
            setAuthHeader,
            setTokenExpired,
          } = get();

          try {
            setLoading(true);
            setError(null);
            setTokenExpired(false);

            const response = await axios.post<AuthResponse>(
              `${API_BASE_URL}/auth/register`,
              userData
            );

            const { access_token, user } = response.data;

            // トークンとユーザー情報を設定
            setToken(access_token);
            setAuthHeader(access_token);
            setUser(user);
          } catch (error: unknown) {
            console.error("Registration failed:", error);

            // ✅ errorFormatterを使用した型安全なエラーハンドリング
            const errorResult = formatAuthError(error);
            logError(error, "authStore.register");

            // 新規登録固有のエラーメッセージ
            if (isAxiosError(error) && error.response?.status === 400) {
              const data = error.response.data;

              // より詳細なエラーメッセージの判定
              if (data?.detail && typeof data.detail === "string") {
                if (
                  data.detail.includes("already exists") ||
                  data.detail.includes("既に存在")
                ) {
                  setError(
                    "このユーザー名またはメールアドレスは既に使用されています"
                  );
                } else {
                  setError(data.detail);
                }
              } else {
                setError("入力内容を確認してください");
              }
            } else {
              setError(errorResult.message);
            }

            throw error;
          } finally {
            setLoading(false);
          }
        },

        logout: () => {
          const { setUser, setToken, clearAuthHeader } = get();

          setUser(null);
          setToken(null);
          clearAuthHeader();

          // ✅ 重要: 期限切れ状態は保持（UIで表示するため）
        },

        // ✅ 修正3: 型安全な現在ユーザー取得
        getCurrentUser: async () => {
          const { setLoading, token, handleAuthError } = get();

          if (!token) {
            get().logout();
            return;
          }

          try {
            setLoading(true);

            const response = await axios.get<User>(`${API_BASE_URL}/auth/me`);
            get().setUser(response.data);
          } catch (error: unknown) {
            console.error("Get current user failed:", error);

            // ✅ 統一されたエラーハンドリングを使用（既に型安全）
            handleAuthError(error);
          } finally {
            setLoading(false);
          }
        },

        checkAuth: () => {
          const { token, setAuthHeader, logout, user, setInitialized } = get();

          if (token) {
            setAuthHeader(token);

            if (!user) {
              console.warn(
                "checkAuth: トークンは存在しますが、ユーザー情報がありません。"
              );
            }
          } else {
            logout();
          }

          setInitialized(true);
        },
      }),
      {
        name: "auth-store",
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: "auth-store",
    }
  )
);

// ✅ 修正4: 型安全なAxiosインターセプター
if (typeof window !== "undefined") {
  axios.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      // unknown型に変更

      // 401エラーの場合は認証ストアで処理
      if (isAxiosError(error) && error.response?.status === 401) {
        const authStore = useAuthStore.getState();
        const result = authStore.handleAuthError(error);
        console.log("✅ authStore.handleAuthError完了:", result);
      } else {
        // より詳細なログ出力
        if (isAxiosError(error)) {
          console.log("❌ 401以外のエラー:", error.response?.status);
        } else {
          console.log("❌ Axios以外のエラー:", error);
        }
      }

      return Promise.reject(error);
    }
  );
}
