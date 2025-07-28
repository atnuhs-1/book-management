// src/types/book.ts

// バックエンドのスキーマに対応した型定義
// types/book.ts

export interface Book {
  id: number;
  title: string;
  volume: string;
  author: string;
  publisher: string;
  cover_image_url: string;
  published_date: string;
  user_id: number; // ✅ 追加
}

export interface BookCreate {
  title: string;
  volume: string;
  author: string;
  publisher: string;
  cover_image_url: string;
  published_date: string;
  user_id: number; // ✅ 追加
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
