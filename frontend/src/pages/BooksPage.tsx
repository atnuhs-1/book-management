// src/pages/BooksPage.tsx - v0レイアウト準拠版
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

  // ローカル検索状態（storeのsearchQueryは使わない）
  const [searchQuery, setSearchQuery] = useState("");

  const loadBooks = useCallback(async () => {
    if (isAuthenticated && isInitialized) {
      await fetchBooks();
    }
  }, [isAuthenticated, isInitialized, fetchBooks]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  // フィルタリングロジック（シンプルな検索のみ）
  const filteredBooks = books.filter((book) => {
    return (
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.publisher.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // シリーズごとにグループ化（v0と同様の処理）
  const seriesGroups = filteredBooks.reduce((groups, book) => {
    // シリーズ名を推定（タイトルから巻数を除去）
    const seriesName =
      book.title.replace(/\s*\d+巻?$/, "").replace(/\s*第?\d+[巻話].*$/, "") ||
      book.title;
    if (!groups[seriesName]) {
      groups[seriesName] = [];
    }
    groups[seriesName].push(book);
    return groups;
  }, {});

  // 各シリーズの代表書籍と統計情報を計算
  const seriesData = Object.entries(seriesGroups).map(([seriesName, books]) => {
    const representativeBook = books[0]; // 最初の書籍を代表とする

    return {
      seriesName,
      books,
      representativeBook,
      totalCount: books.length,
      isComplete: books.length > 1, // 複数巻ある場合は完結扱い
      hasMultiple: books.length > 1,
    };
  });

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
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h1 className="text-4xl font-light text-gray-800">📚 書籍一覧</h1>
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
          <Link to="/register">
            <GlassButton variant="primary">➕ 追加</GlassButton>
          </Link>
        </div>
      </div>

      {/* 書籍一覧 */}
      {isLoading ? (
        <GlassLoading message="書籍を読み込み中..." />
      ) : error ? (
        <GlassError message={error} onRetry={() => fetchBooks()} />
      ) : seriesData.length === 0 ? (
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
              ? () => (window.location.href = "/register")
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {seriesData.map((series) => (
            <div
              key={series.seriesName}
              className="bg-white/30 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 cursor-pointer group"
              onClick={() => {
                // シリーズの最初の書籍の詳細ページに遷移
                window.location.href = `/books/${series.representativeBook.id}`;
              }}
            >
              <div className="relative mb-3 overflow-hidden rounded-lg">
                <img
                  src={
                    series.representativeBook.cover_image_url ||
                    "/placeholder.svg"
                  }
                  alt={series.seriesName}
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
                    {series.representativeBook.title.includes("巻")
                      ? "漫画"
                      : series.representativeBook.title.includes("Code") ||
                          series.representativeBook.title.includes("技術")
                        ? "技術書"
                        : "書籍"}
                  </div>
                </div>

                {/* 巻数バッジ */}
                {series.hasMultiple && (
                  <div className="absolute top-2 left-2">
                    <div className="bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
                      {series.totalCount}冊
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-gray-800 text-sm line-clamp-2 leading-tight">
                  {series.seriesName}
                </h3>
                <p className="text-xs text-gray-600 truncate">
                  {series.representativeBook.author}
                </p>

                {/* 出版情報 */}
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span className="truncate">
                    {series.representativeBook.publisher}
                  </span>
                  <span>
                    {new Date(
                      series.representativeBook.published_date
                    ).getFullYear()}
                    年
                  </span>
                </div>

                {/* ステータスバッジ */}
                <div className="flex gap-2 flex-wrap">
                  {series.isComplete && (
                    <div className="px-2 py-1 rounded-full text-xs bg-green-400/20 text-green-700 border border-green-400/30">
                      完読済み
                    </div>
                  )}
                  {series.hasMultiple && (
                    <div className="px-2 py-1 rounded-full text-xs bg-blue-400/20 text-blue-700 border border-blue-400/30">
                      シリーズ
                    </div>
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
