// frontend/src/pages/WishlistPage.tsx - ウィッシュリスト機能

import { useState } from "react";
import { useBookStore } from "../stores/bookStore";
import { useAuthStore } from "../stores/authStore";
import { useNavigate } from "react-router-dom";
import type { GoogleBookInfo } from "../types/book";
import {
  GlassCard,
  GlassButton,
  GlassInput,
  GlassError,
  GlassLoading,
} from "../components/ui/GlassUI";
import { PLACEHOLDER_IMAGE } from "../constants/images";

export const WishlistPage = () => {
  // ✅ bookStoreから検索機能とウィッシュリスト機能を取得
  const {
    searchBooksByTitleForRegistration,
    isTitleSearching,
    titleSearchResults,
    clearTitleSearchResults,
    addToWishlist,
    isRegisteringToWishlist,
    error,
    wishlistError,
  } = useBookStore();

  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // ✅ ウィッシュリスト検索の状態
  const [searchTitle, setSearchTitle] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  // ✅ 書籍検索の処理（AddBookPageと同じ）
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

  // ✅ ウィッシュリストに追加する処理
  const handleAddToWishlist = async (book: GoogleBookInfo) => {
    if (!isAuthenticated) {
      alert("ウィッシュリストに追加するにはログインが必要です");
      navigate("/login");
      return;
    }

    try {
      // ✅ GoogleBookInfoをバックエンドが期待する形式に変換
      const bookData = {
        title: book.title,
        authors: book.authors || [],
        publisher: book.publisher,
        cover_image_url: book.cover_image_url,
        published_date: book.published_date,
      };

      const registeredBook = await addToWishlist(bookData);
      alert(`📚 「${registeredBook.title}」をウィッシュリストに追加しました！`);

      // 検索状態をリセット
      setSearchTitle("");
      setHasSearched(false);
      clearTitleSearchResults();
      setImageErrors({});

      // ウィッシュリスト一覧に遷移（実装されている場合）
      // navigate("/book-list?filter=wishlist");
    } catch (error: any) {
      console.error("ウィッシュリスト追加エラー:", error);
      alert(`❌ 追加に失敗しました: ${error.message}`);
    }
  };

  // 未認証の場合のガード
  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto">
        <GlassCard className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-400/30 to-purple-500/30 backdrop-blur-sm rounded-3xl mb-8 shadow-xl">
            <span className="text-4xl">💜</span>
          </div>
          <h1 className="text-3xl font-light text-gray-800 mb-6">
            ウィッシュリストを利用するにはログインが必要です
          </h1>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            アカウントにログインして欲しい書籍をウィッシュリストに追加しましょう
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
          💜 ウィッシュリスト
        </h1>
        <p className="text-gray-600 text-lg">
          欲しい書籍を検索してウィッシュリストに追加しましょう
        </p>
      </div>

      {/* メイン検索カード */}
      <GlassCard className="p-8">
        <h2 className="text-2xl font-light text-gray-800 mb-6 flex items-center">
          <span className="mr-3">🔍</span>
          書籍検索
        </h2>

        {/* エラー表示 */}
        {(error || wishlistError) && (
          <GlassError message={error || wishlistError || ""} />
        )}

        {/* 検索フォーム */}
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
                  placeholder="ウィッシュリストに追加したい書籍のタイトルを入力"
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
                    setImageErrors({});
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
              onClick={() => navigate("/book-list")}
              disabled={isTitleSearching}
            >
              書籍一覧に戻る
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
                  setImageErrors({});
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
                <GlassButton
                  variant="primary"
                  onClick={() => {
                    setHasSearched(false);
                    clearTitleSearchResults();
                  }}
                >
                  別のキーワードで検索
                </GlassButton>
              </div>
            ) : (
              <div className="grid gap-6">
                {titleSearchResults.map(
                  (book: GoogleBookInfo, index: number) => (
                    <div
                      key={index}
                      className="bg-white/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-purple-400/50 transition-all duration-300 hover:shadow-xl group"
                    >
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* 書籍カバー */}
                        <div className="flex-shrink-0">
                          <img
                            src={
                              imageErrors[index] || !book.cover_image_url
                                ? PLACEHOLDER_IMAGE
                                : book.cover_image_url
                            }
                            alt={book.title}
                            className="w-24 h-36 object-cover rounded-lg shadow-lg"
                            onError={() => {
                              if (!imageErrors[index]) {
                                setImageErrors((prev) => ({
                                  ...prev,
                                  [index]: true,
                                }));
                              }
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

                        {/* ウィッシュリスト追加ボタン */}
                        <div className="flex-shrink-0 flex items-center">
                          <GlassButton
                            variant="primary"
                            onClick={() => handleAddToWishlist(book)}
                            disabled={isRegisteringToWishlist}
                            className="w-full md:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                          >
                            {isRegisteringToWishlist ? (
                              <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                追加中...
                              </div>
                            ) : (
                              "💜 ウィッシュリストに追加"
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

      {/* ヘルプセクション */}
      <GlassCard className="p-8">
        <h3 className="text-2xl font-light text-gray-800 mb-6 flex items-center">
          <span className="mr-3">💡</span>
          ウィッシュリストについて
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400/30 to-purple-500/30 backdrop-blur-sm rounded-2xl mb-4 shadow-lg">
              <span className="text-2xl">🔍</span>
            </div>
            <h4 className="font-medium text-gray-800 mb-2">書籍を検索</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              欲しい書籍のタイトルで検索し、Google Books
              APIから候補を表示します。
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-400/30 to-pink-500/30 backdrop-blur-sm rounded-2xl mb-4 shadow-lg">
              <span className="text-2xl">💜</span>
            </div>
            <h4 className="font-medium text-gray-800 mb-2">
              ウィッシュリストに追加
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              気になる書籍をウィッシュリストに追加して、後で購入検討できます。
            </p>
          </div>
        </div>
      </GlassCard>

      {/* ✅ ウィッシュリスト追加中の全画面ローディング */}
      {isRegisteringToWishlist && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <GlassCard className="p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-6"></div>
              <h3 className="text-xl font-light text-gray-800 mb-4">
                💜 ウィッシュリストに追加しています...
              </h3>
              <p className="text-gray-600 text-sm">
                選択された書籍をウィッシュリストに追加中です
              </p>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
