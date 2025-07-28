// src/pages/RegisterPage.tsx

import { useState } from "react";
import { useBookStore } from "../stores/bookStore";
import { useAuthStore } from "../stores/authStore";
import { useNavigate } from "react-router-dom";
import type { BookCreate } from "../types/book"; // ✅ 型のインポートを追加

export const RegisterPage = () => {
  const [selectedMethod, setSelectedMethod] = useState<
    "barcode" | "ocr" | "manual" | null
  >(null);

  const { createBook, isLoading, error } = useBookStore();
  const { isAuthenticated } = useAuthStore(); // ✅ 修正: userではなくisAuthenticatedを使用
  const navigate = useNavigate();

  // 手動入力フォームの状態
  const [title, setTitle] = useState("");
  const [volume, setVolume] = useState("");
  const [author, setAuthor] = useState("");
  const [publisher, setPublisher] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [publishedDate, setPublishedDate] = useState("");

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ 修正: 認証チェック
    if (!isAuthenticated) {
      alert("書籍を登録するにはログインが必要です");
      navigate("/login");
      return;
    }

    if (
      !title ||
      !volume ||
      !author ||
      !publisher ||
      !coverImageUrl ||
      !publishedDate
    ) {
      alert("全ての項目を入力してください");
      return;
    }

    // ✅ 修正: user_idフィールドを完全に削除
    const bookData: BookCreate = {
      title,
      volume,
      author,
      publisher,
      cover_image_url: coverImageUrl,
      published_date: publishedDate,
    };

    try {
      await createBook(bookData);
      alert("書籍を登録しました！");

      // フォームをリセット
      setTitle("");
      setVolume("");
      setAuthor("");
      setPublisher("");
      setCoverImageUrl("");
      setPublishedDate("");
      setSelectedMethod(null);

      navigate("/books");
    } catch (err) {
      // エラーは既にstoreで管理されているため、追加処理は不要
      console.error("書籍登録エラー:", err);
    }
  };

  // ✅ 修正: 未認証の場合のガード
  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            書籍を追加するにはログインが必要です
          </h1>
          <p className="text-gray-600 mb-6">
            アカウントにログインして書籍管理を始めましょう
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/login")}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              ログイン
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
            >
              新規登録
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">📚 書籍を追加</h1>
        <p className="text-gray-600">書籍を追加する方法を選択してください</p>
      </div>

      {/* 方法選択カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => setSelectedMethod("barcode")}
          className={`p-6 border-2 rounded-lg text-left transition-all duration-200 ${
            selectedMethod === "barcode"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-blue-400 hover:bg-blue-50"
          }`}
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">📷</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              バーコードスキャン
            </h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            書籍のバーコード（ISBN）を読み取って自動登録
          </p>
          <div className="flex items-center text-xs text-blue-600">
            <span className="mr-1">⚡</span>
            最速で登録
          </div>
        </button>

        <button
          onClick={() => setSelectedMethod("ocr")}
          className={`p-6 border-2 rounded-lg text-left transition-all duration-200 ${
            selectedMethod === "ocr"
              ? "border-green-500 bg-green-50"
              : "border-gray-200 hover:border-green-400 hover:bg-green-50"
          }`}
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">📄</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              OCRテキスト認識
            </h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            レシートや書籍画像からテキストを抽出して登録
          </p>
          <div className="flex items-center text-xs text-green-600">
            <span className="mr-1">🎯</span>
            レシート対応
          </div>
        </button>

        <button
          onClick={() => setSelectedMethod("manual")}
          className={`p-6 border-2 rounded-lg text-left transition-all duration-200 ${
            selectedMethod === "manual"
              ? "border-purple-500 bg-purple-50"
              : "border-gray-200 hover:border-purple-400 hover:bg-purple-50"
          }`}
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">✏️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">手動入力</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            書籍情報を手動で入力して登録
          </p>
          <div className="flex items-center text-xs text-purple-600">
            <span className="mr-1">📝</span>
            確実に登録
          </div>
        </button>
      </div>

      {/* バーコードスキャン機能（開発中） */}
      {selectedMethod === "barcode" && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📷 バーコードスキャン
          </h2>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              開発中の機能
            </h3>
            <p className="text-gray-500 mb-4">
              バーコード読み取り機能は現在開発中です。しばらくお待ちください。
            </p>
            <button
              onClick={() => setSelectedMethod("manual")}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              手動入力で追加する
            </button>
          </div>
        </div>
      )}

      {/* OCR機能（開発中） */}
      {selectedMethod === "ocr" && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📄 OCRテキスト認識
          </h2>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              開発中の機能
            </h3>
            <p className="text-gray-500 mb-4">
              OCRによるレシート読み取り機能は現在開発中です。しばらくお待ちください。
            </p>
            <button
              onClick={() => setSelectedMethod("manual")}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              手動入力で追加する
            </button>
          </div>
        </div>
      )}

      {/* 手動入力フォーム */}
      {selectedMethod === "manual" && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            ✏️ 手動入力
          </h2>

          {/* ✅ 改善: エラー表示 */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-center">
                <span className="text-red-400 mr-2">❌</span>
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  タイトル <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="書籍のタイトルを入力"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  巻数・版 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="第1巻、初版など"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  著者 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="著者名を入力"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  出版社 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="出版社名を入力"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                カバー画像URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://example.com/cover.jpg"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                書籍のカバー画像のURLを入力してください
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                出版日 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={publishedDate}
                onChange={(e) => setPublishedDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  isLoading
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    登録中...
                  </div>
                ) : (
                  "📚 書籍を登録"
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedMethod(null);
                  setTitle("");
                  setVolume("");
                  setAuthor("");
                  setPublisher("");
                  setCoverImageUrl("");
                  setPublishedDate("");
                }}
                disabled={isLoading}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ヘルプセクション */}
      {!selectedMethod && (
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            💡 機能の説明
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-blue-800 mb-1">
                📷 バーコードスキャン
              </h4>
              <p className="text-blue-700">
                書籍のISBNバーコードをカメラで読み取り、Google Books
                APIから自動で書籍情報を取得します。
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-1">
                📄 OCRテキスト認識
              </h4>
              <p className="text-blue-700">
                購入レシートや書籍の写真からテキストを抽出し、書籍情報を自動で入力します。
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-1">✏️ 手動入力</h4>
              <p className="text-blue-700">
                書籍の情報を手動で入力します。確実に正確な情報を登録できます。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
