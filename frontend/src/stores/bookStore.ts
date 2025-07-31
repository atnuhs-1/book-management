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
import { mockRegisterBookByISBN } from "../services/mockBookApi";

const API_BASE_URL = "http://localhost:8000/api";

interface BookStore {
  books: Book[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  searchResults: GoogleBookInfo[];
  isSearching: boolean;
  selectedBook: Book | null;
  // ✅ 新規追加: バーコード関連の状態
  isRegisteringByISBN: boolean;
  lastScannedISBN: string | null;

  // ✅ 新機能: 認証関連エラーの状態
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

  // ✅ 新規追加: バーコード関連のアクション
  setRegisteringByISBN: (registering: boolean) => void;
  setLastScannedISBN: (isbn: string | null) => void;
  createBookByISBN: (isbn: string) => Promise<Book>;

  // ✅ 新機能: 認証エラー管理
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

// ✅ 改良版: エラーメッセージの詳細な判定
const formatErrorMessage = (
  error: any
): { message: string; isAuthError: boolean } => {
  if (typeof error === "string") {
    return { message: error, isAuthError: false };
  }

  // ネットワークエラー
  if (!error.response) {
    return {
      message:
        "ネットワークエラーが発生しました。インターネット接続を確認してください。",
      isAuthError: false,
    };
  }

  const { status, data } = error.response;

  // HTTPステータスコード別の詳細メッセージ
  switch (status) {
    case 401:
      const detail = data?.detail || "";

      // ✅ バックエンドからの期限切れメッセージを検出
      if (
        detail.includes("有効期限が切れました") ||
        detail.includes("expired")
      ) {
        return {
          message:
            "セッションの有効期限が切れました。再度ログインしてください。",
          isAuthError: true,
        };
      }

      if (
        detail.includes("認証情報が無効です") ||
        detail.includes("トークンが無効です")
      ) {
        return {
          message: "認証情報が無効です。ログインし直してください。",
          isAuthError: true,
        };
      }

      if (detail.includes("ユーザーが見つかりません")) {
        return {
          message: "ユーザー情報が見つかりません。再度ログインしてください。",
          isAuthError: true,
        };
      }

      return {
        message: detail || "認証に失敗しました。ログインしてください。",
        isAuthError: true,
      };

    case 403:
      return {
        message: "この操作を行う権限がありません。",
        isAuthError: false,
      };

    case 404:
      return {
        message: "書籍が見つかりません。削除された可能性があります。",
        isAuthError: false,
      };

    case 422:
      // FastAPIのバリデーションエラー
      if (Array.isArray(data?.detail)) {
        const validationErrors = data.detail
          .map((e: any) => {
            const field = e.loc?.join(".");
            const message = e.msg;
            return `${field}: ${message}`;
          })
          .join(", ");
        return {
          message: `入力エラー: ${validationErrors}`,
          isAuthError: false,
        };
      }
      return {
        message: "入力データに問題があります。",
        isAuthError: false,
      };

    case 500:
      return {
        message:
          "サーバーエラーが発生しました。しばらく待ってから再試行してください。",
        isAuthError: false,
      };

    default:
      // カスタムメッセージがある場合
      if (data?.detail) {
        if (typeof data.detail === "string") {
          return { message: data.detail, isAuthError: false };
        }
      }
      return {
        message: `エラーが発生しました (${status})`,
        isAuthError: false,
      };
  }
};

// ✅ 新機能: 認証エラーをAuthStoreに委譲
const handleAuthenticationError = (error: any): boolean => {
  if (error.response?.status === 401) {
    // authStoreがAxiosインターセプターで自動処理するため、ここでは何もしない
    return true; // 認証エラーが検出されたことを示す
  }
  return false;
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
    lastAuthError: null, // ✅ 新規追加
    hasAuthError: false, // ✅ 新規追加
    // ✅ 新規追加: バーコード関連の初期状態
    isRegisteringByISBN: false,
    lastScannedISBN: null,

    setBooks: (books) => set({ books }),
    addBook: (book) => set((state) => ({ books: [...state.books, book] })),

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

    // ✅ 新規追加: バーコード関連のアクション
    setRegisteringByISBN: (registering) =>
      set({ isRegisteringByISBN: registering }),

    setLastScannedISBN: (isbn) => set({ lastScannedISBN: isbn }),

    // ✅ 新機能: 認証エラー管理
    setAuthError: (error) =>
      set({ lastAuthError: error, hasAuthError: !!error }),
    clearAuthError: () => set({ lastAuthError: null, hasAuthError: false }),

    // ✅ 改良版: 書籍一覧取得（認証エラー処理強化）
    fetchBooks: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await axios.get(`${API_BASE_URL}/me/books`);
        set({ books: response.data, isLoading: false });

        // ✅ 成功時は認証エラー状態をクリア
        get().clearAuthError();
      } catch (err: any) {
        console.error("書籍取得エラー:", err);

        const { message, isAuthError } = formatErrorMessage(err);

        if (isAuthError) {
          // ✅ 認証エラーの場合
          get().setAuthError(message);
          // Axiosインターセプターが自動でAuthStoreを処理するため、
          // ここではエラーメッセージを設定しない
          set({ isLoading: false });
        } else {
          // ✅ 通常のエラーの場合
          set({
            error: message,
            isLoading: false,
            books: [],
          });
        }
      }
    },

