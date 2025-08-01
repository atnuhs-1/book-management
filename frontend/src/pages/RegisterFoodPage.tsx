// src/pages/RegisterFoodPage.tsx

import { useState } from "react";
import { GlassCard, GlassInput, GlassButton } from "../components/ui/GlassUI";
import { useAuthStore } from "../stores/authStore";

const foodCategories = [
  { id: "FRESH", name: "生鮮食品", icon: "🥬" },
  { id: "EMERGENCY", name: "非常食", icon: "🥢" },
  { id: "BEVERAGES", name: "飲料", icon: "🥤" },
  { id: "SEASONINGS", name: "調味料", icon: "🠂" },
  { id: "FROZEN", name: "冷凍食品", icon: "🧨" },
  { id: "SNACKS", name: "お菓子", icon: "🍪" },
];

const quantityUnits = ["g", "個"];

type FoodItem = {
  name: string;
  category: string;
  expiration_date: string;
  quantity: string;
  unit: string;
};

export const RegisterFoodPage = () => {
  const { token } = useAuthStore();
  const [mode, setMode] = useState<"manual" | "barcode" | null>(null);
  const [food, setFood] = useState<Partial<FoodItem>>({ quantity: "1", unit: "g" });
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const simulateBarcodeScan = () => {
    setFood({
      name: "カップラーメン",
      category: "emergency",
      quantity: "1",
      unit: "個"
    });
  };

  const handleChange = (field: keyof FoodItem, value: string) => {
    setFood((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!food.name || !food.category || !food.expiration_date || !food.quantity || !food.unit || Number(food.quantity) < 1) {
      alert("すべての項目を正しく入力してください");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/foods/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: food.name.trim(),
          category: selectedCategory?.name || "",
          quantity: Number(food.quantity),
          unit: food.unit,
          expiration_date: food.expiration_date,
        }),
      });

      if (!res.ok) {
        throw new Error("登録に失敗しました");
      }

      alert("食品を登録しました！");
      setFood({ quantity: "1", unit: "g" });
      setMode(null);
    } catch (err) {
      alert("登録中にエラーが発生しました");
      console.error(err);
    }
  };

  const selectedCategory = foodCategories.find((c) => c.id === food.category);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-4xl font-light text-gray-800">食品追加</h1>

      {!mode && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <GlassCard
            className="cursor-pointer p-6 text-center hover:bg-white/30 transition"
            onClick={() => setMode("barcode")}
          >
            <div className="text-4xl mb-2">📷</div>
            <h2 className="text-lg font-medium text-gray-700">バーコードで登録</h2>
            <p className="text-sm text-gray-500 mt-1">商品情報を読み取り、期限だけ入力</p>
          </GlassCard>
          <GlassCard
            className="cursor-pointer p-6 text-center hover:bg-white/30 transition"
            onClick={() => setMode("manual")}
          >
            <div className="text-4xl mb-2">✍️</div>
            <h2 className="text-lg font-medium text-gray-700">手動入力で登録</h2>
            <p className="text-sm text-gray-500 mt-1">すべての情報を自分で入力</p>
          </GlassCard>
        </div>
      )}

      {(mode === "barcode" || mode === "manual") && (
        <GlassCard className="p-6 space-y-4">
          <h2 className="text-2xl font-light text-gray-800 flex items-center">
            {mode === "barcode" ? <>📷 バーコード登録</> : <>✍️ 手動入力</>}
          </h2>

          {mode === "barcode" && (
            <button
              onClick={simulateBarcodeScan}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600 transition"
            >
              バーコード読み取りをシミュレーション
            </button>
          )}

          {(mode === "manual" || food.name) && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <GlassInput
                label="商品名"
                placeholder="商品名"
                value={food.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(true)}
                  className="w-full px-4 py-2 border rounded-lg text-left text-gray-800 bg-white/70 hover:bg-white/80"
                >
                  {selectedCategory ? (
                    <span>
                      {selectedCategory.icon} {selectedCategory.name}
                    </span>
                  ) : (
                    <span className="text-gray-400">カテゴリを選択してください</span>
                  )}
                </button>
              </div>

              <GlassInput
                label="数量"
                type="number"
                min={1}
                step={1}
                placeholder="例: 1"
                value={food.quantity || ""}
                onChange={(e) => handleChange("quantity", e.target.value)}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">単位</label>
                <select
                  className="w-full rounded border-gray-300 shadow-sm"
                  value={food.unit || "g"}
                  onChange={(e) => handleChange("unit", e.target.value)}
                >
                  {quantityUnits.map((unit) => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>

              <GlassInput
                label="賞味/消費期限"
                type="date"
                placeholder="日付を選択"
                value={food.expiration_date || ""}
                onChange={(e) => handleChange("expiration_date", e.target.value)}
              />

              <div className="flex gap-4 pt-2">
                <GlassButton type="submit" variant="primary">
                  登録
                </GlassButton>
                <GlassButton
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setFood({ quantity: "1", unit: "g" });
                    setMode(null);
                  }}
                >
                  キャンセル
                </GlassButton>
              </div>
            </form>
          )}
        </GlassCard>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6 space-y-4">
            <h2 className="text-lg font-medium text-gray-800 text-center mb-2">カテゴリを選択</h2>
            <div className="grid grid-cols-2 gap-3">
              {foodCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    handleChange("category", category.id);
                    setShowCategoryModal(false);
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
    </div>
  );
};
