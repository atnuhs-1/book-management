// src/pages/RegisterPage.tsx

import { useState } from "react";

export const RegisterPage = () => {
  const [selectedMethod, setSelectedMethod] = useState<
    "barcode" | "ocr" | "manual" | null
  >(null);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* ページヘッダー */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">📚 書籍を追加</h1>
        <p className="text-gray-600">書籍を追加する方法を選択してください</p>
      </div>

      {/* 方法選択カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* バーコードスキャン */}
        <button
          onClick={() => setSelectedMethod("barcode")}
          className={`p-6 border-2 rounded-lg text-left transition-all duration-200 ${
            selectedMethod === "barcode"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-blue-400 hover:bg-blue-50"
          }`}
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">📷</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              バーコードスキャン
            </h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            書籍のバーコード（ISBN）を読み取って自動登録
          </p>
          <div className="flex items-center text-xs text-blue-600">
            <span className="mr-1">⚡</span>
            最速で登録
          </div>
        </button>

        {/* OCRスキャン */}
        <button
          onClick={() => setSelectedMethod("ocr")}
          className={`p-6 border-2 rounded-lg text-left transition-all duration-200 ${
            selectedMethod === "ocr"
              ? "border-green-500 bg-green-50"
              : "border-gray-200 hover:border-green-400 hover:bg-green-50"
          }`}
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">📄</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              OCRテキスト認識
            </h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            レシートや書籍画像からテキストを抽出して登録
          </p>
          <div className="flex items-center text-xs text-green-600">
            <span className="mr-1">🎯</span>
            レシート対応
          </div>
        </button>

        {/* 手動入力 */}
        <button
          onClick={() => setSelectedMethod("manual")}
          className={`p-6 border-2 rounded-lg text-left transition-all duration-200 ${
            selectedMethod === "manual"
              ? "border-purple-500 bg-purple-50"
              : "border-gray-200 hover:border-purple-400 hover:bg-purple-50"
          }`}
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">✏️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">手動入力</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            書籍情報を手動で入力して登録
          </p>
          <div className="flex items-center text-xs text-purple-600">
            <span className="mr-1">📝</span>
            確実に登録
          </div>
        </button>
      </div>

      {/* 選択された方法の詳細 */}
      {selectedMethod && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {selectedMethod === "barcode" && "📷 バーコードスキャン"}
            {selectedMethod === "ocr" && "📄 OCRテキスト認識"}
            {selectedMethod === "manual" && "✏️ 手動入力"}
          </h2>

          {selectedMethod === "barcode" && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="font-medium text-blue-900 mb-2">💡 使い方</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 書籍の裏表紙にあるバーコードをカメラで読み取り</li>
                  <li>• Google Books APIから自動で書籍情報を取得</li>
                  <li>• 最も高速で正確な登録方法です</li>
                </ul>
              </div>
              <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                カメラを起動（開発中）
              </button>
            </div>
          )}

          {selectedMethod === "ocr" && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <h4 className="font-medium text-green-900 mb-2">💡 使い方</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• 書店のレシートや書籍の表紙を撮影</li>
                  <li>• AIが画像からテキストを自動抽出</li>
                  <li>• 複数の書籍を一度に登録可能</li>
                </ul>
              </div>
              <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors">
                画像をアップロード（開発中）
              </button>
            </div>
          )}

          {selectedMethod === "manual" && (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
                <h4 className="font-medium text-purple-900 mb-2">
                  💡 手動入力
                </h4>
                <p className="text-sm text-purple-800">
                  書籍情報を直接入力して登録します。バーコードがない古い書籍や同人誌にも対応。
                </p>
              </div>
              <button className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                入力フォームを開く（開発中）
              </button>
            </div>
          )}
        </div>
      )}

      {/* 最近のスキャン履歴（将来の機能） */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📋 最近のスキャン履歴
        </h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📱</div>
          <p className="text-gray-500">スキャン履歴はここに表示されます</p>
          <p className="text-sm text-gray-400 mt-1">（機能開発中）</p>
        </div>
      </div>
    </div>
  );
};
