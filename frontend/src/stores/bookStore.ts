// src/stores/bookStore.ts - ウィッシュリスト取得機能追加版

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios from "axios";
import type {
  Book,
  BookCreate,
  BookUpdate,
  GoogleBookInfo,
} from "../types/book";
import { formatBookError, formatErrorMessage, logError } from "../utils/errorFormatter";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface BookStore {
  books: Book[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  searchResults: GoogleBookInfo[];
  isSearching: boolean;
  selectedBook: Book | null;

  // ✅ 既存: バーコード関連の状態
  isRegisteringByISBN: boolean;
  lastScannedISBN: string | null;

  // ✅ 既存: タイトル検索登録の状態
  isRegisteringByTitle: boolean;
  titleSearchResults: GoogleBookInfo[];
  isTitleSearching: boolean;

  // ✅ 既存: ウィッシュリスト登録関連の状態
  isRegisteringToWishlist: boolean;
  wishlistError: string | null;

  // ✅ 新規追加: ウィッシュリスト取得関連の状態
  wishlistBooks: Book[];
  isLoadingWishlist: boolean;
  wishlistFetchError: string | null;

  // ✅ 既存: 認証関連エラーの状態
  lastAuthError: string | null;
  hasAuthError: boolean;

  setBooks: (books: Book[]) => void;
  addBook: (book: Book) => void;
  updateBook: (updatedBook: Book) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;

  setSearchResults: (results: GoogleBookInfo[]) => void;
  setSearching: (searching: boolean) => void;
  clearSearchResults: () => void;

  setSelectedBook: (book: Book | null) => void;
  getBookById: (id: number) => Book | null;

  // ✅ 既存: バーコード関連のアクション
  setRegisteringByISBN: (registering: boolean) => void;
  setLastScannedISBN: (isbn: string | null) => void;
  createBookByISBN: (isbn: string) => Promise<Book>;

  // ✅ 既存: タイトル検索登録のアクション
  setRegisteringByTitle: (registering: boolean) => void;
  setTitleSearchResults: (results: GoogleBookInfo[]) => void;
  setTitleSearching: (searching: boolean) => void;
  clearTitleSearchResults: () => void;
  searchBooksByTitleForRegistration: (
    title: string
  ) => Promise<GoogleBookInfo[]>;
  createBookByTitle: (title: string) => Promise<Book>;

  // ✅ 既存: ウィッシュリスト登録関連のアクション
  setRegisteringToWishlist: (registering: boolean) => void;
  setWishlistError: (error: string | null) => void;
  addToWishlist: (bookData: any) => Promise<Book>;

  // ✅ 新規追加: ウィッシュリスト取得関連のアクション
  setWishlistBooks: (books: Book[]) => void;
  setLoadingWishlist: (loading: boolean) => void;
  setWishlistFetchError: (error: string | null) => void;
  fetchWishlist: () => Promise<void>;
  clearWishlist: () => void;

  // ✅ 既存: 認証エラー管理
  setAuthError: (error: string | null) => void;
  clearAuthError: () => void;

  fetchBooks: () => Promise<void>;
  fetchBookById: (id: number) => Promise<Book | null>;
  createBook: (bookData: BookCreate) => Promise<void>;
  updateBookById: (id: number, updateData: BookUpdate) => Promise<void>;

  // 外部API（認証不要）
  fetchBookByISBN: (isbn: string) => Promise<GoogleBookInfo | null>;
  searchBooksByTitle: (title: string) => Promise<GoogleBookInfo[]>;
}

export const useBookStore = create<BookStore>()(
  devtools((set, get) => ({
    books: [],
    isLoading: false,
    error: null,
    searchQuery: "",
    searchResults: [],
    isSearching: false,
    selectedBook: null,
    lastAuthError: null,
    hasAuthError: false,

    // ✅ 既存: バーコード関連の初期状態
    isRegisteringByISBN: false,
    lastScannedISBN: null,

    // ✅ 既存: タイトル検索登録の初期状態
    isRegisteringByTitle: false,
    titleSearchResults: [],
    isTitleSearching: false,

    // ✅ 既存: ウィッシュリスト登録関連の初期状態
    isRegisteringToWishlist: false,
    wishlistError: null,

    // ✅ 新規追加: ウィッシュリスト取得関連の初期状態
    wishlistBooks: [],
    isLoadingWishlist: false,
    wishlistFetchError: null,

    setBooks: (books) => set({ books }),
    addBook: (book) => set((state) => ({ books: [...state.books, book] })),

    updateBook: (updatedBook) =>
      set((state) => ({
        books: state.books.map((book) =>
          book.id === updatedBook.id ? updatedBook : book
        ),
        // ✅ ウィッシュリストも同時更新
        wishlistBooks: state.wishlistBooks.map((book) =>
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

    // ✅ 既存: バーコード関連のアクション
    setRegisteringByISBN: (registering) =>
      set({ isRegisteringByISBN: registering }),

    setLastScannedISBN: (isbn) => set({ lastScannedISBN: isbn }),

    // ✅ 既存: タイトル検索登録のアクション
    setRegisteringByTitle: (registering) =>
      set({ isRegisteringByTitle: registering }),

    setTitleSearchResults: (results) => set({ titleSearchResults: results }),

    setTitleSearching: (searching) => set({ isTitleSearching: searching }),

    clearTitleSearchResults: () => set({ titleSearchResults: [] }),

    // ✅ 既存: ウィッシュリスト登録関連のアクション
    setRegisteringToWishlist: (registering) =>
      set({ isRegisteringToWishlist: registering }),

    setWishlistError: (error) => set({ wishlistError: error }),

    // ✅ 新規追加: ウィッシュリスト取得関連のアクション
    setWishlistBooks: (books) => set({ wishlistBooks: books }),

    setLoadingWishlist: (loading) => set({ isLoadingWishlist: loading }),

    setWishlistFetchError: (error) => set({ wishlistFetchError: error }),

    clearWishlist: () =>
      set({
        wishlistBooks: [],
        wishlistFetchError: null,
      }),

    // ✅ 既存: 認証エラー管理
    setAuthError: (error) =>
      set({ lastAuthError: error, hasAuthError: !!error }),
    clearAuthError: () => set({ lastAuthError: null, hasAuthError: false }),

    // ✅ 新機能: ウィッシュリスト取得
    fetchWishlist: async () => {
      set({
        isLoadingWishlist: true,
        wishlistFetchError: null,
      });

      try {
        const response = await axios.get(`${API_BASE_URL}/me/wishlist`);

        // ✅ バックエンドから返されるBookOut[]をBook[]として扱う
        // amazon_urlフィールドが追加されている可能性があるが、Book型は柔軟に対応
        const wishlistBooks = response.data;

        set({
          wishlistBooks,
          isLoadingWishlist: false,
        });

        get().clearAuthError();
      } catch (error: unknown) {
        console.error("❌ ウィッシュリスト取得エラー:", error);

        const errorResult = formatBookError(error);
        logError(error, "fetchWishlist");

        if (errorResult.isAuthError) {
          get().setAuthError(errorResult.message);
          set({
            isLoadingWishlist: false,
            wishlistBooks: [], // 認証エラー時はクリア
          });
        } else {
          set({
            wishlistFetchError: errorResult.message,
            isLoadingWishlist: false,
          });
        }
      }
    },

    // ✅ 既存機能: ウィッシュリストに追加
    addToWishlist: async (bookData: any) => {
      set({ isRegisteringToWishlist: true, wishlistError: null });

      try {
        const response = await axios.post(
          `${API_BASE_URL}/books/wishlist-register`,
          bookData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const registeredBook = response.data;

        set((state) => ({
          books: [...state.books, registeredBook],
          // ✅ ウィッシュリストにも追加
          wishlistBooks: [...state.wishlistBooks, registeredBook],
          isRegisteringToWishlist: false,
        }));

        get().clearAuthError();
        return registeredBook;
      } catch (error: unknown) {
        console.error("❌ ウィッシュリスト追加エラー:", error);

        const errorResult = formatBookError(error);
        logError(error, "addToWishlist");

        if (errorResult.isAuthError) {
          get().setAuthError(errorResult.message);
          set({ isRegisteringToWishlist: false });
          throw new Error("認証が必要です。再度ログインしてください。");
        } else {
          set({
            wishlistError: errorResult.message,
            isRegisteringToWishlist: false,
          });
          throw new Error(errorResult.message);
        }
      }
    },

    // ✅ 既存の関数（変更なし）
    fetchBooks: async () => {
      set({ isLoading: true, error: null });

      try {
        const response = await axios.get(`${API_BASE_URL}/me/books`);
        set({ books: response.data, isLoading: false });
        get().clearAuthError();
      } catch (error: unknown) {
        console.error("書籍取得エラー:", error);

        const errorResult = formatBookError(error);
        logError(error, "fetchBooks");

        if (errorResult.isAuthError) {
          get().setAuthError(errorResult.message);
          set({ isLoading: false });
        } else {
          set({ error: errorResult.message, isLoading: false, books: [] });
        }
      }
    },

    fetchBookById: async (id: number) => {
      set({ isLoading: true, error: null });
      try {
        const response = await axios.get(`${API_BASE_URL}/books/${id}`);
        set({ isLoading: false });
        get().clearAuthError();
        return response.data;
      } catch (error: unknown) {
        console.error("書籍詳細取得エラー:", error);

        const errorResult = formatBookError(error);
        logError(error, "fetchBookById");

        if (errorResult.isAuthError) {
          get().setAuthError(errorResult.message);
          set({ isLoading: false });
        } else {
          set({ error: errorResult.message, isLoading: false });
        }
        return null;
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

        get().clearAuthError();
      } catch (error: unknown) {
        console.error("書籍作成エラー:", error);

        const errorResult = formatBookError(error);
        logError(error, "createBook");

        if (errorResult.isAuthError) {
          get().setAuthError(errorResult.message);
          set({ isLoading: false });
          throw new Error("認証が必要です");
        } else {
          set({ error: errorResult.message, isLoading: false });
          throw new Error(errorResult.message);
        }
      }
    },

    // ✅ ISBNによる書籍登録機能
    createBookByISBN: async (isbn: string) => {
      set({
        isRegisteringByISBN: true,
        error: null,
        lastScannedISBN: isbn,
      });

      try {
        const response = await axios.post(
          `${API_BASE_URL}/books/register-by-isbn`,
          { isbn }
        );

        const registeredBook = response.data.book || response.data;

        set((state) => ({
          books: [...state.books, registeredBook],
          isRegisteringByISBN: false,
        }));

        get().clearAuthError();
        return registeredBook;
      } catch (error: unknown) {
        console.error("❌ ISBN書籍登録エラー:", error);

        const errorResult = formatBookError(error);
        logError(error, "createBookByISBN");

        if (errorResult.isAuthError) {
          get().setAuthError(errorResult.message);
          set({ isRegisteringByISBN: false });
          throw new Error("認証が必要です。再度ログインしてください。");
        } else {
          set({ error: errorResult.message, isRegisteringByISBN: false });
          throw new Error(errorResult.message);
        }
      }
    },

    // ✅ 既存機能: タイトル検索（登録用）
    searchBooksByTitleForRegistration: async (title: string) => {
      set({ isTitleSearching: true, error: null });

      try {
        const response = await axios.get(`${API_BASE_URL}/search_book`, {
          params: { title },
        });
        const results = response.data;
        set({
          titleSearchResults: results,
          isTitleSearching: false,
        });
        return results;
      } catch (error: unknown) {
        console.error("書籍検索エラー:", error);

        const errorResult = formatBookError(error);
        logError(error, "searchBooksByTitleForRegistration");

        set({
          error: errorResult.message,
          isTitleSearching: false,
          titleSearchResults: [],
        });
        return [];
      }
    },

    // ✅ 既存機能: タイトルによる書籍登録
    createBookByTitle: async (title: string) => {
      set({
        isRegisteringByTitle: true,
        error: null,
      });

      try {
        const response = await axios.post(
          `${API_BASE_URL}/books/register-by-title`,
          null,
          {
            params: { title },
          }
        );

        const registeredBook = response.data;

        set((state) => ({
          books: [...state.books, registeredBook],
          isRegisteringByTitle: false,
        }));

        get().clearAuthError();
        return registeredBook;
      } catch (error: unknown) {
        console.error("❌ タイトル書籍登録エラー:", error);

        const errorResult = formatBookError(error);
        logError(error, "createBookByTitle");

        if (errorResult.isAuthError) {
          get().setAuthError(errorResult.message);
          set({ isRegisteringByTitle: false });
          throw new Error("認証が必要です。再度ログインしてください。");
        } else {
          set({ error: errorResult.message, isRegisteringByTitle: false });
          throw new Error(errorResult.message);
        }
      }
    },

    updateBookById: async (id: number, updateData: BookUpdate) => {
      set({ isLoading: true, error: null });

      try {
        const response = await axios.put(
          `${API_BASE_URL}/books/${id}`,
          updateData
        );
        const { updateBook } = get();
        updateBook(response.data);
        set({ isLoading: false });
        get().clearAuthError();
      } catch (error: unknown) {
        console.error("書籍更新エラー:", error);

        const errorResult = formatBookError(error);
        logError(error, "updateBookById");

        if (errorResult.isAuthError) {
          get().setAuthError(errorResult.message);
          set({ isLoading: false });
          throw new Error("認証が必要です");
        } else {
          set({ error: errorResult.message, isLoading: false });
          throw new Error(errorResult.message);
        }
      }
    },

    // 外部API（認証不要）- 変更なし
    fetchBookByISBN: async (isbn: string) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/fetch_book/${isbn}`);
        return response.data;
      } catch (error: unknown) {
        console.error("ISBN検索エラー:", error);

        const errorResult = formatErrorMessage(error);
        logError(error, "fetchBookByISBN");

        set({ error: errorResult.message });
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
      } catch (error: unknown) {
        console.error("書籍検索エラー:", error);

        // ✅ 外部APIなので汎用エラーフォーマッターを使用
        const errorResult = formatErrorMessage(error);
        logError(error, "searchBooksByTitle");

        set({
          error: errorResult.message,
          isSearching: false,
          searchResults: [],
        });
        return [];
      }
    },
  }))
);
