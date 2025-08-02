// frontend/src/pages/RegisterFoodPage.tsx - バーコード機能統合版

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GlassCard,
  GlassInput,
  GlassButton,
  GlassError,
  GlassLoading,
} from "../components/ui/GlassUI";
import { BarcodeScanner } from "../components/barcode/BarcodeScanner";
import { useAuthStore } from "../stores/authStore";
import { useFoodStore } from "../stores/foodStore";
import type {
  FoodCreate,
  FoodCategory,
  FoodUnit,
  BarcodeValidationResult,
} from "../types/food";
import {
  suggestCategoryFromName,
  calculateDefaultExpirationDate,
  validateFoodData,
} from "../utils/foodUtils";

const foodCategories = [
  { id: "生鮮食品", name: "生鮮食品", icon: "🥬" },
  { id: "非常食", name: "非常食", icon: "🥫" },
  { id: "飲料", name: "飲料", icon: "🥤" },
  { id: "調味料", name: "調味料", icon: "🧂" },
  { id: "冷凍食品", name: "冷凍食品", icon: "🧊" },
  { id: "お菓子", name: "お菓子", icon: "🍪" },
];

// ✅ 新規追加: 食品単位の選択肢
const foodUnits = [
  { id: "個", name: "個", icon: "🔢", category: "count" },
  { id: "本", name: "本", icon: "📏", category: "count" },
  { id: "袋", name: "袋", icon: "🛍️", category: "count" },
  { id: "パック", name: "パック", icon: "📦", category: "count" },
  { id: "缶", name: "缶", icon: "🥫", category: "count" },
  { id: "箱", name: "箱", icon: "📦", category: "count" },
  { id: "kg", name: "キログラム", icon: "⚖️", category: "weight" },
  { id: "g", name: "グラム", icon: "⚖️", category: "weight" },
  { id: "L", name: "リットル", icon: "🧴", category: "volume" },
  { id: "ml", name: "ミリリットル", icon: "🧴", category: "volume" },
];

type FoodItem = {
  name: string;
  category: string;
  expiration_date: string;
  quantity: string;
  unit: string; // ✅ 追加
  barcode?: string;
  barcode_type?: "JAN" | "EAN";
};


