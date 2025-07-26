// src/stores/bookStore.ts

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios from "axios";
import type { Book, BookCreate, GoogleBookInfo } from "../types/book";

// APIのベースURL
const API_BASE_URL = "http://localhost:8000/api";

// ストアの状態の型定義
interface BookStore {
  // 状態
  books: Book[];
  isLoading: boolean;
  error: string | null;

  // 検索・フィルタ関連
  searchQuery: string;

  // アクション
  setBooks: (books: Book[]) => void;
  addBook: (book: Book) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;

  // API関連アクション
  fetchBooks: () => Promise<void>;
  createBook: (bookData: BookCreate) => Promise<void>;
  fetchBookByISBN: (isbn: string) => Promise<GoogleBookInfo | null>;
  searchBooksByTitle: (title: string) => Promise<GoogleBookInfo[]>;
}

// Zustandストアの作成
export const useBookStore = create<BookStore>()(
  devtools(
    (set, get) => ({
      // 初期状態
      books: [],
      isLoading: false,
      error: null,
      searchQuery: "",

      // 基本的な状態操作
      setBooks: (books) => set({ books }),
      addBook: (book) =>
        set((state) => ({
          books: [...state.books, book],
        })),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),

      // 書籍一覧を取得
      fetchBooks: async () => {
        const { setLoading, setError, setBooks } = get();

        try {
          setLoading(true);
          setError(null);

          const response = await axios.get<Book[]>(`${API_BASE_URL}/books`);
          setBooks(response.data);
        } catch (error) {
          console.error("Failed to fetch books:", error);
          setError("書籍データの取得に失敗しました");
        } finally {
          setLoading(false);
        }
      },

      // 書籍を新規作成
      createBook: async (bookData) => {
        const { setLoading, setError, addBook } = get();

        try {
          setLoading(true);
          setError(null);

          const response = await axios.post<Book>(
            `${API_BASE_URL}/books`,
            bookData
          );
          addBook(response.data);
        } catch (error) {
          console.error("Failed to create book:", error);
          setError("書籍の作成に失敗しました");
          throw error;
        } finally {
          setLoading(false);
        }
      },

      // ISBNから書籍情報を取得
      fetchBookByISBN: async (isbn) => {
        const { setLoading, setError } = get();

        try {
          setLoading(true);
          setError(null);

          const response = await axios.get<GoogleBookInfo>(
            `${API_BASE_URL}/fetch_book/${isbn}`
          );
          return response.data;
        } catch (error) {
          console.error("Failed to fetch book by ISBN:", error);
          setError("ISBN検索に失敗しました");
          return null;
        } finally {
          setLoading(false);
        }
      },

      // タイトルで書籍を検索
      searchBooksByTitle: async (title) => {
        const { setLoading, setError } = get();

        try {
          setLoading(true);
          setError(null);

          const response = await axios.get<GoogleBookInfo[]>(
            `${API_BASE_URL}/search_book`,
            {
              params: { title },
            }
          );
          return response.data;
        } catch (error) {
          console.error("Failed to search books by title:", error);
          setError("タイトル検索に失敗しました");
          return [];
        } finally {
          setLoading(false);
        }
      },
    }),
    {
      name: "book-store", // Redux DevToolsでの表示名
    }
  )
);
