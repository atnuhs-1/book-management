// src/pages/BookDetailPage.tsx

import { useParams } from "react-router-dom";

export const BookDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">📖 書籍詳細</h1>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            開発中の機能です
          </h2>
          <p className="text-gray-600">書籍ID: {id} の詳細ページを表示予定</p>
        </div>
      </div>
    </div>
  );
};