export const RegisterFoodPage = () => {
  const { token, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [forceConfirmVisible, setForceConfirmVisible] = useState(false);
  const [pendingFoodData, setPendingFoodData] = useState<FoodCreate | null>(null);


  // ✅ 新規: foodStoreから新しい機能を取得
  const {
    createFood,
    createFoodByBarcode, // ✅ 新機能: バーコード直接登録
    isLoading,
    isRegisteringByBarcode, // ✅ 新機能: バーコード登録中フラグ
    error,
    setError
  } = useFoodStore();

  const [mode, setMode] = useState<"manual" | "barcode" | null>(null);
  const [food, setFood] = useState<Partial<FoodItem>>({
    quantity: "1",
    unit: "個", // ✅ デフォルト単位を設定
  });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false); // ✅ 単位選択モーダル用

  // ✅ 新機能: バーコードから検出した商品情報の一時保存
  const [detectedProduct, setDetectedProduct] = useState<{
    name: string;
    category: FoodCategory;
    barcode: string;
    barcode_type: "JAN" | "EAN";
  } | null>(null);

  // ✅ 未認証の場合のガード
  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto">
        <GlassCard className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-400/30 to-red-500/30 backdrop-blur-sm rounded-3xl mb-8 shadow-xl">
            <span className="text-4xl">🔒</span>
          </div>
          <h1 className="text-3xl font-light text-gray-800 mb-6">
            食品を追加するにはログインが必要です
          </h1>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            アカウントにログインして食品管理を始めましょう
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
        </GlassCard>
      </div>
    );
  }

  // ✅ 新機能: バーコードスキャン成功時の処理
  const handleBarcodeSuccess = async (result: BarcodeValidationResult) => {
    console.log("🎯 バーコードスキャン成功:", result);

    try {
      // JAN/EANのみサポート
      if (result.type !== "JAN" && result.type !== "EAN") {
        alert("❌ 食品のバーコード（JAN/EAN）のみサポートしています");
        return;
      }

      // バーコードから商品情報を取得して登録
      const registeredFood = await createFoodByBarcode(
        result.cleanCode,
        result.type as "JAN" | "EAN"
      );

      // 成功メッセージ表示
      alert(`🛒 「${registeredFood.name}」を登録しました！`);

      // 食品一覧ページに遷移（将来実装予定）
      // navigate("/food-list");

      // 現在は登録完了後にモード選択に戻る
      setMode(null);
      setFood({ quantity: "1", unit: "個" });
      setDetectedProduct(null);
    } catch (error: any) {
      console.error("食品登録エラー:", error);

      // エラーの種類に応じた対応
      if (error.message.includes("商品情報が見つかりませんでした")) {
        // 商品情報が見つからない場合は手動入力に誘導
        const shouldManualInput = confirm(
          `商品情報が見つかりませんでした。\nバーコード: ${result.formattedCode}\n\n手動入力で追加しますか？`
        );

        if (shouldManualInput) {
          // 手動入力モードに切り替え、バーコード情報をセット
          setFood({
            quantity: "1",
            unit: "個",
            barcode: result.cleanCode,
            barcode_type: result.type as "JAN" | "EAN",
          });
          setMode("manual");
        } else {
          setMode(null);
        }
      } else {
        // その他のエラー
        alert(`❌ 登録に失敗しました: ${error.message}`);

        const shouldRetry = confirm("手動入力で食品を追加しますか？");
        if (shouldRetry) {
          setMode("manual");
        } else {
          setMode(null);
        }
      }
    }
  };

  const handleChange = (field: keyof FoodItem, value: string) => {
    setFood((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (
      !food.name ||
      !food.category ||
      !food.expiration_date ||
      !food.quantity ||
      !food.unit ||
      Number(food.quantity) < 1
    ) {
      setError("すべての項目を正しく入力してください");
      return;
    }
  
    const foodData: FoodCreate = {
      name: food.name.trim(),
      category: food.category as FoodCategory,
      quantity: Number(food.quantity),
      unit: food.unit as FoodUnit,
      expiration_date: food.expiration_date,
      barcode: food.barcode,
      barcode_type: food.barcode_type,
    };
  
    const validation = validateFoodData(foodData);
    if (!validation.isValid) {
      setError(`入力エラー:\n${validation.errors.join("\n")}`);
      return;
    }
  
    try {
      await createFood(foodData); // 通常登録
      alert("食品を登録しました！");
      setFood({ quantity: "1", unit: "個" });
      setMode(null);
      setDetectedProduct(null);
    } catch (err: any) {
      if (err.message.includes("分類されません")) {
        setPendingFoodData(foodData);
        setForceConfirmVisible(true); // 確認モーダル表示
      } else {
        console.error("食品登録エラー:", err);
        alert("登録に失敗しました: " + err.message);
      }
    }
  };
  
  

  const selectedCategory = foodCategories.find((c) => c.id === food.category);
  const selectedUnit = foodUnits.find((u) => u.id === food.unit); // ✅ 選択された単位

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-24 md:pb-8">
      {/* ヘッダー */}
      <div className="text-center">
        <h1 className="text-4xl font-light text-gray-800 mb-4">
          🛒 食品を追加
        </h1>
        <p className="text-gray-600 text-lg">
          食品を追加する方法を選択してください
        </p>
      </div>

      {/* 方法選択カード */}
      {!mode && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* ✅ バーコードスキャン - 実装完了 */}
          <div
            className={`group cursor-pointer transition-all duration-500`}
            onClick={() => setMode("barcode")}
          >
            <div className="bg-white/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:bg-white/40 transition-all duration-500">
              <div className="flex items-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-400/30 to-blue-500/30 backdrop-blur-sm rounded-xl mr-4 shadow-lg">
                  <span className="text-2xl">📷</span>
                </div>
                <h3 className="text-lg font-medium text-gray-800">
                  バーコードスキャン
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                商品のバーコード（JAN/EAN）を読み取って自動登録
              </p>
              <div className="flex items-center text-xs text-blue-600">
                <span className="mr-1">⚡</span>
                最速で登録
              </div>
            </div>
          </div>

          {/* 手動入力 */}
          <div
            className={`group cursor-pointer transition-all duration-500`}
            onClick={() => setMode("manual")}
          >
            <div className="bg-white/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:bg-white/40 transition-all duration-500">
              <div className="flex items-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-400/30 to-purple-500/30 backdrop-blur-sm rounded-xl mr-4 shadow-lg">
                  <span className="text-2xl">✍️</span>
                </div>
                <h3 className="text-lg font-medium text-gray-800">手動入力</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                すべての情報を自分で入力して登録
              </p>
              <div className="flex items-center text-xs text-purple-600">
                <span className="mr-1">📝</span>
                確実に登録
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ バーコードスキャン機能 - 実装完了 */}
      {mode === "barcode" && (
        <BarcodeScanner
          supportedTypes={["JAN", "EAN"]} // ✅ 食品用バーコード種別
          onBarcodeDetected={handleBarcodeSuccess} // ✅ 汎用コールバック使用
          onClose={() => setMode(null)}
          title="🛒 食品バーコードスキャン"
          subtitle="商品のJAN/EANバーコードをカメラに向けてください"
        />
      )}

      {/* 手動入力フォーム */}
      {mode === "manual" && (
        <GlassCard className="p-6 space-y-4">
          <h2 className="text-2xl font-light text-gray-800 flex items-center">
            <span className="mr-3">✍️</span>
            手動入力
          </h2>

          {/* バーコード情報が設定されている場合の表示 */}
          {food.barcode && (
            <div className="mb-4 p-3 bg-blue-50/50 backdrop-blur-sm rounded-xl border border-blue-200/30">
              <div className="text-sm text-blue-800">
                <span className="font-medium">検出されたバーコード:</span>
                <div className="mt-1 font-mono text-xs">
                  {food.barcode_type}: {food.barcode}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <GlassInput
              label="商品名"
              placeholder="商品名"
              value={food.name || ""}
              onChange={(e) => {
                handleChange("name", e.target.value);

                // 商品名からカテゴリを自動推定
                if (e.target.value && !food.category) {
                  const suggestedCategory = suggestCategoryFromName(
                    e.target.value
                  );
                  if (suggestedCategory) {
                    handleChange("category", suggestedCategory);
                  }
                }
              }}
              disabled={isLoading}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                カテゴリ
              </label>
              <button
                type="button"
                onClick={() => setShowCategoryModal(true)}
                disabled={isLoading}
                className="w-full px-4 py-2 border rounded-lg text-left text-gray-800 bg-white/70 hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectedCategory ? (
                  <span>
                    {selectedCategory.icon} {selectedCategory.name}
                  </span>
                ) : (
                  <span className="text-gray-400">
                    カテゴリを選択してください
                  </span>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  数量
                </label>
                <GlassInput
                  type="number"
                  min={1}
                  step={1}
                  placeholder="例: 1"
                  value={food.quantity || ""}
                  onChange={(e) => handleChange("quantity", e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* ✅ 新規追加: 単位選択 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  単位
                </label>
                <button
                  type="button"
                  onClick={() => setShowUnitModal(true)}
                  disabled={isLoading}
                  className="w-full px-4 py-2 border rounded-lg text-left text-gray-800 bg-white/70 hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {selectedUnit ? (
                    <span>
                      {selectedUnit.icon} {selectedUnit.name}
                    </span>
                  ) : (
                    <span className="text-gray-400">
                      単位を選択してください
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                賞味/消費期限
              </label>
              <GlassInput
                type="date"
                placeholder="日付を選択"
                value={food.expiration_date || ""}
                onChange={(e) =>
                  handleChange("expiration_date", e.target.value)
                }
                disabled={isLoading}
              />

              {/* カテゴリに基づく推奨期限の表示 */}
              {food.category && !food.expiration_date && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const defaultDate = calculateDefaultExpirationDate(
                        food.category as FoodCategory
                      );
                      handleChange("expiration_date", defaultDate);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                    disabled={isLoading}
                  >
                    📅 推奨期限を自動設定
                  </button>
                </div>
              )}
            </div>

            {/* エラーを送信ボタンの直前に配置 */}
            {error && <GlassError message={error} />}

            <div className="flex gap-4 pt-2">
              <GlassButton type="submit" variant="primary" disabled={isLoading}>
                {isLoading ? "登録中..." : "🛒 食品を登録"}
              </GlassButton>
              <GlassButton
                type="button"
                variant="secondary"
                onClick={() => {
                  setFood({ quantity: "1", unit: "個" }); // ✅ unit もリセット
                  setMode(null);
                  setDetectedProduct(null);
                }}
                disabled={isLoading}
              >
                キャンセル
              </GlassButton>
            </div>
          </form>
        </GlassCard>
      )}

      {/* カテゴリ選択モーダル */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6 space-y-4">
            <h2 className="text-lg font-medium text-gray-800 text-center mb-2">
              カテゴリを選択
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {foodCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    handleChange("category", category.id);
                    setShowCategoryModal(false);

                    // カテゴリ選択時に推奨期限を自動設定
                    if (!food.expiration_date) {
                      const defaultDate = calculateDefaultExpirationDate(
                        category.id as FoodCategory
                      );
                      handleChange("expiration_date", defaultDate);
                    }
                  }}
                  className={`p-3 border rounded-xl text-center text-sm transition ${
                    food.category === category.id
                      ? "bg-indigo-100 border-indigo-300 text-indigo-700"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  <div className="text-xl mb-1">{category.icon}</div>
                  <div>{category.name}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCategoryModal(false)}
              className="block w-full mt-4 text-sm text-gray-500 hover:text-gray-700 text-center"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* ✅ 新規追加: 単位選択モーダル */}
      {showUnitModal && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-medium text-gray-800 text-center mb-2">
              単位を選択
            </h2>

            {/* 単位カテゴリ別に表示 */}
            <div className="space-y-4">
              {/* 個数系 */}
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  🔢 個数
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {foodUnits
                    .filter((unit) => unit.category === "count")
                    .map((unit) => (
                      <button
                        key={unit.id}
                        onClick={() => {
                          handleChange("unit", unit.id);
                          setShowUnitModal(false);
                        }}
                        className={`p-2 border rounded-lg text-center text-sm transition ${
                          food.unit === unit.id
                            ? "bg-indigo-100 border-indigo-300 text-indigo-700"
                            : "bg-white hover:bg-gray-100"
                        }`}
                      >
                        <div className="text-lg mb-1">{unit.icon}</div>
                        <div className="text-xs">{unit.name}</div>
                      </button>
                    ))}
                </div>
              </div>

              {/* 重量系 */}
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  ⚖️ 重量
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {foodUnits
                    .filter((unit) => unit.category === "weight")
                    .map((unit) => (
                      <button
                        key={unit.id}
                        onClick={() => {
                          handleChange("unit", unit.id);
                          setShowUnitModal(false);
                        }}
                        className={`p-2 border rounded-lg text-center text-sm transition ${
                          food.unit === unit.id
                            ? "bg-indigo-100 border-indigo-300 text-indigo-700"
                            : "bg-white hover:bg-gray-100"
                        }`}
                      >
                        <div className="text-lg mb-1">{unit.icon}</div>
                        <div className="text-xs">{unit.name}</div>
                      </button>
                    ))}
                </div>
              </div>

              {/* 容量系 */}
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  🧴 容量
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {foodUnits
                    .filter((unit) => unit.category === "volume")
                    .map((unit) => (
                      <button
                        key={unit.id}
                        onClick={() => {
                          handleChange("unit", unit.id);
                          setShowUnitModal(false);
                        }}
                        className={`p-2 border rounded-lg text-center text-sm transition ${
                          food.unit === unit.id
                            ? "bg-indigo-100 border-indigo-300 text-indigo-700"
                            : "bg-white hover:bg-gray-100"
                        }`}
                      >
                        <div className="text-lg mb-1">{unit.icon}</div>
                        <div className="text-xs">{unit.name}</div>
                      </button>
                    ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowUnitModal(false)}
              className="block w-full mt-4 text-sm text-gray-500 hover:text-gray-700 text-center"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* ヘルプセクション */}
      {!mode && (
        <GlassCard className="p-8">
          <h3 className="text-2xl font-light text-gray-800 mb-6 flex items-center">
            <span className="mr-3">💡</span>
            機能の説明
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400/30 to-blue-500/30 backdrop-blur-sm rounded-2xl mb-4 shadow-lg">
                <span className="text-2xl">📷</span>
              </div>
              <h4 className="font-medium text-gray-800 mb-2">
                バーコードスキャン
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                商品のJAN/EANバーコードをカメラで読み取り、商品データベースから自動で商品情報を取得します。
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400/30 to-purple-500/30 backdrop-blur-sm rounded-2xl mb-4 shadow-lg">
                <span className="text-2xl">✍️</span>
              </div>
              <h4 className="font-medium text-gray-800 mb-2">手動入力</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                商品の情報を手動で入力します。カテゴリに応じた推奨期限の自動設定機能付きです。
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* ✅ バーコードスキャン中の全画面ローディング */}
      {isRegisteringByBarcode && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <GlassCard className="p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
              <h3 className="text-xl font-light text-gray-800 mb-4">
                🛒 食品を登録しています...
              </h3>
              <p className="text-gray-600 text-sm">
                商品データベースから商品情報を取得中です
              </p>
            </div>
          </GlassCard>
        </div>
      )}

      {forceConfirmVisible && pendingFoodData && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-medium text-gray-800 text-center mb-2">
              ⚠️ カテゴリ外の食品です
            </h2>
            <p className="text-sm text-gray-700 text-center whitespace-pre-line">
              {pendingFoodData.name} は {pendingFoodData.category} に分類されませんが、
              登録を続行しますか？
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <GlassButton
                variant="primary"
                onClick={async () => {
                  try {
                    await createFood({ ...pendingFoodData, force: true });
                    alert("⚠️ カテゴリ外ですが登録しました！");
                    setFood({ quantity: "1", unit: "個" });
                    setMode(null);
                    setDetectedProduct(null);
                    setForceConfirmVisible(false);
                    setPendingFoodData(null);
                  } catch (e: any) {
                    alert("強制登録に失敗しました: " + e.message);
                    setForceConfirmVisible(false);
                    setPendingFoodData(null);
                  }
                }}
              >
                登録を強行する
              </GlassButton>
              <GlassButton
                variant="secondary"
                onClick={() => {
                  setForceConfirmVisible(false);
                  setPendingFoodData(null);
                }}
              >
                キャンセル
              </GlassButton>
            </div>
          </div>
  </div>
)}

    </div>
  );
};
