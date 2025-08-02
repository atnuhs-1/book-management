// src/pages/FoodPages.tsx

import { useEffect, useState } from "react";
import { GlassCard, GlassInput } from "../components/ui/GlassUI";
import { useAuthStore } from "../stores/authStore";
import { FOOD_UNITS } from "../types/food";


const foodCategories = [
  { id: "all", name: "すべて", icon: "🍽️" },
  { id: "FRESH", name: "生鮮食品", icon: "🥬" },
  { id: "EMERGENCY", name: "非常食", icon: "🥢" },
  { id: "BEVERAGES", name: "飲料", icon: "🥤" },
  { id: "SEASONINGS", name: "調味料", icon: "🠂" },
  { id: "FROZEN", name: "冷凍食品", icon: "🤊" },
  { id: "SNACKS", name: "お菓子", icon: "🍪" },
];

const quantityUnits = ["g", "個"];

export const FoodPage = () => {
  const { token } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [foodItems, setFoodItems] = useState([]);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    quantity: "",
    unit: "g",
    expiration_date: "",
  });
  const [forceEditConfirmVisible, setForceEditConfirmVisible] = useState(false);
  const [editErrorMessage, setEditErrorMessage] = useState("");

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/me/foods/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("食品の取得に失敗しました");
        const data = await res.json();
        setFoodItems(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchFoods();
  }, [token]);

  const getStatus = (dateStr: string) => {
    const today = new Date();
    const expiry = new Date(dateStr);
    const diff = (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return "expired";
    if (diff <= 3) return "expiring";
    return "fresh";
  };

  const currentCategoryObj = foodCategories.find((cat) => cat.id === selectedCategory);

  const filteredItems = foodItems.filter(
    (item) =>
      (selectedCategory === "all" || item.category === currentCategoryObj?.name) &&
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setEditForm({
      name: item.name,
      category: item.category,
      quantity: String(item.quantity),
      unit: item.unit,
      expiration_date: item.expiration_date,
    });
  };

  const handleUpdate = async (force = false) => {
    if (!editingItem) return;

    try {
      const url = new URL(`http://localhost:8000/api/foods/${editingItem.id}`);
      if (force) url.searchParams.set("force", "true");

      const res = await fetch(url.toString(), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editForm.name.trim(),
          category: editForm.category,
          quantity: Number(editForm.quantity),
          unit: editForm.unit,
          expiration_date: editForm.expiration_date,
        }),
      });

      if (!res.ok) {
        let errorDetail = "更新に失敗しました";
        try {
          const errJson = await res.json();
          if (res.status === 409 && errJson.detail?.includes("分類されません")) {
            setEditErrorMessage(errJson.detail);
            setForceEditConfirmVisible(true);
            return;
          }
          if (errJson.detail) errorDetail = errJson.detail;
        } catch (e) {
          console.error("エラーレスポンスの解析に失敗:", e);
        }
        throw new Error(errorDetail);
      }

      const updated = await res.json();
      setFoodItems((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      setEditingItem(null);
      alert("✅ 食品を更新しました");
    } catch (err: any) {
      console.error(err);
      alert("更新に失敗しました: " + err.message);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("この食品を削除しますか？");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:8000/api/foods/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("削除に失敗しました");
      setFoodItems((prev) => prev.filter((item: any) => item.id !== id));
    } catch (err) {
      console.error(err);
      alert("削除に失敗しました");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h1 className="text-4xl font-light text-gray-800">食品一覧</h1>
        <GlassInput
          placeholder="食品名を検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon="🔍"
          className="w-full sm:w-64"
        />
      </div>

      <div className="hidden sm:grid sm:grid-cols-4 lg:grid-cols-7 gap-4">
        {foodCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`p-4 rounded-2xl text-center transition-all duration-500 border ${
              selectedCategory === category.id
                ? "bg-white/50 backdrop-blur-xl border-white/40 shadow-xl"
                : "bg-white/20 backdrop-blur-xl border-white/20 hover:bg-white/30"
            }`}
          >
            <div className="text-2xl mb-2">{category.icon}</div>
            <div className="text-xs font-medium text-gray-700">{category.name}</div>
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item: any) => (
          <GlassCard key={item.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-medium text-gray-800 mb-1">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.category}</p>
              </div>
              <div
                className={`w-4 h-4 rounded-full shadow-lg ${
                  getStatus(item.expiration_date) === "expired"
                    ? "bg-red-400"
                    : getStatus(item.expiration_date) === "expiring"
                    ? "bg-amber-400"
                    : "bg-green-400"
                }`}
              ></div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>数量</span>
                <span className="text-gray-800 font-medium">
                  {item.quantity} {item.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span>期限</span>
                <span className="text-gray-800 font-medium">{item.expiration_date}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => handleEdit(item)}
                className="px-3 py-1 text-sm rounded text-white bg-blue-500 hover:bg-blue-600 transition"
              >
                編集
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="px-3 py-1 text-sm rounded text-white bg-red-500 hover:bg-red-600 transition"
              >
                削除
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      {editingItem && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800">食品情報の編集</h2>
            <div className="space-y-3">
              <label className="block">
                <span className="text-sm text-gray-600">食品名</span>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="mt-1 w-full rounded border-gray-300 shadow-sm"
                />
              </label>
              <label className="block">
                <span className="text-sm text-gray-600">カテゴリ</span>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="mt-1 w-full rounded border-gray-300 shadow-sm"
                >
                  {foodCategories.filter((c) => c.id !== "all").map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm text-gray-600">数量</span>
                <input
                  type="number"
                  value={editForm.quantity}
                  onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                  className="mt-1 w-full rounded border-gray-300 shadow-sm"
                />
              </label>
              <label className="block">
                <span className="text-sm text-gray-600">単位</span>
                <select
                  value={editForm.unit}
                  onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                  className="mt-1 w-full rounded border-gray-300 shadow-sm"
                >
                  {FOOD_UNITS.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm text-gray-600">賞味/消費期限</span>
                <input
                  type="date"
                  value={editForm.expiration_date}
                  onChange={(e) => setEditForm({ ...editForm, expiration_date: e.target.value })}
                  className="mt-1 w-full rounded border-gray-300 shadow-sm"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300"
              >
                キャンセル
              </button>
              <button
                onClick={() => handleUpdate()}
                className="px-4 py-2 text-sm rounded text-white bg-green-500 hover:bg-green-600"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {forceEditConfirmVisible && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h2 className="text-lg font-medium text-gray-800 text-center">
              ⚠️ カテゴリ外の食品です
            </h2>
            <p className="text-sm text-gray-700 text-center whitespace-pre-line">
              {editErrorMessage}
              {"\n\n"}このまま変更を強行しますか？
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <button
                onClick={() => {
                  setForceEditConfirmVisible(false);
                  handleUpdate(true);
                }}
                className="px-4 py-2 text-sm rounded text-white bg-red-500 hover:bg-red-600"
              >
                強行して保存
              </button>
              <button
                onClick={() => setForceEditConfirmVisible(false)}
                className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
