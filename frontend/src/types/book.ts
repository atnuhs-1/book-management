// src/types/book.ts

// バックエンドのスキーマに対応した型定義

export interface Book {
  id: number;
  title: string;
  volume: string;
  author: string;
  publisher: string;
  cover_image_url: string;
  published_date: string; // バックエンドはdate型だが、JSONでは文字列として受信
}

export interface BookCreate {
  title: string;
  volume: string;
  author: string;
  publisher: string;
  cover_image_url: string;
  published_date: string;
}

// Google Books APIのレスポンス型
export interface GoogleBookInfo {
  title: string;
  authors: string;
  publisher: string;
  published_date: string;
  cover_image_url: string;
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
