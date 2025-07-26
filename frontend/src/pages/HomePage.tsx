// src/pages/HomePage.tsx

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useBookStore } from "../stores/bookStore";

export const HomePage = () => {
  const { books, fetchBooks } = useBookStore();

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  return (
    <div className="space-y-8">
      {/* ヒーローセクション */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-white p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">📚 書籍管理PWA</h1>
          <p className="text-xl mb-6 text-blue-100">
            バーコード読み取りで簡単に書籍を管理しよう
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              📷 書籍を追加
            </Link>
            <Link
              to="/books"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-400 transition-colors"
            >
              📖 書籍一覧を見る
            </Link>
          </div>
        </div>
      </div>

      {/* 機能紹介 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">📷</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              バーコード読み取り
            </h3>
          </div>
          <p className="text-gray-600">
            書籍のバーコードを読み取って自動登録。Google Books
            APIで詳細情報を取得します。
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">📄</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              OCRレシート読み取り
            </h3>
          </div>
          <p className="text-gray-600">
            購入レシートから書籍情報を自動抽出。写真を撮るだけで簡単登録できます。
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">読書統計</h3>
          </div>
          <p className="text-gray-600">
            読書習慣を可視化。統計情報で読書ライフをより充実させましょう。
          </p>
        </div>
      </div>

      {/* 統計ダッシュボード */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <div className="w-4 h-4 bg-purple-500 rounded-full mr-3"></div>
          統計情報
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {books.length}
            </div>
            <div className="text-sm text-gray-600">総書籍数</div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">0</div>
            <div className="text-sm text-gray-600">読了済み</div>
          </div>

          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {books.length}
            </div>
            <div className="text-sm text-gray-600">積読</div>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
            <div className="text-sm text-gray-600">今月読了</div>
          </div>
        </div>
      </div>

      {/* 最近追加した書籍 */}
      {books.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
              最近追加した書籍
            </h2>
            <Link
              to="/books"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              すべて見る →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {books.slice(0, 5).map((book) => (
              <div key={book.id} className="text-center">
                <div className="aspect-[3/4] bg-gray-200 rounded-md mb-2 overflow-hidden">
                  {book.cover_image_url ? (
                    <img
                      src={book.cover_image_url}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl">📖</span>
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{book.author}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
