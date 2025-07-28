// src/pages/BooksPage.tsx

import { useEffect, useCallback } from "react";
import { useBookStore } from "../stores/bookStore";
import { useAuthStore } from "../stores/authStore";
import { Link } from "react-router-dom";

export const BooksPage = () => {
  // Zustandストアから状態とアクションを取得
  const { books, isLoading, error, searchQuery, fetchBooks, setSearchQuery } =
    useBookStore();

  const { isAuthenticated, isInitialized } = useAuthStore(); // ✅ isInitializedを追加

  // ✅ 修正: 認証初期化完了後にのみ書籍を取得
  const loadBooks = useCallback(async () => {
    if (isAuthenticated && isInitialized) {
      // ✅ 両方の条件をチェック
      await fetchBooks();
    }
  }, [isAuthenticated, isInitialized, fetchBooks]); // ✅ isInitializedを依存配列に追加

  useEffect(() => {
    loadBooks();
  }, [loadBooks]); // ✅ loadBooks関数に依存

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ✅ 修正: 未認証の場合の表示
  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            書籍一覧を見るにはログインが必要です
          </h1>
          <p className="text-gray-600 mb-6">
            アカウントにログインして書籍管理を始めましょう
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              ログイン
            </Link>
            <Link
              to="/signup"
              className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
            >
              新規登録
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
              書籍を検索
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
          {/* ✅ 新規追加: 書籍追加ボタン */}
          <div className="flex items-end">
            <Link
              to="/register"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors font-medium"
            >
              ➕ 書籍を追加
            </Link>
          </div>
        </div>
      </div>

      {/* 書籍一覧セクション */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
            書籍一覧
          </h2>
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
            {filteredBooks.length}冊
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-600">書籍を読み込み中...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <span className="text-red-400 mr-2">❌</span>
              <div>
                <p className="text-red-800 font-medium">{error}</p>
                <button
                  onClick={() => fetchBooks()}
                  className="text-red-600 hover:text-red-800 text-sm underline mt-1"
                >
                  再試行
                </button>
              </div>
            </div>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? "該当する書籍がありません" : "書籍がありません"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery
                ? "検索条件を変更してみてください"
                : "書籍を追加してみましょう"}
            </p>
            {!searchQuery && (
              <Link
                to="/register"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                ➕ 最初の書籍を追加
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-300"
              >
                <Link to={`/books/${book.id}`}>
                  <div className="aspect-[3/4] bg-gray-200 rounded-md mb-4 overflow-hidden hover:opacity-90 transition-opacity">
                    {book.cover_image_url ? (
                      <img
                        src={book.cover_image_url}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                          (
                            e.target as HTMLImageElement
                          ).nextElementSibling!.classList.remove("hidden");
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-full h-full flex items-center justify-center ${book.cover_image_url ? "hidden" : ""}`}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-2">📖</div>
                        <p className="text-xs text-gray-500">カバー画像なし</p>
                      </div>
                    </div>
                  </div>
                </Link>

                <div className="space-y-2">
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

                <div className="mt-4 flex space-x-2">
                  <Link
                    to={`/books/${book.id}`}
                    className="flex-1 bg-blue-600 text-white text-xs px-3 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 text-center"
                  >
                    詳細
                  </Link>
                  <Link
                    to={`/books/${book.id}`}
                    className="flex-1 bg-gray-200 text-gray-700 text-xs px-3 py-2 rounded-md hover:bg-gray-300 transition-colors duration-200 text-center"
                  >
                    編集
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">📚</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{books.length}</p>
              <p className="text-sm text-gray-600">総書籍数</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-600">読了済み（機能開発中）</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">📖</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {filteredBooks.length}
              </p>
              <p className="text-sm text-gray-600">表示中の書籍</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
