// src/types/auth.ts

// ユーザー情報の型
export interface User {
  id: number;
  email: string;
  username: string;
}

// ログイン要求の型
export interface LoginRequest {
  username: string;
  password: string;
}

// 新規登録要求の型
export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  confirmPassword?: string; // フロントエンド用の確認パスワード
}

// 認証レスポンスの型（バックエンド修正に対応）
export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User; // ✅ 追加: バックエンドがユーザー情報も返すように変更
}

// フォームエラーの型
export interface FormErrors {
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

// 認証状態の型
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
