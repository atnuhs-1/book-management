// frontend/src/pages/RegisterFoodPage.tsx - BarcodeScanPage連携版

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  GlassCard,
  GlassInput,
  GlassButton,
  GlassError,
} from "../components/ui/GlassUI";
import { useAuthStore } from "../stores/authStore";
import { useFoodStore } from "../stores/foodStore";
import type { FoodCreate, FoodCategory, FoodUnit } from "../types/food";
import {
  suggestCategoryFromName,
  calculateDefaultExpirationDate,
  validateFoodData,
} from "../utils/foodUtils";

// ✅ errorFormatterをインポート
import { formatFoodError, logError } from "../utils/errorFormatter";

interface FoodCategoryItem {
  id: string;
  name: string;
  icon: string;
}

const foodCategories: FoodCategoryItem[] = [
  { id: "野菜・きのこ類", name: "野菜・きのこ類", icon: "🥬" },
  { id: "果物", name: "果物", icon: "🍎" },
  { id: "精肉", name: "精肉", icon: "🥩" },
  { id: "魚介類", name: "魚介類", icon: "🐟" },
  { id: "卵・乳製品", name: "卵・乳製品", icon: "🥛" },
  { id: "冷凍食品", name: "冷凍食品", icon: "🧊" },
  { id: "レトルト・缶詰", name: "レトルト・缶詰", icon: "🥫" },
  { id: "ハム・ソーセージ類", name: "ハム・ソーセージ類", icon: "🌭" },
  { id: "惣菜", name: "惣菜", icon: "🍱" },
  { id: "お菓子", name: "お菓子", icon: "🍪" },
  { id: "米、パン、麺", name: "米、パン、麺", icon: "🍞" },
  { id: "調味料", name: "調味料", icon: "🧂" },
  { id: "飲料", name: "飲料", icon: "🥤" },
  { id: "その他", name: "その他", icon: "📦" },
];

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
  unit: string;
  barcode?: string;
  barcode_type?: "JAN" | "EAN";
};

// ✅ 確認ダイアログの状態管理用インターフェース
interface ConfirmationState {
  isVisible: boolean;
  message: string;
  foodData: FoodCreate | null;
}

