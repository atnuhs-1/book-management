// src/stores/authStore.ts

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import axios from "axios";
import type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from "../types/auth";

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

  // ✅ 新機能: 期限切れ関連の状態
  isTokenExpired: boolean;
  lastAuthError: string | null;

  // アクション
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setInitialized: (initialized: boolean) => void;

  // ✅ 新機能: 期限切れ関連のアクション
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

  // ✅ 新機能: エラーハンドリング
  handleAuthError: (error: any) => boolean; // 認証エラーかどうかを返す
}

// authStore.ts の parseAuthError 関数にログを追加
const parseAuthError = (
  error: any
): { message: string; isTokenExpired: boolean; shouldLogout: boolean } => {
  if (!error.response) {
    return {
      message: "ネットワークエラーが発生しました",
      isTokenExpired: false,
      shouldLogout: false,
    };
  }

  const { status, data } = error.response;

  if (status === 401) {
    const detail = data?.detail || "";

    // バックエンドからの期限切れメッセージを検出
    if (detail.includes("有効期限が切れました") || detail.includes("expired")) {
      return {
        message: "セッションの有効期限が切れました。再度ログインしてください。",
        isTokenExpired: true,
        shouldLogout: true,
      };
    }

    if (detail.includes("トークンが無効です") || detail.includes("invalid")) {
      return {
        message: "認証情報が無効です。再度ログインしてください。",
        isTokenExpired: true,
        shouldLogout: true,
      };
    }

    if (detail.includes("ユーザーが見つかりません")) {
      return {
        message: "ユーザー情報が見つかりません。再度ログインしてください。",
        isTokenExpired: false,
        shouldLogout: true,
      };
    }

    return {
      message: detail || "認証に失敗しました",
      isTokenExpired: true,
      shouldLogout: true,
    };
  }

  return {
    message: data?.detail || "エラーが発生しました",
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
        isTokenExpired: false, // ✅ 新規追加
        lastAuthError: null, // ✅ 新規追加

        // 基本的な状態操作
        setUser: (user) =>
          set({ user, isAuthenticated: !!user }, false, "setUser"),

        setToken: (token) => set({ token }, false, "setToken"),

        setLoading: (isLoading) => set({ isLoading }, false, "setLoading"),

        setError: (error) => set({ error }, false, "setError"),

        clearError: () => set({ error: null }, false, "clearError"),

        setInitialized: (isInitialized) =>
          set({ isInitialized }, false, "setInitialized"),

        // ✅ 新機能: 期限切れ状態管理
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

        // ✅ 修正: 統一された認証エラーハンドリング
        handleAuthError: (error) => {
          const { message, isTokenExpired, shouldLogout } =
            parseAuthError(error);

          const { setError, setTokenExpired, setLastAuthError, logout } = get();

          // ✅ 重要: 先にエラー状態を設定してからログアウト
          setLastAuthError(message);
          setTokenExpired(isTokenExpired);
          setError(message);

          if (shouldLogout) {
            // ✅ 修正: ログアウト処理（ユーザー情報とトークンのみクリア）
            const { setUser, setToken, clearAuthHeader } = get();
            setUser(null);
            setToken(null);
            clearAuthHeader();

            return true; // 認証エラーであることを示す
          } else {
            return false; // 認証エラーではない
          }
        },

        // ログイン処理
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
            setTokenExpired(false); // ✅ 期限切れ状態をリセット

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
          } catch (error: any) {
            console.error("Login failed:", error);

            if (error.response?.status === 401) {
              setError("ユーザー名またはパスワードが間違っています");
            } else if (error.response?.data?.detail) {
              setError(error.response.data.detail);
            } else {
              setError("ログインに失敗しました");
            }
            throw error;
          } finally {
            setLoading(false);
          }
        },

        // 新規登録処理
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
            setTokenExpired(false); // ✅ 期限切れ状態をリセット

            const response = await axios.post<AuthResponse>(
              `${API_BASE_URL}/auth/register`,
              userData
            );

            const { access_token, user } = response.data;

            // トークンとユーザー情報を設定
            setToken(access_token);
            setAuthHeader(access_token);
            setUser(user);
          } catch (error: any) {
            console.error("Registration failed:", error);

            if (error.response?.status === 400) {
              setError(
                "このユーザー名またはメールアドレスは既に使用されています"
              );
            } else if (error.response?.data?.detail) {
              setError(error.response.data.detail);
            } else {
              setError("アカウントの作成に失敗しました");
            }
            throw error;
          } finally {
            setLoading(false);
          }
        },

        logout: () => {
          const {
            setUser,
            setToken,
            clearAuthHeader,
            // ✅ 重要: ログアウト時は認証エラー状態をリセットしない
            // setTokenExpired,
            // setLastAuthError,
          } = get();

          setUser(null);
          setToken(null);
          clearAuthHeader();

          // ✅ 重要: 期限切れ状態は保持（UIで表示するため）
          // setTokenExpired(false);
          // setLastAuthError(null);
        },

        // ✅ 修正: 現在のユーザー情報を取得（エラーハンドリング強化）
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
          } catch (error: any) {
            console.error("Get current user failed:", error);

            // ✅ 統一されたエラーハンドリングを使用
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

// authStore.ts の最下部のAxiosインターセプター部分
if (typeof window !== "undefined") {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {

      // 401エラーの場合は認証ストアで処理
      if (error.response?.status === 401) {
        const authStore = useAuthStore.getState();
        const result = authStore.handleAuthError(error);
        console.log("✅ authStore.handleAuthError完了:", result);
      } else {
        console.log("❌ 401以外のエラー:", error.response?.status);
      }

      return Promise.reject(error);
    }
  );
}
