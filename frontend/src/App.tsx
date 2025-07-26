import { useEffect, useState } from "react";

interface Book {
  id: number;
  title: string;
  volume: string;
  author: string;
  publisher: string;
  cover_image_url: string;
  published_date: string;
}

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // 書籍一覧を取得
    fetch("http://localhost:8000/api/books")
      .then((res) => res.json())
      .then((data: Book[]) => {
        setBooks(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("書籍データの取得に失敗しました");
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              📚 Book Management PWA
            </h1>
            <div className="flex space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                PWA対応
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                React + TypeScript
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 書籍一覧セクション */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
              書籍一覧
            </h2>
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              {books.length}冊
            </span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-gray-600">書籍を読み込み中...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800 font-medium">❌ {error}</p>
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                書籍がありません
              </h3>
              <p className="text-gray-500">
                バーコード読み取りで書籍を追加してみましょう
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {books.map((book) => (
                <div
                  key={book.id}
                  className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-300"
                >
                  {/* 書籍カバー画像 */}
                  <div className="aspect-[3/4] bg-gray-200 rounded-md mb-4 overflow-hidden">
                    {book.cover_image_url ? (
                      <img
                        src={book.cover_image_url}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                          (
                            e.target as HTMLImageElement
                          ).nextElementSibling!.classList.remove("hidden");
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-full h-full flex items-center justify-center ${book.cover_image_url ? "hidden" : ""}`}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-2">📖</div>
                        <p className="text-xs text-gray-500">カバー画像なし</p>
                      </div>
                    </div>
                  </div>

                  {/* 書籍情報 */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-tight">
                      {book.title}
                      {book.volume && (
                        <span className="text-gray-600"> {book.volume}</span>
                      )}
                    </h3>
                    <p className="text-xs text-gray-600">{book.author}</p>
                    <p className="text-xs text-gray-500">{book.publisher}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(book.published_date).getFullYear()}年
                    </p>
                  </div>

                  {/* アクションボタン */}
                  <div className="mt-4 flex space-x-2">
                    <button className="flex-1 bg-blue-600 text-white text-xs px-3 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200">
                      詳細
                    </button>
                    <button className="flex-1 bg-gray-200 text-gray-700 text-xs px-3 py-2 rounded-md hover:bg-gray-300 transition-colors duration-200">
                      編集
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 機能紹介カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
              書籍のバーコードを読み取って自動登録
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
            <p className="text-gray-600">購入レシートから書籍情報を自動抽出</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">読書統計</h3>
            </div>
            <p className="text-gray-600">読書習慣を可視化して管理</p>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {books.length}
                </p>
                <p className="text-sm text-gray-600">総書籍数</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-600">読了済み</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">📖</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {books.length}
                </p>
                <p className="text-sm text-gray-600">積読</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-gray-800 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-300">
              Built with ❤️ using React + TypeScript + Tailwind CSS + FastAPI
            </p>
            <p className="text-sm text-gray-400 mt-2">
              書籍管理PWA - あなたの読書ライフをサポート 📚
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
