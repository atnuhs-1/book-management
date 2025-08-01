// src/pages/BooksPage.tsx - 全書籍個別表示版
import { useEffect, useCallback, useState } from "react";
import { useBookStore } from "../stores/bookStore";
import { useAuthStore } from "../stores/authStore";
import { Link } from "react-router-dom";
import {
  GlassCard,
  GlassInput,
  GlassButton,
  GlassLoading,
  GlassError,
  GlassEmptyState,
} from "../components/ui/GlassUI";

export const BooksPage = () => {
  const { books, isLoading, error, fetchBooks } = useBookStore();
  const { isAuthenticated, isInitialized } = useAuthStore();

  // ローカル検索状態
  const [searchQuery, setSearchQuery] = useState("");
  // ソート状態
  const [sortBy, setSortBy] = useState<
    "title" | "author" | "published_date" | "created_at"
  >("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const loadBooks = useCallback(async () => {
    if (isAuthenticated && isInitialized) {
      await fetchBooks();
    }
  }, [isAuthenticated, isInitialized, fetchBooks]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  // フィルタリングロジック
  const filteredBooks = books.filter((book) => {
    return (
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.publisher.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // ソート処理
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case "title":
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case "author":
        aValue = a.author.toLowerCase();
        bValue = b.author.toLowerCase();
        break;
      case "published_date":
        aValue = new Date(a.published_date).getTime();
        bValue = new Date(b.published_date).getTime();
        break;
      case "created_at":
      default:
        aValue = new Date(a.created_at || 0).getTime();
        bValue = new Date(b.created_at || 0).getTime();
        break;
    }

    if (sortOrder === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  // ジャンル推定関数
  const getGenre = (book: any) => {
    const title = book.title.toLowerCase();
    if (title.includes("巻") || title.includes("vol") || title.includes("第")) {
      return "漫画";
    } else if (
      title.includes("code") ||
      title.includes("技術") ||
      title.includes("programming")
    ) {
      return "技術書";
    } else if (title.includes("小説") || title.includes("novel")) {
      return "小説";
    } else {
      return "書籍";
    }
  };

  // ステータス推定関数
  const getStatus = (book: any) => {
    // 実際のプロジェクトではbook.statusなどの値を使用
    // ここでは仮の実装
    return Math.random() > 0.7
      ? "読了"
      : Math.random() > 0.5
        ? "読書中"
        : "積読";
  };

  // 未認証の場合の表示
  if (!isAuthenticated) {
    return (
      <div className="max-w-6xl mx-auto">
        <GlassCard className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-indigo-400/30 to-purple-500/30 backdrop-blur-sm rounded-3xl mb-8 shadow-xl">
            <span className="text-4xl">🔒</span>
          </div>
          <h1 className="text-3xl font-light text-gray-800 mb-6">
            書籍一覧を見るにはログインが必要です
          </h1>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            アカウントにログインして書籍管理を始めましょう
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
          <h1 className="text-4xl font-light text-gray-800">書籍一覧</h1>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <GlassInput
                type="text"
                placeholder="書籍名・著者・出版社で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon="🔍"
              />
            </div>
            <Link to="/add-book">
              <GlassButton variant="primary">➕ 追加</GlassButton>
            </Link>
          </div>
        </div>

        {/* ソート・フィルター */}
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-sm text-gray-600">並び替え:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white/30 backdrop-blur-xl border border-white/20 rounded-lg px-3 py-1 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
          >
            <option value="created_at">登録日</option>
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
            {sortedBooks.length}件表示
          </span>
        </div>
      </div>

      {/* 書籍一覧 */}
      {isLoading ? (
        <GlassLoading message="書籍を読み込み中..." />
      ) : error ? (
        <GlassError message={error} onRetry={() => fetchBooks()} />
      ) : sortedBooks.length === 0 ? (
        <GlassEmptyState
          icon={searchQuery ? "🔍" : "📚"}
          title={searchQuery ? "検索結果が見つかりません" : "書籍がありません"}
          description={
            searchQuery
              ? "別のキーワードで検索してみてください"
              : "書籍を追加してみましょう"
          }
          actionLabel={!searchQuery ? "最初の書籍を追加" : undefined}
          onAction={
            !searchQuery
              ? () => (window.location.href = "/add-book")
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white/30 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 cursor-pointer group"
              onClick={() => {
                window.location.href = `/books/${book.id}`;
              }}
            >
              <div className="relative mb-3 overflow-hidden rounded-lg">
                <img
                  src={book.cover_image_url || "/placeholder.svg"}
                  alt={book.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.classList.remove("hidden");
                  }}
                />

                {/* フォールバック画像 */}
                <div className="hidden w-full h-64 flex items-center justify-center bg-gray-200/50">
                  <div className="text-center">
                    <div className="text-4xl mb-2 opacity-50">📖</div>
                    <p className="text-xs text-gray-500">カバー画像なし</p>
                  </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* ジャンルバッジ */}
                <div className="absolute top-2 right-2">
                  <div className="px-2 py-1 rounded-full text-xs font-medium bg-blue-400/80 text-white">
                    {getGenre(book)}
                  </div>
                </div>

                {/* ステータスバッジ */}
                <div className="absolute top-2 left-2">
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      getStatus(book) === "読了"
                        ? "bg-green-400/80 text-white"
                        : getStatus(book) === "読書中"
                          ? "bg-yellow-400/80 text-white"
                          : "bg-gray-400/80 text-white"
                    }`}
                  >
                    {getStatus(book)}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-gray-800 text-sm line-clamp-2 leading-tight">
                  {book.title}
                </h3>
                <p className="text-xs text-gray-600 truncate">{book.author}</p>

                {/* 出版情報 */}
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span className="truncate">{book.publisher}</span>
                  <span>{new Date(book.published_date).getFullYear()}年</span>
                </div>

                {/* ISBN情報（あれば表示） */}
                {book.isbn && (
                  <div className="text-xs text-gray-500 truncate">
                    ISBN: {book.isbn}
                  </div>
                )}

                {/* 登録日 */}
                <div className="text-xs text-gray-500">
                  登録:{" "}
                  {new Date(book.created_at || new Date()).toLocaleDateString(
                    "ja-JP"
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
