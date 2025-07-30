// src/types/book.ts

// バックエンドのスキーマに対応した型定義

export interface Book {
  id: number;
  title: string;
  volume: string;
  author: string;
  publisher: string;
  cover_image_url: string;
  published_date: string;
  user_id: number;
}

export interface BookCreate {
  title: string;
  volume: string;
  author: string;
  publisher: string;
  cover_image_url: string;
  published_date: string;
  // user_id: number; ✅ 削除：バックエンドで自動設定される
}

// ✅ 新規追加: 書籍更新用の型（任意のフィールドを更新可能）
export interface BookUpdate {
  title?: string;
  volume?: string;
  author?: string;
  publisher?: string;
  cover_image_url?: string;
  published_date?: string;
  // user_idは更新不可（セキュリティ上の理由）
}

export interface GoogleBookInfo {
  title: string;
  volume: string;
  author: string;
  publisher: string;
  cover_image_url: string;
  published_date: string;
}

// API関連の型
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// UI状態の型
export interface UIState {
  isLoading: boolean;
  error: string | null;
}