export const RegisterFoodPage = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ✅ バーコードスキャンからの戻り処理
  const fromScan = searchParams.get("from") === "scan";
  const scannedBarcode = searchParams.get("barcode");
  const barcodeType = searchParams.get("barcodeType") as "JAN" | "EAN" | null;
  const scannedName = searchParams.get("name");
  const scannedQuantity = searchParams.get("quantity");
  const scannedUnit = searchParams.get("unit");

  // ✅ 確認ダイアログ状態
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isVisible: false,
    message: "",
    foodData: null,
  });

  const { createFood, isLoading, error, setError } = useFoodStore();

  const [mode, setMode] = useState<"manual" | "barcode" | null>(null);
  const [food, setFood] = useState<Partial<FoodItem>>({
    quantity: "1",
    unit: "個",
  });
  const [showUnitModal, setShowUnitModal] = useState(false);

  // ✅ バーコードスキャンからの戻り時の処理
  useEffect(() => {
    if (fromScan && scannedBarcode && barcodeType) {
      // バーコード情報と取得できた商品情報をフォームに設定
      const foodData: Partial<FoodItem> = {
        barcode: scannedBarcode,
        barcode_type: barcodeType,
        quantity: scannedQuantity || "1",
        unit: scannedUnit || "個",
      };

      // 商品名が取得できた場合は設定
      if (scannedName) {
        foodData.name = scannedName;

        // 商品名から推定カテゴリを設定
        const suggestedCategory = suggestCategoryFromName(scannedName);
        if (suggestedCategory) {
          foodData.category = suggestedCategory;
        }
      }

      setFood(foodData);
      setMode("manual");

      // URLをクリーンアップ
      navigate("/add-food", { replace: true });
    }
  }, [
    fromScan,
    scannedBarcode,
    barcodeType,
    scannedName,
    scannedQuantity,
    scannedUnit,
    navigate,
  ]);

  // 未認証の場合のガード
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

  // ✅ バーコードスキャンページに遷移
  const handleBarcodeNavigation = () => {
    navigate("/barcode-scan?mode=food&action=register&returnTo=/add-food");
  };

  const handleChange = (field: keyof FoodItem, value: string) => {
    setFood((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ 手動登録処理（errorFormatter対応）
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
      await createFood(foodData);
      alert("食品を登録しました！");
      setFood({ quantity: "1", unit: "個" });
      setMode(null);
    } catch (error: unknown) {
      console.error("食品登録エラー:", error);

      // ✅ 型安全な確認エラーの判定
      const isConfirmationError = (
        err: unknown
      ): err is Error & {
        needsConfirmation: boolean;
        confirmationMessage: string;
        canForce: boolean;
        originalFoodData: FoodCreate;
      } => {
        return (
          err instanceof Error &&
          "needsConfirmation" in err &&
          "confirmationMessage" in err &&
          "canForce" in err &&
          "originalFoodData" in err
        );
      };

      // ✅ 確認が必要な409エラーの場合
      if (isConfirmationError(error)) {
        setConfirmation({
          isVisible: true,
          message: error.confirmationMessage,
          foodData: error.originalFoodData,
        });
        return;
      }

      // ✅ その他のエラーの処理
      const errorResult = formatFoodError(error);
      logError(error, "RegisterFoodPage.handleSubmit");

      if (errorResult.isAuthError) {
        alert("セッションが期限切れです。再度ログインしてください。");
        navigate("/login");
        return;
      }

      alert(`❌ 登録に失敗しました: ${errorResult.message}`);
    }
  };

  // ✅ 強行登録処理
  const handleForceRegister = async () => {
    if (!confirmation.foodData) return;

    try {
      await createFood({
        ...confirmation.foodData,
        force: true,
      });

      alert("⚠️ カテゴリ外ですが登録しました！");
      setFood({ quantity: "1", unit: "個" });
      setMode(null);
      setConfirmation({
        isVisible: false,
        message: "",
        foodData: null,
      });
    } catch (error: unknown) {
      console.error("強制登録エラー:", error);

      // ✅ errorFormatterを使用
      const errorResult = formatFoodError(error);
      logError(error, "RegisterFoodPage.handleForceRegister");

      alert(`❌ 強制登録に失敗しました: ${errorResult.message}`);
      setConfirmation({
        isVisible: false,
        message: "",
        foodData: null,
      });
    }
  };

  // ✅ 確認ダイアログのキャンセル
  const handleCancelConfirmation = () => {
    setConfirmation({
      isVisible: false,
      message: "",
      foodData: null,
    });
  };

  const selectedUnit = foodUnits.find((u) => u.id === food.unit);

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
          {/* ✅ バーコードスキャンカード - BarcodeScanPageに遷移 */}
          <div
            className={`group cursor-pointer transition-all duration-500`}
            onClick={handleBarcodeNavigation}
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

      {/* 手動入力フォーム */}
      {mode === "manual" && (
        <GlassCard className="p-6 space-y-4">
          <h2 className="text-2xl font-light text-gray-800 flex items-center">
            <span className="mr-3">✍️</span>
            手動入力
          </h2>

          {/* ✅ バーコード情報表示（バーコードスキャンから戻ってきた場合） */}
          {food.barcode && (
            <div className="mb-4 p-3 bg-blue-50/50 backdrop-blur-sm rounded-xl border border-blue-200/30">
              <div className="text-sm text-blue-800">
                <span className="font-medium">検出されたバーコード:</span>
                <div className="mt-1 font-mono text-xs">
                  {food.barcode_type}: {food.barcode}
                </div>
                {scannedName ? (
                  <div className="mt-2 text-xs text-blue-600">
                    ✅
                    商品情報が取得できました。不足している情報を入力してください。
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-blue-600">
                    商品情報が見つからなかったため、手動で入力してください
                  </div>
                )}
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
              <select
                value={food.category || ""}
                onChange={(e) => handleChange("category", e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2 border rounded-lg text-gray-800 bg-white/70 hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="" disabled>
                  カテゴリを選択してください
                </option>
                {foodCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
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

            {error && <GlassError message={error} />}

            <div className="flex gap-4 pt-2">
              <GlassButton type="submit" variant="primary" disabled={isLoading}>
                {isLoading ? "登録中..." : "🛒 食品を登録"}
              </GlassButton>
              <GlassButton
                type="button"
                variant="secondary"
                onClick={() => {
                  setFood({ quantity: "1", unit: "個" });
                  setMode(null);
                }}
                disabled={isLoading}
              >
                キャンセル
              </GlassButton>
            </div>
          </form>
        </GlassCard>
      )}

      {/* 単位選択モーダル（既存のまま - 省略） */}
      {showUnitModal && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-medium text-gray-800 text-center mb-2">
              単位を選択
            </h2>

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

      {/* ✅ 確認ダイアログ */}
      {confirmation.isVisible && confirmation.foodData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <GlassCard className="p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400/30 to-amber-500/30 backdrop-blur-sm rounded-2xl mb-6 shadow-xl">
                <span className="text-3xl">⚠️</span>
              </div>

              <h3 className="text-xl font-light text-gray-800 mb-4">
                カテゴリの確認
              </h3>

              <p className="text-gray-600 mb-8 leading-relaxed text-left bg-amber-50/50 p-4 rounded-lg border border-amber-200/30">
                {confirmation.message}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <GlassButton
                  variant="primary"
                  onClick={handleForceRegister}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  disabled={isLoading}
                >
                  {isLoading ? "登録中..." : "はい、登録します"}
                </GlassButton>

                <GlassButton
                  variant="outline"
                  onClick={handleCancelConfirmation}
                  className="flex-1"
                  disabled={isLoading}
                >
                  キャンセル
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

