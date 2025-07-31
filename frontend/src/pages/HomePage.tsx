// src/pages/HomePage.tsx - v0デザイン適用版
import { useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useBookStore } from "../stores/bookStore";
import { useAuthStore } from "../stores/authStore";
import { GlassCard, GlassButton } from "../components/ui/GlassUI";

export const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isInitialized } = useAuthStore();
  const { books, fetchBooks } = useBookStore();

  const loadBooks = useCallback(async () => {
    if (isAuthenticated && isInitialized) {
      await fetchBooks();
    }
  }, [isAuthenticated, isInitialized, fetchBooks]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  // 仮の食品データ（後でstoreに移行）
  const foodStats = {
    totalItems: 89,
    expiringSoon: 12,
    expired: 3,
    freshItems: 74,
  };
  const bookStats = {
    totalBooks: books.length,
    readBooks: 0,
    unreadBooks: books.length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Main Glass Cards */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Food Management Card */}
        <div
          className="group cursor-pointer"
          onClick={() => navigate("/food-list")}
        >
          <div className="bg-white/30 backdrop-blur-xl rounded-[2rem] p-8 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-700 hover:-translate-y-2 hover:bg-white/40">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400/30 to-emerald-500/30 backdrop-blur-sm rounded-2xl mb-6 shadow-xl group-hover:scale-110 transition-transform duration-500">
                <span className="text-3xl">🍎</span>
              </div>
              <h2 className="text-3xl font-light mb-4 text-gray-800">
                食品管理
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                賞味期限と在庫を美しく管理
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                  <div className="text-3xl font-light text-gray-800">
                    {foodStats.totalItems}
                  </div>
                  <div className="text-gray-600 text-sm">アイテム</div>
                </div>
                <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                  <div className="text-3xl font-light text-amber-600">
                    {foodStats.expiringSoon}
                  </div>
                  <div className="text-gray-600 text-sm">期限間近</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Book Management Card */}
        <div
          className="group cursor-pointer"
          onClick={() => navigate("/book-list")}
        >
          <div className="bg-white/30 backdrop-blur-xl rounded-[2rem] p-8 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-700 hover:-translate-y-2 hover:bg-white/40">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-400/30 to-indigo-500/30 backdrop-blur-sm rounded-2xl mb-6 shadow-xl group-hover:scale-110 transition-transform duration-500">
                <span className="text-3xl">📚</span>
              </div>
              <h2 className="text-3xl font-light mb-4 text-gray-800">
                書籍管理
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                読書の記録を優雅に保存
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                  <div className="text-3xl font-light text-gray-800">
                    {bookStats.totalBooks}
                  </div>
                  <div className="text-gray-600 text-sm">書籍</div>
                </div>
                <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                  <div className="text-3xl font-light text-green-600">
                    {bookStats.readBooks}
                  </div>
                  <div className="text-gray-600 text-sm">読了</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Glass Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          {
            value: foodStats.expired,
            label: "期限切れ",
            gradient: "from-red-400/30 to-red-500/30",
            onClick: () => navigate("/expiry"),
          },
          {
            value: foodStats.expiringSoon,
            label: "期限間近",
            gradient: "from-amber-400/30 to-amber-500/30",
            onClick: () => navigate("/expiry"),
          },
          {
            value: bookStats.unreadBooks,
            label: "積読",
            gradient: "from-blue-400/30 to-blue-500/30",
            onClick: () => navigate("/book-list"),
          },
          {
            value: bookStats.readBooks,
            label: "読了",
            gradient: "from-green-400/30 to-green-500/30",
            onClick: () => navigate("/book-list"),
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-white/30 backdrop-blur-xl rounded-2xl p-6 text-center border border-white/20 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 cursor-pointer"
            onClick={stat.onClick}
          >
            <div
              className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${stat.gradient} backdrop-blur-sm rounded-xl mb-4`}
            >
              <div className="text-2xl font-light text-gray-800">
                {stat.value}
              </div>
            </div>
            <div className="text-gray-600 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* 認証状態に応じたコンテンツ */}
      {isAuthenticated ? (
        <>
          {/* 最近追加した書籍 */}
          {books.length > 0 && (
            <GlassCard className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-light text-gray-800">
                  📚 最近追加した書籍
                </h2>
                <Link to="/book-list">
                  <GlassButton variant="outline" size="sm">
                    すべて見る →
                  </GlassButton>
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {books.slice(0, 5).map((book) => (
                  <div key={book.id} className="text-center group">
                    <Link to={`/books/${book.id}`}>
                      <div className="aspect-[3/4] bg-white/20 backdrop-blur-sm rounded-xl mb-3 overflow-hidden hover:shadow-xl transition-all duration-500 group-hover:scale-105 border border-white/20">
                        {book.cover_image_url ? (
                          <img
                            src={book.cover_image_url}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-3xl opacity-50">📖</span>
                          </div>
                        )}
                      </div>
                    </Link>
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                      {book.title}
                    </h3>
                    <p className="text-xs text-gray-600">{book.author}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* クイックアクション */}
          <GlassCard className="p-8">
            <h2 className="text-2xl font-light text-gray-800 mb-6 text-center">
              ⚡ クイックアクション
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link to="/add-book">
                <GlassButton variant="primary" size="lg" className="w-full">
                  📷 書籍を追加
                </GlassButton>
              </Link>
              <Link to="/add-food">
                <GlassButton variant="secondary" size="lg" className="w-full">
                  🍎 食品を追加
                </GlassButton>
              </Link>
            </div>
          </GlassCard>
        </>
      ) : (
        /* 未認証ユーザー向けの案内 */
        <GlassCard className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-indigo-400/30 to-purple-500/30 backdrop-blur-sm rounded-3xl mb-8 shadow-xl">
            <span className="text-4xl">🔐</span>
          </div>
          <h2 className="text-3xl font-light text-gray-800 mb-6">
            書籍管理を始めよう
          </h2>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed max-w-2xl mx-auto">
            アカウントを作成すると、書籍の登録・管理ができるようになります。
            <br />
            バーコード読み取りやOCR機能で簡単に書籍を追加できます。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <GlassButton variant="primary" size="lg">
                無料で始める
              </GlassButton>
            </Link>
            <Link to="/login">
              <GlassButton variant="outline" size="lg">
                ログイン
              </GlassButton>
            </Link>
          </div>
        </GlassCard>
      )}
    </div>
  );
};
