// src/pages/WishlistPage.tsx - ウィッシュリスト表示ページ
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  GlassButton,
  GlassCard,
  GlassEmptyState,
  GlassError,
  GlassInput,
  GlassLoading,
} from "../components/ui/GlassUI";
import { useAuthStore } from "../stores/authStore";
import { useBookStore } from "../stores/bookStore";
import { BookStatusEnum, type Book } from "../types/book";

// ソート型を定義（created_atを削除してidを使用）
type SortBy = "title" | "author" | "published_date" | "id";
type SortOrder = "asc" | "desc";

export const WishlistPage = () => {
  const {
    wishlistBooks,
    isLoadingWishlist,
    wishlistFetchError,
    fetchWishlist,
    updateBookById,
  } = useBookStore();
  const { isAuthenticated, isInitialized } = useAuthStore();

  // ローカル検索状態
  const [searchQuery, setSearchQuery] = useState("");
  // ソート状態（created_atをidに変更）
  const [sortBy, setSortBy] = useState<SortBy>("id");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const loadWishlist = useCallback(async () => {
    if (isAuthenticated && isInitialized) {
      await fetchWishlist();
    }
  }, [isAuthenticated, isInitialized, fetchWishlist]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const filteredBooks = wishlistBooks.filter((book) => {
    // 安全なアクセス：null/undefinedの場合は空文字に変換
    const title = (book.title || "").toLowerCase();
    const author = (book.author || "").toLowerCase();
    const publisher = (book.publisher || "").toLowerCase();
    const query = searchQuery.toLowerCase();

    return (
      title.includes(query) ||
      author.includes(query) ||
      publisher.includes(query)
    );
  });

  // ソート処理
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    let aValue: string | number, bValue: string | number;

    switch (sortBy) {
      case "title":
        aValue = (a.title || "").toLowerCase();
        bValue = (b.title || "").toLowerCase();
        break;
      case "author":
        aValue = (a.author || "").toLowerCase();
        bValue = (b.author || "").toLowerCase();
        break;
      case "published_date":
        aValue = new Date(a.published_date || 0).getTime();
        bValue = new Date(b.published_date || 0).getTime();
        break;
      case "id":
      default:
        // IDを追加順として使用（数値の大小で判定）
        aValue = a.id;
        bValue = b.id;
        break;
    }

    if (sortOrder === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  // ✅ ウィッシュリスト専用: 所有済みに変更する機能
  const handleMarkAsOwned = async (bookId: number) => {
    try {
      await updateBookById(bookId, { status: BookStatusEnum.OWNED });
      // 成功したらウィッシュリストを再取得して状態を更新
      await loadWishlist();
    } catch (error) {
      console.error("所有済み変更エラー:", error);
    }
  };

  // ✅ Amazon購入リンクを開く
  const handleBuyOnAmazon = (book: Book) => {
    // バックエンドから返されるamazon_urlがある場合はそれを使用
    if (book.amazon_url) {
      window.open(book.amazon_url, "_blank", "noopener,noreferrer");
    } else if (book.isbn) {
      // ISBN10に変換してAmazonリンクを生成（簡易実装）
      const amazonUrl = `https://www.amazon.co.jp/s?k=${encodeURIComponent(
        book.isbn
      )}`;
      window.open(amazonUrl, "_blank", "noopener,noreferrer");
    } else {
      // ISBNがない場合はタイトルで検索
      const amazonUrl = `https://www.amazon.co.jp/s?k=${encodeURIComponent(
        book.title + " " + book.author
      )}`;
      window.open(amazonUrl, "_blank", "noopener,noreferrer");
    }
  };

  // 未認証の場合の表示
  if (!isAuthenticated) {
    return (
      <div className="max-w-6xl mx-auto">
        <GlassCard className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-pink-400/30 to-purple-500/30 backdrop-blur-sm rounded-3xl mb-8 shadow-xl">
            <span className="text-4xl">💖</span>
          </div>
          <h1 className="text-3xl font-light text-gray-800 mb-6">
            ウィッシュリストを見るにはログインが必要です
          </h1>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            アカウントにログインして欲しい本リストを管理しましょう
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <GlassButton variant="primary" size="lg">
                ログイン
              </GlassButton>
            </Link>
            <Link to="/signup">
              <GlassButton variant="outline" size="lg">
                新規登録
              </GlassButton>
            </Link>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* ヘッダー */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-light text-gray-800">
              ウィッシュリスト
            </h1>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <GlassInput
                type="text"
                placeholder="タイトル"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon="🔍"
              />
            </div>
            <Link to="/search-books">
              <GlassButton variant="primary">追加</GlassButton>
            </Link>
          </div>
        </div>

        {/* ソート・フィルター */}
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-sm text-gray-600">並び替え:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="bg-white/30 backdrop-blur-xl border border-white/20 rounded-lg px-3 py-1 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-400/50"
          >
            <option value="created_at">追加日</option>
            <option value="title">タイトル</option>
            <option value="author">著者</option>
            <option value="published_date">出版日</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="bg-white/30 backdrop-blur-xl border border-white/20 rounded-lg px-3 py-1 text-sm text-gray-800 hover:bg-white/40 transition-colors"
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
          <span className="text-sm text-gray-600 ml-2">
            {sortedBooks.length}件の欲しい本
          </span>
        </div>
      </div>

      {/* ウィッシュリスト一覧 */}
      {isLoadingWishlist ? (
        <GlassLoading message="ウィッシュリストを読み込み中..." />
      ) : wishlistFetchError ? (
        <GlassError
          message={wishlistFetchError}
          onRetry={() => fetchWishlist()}
        />
      ) : sortedBooks.length === 0 ? (
        <GlassEmptyState
          icon={searchQuery ? "🔍" : "💖"}
          title={
            searchQuery
              ? "検索結果が見つかりません"
              : "ウィッシュリストが空です"
          }
          description={
            searchQuery
              ? "別のキーワードで検索してみてください"
              : "欲しい本をウィッシュリストに追加してみましょう"
          }
          actionLabel={!searchQuery ? "最初の本を追加" : undefined}
          onAction={
            !searchQuery
              ? () => (window.location.href = "/add-book")
              : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {sortedBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white/30 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group relative"
            >
              <div className="flex gap-4">
                {/* ✅ 左側: カバー画像 */}
                <div className="flex-shrink-0">
                  <div className="relative w-20 h-28 overflow-hidden rounded-lg">
                    <img
                      src={book.cover_image_url || "/placeholder.svg"}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const fallback =
                          target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.classList.remove("hidden");
                      }}
                    />
                    {/* フォールバック画像 */}
                    <div className="hidden w-full h-full items-center justify-center bg-gray-200/50">
                      <span className="text-2xl opacity-50">💖</span>
                    </div>
                  </div>
                </div>

                {/* ✅ 右側: 書籍情報 */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between mb-10">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-800 text-sm line-clamp-2 leading-tight">
                        {book.title}
                      </h3>
                      <p className="text-xs text-gray-600 truncate mt-1">
                        {book.author}
                      </p>
                    </div>
                  </div>

                  {/* 追加日 */}
                  <div className="text-xs text-gray-500">
                    発売日:{" "}
                    {book.published_date
                      ? new Date(book.published_date).toLocaleDateString(
                          "ja-JP"
                        )
                      : "発売日不明"}
                  </div>

                  {/* ✅ アクションボタン */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleBuyOnAmazon(book)}
                      className="flex-1 bg-gradient-to-r from-orange-400/80 to-yellow-500/80 hover:from-orange-500/90 hover:to-yellow-600/90 text-white text-xs py-2 px-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-1"
                    >
                      🛒 Amazonで購入
                    </button>
                    <button
                      onClick={() => handleMarkAsOwned(book.id)}
                      className="flex-1 bg-white/20 hover:bg-gradient-to-r hover:from-green-500/90 hover:to-blue-600/90 text-gray-600 hover:text-white text-xs py-2 px-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-1 border-2 border-dashed border-gray-400/50 hover:border-transparent"
                    >
                      ☐ 本棚に移動
                    </button>
                    <button
                      onClick={() => {
                        window.location.href = `/books/${book.id}`;
                      }}
                      className="bg-white/20 hover:bg-white/30 text-gray-700 text-xs py-2 px-3 rounded-lg transition-all duration-300 border border-white/30"
                    >
                      📖
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ ウィッシュリスト専用のヘルプセクション */}
      {sortedBooks.length > 0 && (
        <GlassCard className="p-6">
          <div className="flex items-start gap-4">
            <div className="text-2xl">💡</div>
            <div>
              <h3 className="font-medium text-gray-800 mb-2">
                ウィッシュリストの使い方
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  • 🛒 <strong>購入ボタン</strong>: Amazonで購入できます
                </p>
                <p>
                  • ✅ <strong>購入済みボタン</strong>:
                  所有している本リストに移動します
                </p>
                <p>
                  • 📖 <strong>詳細を見る</strong>: 本の詳細情報を確認できます
                </p>
              </div>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
};
