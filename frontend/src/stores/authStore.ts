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

  // アクション
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // 認証関連アクション
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
  getCurrentUser: () => Promise<void>; // ✅ 新機能: 現在のユーザー情報取得

  // トークンをAxiosヘッダーに設定
  setAuthHeader: (token: string) => void;
  clearAuthHeader: () => void;
}

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

        // 基本的な状態操作
        setUser: (user) =>
          set({ user, isAuthenticated: !!user }, false, "setUser"),

        setToken: (token) => set({ token }, false, "setToken"),

        setLoading: (isLoading) => set({ isLoading }, false, "setLoading"),

        setError: (error) => set({ error }, false, "setError"),

        clearError: () => set({ error: null }, false, "clearError"),

        // Axiosヘッダー管理
        setAuthHeader: (token) => {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        },

        clearAuthHeader: () => {
          delete axios.defaults.headers.common["Authorization"];
        },

        // ✅ 修正: ログイン処理（バックエンドからユーザー情報を取得）
        login: async (credentials) => {
          const { setLoading, setError, setUser, setToken, setAuthHeader } =
            get();

          try {
            setLoading(true);
            setError(null);

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

            const { access_token, user } = response.data; // ✅ userも取得

            // トークンを保存してヘッダーに設定
            setToken(access_token);
            setAuthHeader(access_token);

            // ✅ 修正: バックエンドから返された実際のユーザー情報を設定
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

        // ✅ 修正: 新規登録処理（バックエンドの新しいレスポンス形式に対応）
        register: async (userData) => {
          const { setLoading, setError, setUser, setToken, setAuthHeader } =
            get();

          try {
            setLoading(true);
            setError(null);

            // ✅ 修正: 登録APIが直接 TokenWithUser を返すように変更
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

        // ログアウト処理
        logout: () => {
          const { setUser, setToken, clearAuthHeader } = get();

          setUser(null);
          setToken(null);
          clearAuthHeader();
        },

        // ✅ 修正: 現在のユーザー情報を取得（有効化）
        getCurrentUser: async () => {
          const { setLoading, setError, setUser, token, logout } = get();

          if (!token) {
            logout();
            return;
          }

          try {
            setLoading(true);
            setError(null);

            const response = await axios.get<User>(`${API_BASE_URL}/auth/me`);
            setUser(response.data);
          } catch (error: any) {
            console.error("Get current user failed:", error);

            // 401エラー（認証切れ）の場合はログアウト
            if (error.response?.status === 401) {
              logout();
            } else {
              setError("ユーザー情報の取得に失敗しました");
            }
          } finally {
            setLoading(false);
          }
        },

        // ✅ 修正: 認証状態確認（シンプル版、無限ループ防止）
        checkAuth: () => {
          const { token, setAuthHeader, logout, user } = get();

          if (token) {
            // トークンが存在する場合、Axiosヘッダーに設定
            setAuthHeader(token);

            // ユーザー情報が存在しない場合のみ警告（デバッグ用）
            if (!user) {
              console.warn(
                "checkAuth: トークンは存在しますが、ユーザー情報がありません。ログイン時に設定されているはずです。"
              );
            }

            // ✅ 重要: getCurrentUserは呼び出さない（無限ループ防止）
            // 必要に応じて手動でgetCurrentUserを呼び出す
          } else {
            logout();
          }
        },
      }),
      {
        name: "auth-store", // localStorage のキー名
        // トークンとユーザー情報のみ永続化
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: "auth-store", // Redux DevToolsでの表示名
    }
  )
);
