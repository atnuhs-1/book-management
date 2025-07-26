import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // バックエンドAPIテスト
    fetch("http://localhost:8000/api/test")
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setMessage("接続エラー");
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
        {/* 接続ステータスカード */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
            バックエンド接続テスト
          </h2>

          {isLoading ? (
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              <span className="text-gray-600">接続中...</span>
            </div>
          ) : (
            <div
              className={`p-4 rounded-md ${
                message === "接続エラー"
                  ? "bg-red-50 border border-red-200"
                  : "bg-green-50 border border-green-200"
              }`}
            >
              <p
                className={`font-medium ${
                  message === "接続エラー" ? "text-red-800" : "text-green-800"
                }`}
              >
                {message === "接続エラー" ? "❌ " : "✅ "}
                {message}
              </p>
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

        {/* Tailwind CSS動作確認セクション */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            🎨 Tailwind CSS 動作確認
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* レスポンシブ・カラーテスト */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">
                カラーパレット
              </h3>
              <div className="flex flex-wrap gap-2">
                <div className="w-16 h-16 bg-red-500 rounded-lg shadow-md"></div>
                <div className="w-16 h-16 bg-blue-500 rounded-lg shadow-md"></div>
                <div className="w-16 h-16 bg-green-500 rounded-lg shadow-md"></div>
                <div className="w-16 h-16 bg-yellow-500 rounded-lg shadow-md"></div>
                <div className="w-16 h-16 bg-purple-500 rounded-lg shadow-md"></div>
                <div className="w-16 h-16 bg-pink-500 rounded-lg shadow-md"></div>
              </div>
            </div>

            {/* ボタンテスト */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">
                ボタンスタイル
              </h3>
              <div className="flex flex-wrap gap-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200">
                  Primary
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200">
                  Secondary
                </button>
                <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors duration-200">
                  Outline
                </button>
              </div>
            </div>
          </div>

          {/* レスポンシブテスト */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              レスポンシブテスト
            </h3>
            <div className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-4 rounded-lg text-white text-center">
              <p className="text-sm sm:text-base md:text-lg lg:text-xl">
                画面サイズに応じてテキストサイズが変わります
              </p>
              <p className="mt-2 text-xs sm:text-sm">
                現在: <span className="sm:hidden">mobile</span>
                <span className="hidden sm:inline md:hidden">tablet</span>
                <span className="hidden md:inline lg:hidden">desktop</span>
                <span className="hidden lg:inline">large desktop</span>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-gray-800 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-300">
              Built with ❤️ using React + TypeScript + Tailwind CSS
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Tailwind CSS が正常に動作していることを確認できます 🎉
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
