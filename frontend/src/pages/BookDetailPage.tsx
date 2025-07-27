// src/pages/BookDetailPage.tsx

import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useBookStore } from "../stores/bookStore";
import type { Book } from "../types/book";

export const BookDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { books, getBookById, fetchBooks } = useBookStore();
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBook = async () => {
      setIsLoading(true);

      // 書籍一覧がない場合は取得
      if (books.length === 0) {
        await fetchBooks();
      }

      // IDから書籍を検索
      if (id) {
        const foundBook = getBookById(parseInt(id));
        setBook(foundBook);
      }

      setIsLoading(false);
    };

    loadBook();
  }, [id, books, getBookById, fetchBooks]);

  if (isLoading) {
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {book.title}
                {book.volume && (
                  <span className="text-gray-600 ml-2">{book.volume}</span>
                )}
              </h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">著者:</span>
                <span className="ml-2 text-gray-900">{book.author}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">出版社:</span>
                <span className="ml-2 text-gray-900">{book.publisher}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">発行日:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(book.published_date).toLocaleDateString("ja-JP")}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">書籍ID:</span>
                <span className="ml-2 text-gray-900">#{book.id}</span>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex flex-wrap gap-3 pt-4">
              <button className="flex-1 min-w-32 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                📝 編集
              </button>
              <button className="flex-1 min-w-32 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                📚 読書開始
              </button>
              <button className="flex-1 min-w-32 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">
                🗑️ 削除
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 追加情報カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 読書進捗 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📊 読書進捗
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">ステータス:</span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                未読
              </span>
            </div>
            <div className="flex items-center justify-between">
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

// src/pages/SettingsPage.tsx

export const SettingsPage = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* ページヘッダー */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">⚙️ 設定</h1>
        <p className="text-gray-600">アプリの設定を管理します</p>
      </div>

      {/* 設定項目 */}
      <div className="space-y-6">
        {/* アカウント設定 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            👤 アカウント設定
          </h2>
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🚧</div>
            <p className="text-gray-500">ユーザー認証機能は開発中です</p>
          </div>
        </div>

        {/* 表示設定 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🎨 表示設定
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">ダークモード</h3>
                <p className="text-sm text-gray-500">暗いテーマに切り替え</p>
              </div>
              <button className="bg-gray-200 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* データ管理 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            💾 データ管理
          </h2>
          <div className="space-y-4">
            <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <span className="text-2xl mr-3">📤</span>
                <div>
                  <h3 className="font-medium text-gray-900">
                    データをエクスポート
                  </h3>
                  <p className="text-sm text-gray-500">
                    書籍データをJSONファイルで保存
                  </p>
                </div>
              </div>
            </button>

            <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <span className="text-2xl mr-3">📥</span>
                <div>
                  <h3 className="font-medium text-gray-900">
                    データをインポート
                  </h3>
                  <p className="text-sm text-gray-500">
                    JSONファイルから書籍データを復元
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* アプリ情報 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            ℹ️ アプリ情報
          </h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>バージョン</span>
              <span>v1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>技術スタック</span>
              <span>React + TypeScript + Zustand</span>
            </div>
            <div className="flex justify-between">
              <span>開発チーム</span>
              <span>5人チーム</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
