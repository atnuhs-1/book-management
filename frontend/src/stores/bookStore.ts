// src/stores/bookStore.ts

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios from "axios";
import type { Book, BookCreate, GoogleBookInfo } from "../types/book";

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
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;

  setSearchResults: (results: GoogleBookInfo[]) => void;
  setSearching: (searching: boolean) => void;
  clearSearchResults: () => void;

  setSelectedBook: (book: Book | null) => void;
  getBookById: (id: number) => Book | null;

  fetchBooks: (userId: number) => Promise<void>;
  fetchBookById: (id: number) => Promise<Book | null>;
  createBook: (bookData: BookCreate) => Promise<void>;
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

    fetchBooks: async (userId: number) => {
      set({ isLoading: true, error: null });
      try {
        // 既存のエンドポイントを使用
        const response = await axios.get(`${API_BASE_URL}/users/${userId}/books`);
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

    fetchBookById: async (id: number) => {
      set({ isLoading: true, error: null });
      try {
        const response = await axios.get(`${API_BASE_URL}/books/${id}`);
        return response.data;
      } catch (err: any) {
        const errorMessage = formatErrorMessage(err);
        console.error("書籍詳細取得エラー:", err);

        set({ error: errorMessage });
        return null;
      } finally {
        set({ isLoading: false });
      }
    },

    createBook: async (bookData) => {
      set({ isLoading: true, error: null });
      try {
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