    // ✅ 改良版: 書籍詳細取得（認証エラー処理強化）
    fetchBookById: async (id: number) => {
      set({ isLoading: true, error: null });
      try {
        const response = await axios.get(`${API_BASE_URL}/books/${id}`);
        set({ isLoading: false });

        // ✅ 成功時は認証エラー状態をクリア
        get().clearAuthError();
        return response.data;
      } catch (err: any) {
        console.error("書籍詳細取得エラー:", err);

        const { message, isAuthError } = formatErrorMessage(err);

        if (isAuthError) {
          // ✅ 認証エラーの場合
          get().setAuthError(message);
          set({ isLoading: false });
        } else {
          // ✅ 通常のエラーの場合
          set({ error: message, isLoading: false });
        }
        return null;
      }
    },

    // ✅ 改良版: 書籍作成（認証エラー処理強化）
    createBook: async (bookData) => {
      set({ isLoading: true, error: null });
      try {
        const response = await axios.post(`${API_BASE_URL}/books`, bookData);
        set((state) => ({
          books: [...state.books, response.data],
          isLoading: false,
        }));

        // ✅ 成功時は認証エラー状態をクリア
        get().clearAuthError();
      } catch (err: any) {
        console.error("書籍作成エラー:", err);

        const { message, isAuthError } = formatErrorMessage(err);

        if (isAuthError) {
          // ✅ 認証エラーの場合
          get().setAuthError(message);
          set({ isLoading: false });
          throw new Error("認証が必要です");
        } else {
          // ✅ 通常のエラーの場合
          set({
            error: message,
            isLoading: false,
          });
          throw new Error(message);
        }
      }
    },

    // ✅ 新規追加: ISBNによる書籍登録機能
    createBookByISBN: async (isbn: string) => {
      console.log(`📚 createBookByISBN開始: ${isbn}`);

      set({
        isRegisteringByISBN: true,
        error: null,
        lastScannedISBN: isbn,
      });

      try {
        let registeredBook: Book;

        // 🚧 開発環境判定とモック使用の切り替え
        const isDevelopment = import.meta.env.DEV;
        const useMockAPI = isDevelopment && !import.meta.env.VITE_USE_REAL_API;

        if (useMockAPI) {
          console.log("🧪 Mock API使用: ISBN登録");

          // モックAPIを使用
          registeredBook = await mockRegisterBookByISBN(isbn);

          // ローカル状態に追加（モック用）
          set((state) => ({
            books: [...state.books, registeredBook],
            isRegisteringByISBN: false,
          }));

          console.log("✅ Mock API: 書籍登録完了", registeredBook);
        } else {
          console.log("🌐 Real API使用: ISBN登録");

          // 実際のバックエンドAPIを使用
          const response = await axios.post(
            `${API_BASE_URL}/books/register-by-isbn`,
            {
              isbn,
            }
          );

          registeredBook = response.data.book || response.data;

          set((state) => ({
            books: [...state.books, registeredBook],
            isRegisteringByISBN: false,
          }));

          console.log("✅ Real API: 書籍登録完了", registeredBook);
        }

        // ✅ 成功時は認証エラー状態をクリア
        get().clearAuthError();

        return registeredBook;
      } catch (err: any) {
        console.error("❌ ISBN書籍登録エラー:", err);

        const { message, isAuthError } = formatErrorMessage(err);

        if (isAuthError) {
          // ✅ 認証エラーの場合
          get().setAuthError(message);
          set({ isRegisteringByISBN: false });
          throw new Error("認証が必要です。再度ログインしてください。");
        } else {
          // ✅ 通常のエラーの場合
          set({
            error: message,
            isRegisteringByISBN: false,
          });
          throw new Error(message);
        }
      }
    },

    // ✅ 改良版: 書籍更新（認証エラー処理強化）
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

        // ✅ 成功時は認証エラー状態をクリア
        get().clearAuthError();
      } catch (err: any) {
        console.error("書籍更新エラー:", err);

        const { message, isAuthError } = formatErrorMessage(err);

        if (isAuthError) {
          // ✅ 認証エラーの場合
          get().setAuthError(message);
          set({ isLoading: false });
          throw new Error("認証が必要です");
        } else {
          // ✅ 通常のエラーの場合
          set({
            error: message,
            isLoading: false,
          });
          throw new Error(message);
        }
      }
    },

    // 外部API（認証不要）- 変更なし
    fetchBookByISBN: async (isbn: string) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/fetch_book/${isbn}`);
        return response.data;
      } catch (err: any) {
        const { message } = formatErrorMessage(err);
        console.error("ISBN検索エラー:", err);

        set({ error: message });
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
        const { message } = formatErrorMessage(err);
        console.error("書籍検索エラー:", err);

        set({
          error: message,
          isSearching: false,
          searchResults: [],
        });
        return [];
      }
    },
  }))
);

// デバッグ用（開発環境のみ）
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as any).bookStore = useBookStore;
}

// 修正版
if (import.meta.env.DEV) {
  const useRealAPI = import.meta.env.VITE_USE_REAL_API === 'true';  // ←文字列比較
  const useMockAPI = !useRealAPI;

  console.log('📚 BookStore バーコード機能初期化');
  console.log(`🔧 API Mode: ${useMockAPI ? 'Mock API' : 'Real API'}`);

  if (useMockAPI) {
    console.log('💡 Real APIを使用する場合: VITE_USE_REAL_API=true');
  } else {
    console.log('💡 Mock APIを使用する場合: VITE_USE_REAL_API=false');
  }
}
