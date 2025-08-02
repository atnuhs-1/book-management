// frontend/src/pages/AddBookPage.tsx - 書籍検索機能統合完全版

import { useState } from "react";
import { useBookStore } from "../stores/bookStore";
import { useAuthStore } from "../stores/authStore";
import { useNavigate } from "react-router-dom";
import type { BookCreate, GoogleBookInfo } from "../types/book";
import {
  GlassCard,
  GlassButton,
  GlassInput,
  GlassError,
  GlassLoading,
} from "../components/ui/GlassUI";
import { BarcodeScanner } from "../components/barcode/BarcodeScanner";

export const AddBookPage = () => {
  const [selectedMethod, setSelectedMethod] = useState<
  "barcode" | "search" | "manual" | null >(null);

  // ✅ bookStoreから機能を取得
  const {
    createBook,
    createBookByISBN,
    createBookByTitle,
    searchBooksByTitleForRegistration,
    isLoading,
    isRegisteringByISBN,
    isRegisteringByTitle,
    isTitleSearching,
    titleSearchResults,
    clearTitleSearchResults,
    error,
  } = useBookStore();

  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // 手動入力フォームの状態
  const [title, setTitle] = useState("");
  const [volume, setVolume] = useState("");
  const [author, setAuthor] = useState("");
  const [publisher, setPublisher] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [publishedDate, setPublishedDate] = useState("");

  // ✅ 書籍検索の状態
  const [searchTitle, setSearchTitle] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // ✅ バーコードスキャン成功時の処理
  const handleBarcodeSuccess = async (isbn: string) => {
    console.log("🎯 バーコードスキャン成功:", isbn);

    try {
      const registeredBook = await createBookByISBN(isbn);
      alert(`📚 「${registeredBook.title}」を登録しました！`);
      navigate("/book-list");
    } catch (error: any) {
      console.error("書籍登録エラー:", error);
      alert(`❌ 登録に失敗しました: ${error.message}`);
      const shouldRetry = confirm("手動入力で書籍を追加しますか？");
      if (shouldRetry) {
        setSelectedMethod("manual");
      } else {
        setSelectedMethod(null);
      }
    }
  };

  // ✅ 書籍検索の処理
  const handleSearchBooks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTitle.trim()) {
      alert("検索するタイトルを入力してください");
      return;
    }

    try {
      await searchBooksByTitleForRegistration(searchTitle.trim());
      setHasSearched(true);
    } catch (error: any) {
      console.error("検索エラー:", error);
      alert("検索に失敗しました。再度お試しください。");
    }
  };

  // ✅ 検索結果から書籍を登録
  const handleRegisterFromSearch = async (selectedTitle: string) => {
    if (!isAuthenticated) {
      alert("書籍を登録するにはログインが必要です");
      navigate("/login");
      return;
    }

    try {
      const registeredBook = await createBookByTitle(selectedTitle);
      alert(`📚 「${registeredBook.title}」を登録しました！`);

      // 検索状態をリセット
      setSearchTitle("");
      setHasSearched(false);
      clearTitleSearchResults();
      setSelectedMethod(null);

      navigate("/book-list");
    } catch (error: any) {
      console.error("書籍登録エラー:", error);
      alert(`❌ 登録に失敗しました: ${error.message}`);
    }
  };

  // 手動入力の処理
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

      navigate("/book-list");
    } catch (err) {
      console.error("書籍登録エラー:", err);
    }
  };

  // 未認証の場合のガード
  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto">
        <GlassCard className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-400/30 to-red-500/30 backdrop-blur-sm rounded-3xl mb-8 shadow-xl">
            <span className="text-4xl">🔒</span>
          </div>
          <h1 className="text-3xl font-light text-gray-800 mb-6">
            書籍を追加するにはログインが必要です
          </h1>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            アカウントにログインして書籍管理を始めましょう
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <GlassButton
              variant="primary"
              size="lg"
              onClick={() => navigate("/login")}
            >
              ログイン
            </GlassButton>
            <GlassButton
              variant="outline"
              size="lg"
              onClick={() => navigate("/signup")}
            >
              新規登録
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* ヘッダー */}
      <div className="text-center">
        <h1 className="text-4xl font-light text-gray-800 mb-4">
          📚 書籍を追加
        </h1>
        <p className="text-gray-600 text-lg">
          書籍を追加する方法を選択してください
        </p>
      </div>

      {/* 方法選択カード - 方法が選択されていない時のみ表示 */}
      {!selectedMethod && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ✅ バーコードスキャン */}
          <div
            className={`group cursor-pointer transition-all duration-500 ${
              selectedMethod === "barcode" ? "scale-105" : ""
            }`}
            onClick={() => setSelectedMethod("barcode")}
          >
            <div
              className={`bg-white/30 backdrop-blur-xl rounded-2xl p-6 border transition-all duration-500 ${
                selectedMethod === "barcode"
                  ? "border-blue-400/50 bg-white/50 shadow-2xl"
                  : "border-white/20 shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:bg-white/40"
              }`}
            >
              <div className="flex items-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-400/30 to-blue-500/30 backdrop-blur-sm rounded-xl mr-4 shadow-lg">
                  <span className="text-2xl">📷</span>
                </div>
                <h3 className="text-lg font-medium text-gray-800">
                  バーコードスキャン
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                書籍のバーコード（ISBN）を読み取って自動登録
              </p>
              <div className="flex items-center text-xs text-blue-600">
                <span className="mr-1">⚡</span>
                最速で登録
              </div>
            </div>
          </div>

          {/* ✅ 書籍検索 - OCRから変更 */}
          <div
            className={`group cursor-pointer transition-all duration-500 ${
              selectedMethod === "search" ? "scale-105" : ""
            }`}
            onClick={() => setSelectedMethod("search")}
          >
            <div
              className={`bg-white/30 backdrop-blur-xl rounded-2xl p-6 border transition-all duration-500 ${
                selectedMethod === "search"
                  ? "border-green-400/50 bg-white/50 shadow-2xl"
                  : "border-white/20 shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:bg-white/40"
              }`}
            >
              <div className="flex items-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-400/30 to-green-500/30 backdrop-blur-sm rounded-xl mr-4 shadow-lg">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="text-lg font-medium text-gray-800">書籍検索</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                書籍のタイトルを検索して候補から選択して登録
              </p>
              <div className="flex items-center text-xs text-green-600">
                <span className="mr-1">🎯</span>
                簡単検索
              </div>
            </div>
          </div>

          {/* 手動入力 */}
          <div
            className={`group cursor-pointer transition-all duration-500 ${
              selectedMethod === "manual" ? "scale-105" : ""
            }`}
            onClick={() => setSelectedMethod("manual")}
          >
            <div
              className={`bg-white/30 backdrop-blur-xl rounded-2xl p-6 border transition-all duration-500 ${
                selectedMethod === "manual"
                  ? "border-purple-400/50 bg-white/50 shadow-2xl"
                  : "border-white/20 shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:bg-white/40"
              }`}
            >
              <div className="flex items-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-400/30 to-purple-500/30 backdrop-blur-sm rounded-xl mr-4 shadow-lg">
                  <span className="text-2xl">✏️</span>
                </div>
                <h3 className="text-lg font-medium text-gray-800">手動入力</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                書籍情報を手動で入力して登録
              </p>
              <div className="flex items-center text-xs text-purple-600">
                <span className="mr-1">📝</span>
                確実に登録
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ バーコードスキャン機能 */}
      {selectedMethod === "barcode" && (
        <BarcodeScanner
          onISBNDetected={handleBarcodeSuccess}
          onClose={() => setSelectedMethod(null)}
          title="📷 バーコードスキャン"
          subtitle="書籍のISBNバーコードをカメラに向けてください"
        />
      )}

      {/* ✅ 書籍検索機能 - OCRから変更 */}
      {selectedMethod === "search" && (
        <GlassCard className="p-8">
          <h2 className="text-2xl font-light text-gray-800 mb-6 flex items-center">
            <span className="mr-3">🔍</span>
            書籍検索
          </h2>

          {/* エラー表示 */}
          {error && <GlassError message={error} />}

          {/* 検索フォーム - 常に表示で連続検索可能 */}
          <form onSubmit={handleSearchBooks} className="space-y-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                書籍タイトル <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <GlassInput
                    type="text"
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                    placeholder="検索したい書籍のタイトルを入力"
                    disabled={isTitleSearching}
                  />
                </div>
                {/* ✅ 入力リセットボタン */}
                {searchTitle && (
                  <GlassButton
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSearchTitle("");
                      setHasSearched(false);
                      clearTitleSearchResults();
                    }}
                    disabled={isTitleSearching}
                    className="px-3"
                  >
                    ✕
                  </GlassButton>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                例: 「ハリーポッター」「Python」「料理本」など
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <GlassButton
                variant="primary"
                type="submit"
                size="lg"
                className="flex-1"
                disabled={isTitleSearching || !searchTitle.trim()}
              >
                {isTitleSearching ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    検索中...
                  </div>
                ) : (
                  "🔍 書籍を検索"
                )}
              </GlassButton>

              <GlassButton
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => {
                  setSelectedMethod(null);
                  setSearchTitle("");
                  setHasSearched(false);
                  clearTitleSearchResults();
                }}
                disabled={isTitleSearching}
              >
                戻る
              </GlassButton>
            </div>
          </form>

          {/* 検索結果 */}
          {hasSearched && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-light text-gray-800">
                  「{searchTitle}」の検索結果 ({titleSearchResults.length}件)
                </h3>
                <GlassButton
                  variant="outline"
                  onClick={() => {
                    setHasSearched(false);
                    clearTitleSearchResults();
                  }}
                >
                  結果をクリア
                </GlassButton>
              </div>

              {titleSearchResults.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-400/30 to-gray-500/30 backdrop-blur-sm rounded-3xl mb-8 shadow-xl">
                    <span className="text-4xl">😔</span>
                  </div>
                  <h3 className="text-xl font-light text-gray-800 mb-4">
                    検索結果が見つかりませんでした
                  </h3>
                  <p className="text-gray-600 mb-8 leading-relaxed max-w-md mx-auto">
                    「{searchTitle}
                    」に一致する書籍が見つかりませんでした。別のキーワードで検索してみてください。
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <GlassButton
                      variant="primary"
                      onClick={() => {
                        setHasSearched(false);
                        clearTitleSearchResults();
                      }}
                    >
                      別のキーワードで検索
                    </GlassButton>
                    <GlassButton
                      variant="outline"
                      onClick={() => setSelectedMethod("manual")}
                    >
                      手動入力で追加
                    </GlassButton>
                  </div>
                </div>
              ) : (
                <div className="grid gap-6">
                  {titleSearchResults.map(
                    (book: GoogleBookInfo, index: number) => (
                      <div
                        key={index}
                        className="bg-white/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-green-400/50 transition-all duration-300 hover:shadow-xl group"
                      >
                        <div className="flex flex-col md:flex-row gap-4">
                          {/* 書籍カバー */}
                          <div className="flex-shrink-0">
                            <img
                              src={
                                book.cover_image_url ||
                                "https://via.placeholder.com/120x180?text=No+Image"
                              }
                              alt={book.title}
                              className="w-24 h-36 object-cover rounded-lg shadow-lg"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "https://via.placeholder.com/120x180?text=No+Image";
                              }}
                            />
                          </div>

                          {/* 書籍情報 */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-lg font-medium text-gray-800 mb-2 line-clamp-2">
                              {book.title}
                            </h4>
                            <div className="space-y-1 text-sm text-gray-600">
                              <p>
                                <span className="font-medium">著者:</span>{" "}
                                {Array.isArray(book.author)
                                  ? book.author.join(", ")
                                  : book.author || "不明"}
                              </p>
                              <p>
                                <span className="font-medium">出版社:</span>{" "}
                                {book.publisher || "不明"}
                              </p>
                              <p>
                                <span className="font-medium">出版日:</span>{" "}
                                {book.published_date || "不明"}
                              </p>
                            </div>
                          </div>

                          {/* 登録ボタン */}
                          <div className="flex-shrink-0 flex items-center">
                            <GlassButton
                              variant="primary"
                              onClick={() =>
                                handleRegisterFromSearch(book.title)
                              }
                              disabled={isRegisteringByTitle}
                              className="w-full md:w-auto"
                            >
                              {isRegisteringByTitle ? (
                                <div className="flex items-center">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  登録中...
                                </div>
                              ) : (
                                "📚 この書籍を登録"
                              )}
                            </GlassButton>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          )}
        </GlassCard>
      )}

      {/* 手動入力フォーム */}
      {selectedMethod === "manual" && (
        <GlassCard className="p-8">
          <h2 className="text-2xl font-light text-gray-800 mb-6 flex items-center">
            <span className="mr-3">✏️</span>
            手動入力
          </h2>

          {/* エラー表示 */}
          {error && <GlassError message={error} />}

          {/* ローディング状態 */}
          {isLoading && <GlassLoading message="書籍を登録中..." />}

          <form onSubmit={handleManualSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  タイトル <span className="text-red-500">*</span>
                </label>
                <GlassInput
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="書籍のタイトルを入力"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  巻数・版 <span className="text-red-500">*</span>
                </label>
                <GlassInput
                  type="text"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  placeholder="第1巻、初版など"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  著者 <span className="text-red-500">*</span>
                </label>
                <GlassInput
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="著者名を入力"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  出版社 <span className="text-red-500">*</span>
                </label>
                <GlassInput
                  type="text"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  placeholder="出版社名を入力"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カバー画像URL <span className="text-red-500">*</span>
              </label>
              <GlassInput
                type="url"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://example.com/cover.jpg"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-2">
                書籍のカバー画像のURLを入力してください
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                出版日 <span className="text-red-500">*</span>
              </label>
              <GlassInput
                type="date"
                value={publishedDate}
                onChange={(e) => setPublishedDate(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <GlassButton
                variant="primary"
                size="lg"
                className="flex-1"
                disabled={isLoading}
                onClick={() => {}}
              >
                {isLoading ? "登録中..." : "📚 書籍を登録"}
              </GlassButton>

              <GlassButton
                variant="secondary"
                size="lg"
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
              >
                キャンセル
              </GlassButton>
            </div>
          </form>
        </GlassCard>
      )}

      {/* ヘルプセクション */}
      {!selectedMethod && (
        <GlassCard className="p-8">
          <h3 className="text-2xl font-light text-gray-800 mb-6 flex items-center">
            <span className="mr-3">💡</span>
            機能の説明
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400/30 to-blue-500/30 backdrop-blur-sm rounded-2xl mb-4 shadow-lg">
                <span className="text-2xl">📷</span>
              </div>
              <h4 className="font-medium text-gray-800 mb-2">
                バーコードスキャン
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                書籍のISBNバーコードをカメラで読み取り、Google Books
                APIから自動で書籍情報を取得します。
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400/30 to-green-500/30 backdrop-blur-sm rounded-2xl mb-4 shadow-lg">
                <span className="text-2xl">🔍</span>
              </div>
              <h4 className="font-medium text-gray-800 mb-2">書籍検索</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                書籍のタイトルでGoogle Books
                APIを検索し、候補一覧から選択して登録します。
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400/30 to-purple-500/30 backdrop-blur-sm rounded-2xl mb-4 shadow-lg">
                <span className="text-2xl">✏️</span>
              </div>
              <h4 className="font-medium text-gray-800 mb-2">手動入力</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                書籍の情報を手動で入力します。確実に正確な情報を登録できます。
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* ✅ バーコードスキャン中の全画面ローディング */}
      {isRegisteringByISBN && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <GlassCard className="p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
              <h3 className="text-xl font-light text-gray-800 mb-4">
                📚 書籍を登録しています...
              </h3>
              <p className="text-gray-600 text-sm">
                Google Books APIから書籍情報を取得中です
              </p>
            </div>
          </GlassCard>
        </div>
      )}

      {/* ✅ 書籍検索登録中の全画面ローディング */}
      {isRegisteringByTitle && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <GlassCard className="p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-6"></div>
              <h3 className="text-xl font-light text-gray-800 mb-4">
                📚 書籍を登録しています...
              </h3>
              <p className="text-gray-600 text-sm">
                選択された書籍を登録中です
              </p>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
