// src/pages/BookDetailPage.tsx

import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { useBookStore } from "../stores/bookStore";
import { useAuthStore } from "../stores/authStore";
import type { Book, BookUpdate } from "../types/book";

export const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchBookById, updateBookById, isLoading, error } = useBookStore();
  const { isAuthenticated } = useAuthStore();

  const [book, setBook] = useState<Book | null>(null);
  const [localLoading, setLocalLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // ✅ 新機能: 編集フォームの状態
  const [editForm, setEditForm] = useState<BookUpdate>({});

  // ✅ 修正: useCallbackで関数をメモ化
  const loadBook = useCallback(async () => {
    if (!id) return;

    // ✅ デバッグ情報を追加
    console.log("BookDetailPage - 認証状態:", isAuthenticated);
    console.log("BookDetailPage - 書籍ID:", id);

    if (!isAuthenticated) {
      console.log("BookDetailPage - 認証されていないため、書籍取得をスキップ");
      return;
    }

    setLocalLoading(true);

    const numericId = parseInt(id, 10);
    console.log("BookDetailPage - 書籍詳細を取得中:", numericId);

    const fetched = await fetchBookById(numericId);
    console.log("BookDetailPage - 取得結果:", fetched);

    setBook(fetched);
    // 編集フォームを初期化
    if (fetched) {
      setEditForm({
        title: fetched.title,
        volume: fetched.volume,
        author: fetched.author,
        publisher: fetched.publisher,
        cover_image_url: fetched.cover_image_url,
        published_date: fetched.published_date,
      });
    }
    setLocalLoading(false);
  }, [id, isAuthenticated, fetchBookById]);

  useEffect(() => {
    loadBook();
  }, [loadBook]); // ✅ loadBook関数に依存

  // ✅ 新機能: 書籍更新処理
  const handleUpdateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book) return;

    try {
      await updateBookById(book.id, editForm);

      // ローカル状態を更新
      setBook((prev) => (prev ? { ...prev, ...editForm } : null));
      setIsEditing(false);
      alert("書籍情報を更新しました！");
    } catch (err) {
      console.error("書籍更新エラー:", err);
      // エラーはstoreで管理されているため、追加処理は不要
    }
  };

  // 編集をキャンセル
  const handleCancelEdit = () => {
    if (book) {
      setEditForm({
        title: book.title,
        volume: book.volume,
        author: book.author,
        publisher: book.publisher,
        cover_image_url: book.cover_image_url,
        published_date: book.published_date,
      });
    }
    setIsEditing(false);
  };

  // ✅ 未認証の場合のガード
  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            書籍詳細を見るにはログインが必要です
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

  if (localLoading || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">書籍を読み込み中...</span>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📖</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              書籍が見つかりません
            </h1>
            <p className="text-gray-600 mb-6">
              お探しの書籍は存在しないか、アクセス権限がない可能性があります。
            </p>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
            <Link
              to="/books"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              📚 書籍一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* パンくずナビ */}
      <nav className="flex items-center text-sm text-gray-500">
        <Link to="/" className="hover:text-gray-700">
          ホーム
        </Link>
        <span className="mx-2">/</span>
        <Link to="/books" className="hover:text-gray-700">
          書籍一覧
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{book.title}</span>
      </nav>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <span className="text-red-400 mr-2">❌</span>
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* メイン詳細カード */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 書籍画像 */}
          <div className="md:col-span-1">
            <div className="aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden">
              {book.cover_image_url ? (
                <img
                  src={book.cover_image_url}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📖</div>
                    <p className="text-gray-500">カバー画像なし</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 書籍情報 */}
          <div className="md:col-span-2 space-y-4">
            {isEditing ? (
              // ✅ 編集フォーム
              <form onSubmit={handleUpdateBook} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    タイトル
                  </label>
                  <input
                    type="text"
                    value={editForm.title || ""}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      巻数・版
                    </label>
                    <input
                      type="text"
                      value={editForm.volume || ""}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          volume: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      著者
                    </label>
                    <input
                      type="text"
                      value={editForm.author || ""}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          author: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    出版社
                  </label>
                  <input
                    type="text"
                    value={editForm.publisher || ""}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        publisher: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    カバー画像URL
                  </label>
                  <input
                    type="url"
                    value={editForm.cover_image_url || ""}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        cover_image_url: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    出版日
                  </label>
                  <input
                    type="date"
                    value={editForm.published_date || ""}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        published_date: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                      isLoading
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {isLoading ? "更新中..." : "✅ 保存"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            ) : (
              // ✅ 表示モード
              <>
                <h1 className="text-3xl font-bold text-gray-900">
                  {book.title}
                  {book.volume && (
                    <span className="text-gray-600 ml-2">{book.volume}</span>
                  )}
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">著者:</span>
                    <span className="ml-2">{book.author}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">出版社:</span>
                    <span className="ml-2">{book.publisher}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">発行日:</span>
                    <span className="ml-2">
                      {new Date(book.published_date).toLocaleDateString(
                        "ja-JP"
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">書籍ID:</span>
                    <span className="ml-2">#{book.id}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 min-w-32 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    📝 編集
                  </button>
                  <button className="flex-1 min-w-32 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                    📚 読書開始
                  </button>
                  <button className="flex-1 min-w-32 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">
                    🗑️ 削除
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 読書進捗 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📊 読書進捗
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-700">ステータス:</span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                未読
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">進捗:</span>
              <span className="text-gray-900">0%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: "0%" }}
              ></div>
            </div>
          </div>
        </div>

        {/* メモ・レビュー */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📝 メモ・レビュー
          </h2>
          <div className="text-center py-8">
            <div className="text-4xl mb-2">✍️</div>
            <p className="text-gray-500">メモ機能は開発中です</p>
            <button className="mt-3 text-sm text-blue-600 hover:text-blue-800">
              メモを追加
            </button>
          </div>
        </div>
      </div>

      {/* 関連書籍 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          📚 同じ著者の書籍
        </h2>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-gray-500">関連書籍機能は開発中です</p>
        </div>
      </div>
    </div>
  );
};
