// src/stores/bookStore.ts

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios from "axios";
import type {
  Book,
  BookCreate,
  BookUpdate,
  GoogleBookInfo,
} from "../types/book";

const API_BASE_URL = "http://localhost:8000/api";

interface BookStore {
  books: Book[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  searchResults: GoogleBookInfo[];
  isSearching: boolean;
  selectedBook: Book | null;

  setBooks: (books: Book[]) => void;
  addBook: (book: Book) => void;
  updateBook: (updatedBook: Book) => void; // ✅ 新規追加
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;

  setSearchResults: (results: GoogleBookInfo[]) => void;
  setSearching: (searching: boolean) => void;
  clearSearchResults: () => void;

  setSelectedBook: (book: Book | null) => void;
  getBookById: (id: number) => Book | null;

  // ✅ 修正: 認証必須のエンドポイントに変更
  fetchBooks: () => Promise<void>; // userIdパラメータ削除
  fetchBookById: (id: number) => Promise<Book | null>;
  createBook: (bookData: BookCreate) => Promise<void>;
  updateBookById: (id: number, updateData: BookUpdate) => Promise<void>; // ✅ 新機能

  // 外部API（認証不要）
  fetchBookByISBN: (isbn: string) => Promise<GoogleBookInfo | null>;
  searchBooksByTitle: (title: string) => Promise<GoogleBookInfo[]>;
}

// エラーメッセージを文字列に変換する関数
const formatErrorMessage = (error: any): string => {
  if (typeof error === "string") {
    return error;
  }

  if (error.response?.data?.detail) {
    const detail = error.response.data.detail;

    // FastAPIのバリデーションエラーの場合
    if (Array.isArray(detail)) {
      return detail
        .map((e: any) => `${e.loc?.join(".")}: ${e.msg}`)
        .join(" / ");
    }

    // 単純な文字列エラーの場合
    if (typeof detail === "string") {
      return detail;
    }
  }

  // HTTPステータスコード別のエラーメッセージ
  if (error.response?.status === 403) {
    return "この操作を行う権限がありません";
  }

  if (error.response?.status === 404) {
    return "書籍が見つかりません";
  }

  if (error.response?.status === 401) {
    return "認証が必要です。ログインしてください";
  }

  // その他のエラー
  return "エラーが発生しました";
};

export const useBookStore = create<BookStore>()(
  devtools((set, get) => ({
    books: [],
    isLoading: false,
    error: null,
    searchQuery: "",
    searchResults: [],
    isSearching: false,
    selectedBook: null,

    setBooks: (books) => set({ books }),
    addBook: (book) => set((state) => ({ books: [...state.books, book] })),

    // ✅ 新機能: ローカル状態の書籍を更新
    updateBook: (updatedBook) =>
      set((state) => ({
        books: state.books.map((book) =>
          book.id === updatedBook.id ? updatedBook : book
        ),
      })),

    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    setSearchQuery: (query) => set({ searchQuery: query }),

    setSearchResults: (results) => set({ searchResults: results }),
    setSearching: (searching) => set({ isSearching: searching }),
    clearSearchResults: () => set({ searchResults: [] }),

    setSelectedBook: (book) => set({ selectedBook: book }),
    getBookById: (id) => {
      const { books } = get();
      return books.find((b) => b.id === id) || null;
    },

    // ✅ 修正: GET /api/me/books（認証必須）
    fetchBooks: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await axios.get(`${API_BASE_URL}/me/books`);
        set({ books: response.data, isLoading: false });
      } catch (err: any) {
        const errorMessage = formatErrorMessage(err);
        console.error("書籍取得エラー:", err);

        set({
          error: errorMessage,
          isLoading: false,
          books: [], // エラー時は空の配列を設定
        });
      }
    },

    // ✅ 修正: 認証必須の書籍詳細取得
    fetchBookById: async (id: number) => {
      set({ isLoading: true, error: null });
      try {
        // ✅ デバッグ情報を追加
        console.log("fetchBookById - 書籍ID:", id);
        console.log(
          "fetchBookById - Authorization header:",
          axios.defaults.headers.common["Authorization"]
        );

        const response = await axios.get(`${API_BASE_URL}/books/${id}`);
        console.log("fetchBookById - 成功:", response.data);
        return response.data;
      } catch (err: any) {
        const errorMessage = formatErrorMessage(err);
        console.error("書籍詳細取得エラー:", err);
        console.error("エラーレスポンス:", err.response);

        set({ error: errorMessage });
        return null;
      } finally {
        set({ isLoading: false });
      }
    },

    // ✅ 修正: 認証必須の書籍作成（user_idは自動設定）
    createBook: async (bookData) => {
      set({ isLoading: true, error: null });
      try {
        // ✅ user_idは既に型定義から削除されているため、そのまま送信
        const response = await axios.post(`${API_BASE_URL}/books`, bookData);
        set((state) => ({
          books: [...state.books, response.data],
          isLoading: false,
        }));
      } catch (err: any) {
        const errorMessage = formatErrorMessage(err);
        console.error("書籍作成エラー:", err);

        set({
          error: errorMessage,
          isLoading: false,
        });
        throw new Error(errorMessage);
      }
    },

    // ✅ 新機能: 書籍更新（認証必須、所有者チェック付き）
    updateBookById: async (id: number, updateData: BookUpdate) => {
      set({ isLoading: true, error: null });
      try {
        const response = await axios.put(
          `${API_BASE_URL}/books/${id}`,
          updateData
        );

        // ローカル状態を更新
        const { updateBook } = get();
        updateBook(response.data);

        set({ isLoading: false });
      } catch (err: any) {
        const errorMessage = formatErrorMessage(err);
        console.error("書籍更新エラー:", err);

        set({
          error: errorMessage,
          isLoading: false,
        });
        throw new Error(errorMessage);
      }
    },

    // 外部API（認証不要）
    fetchBookByISBN: async (isbn: string) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/fetch_book/${isbn}`);
        return response.data;
      } catch (err: any) {
        const errorMessage = formatErrorMessage(err);
        console.error("ISBN検索エラー:", err);

        set({ error: errorMessage });
        return null;
      }
    },

    searchBooksByTitle: async (title: string) => {
      set({ isSearching: true, error: null });
      try {
        const response = await axios.get(`${API_BASE_URL}/search_book`, {
          params: { title },
        });
        set({ searchResults: response.data, isSearching: false });
        return response.data;
      } catch (err: any) {
        const errorMessage = formatErrorMessage(err);
        console.error("書籍検索エラー:", err);

        set({
          error: errorMessage,
          isSearching: false,
          searchResults: [], // エラー時は空の配列を設定
        });
        return [];
      }
    },
  }))
);
