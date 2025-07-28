// src/pages/RegisterPage.tsx
import { useState } from "react";
import { useBookStore } from "../stores/bookStore";
import { useAuthStore } from "../stores/authStore"; // ✅ 追加
import { useNavigate } from "react-router-dom";     // ✅ 追加

export const RegisterPage = () => {
  const [selectedMethod, setSelectedMethod] = useState<
    "barcode" | "ocr" | "manual" | null
  >(null);

  const { createBook, isLoading, error } = useBookStore();
  const { user } = useAuthStore(); // ✅ ログインユーザーを取得
  const navigate = useNavigate();  // ✅ 登録完了後に遷移

  // 手動入力フォームの状態
  const [title, setTitle] = useState("");
  const [volume, setVolume] = useState("");
  const [author, setAuthor] = useState("");
  const [publisher, setPublisher] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [publishedDate, setPublishedDate] = useState("");

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("書籍を登録するにはログインが必要です");
      return;
    }

    if (!title || !volume || !author || !publisher || !coverImageUrl || !publishedDate) {
      alert("全ての項目を入力してください");
      return;
    }

    const bookData = {
      title,
      volume,
      author,
      publisher,
      cover_image_url: coverImageUrl,
      published_date: publishedDate,
      user_id: user.id, // ✅ 必須フィールド
    };

    try {
      await createBook(bookData);
      alert("書籍を登録しました！");
      navigate("/books"); // ✅ 登録後に一覧へ遷移
    } catch {
      alert("書籍の登録に失敗しました");
    }
  };

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
            <h3 className="text-lg font-semibold text-gray-900">バーコードスキャン</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">書籍のバーコード（ISBN）を読み取って自動登録</p>
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
            <h3 className="text-lg font-semibold text-gray-900">OCRテキスト認識</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">レシートや書籍画像からテキストを抽出して登録</p>
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
          <p className="text-sm text-gray-600 mb-4">書籍情報を手動で入力して登録</p>
          <div className="flex items-center text-xs text-purple-600">
            <span className="mr-1">📝</span>
            確実に登録
          </div>
        </button>
      </div>

      {/* 手動入力フォーム */}
      {selectedMethod === "manual" && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">✏️ 手動入力</h2>
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">タイトル *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">巻数 *</label>
              <input
                type="text"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">著者 *</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">出版社 *</label>
              <input
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">カバー画像URL *</label>
              <input
                type="text"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">出版日 *</label>
              <input
                type="date"
                value={publishedDate}
                onChange={(e) => setPublishedDate(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? "登録中..." : "登録する"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
