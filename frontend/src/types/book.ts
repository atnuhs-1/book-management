// src/types/book.ts

// バックエンドのスキーマに対応した型定義

// ✅ 書籍ステータスの列挙型
export enum BookStatusEnum {
  OWNED = "OWNED",
  WISHLIST = "WISHLIST",
}

export interface Book {
  id: number;
  title: string;
  volume: string;
  author: string;
  publisher: string;
  cover_image_url: string;
  published_date: string;
  user_id: number;
  status?: BookStatusEnum;
  is_favorite?: boolean;
  genres?: string[];
  isbn?: string;
}

export interface BookCreate {
  title: string;
  volume: string;
  author: string;
  publisher: string;
  cover_image_url: string;
  published_date: string;
  status?: BookStatusEnum;
  is_favorite?: boolean;
  genres?: string[];
  isbn?: string;
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
  status?: BookStatusEnum;
  is_favorite?: boolean;
  genres?: string[];
  // user_idは更新不可（セキュリティ上の理由）
}

export interface GoogleBookInfo {
  title: string;
  volume: string;
  authors: string[];
  publisher: string;
  cover_image_url: string;
  published_date: string;
}

export interface WishlistRegisterRequest {
  title: string;
  authors: string[];
  publisher: string;
  cover_image_url: string;
  published_date: string;
  isbn?: string;
  description?: string;
  categories?: string[];
  page_count?: number;
  language?: string;
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

// ✅ 新規追加: フィルター関連の型
export interface BookFilter {
  status?: BookStatusEnum;
  isFavorite?: boolean;
  searchQuery?: string;
  genres?: string[];
}

// ✅ 新規追加: 書籍一覧表示用の型
export interface BookListProps {
  books: Book[];
  filter?: BookFilter;
  onBookClick?: (book: Book) => void;
  onStatusChange?: (bookId: number, newStatus: BookStatusEnum) => void;
  onFavoriteToggle?: (bookId: number) => void;
}
