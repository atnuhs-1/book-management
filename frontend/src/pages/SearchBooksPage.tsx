// frontend/src/pages/SearchBooksPage.tsx - errorFormatter対応版

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
} from "../components/ui/GlassUI";
import { PLACEHOLDER_IMAGE } from "../constants/images";

// ✅ errorFormatterをインポート
import {
  formatBookError,
  categorizeError,
  logError,
} from "../utils/errorFormatter";

export const SearchBooksPage = () => {
  // bookStoreから必要な機能を取得
  const {
    searchBooksByTitleForRegistration,
    createBookByTitle,
    addToWishlist,
    isTitleSearching,
    isRegisteringByTitle,
    isRegisteringToWishlist,
    titleSearchResults,
    clearTitleSearchResults,
    error,
    wishlistError,
  } = useBookStore();

  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // 検索とUI状態管理
  const [searchTitle, setSearchTitle] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  // ✅ ローカルエラー状態の追加
  const [searchError, setSearchError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [wishlistAddError, setWishlistAddError] = useState<string | null>(null);

  // ✅ 改善された書籍検索処理
  const handleSearchBooks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTitle.trim()) {
      setSearchError("検索するタイトルを入力してください");
      return;
    }

    // エラー状態をクリア
    setSearchError(null);

    try {
      await searchBooksByTitleForRegistration(searchTitle.trim());
      setHasSearched(true);
    } catch (error: unknown) {
      console.error("検索エラー:", error);

      // ✅ errorFormatterを使用した詳細エラーハンドリング
      const errorResult = formatBookError(error);
      const category = categorizeError(error);
      logError(error, "SearchBooksPage.handleSearchBooks");

      // エラーの種類に応じたメッセージ表示
      let userMessage = errorResult.message;

      if (category.type === "network") {
        userMessage =
          "インターネット接続を確認してください。検索を再試行できます。";
      } else if (category.type === "server") {
        userMessage =
          "サーバーで問題が発生しています。しばらく待ってから再試行してください。";
      } else if (category.severity === "high") {
        userMessage = `検索に失敗しました: ${errorResult.message}`;
      }

      setSearchError(userMessage);

      // リトライ可能なエラーの場合は自動リトライのオプション表示
      if (category.retryable) {
        // UIでリトライボタンを表示するためのフラグなど
        console.log("リトライ可能なエラー:", category.action);
      }
    }
  };

  // ✅ 改善された書籍登録処理
  const handleRegisterBook = async (selectedTitle: string) => {
    if (!isAuthenticated) {
      setRegisterError("書籍を登録するにはログインが必要です");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    // エラー状態をクリア
    setRegisterError(null);

    try {
      const registeredBook = await createBookByTitle(selectedTitle);

      // ✅ 成功時の改善されたフィードバック
      const successMessage = `📚 「${registeredBook.title}」を所有書籍として登録しました！`;

      // より良いUX: アラートの代わりにトースト通知などを使用
      // showSuccessToast(successMessage);
      alert(successMessage); // 一時的にアラートを使用

      // 成功後の状態管理
      setRegisterError(null);
    } catch (error: unknown) {
      console.error("書籍登録エラー:", error);

      // ✅ errorFormatterを使用した詳細エラーハンドリング
      const errorResult = formatBookError(error);
      const category = categorizeError(error);
      logError(error, "SearchBooksPage.handleRegisterBook");

      // 認証エラーの特別処理
      if (errorResult.isAuthError) {
        setRegisterError(
          "セッションが期限切れです。再度ログインしてください。"
        );
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      // エラーカテゴリに応じたメッセージ
      let userMessage = errorResult.message;

      if (category.type === "validation") {
        userMessage = `登録データに問題があります: ${errorResult.message}`;
      } else if (category.type === "server") {
        userMessage =
          "サーバーエラーが発生しました。しばらく待ってから再試行してください。";
      } else if (errorResult.status === 409) {
        userMessage = "この書籍は既に登録されています。";
      }

      setRegisterError(userMessage);

      // 重要なエラーの場合はアラートも表示
      if (category.severity === "high") {
        alert(`❌ 登録に失敗しました: ${userMessage}`);
      }
    }
  };

  // ✅ 改善されたウィッシュリスト追加処理
  const handleAddToWishlist = async (book: GoogleBookInfo) => {
    if (!isAuthenticated) {
      setWishlistAddError("ウィッシュリストに追加するにはログインが必要です");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    // エラー状態をクリア
    setWishlistAddError(null);

    try {
      const registeredBook = await addToWishlist(book);

      // ✅ 成功時の改善されたフィードバック
      const successMessage = `💜 「${registeredBook.title}」をウィッシュリストに追加しました！`;

      // showSuccessToast(successMessage);
      alert(successMessage); // 一時的にアラートを使用

      setWishlistAddError(null);
    } catch (error: unknown) {
      console.error("ウィッシュリスト追加エラー:", error);

      // ✅ errorFormatterを使用した詳細エラーハンドリング
      const errorResult = formatBookError(error);
      const category = categorizeError(error);
      logError(error, "SearchBooksPage.handleAddToWishlist");

      // 認証エラーの特別処理
      if (errorResult.isAuthError) {
        setWishlistAddError(
          "セッションが期限切れです。再度ログインしてください。"
        );
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      // エラーカテゴリに応じたメッセージ
      let userMessage = errorResult.message;

      if (category.type === "validation") {
        userMessage = `書籍データに問題があります: ${errorResult.message}`;
      } else if (category.type === "server") {
        userMessage =
          "サーバーエラーが発生しました。しばらく待ってから再試行してください。";
      } else if (errorResult.status === 409) {
        userMessage = "この書籍は既にウィッシュリストに追加されています。";
      }

      setWishlistAddError(userMessage);

      // 重要なエラーの場合はアラートも表示
      if (category.severity === "high") {
        alert(`❌ 追加に失敗しました: ${userMessage}`);
      }
    }
  };

  // ✅ エラー状態をクリアする関数
  const clearErrors = () => {
    setSearchError(null);
    setRegisterError(null);
    setWishlistAddError(null);
  };

  // 検索状態をリセット
  const handleResetSearch = () => {
    setSearchTitle("");
    setHasSearched(false);
    clearTitleSearchResults();
    setImageErrors({});
    clearErrors(); // ✅ エラー状態もクリア
  };

  // ✅ 統合されたエラー表示関数
  const renderErrors = () => {
    const errors = [
      error,
      wishlistError,
      searchError,
      registerError,
      wishlistAddError,
    ].filter(Boolean);

    if (errors.length === 0) return null;

    return (
      <div className="space-y-2">
        {errors.map((errorMsg, index) => (
          <GlassError key={index} message={errorMsg!} onRetry={clearErrors} />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* メイン検索カード */}
      <GlassCard className="p-8">
        <h2 className="text-2xl font-light text-gray-800 mb-6 flex items-center">
          <span className="mr-3">🔍</span>
          書籍検索
        </h2>

        {/* ✅ 改善されたエラー表示 */}
        {renderErrors()}

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
                  onChange={(e) => {
                    setSearchTitle(e.target.value);
                    // ✅ 入力時にエラーをクリア
                    if (searchError) setSearchError(null);
                  }}
                  placeholder="検索したい書籍のタイトルを入力"
                  disabled={isTitleSearching}
                />
              </div>
              {/* リセットボタン */}
              {searchTitle && (
                <GlassButton
                  type="button"
                  variant="outline"
                  onClick={handleResetSearch}
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

        {/* ✅ 検索エラーの場合のリトライボタン */}
        {searchError && (
          <div className="mb-6 p-4 bg-yellow-50/50 backdrop-blur-sm rounded-xl border border-yellow-200/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-yellow-600 mr-2">⚠️</span>
                <span className="text-yellow-800 text-sm">
                  検索でエラーが発生しました
                </span>
              </div>
              <GlassButton
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchError(null);
                  handleSearchBooks({
                    preventDefault: () => {},
                  } as React.FormEvent);
                }}
                disabled={isTitleSearching}
              >
                🔄 再試行
              </GlassButton>
            </div>
          </div>
        )}

        {/* 検索結果（既存のコードと同じ） */}
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
                  clearErrors(); // ✅ エラー状態もクリア
                }}
              >
                結果をクリア
              </GlassButton>
            </div>

            {/* ✅ 個別のエラー表示も追加 */}
            {(registerError || wishlistAddError) && (
              <div className="space-y-2">
                {registerError && (
                  <div className="p-3 bg-red-50/50 backdrop-blur-sm rounded-lg border border-red-200/30">
                    <span className="text-red-800 text-sm">
                      📚 登録エラー: {registerError}
                    </span>
                  </div>
                )}
                {wishlistAddError && (
                  <div className="p-3 bg-purple-50/50 backdrop-blur-sm rounded-lg border border-purple-200/30">
                    <span className="text-purple-800 text-sm">
                      💜 ウィッシュリストエラー: {wishlistAddError}
                    </span>
                  </div>
                )}
              </div>
            )}

            {titleSearchResults.length === 0 ? (
              // 検索結果なしの表示（既存と同じ）
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
                    clearErrors();
                  }}
                >
                  別のキーワードで検索
                </GlassButton>
              </div>
            ) : (
              // 検索結果の表示（既存のコードと同じ）
              <div className="grid gap-6">
                {titleSearchResults.map(
                  (book: GoogleBookInfo, index: number) => (
                    <div
                      key={index}
                      className="bg-white/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-blue-400/50 transition-all duration-300 hover:shadow-xl group"
                    >
                      {/* 書籍カードの内容は既存と同じ */}
                      <div className="flex flex-col lg:flex-row gap-4">
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
                              {Array.isArray(book.authors)
                                ? book.authors.join(", ")
                                : book.authors || "不明"}
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

                        {/* アクションボタン群 */}
                        <div className="flex-shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3 items-stretch">
                          {/* 書籍登録ボタン */}
                          <GlassButton
                            variant="primary"
                            onClick={() => {
                              // ✅ エラー状態をクリアしてから実行
                              setRegisterError(null);
                              handleRegisterBook(book.title);
                            }}
                            disabled={
                              isRegisteringByTitle || isRegisteringToWishlist
                            }
                            className="w-full lg:w-40 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                          >
                            {isRegisteringByTitle ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                登録中...
                              </div>
                            ) : (
                              <div className="flex items-center justify-center">
                                <span className="mr-1">📚</span>
                                所有書籍に登録
                              </div>
                            )}
                          </GlassButton>

                          {/* ウィッシュリスト追加ボタン */}
                          <GlassButton
                            variant="primary"
                            onClick={() => {
                              // ✅ エラー状態をクリアしてから実行
                              setWishlistAddError(null);
                              handleAddToWishlist(book);
                            }}
                            disabled={
                              isRegisteringByTitle || isRegisteringToWishlist
                            }
                            className="w-full lg:w-40 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                          >
                            {isRegisteringToWishlist ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                追加中...
                              </div>
                            ) : (
                              <div className="flex items-center justify-center">
                                <span className="mr-1">💜</span>
                                ウィッシュリストに追加
                              </div>
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

      {/* 認証が必要な場合の説明 */}
      {!isAuthenticated && (
        <GlassCard className="p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400/30 to-amber-500/30 backdrop-blur-sm rounded-2xl mb-4 shadow-lg">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="text-xl font-light text-gray-800 mb-4">
              書籍の登録・追加にはログインが必要です
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              検索はどなたでもご利用いただけますが、書籍の登録やウィッシュリストへの追加にはアカウントが必要です
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
          </div>
        </GlassCard>
      )}

      {/* ヘルプセクション */}
      <GlassCard className="p-8">
        <h3 className="text-2xl font-light text-gray-800 mb-6 flex items-center">
          <span className="mr-3">💡</span>
          機能の説明
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400/30 to-blue-500/30 backdrop-blur-sm rounded-2xl mb-4 shadow-lg">
              <span className="text-2xl">🔍</span>
            </div>
            <h4 className="font-medium text-gray-800 mb-2">書籍検索</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              書籍のタイトルでGoogle Books APIを検索し、候補一覧を表示します。
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400/30 to-blue-600/30 backdrop-blur-sm rounded-2xl mb-4 shadow-lg">
              <span className="text-2xl">📚</span>
            </div>
            <h4 className="font-medium text-gray-800 mb-2">所有書籍登録</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              気に入った書籍を所有書籍として登録し、読書管理を始められます。
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400/30 to-pink-500/30 backdrop-blur-sm rounded-2xl mb-4 shadow-lg">
              <span className="text-2xl">💜</span>
            </div>
            <h4 className="font-medium text-gray-800 mb-2">ウィッシュリスト</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              気になる書籍をウィッシュリストに追加して、後で購入検討できます。
            </p>
          </div>
        </div>
      </GlassCard>

      {/* 書籍登録中の全画面ローディング */}
      {isRegisteringByTitle && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <GlassCard className="p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
              <h3 className="text-xl font-light text-gray-800 mb-4">
                📚 書籍を登録しています...
              </h3>
              <p className="text-gray-600 text-sm">
                選択された書籍を所有書籍として登録中です
              </p>
            </div>
          </GlassCard>
        </div>
      )}

      {/* ウィッシュリスト追加中の全画面ローディング */}
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
