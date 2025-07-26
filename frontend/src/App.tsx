// src/App.tsx

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { BooksPage } from "./pages/BooksPage";
import { RegisterPage } from "./pages/RegisterPage";
import { BookDetailPage } from "./pages/BookDetailPage";
import { SettingsPage } from "./pages/SettingsPage";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          {/* 404ページ */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

// 404ページコンポーネント
const NotFoundPage = () => {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">📖</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        ページが見つかりません
      </h1>
      <p className="text-gray-600 mb-6">
        お探しのページは存在しないか、移動された可能性があります。
      </p>
      <a
        href="/"
        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
      >
        🏠 ホームに戻る
      </a>
    </div>
  );
};

export default App;
