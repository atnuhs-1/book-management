// src/pages/BookDetailPage.tsx

import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useBookStore } from "../stores/bookStore";
import type { Book } from "../types/book";

export const BookDetailPage = () => {
  const { id } = useParams();
  const { fetchBookById, isLoading, error } = useBookStore();
  const [book, setBook] = useState<Book | null>(null);
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    const loadBook = async () => {
      if (!id) return;
      setLocalLoading(true);

      const numericId = parseInt(id, 10);
      const fetched = await fetchBookById(numericId);

      setBook(fetched);
      setLocalLoading(false);
    };

    loadBook();
  }, [id, fetchBookById]);

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
              お探しの書籍は存在しないか、削除された可能性があります。
            </p>
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
        <Link to="/" className="hover:text-gray-700">ホーム</Link>
        <span className="mx-2">/</span>
        <Link to="/books" className="hover:text-gray-700">書籍一覧</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{book.title}</span>
      </nav>

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
            <h1 className="text-3xl font-bold text-gray-900">
              {book.title}
              {book.volume && (
                <span className="text-gray-600 ml-2">{book.volume}</span>
              )}
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div><span className="font-medium text-gray-700">著者:</span><span className="ml-2">{book.author}</span></div>
              <div><span className="font-medium text-gray-700">出版社:</span><span className="ml-2">{book.publisher}</span></div>
              <div><span className="font-medium text-gray-700">発行日:</span><span className="ml-2">{new Date(book.published_date).toLocaleDateString("ja-JP")}</span></div>
              <div><span className="font-medium text-gray-700">書籍ID:</span><span className="ml-2">#{book.id}</span></div>
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              <button className="flex-1 min-w-32 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">📝 編集</button>
              <button className="flex-1 min-w-32 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">📚 読書開始</button>
              <button className="flex-1 min-w-32 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">🗑️ 削除</button>
            </div>
          </div>
        </div>
      </div>

      {/* 読書進捗 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 読書進捗</h2>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-gray-700">ステータス:</span><span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">未読</span></div>
            <div className="flex justify-between"><span className="text-gray-700">進捗:</span><span className="text-gray-900">0%</span></div>
            <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: "0%" }}></div></div>
          </div>
        </div>

        {/* メモ・レビュー */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📝 メモ・レビュー</h2>
          <div className="text-center py-8">
            <div className="text-4xl mb-2">✍️</div>
            <p className="text-gray-500">メモ機能は開発中です</p>
            <button className="mt-3 text-sm text-blue-600 hover:text-blue-800">メモを追加</button>
          </div>
        </div>
      </div>

      {/* 関連書籍 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">📚 同じ著者の書籍</h2>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-gray-500">関連書籍機能は開発中です</p>
        </div>
      </div>
    </div>
  );
};
