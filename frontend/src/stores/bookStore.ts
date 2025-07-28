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
        const res = await axios.get(`${API_BASE_URL}/users/${userId}/books`);
        set({ books: res.data, isLoading: false });
      } catch (err: any) {
        set({
          error: err.response?.data?.detail || "書籍の取得に失敗しました",
          isLoading: false,
        });
      }
    },

    fetchBookById: async (id: number) => {
      set({ isLoading: true, error: null });
      try {
        const res = await axios.get(`${API_BASE_URL}/books/${id}`);
        return res.data;
      } catch (err: any) {
        set({
          error: err.response?.data?.detail || "書籍の取得に失敗しました",
        });
        return null;
      } finally {
        set({ isLoading: false });
      }
    },

    createBook: async (bookData) => {
      set({ isLoading: true, error: null });
      try {
        const res = await axios.post(`${API_BASE_URL}/books`, bookData);
        set((state) => ({
          books: [...state.books, res.data],
          isLoading: false,
        }));
      } catch (err: any) {
        const detail = err.response?.data?.detail;
        const message = Array.isArray(detail)
          ? detail.map((e: any) => `${e.loc?.join(".")}: ${e.msg}`).join(" / ")
          : detail || "書籍の登録に失敗しました";
        set({
          error: message,
          isLoading: false,
        });
      }
    },

    fetchBookByISBN: async (isbn: string) => {
      try {
        const res = await axios.get(`${API_BASE_URL}/fetch_book/${isbn}`);
        return res.data;
      } catch (err: any) {
        set({
          error: err.response?.data?.detail || "ISBN取得に失敗しました",
        });
        return null;
      }
    },

    searchBooksByTitle: async (title: string) => {
      set({ isSearching: true });
      try {
        const res = await axios.get(`${API_BASE_URL}/search_book`, {
          params: { title },
        });
        set({ searchResults: res.data, isSearching: false });
        return res.data;
      } catch (err: any) {
        set({
          error:
            err.response?.data?.detail || "書籍検索に失敗しました",
          isSearching: false,
        });
        return [];
      }
    },
  }))
);
