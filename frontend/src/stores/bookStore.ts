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
  searchQuery: string;

  // Google Books 検索関連の状態
  searchResults: GoogleBookInfo[];
  isSearching: boolean;

  // 書籍詳細関連
  selectedBook: Book | null;

  // アクション
  setBooks: (books: Book[]) => void;
  addBook: (book: Book) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;

  // Google Books検索関連のアクション
  setSearchResults: (results: GoogleBookInfo[]) => void;
  setSearching: (searching: boolean) => void;
  clearSearchResults: () => void;

  // 書籍詳細関連のアクション
  setSelectedBook: (book: Book | null) => void;
  getBookById: (id: number) => Book | null;

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

      // Google Books検索関連
      setSearchResults: (searchResults) => set({ searchResults }),
      setSearching: (isSearching) => set({ isSearching }),
      clearSearchResults: () => set({ searchResults: [] }),

      // 書籍詳細関連
      setSelectedBook: (selectedBook) => set({ selectedBook }),
      getBookById: (id) => {
        const { books } = get();
        return books.find((book) => book.id === id) || null;
      },

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

      // Google Booksからウィッシュリストに追加
      // addBookToWishlist: async (googleBook) => {
      //   const { createBook } = get();

      //   // GoogleBookInfo を BookCreate 形式に変換（ステータスをwishlistに）
      //   const bookData: BookCreate = {
      //     title: googleBook.title || "不明なタイトル",
      //     volume: "",
      //     author: googleBook.authors || "不明な著者",
      //     publisher: googleBook.publisher || "不明な出版社",
      //     cover_image_url: googleBook.cover_image_url || "",
      //     published_date:
      //       googleBook.published_date || new Date().toISOString().split("T")[0],
      //     status: "wishlist", // ウィッシュリストとして追加
      //   };

      //   await createBook(bookData);
      // },
    }),
    {
      name: "book-store", // Redux DevToolsでの表示名
    }
  )
);
