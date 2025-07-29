import { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "../stores/authStore";
import type { Book, BookCreate } from "../types/book";

export const WishlistPage = () => {
  const { token } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [wishlist, setWishlist] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    try {
      const res = await axios.get("/api/me/books", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(res.data)) {
        setWishlist(res.data);
      } else {
        setWishlist([]);
      }
    } catch (err) {
      console.error("ウィッシュリストの取得に失敗しました", err);
      setWishlist([]);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const res = await axios.get("/api/search_book", {
        params: { title: searchQuery },
      });
      setSearchResults(Array.isArray(res.data.books) ? res.data.books : []);
    } catch (err) {
      console.error("検索に失敗しました", err);
      setSearchResults([]);
    }
  };

  const handleAddToWishlist = async (book: BookCreate) => {
    try {
      const res = await axios.post("/api/books", book, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlist((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("ウィッシュリストへの登録に失敗しました", err);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <div className="space-y-8">
      {/* 検索セクション */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              本を検索
            </label>
            <input
              id="search"
              type="text"
              placeholder="タイトルや著者名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors font-medium"
            >
              🔍 検索
            </button>
          </div>
        </div>
      </div>

      {/* 検索結果セクション */}
      {searchResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <div className="w-4 h-4 bg-indigo-500 rounded-full mr-3"></div>
            検索結果
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((book) => (
              <div
                key={book.title + book.author}
                className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-300"
              >
                <div className="aspect-[3/4] bg-gray-200 rounded-md mb-4 overflow-hidden">
                  {book.cover_image_url ? (
                    <img
                      src={book.cover_image_url}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl">📖</span>
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-tight">
                  {book.title}
                </h3>
                <p className="text-xs text-gray-600">{book.author}</p>
                <p className="text-xs text-gray-500">{book.publisher}</p>
                <p className="text-xs text-gray-400">{book.published_date}</p>
                <button
                  onClick={() => handleAddToWishlist(book)}
                  className="mt-2 text-sm text-blue-600 hover:underline"
                >
                  ➕ ウィッシュリストに追加
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 登録済みウィッシュリスト */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
          登録済みのウィッシュリスト
        </h2>

        {wishlist.length === 0 ? (
          <div className="text-center text-gray-500">まだ登録がありません。</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((book) => (
              <div
                key={book.id}
                className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-300"
              >
                <div className="aspect-[3/4] bg-gray-200 rounded-md mb-4 overflow-hidden">
                  {book.cover_image_url ? (
                    <img
                      src={book.cover_image_url}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl">📖</span>
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-tight">
                  {book.title}
                  {book.volume && (
                    <span className="text-gray-600"> {book.volume}</span>
                  )}
                </h3>
                <p className="text-xs text-gray-600">{book.author}</p>
                <p className="text-xs text-gray-500">{book.publisher}</p>
                <p className="text-xs text-gray-400">
                  {new Date(book.published_date).getFullYear()}年
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
