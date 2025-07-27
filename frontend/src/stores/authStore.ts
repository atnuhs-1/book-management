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

        // ログイン処理
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

            const { access_token } = response.data;

            // トークンを保存してヘッダーに設定
            setToken(access_token);
            setAuthHeader(access_token);

            // トークンからユーザー情報を取得（後で実装）
            // 現在は仮のユーザー情報を設定
            const userData: User = {
              id: 1,
              username: credentials.username,
              email: `${credentials.username}@example.com`, // 仮の値
            };

            setUser(userData);
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
          const { setLoading, setError, setUser, setToken, setAuthHeader } =
            get();

          try {
            setLoading(true);
            setError(null);

            // ユーザー登録
            const registerResponse = await axios.post<User>(
              `${API_BASE_URL}/auth/register`,
              userData
            );

            // 登録成功後、自動ログイン
            const loginCredentials = {
              username: userData.username,
              password: userData.password,
            };

            const formData = new FormData();
            formData.append("username", loginCredentials.username);
            formData.append("password", loginCredentials.password);

            const loginResponse = await axios.post<AuthResponse>(
              `${API_BASE_URL}/auth/login`,
              formData,
              {
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
              }
            );

            const { access_token } = loginResponse.data;

            // トークンとユーザー情報を設定
            setToken(access_token);
            setAuthHeader(access_token);
            setUser(registerResponse.data);
          } catch (error: any) {
            console.error("Registration failed:", error);

            if (error.response?.status === 400) {
              setError("このユーザー名は既に使用されています");
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

        // 認証状態確認（アプリ起動時など）
        checkAuth: () => {
          const { token, setAuthHeader, logout } = get();

          if (token) {
            // トークンが存在する場合、Axiosヘッダーに設定
            setAuthHeader(token);

            // TODO: トークンの有効性をバックエンドで検証
            // 現在は簡易的にトークンの存在のみチェック
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
