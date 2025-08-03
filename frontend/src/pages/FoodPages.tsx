// src/pages/FoodPages.tsx

import { useEffect, useState } from "react";
import { GlassCard, GlassInput } from "../components/ui/GlassUI";
import { useAuthStore } from "../stores/authStore";
import { FOOD_UNITS, type Food } from "../types/food";
import { fetchWithAuth, getApiUrl } from "../utils/fetchWrapper"; // ✅ 追加

const foodCategories = [
  { id: "all", name: "すべて", icon: "🍽️" },
  { id: "野菜・きのこ類", name: "野菜・きのこ類", icon: "🥬" },
  { id: "果物", name: "果物", icon: "🍎" },
  { id: "精肉", name: "精肉", icon: "🥩" },
  { id: "魚介類", name: "魚介類", icon: "🐟" },
  { id: "卵・乳製品", name: "卵・乳製品", icon: "🥚" },
  { id: "冷凍食品", name: "冷凍食品", icon: "🧨" },
  { id: "レトルト・缶詰", name: "レトルト・缶詰", icon: "🥫" },
  { id: "ハム・ソーセージ類", name: "ハム・ソーセージ類", icon: "🌭" },
  { id: "惣菜", name: "惣菜", icon: "🍱" },
  { id: "お菓子", name: "お菓子", icon: "🍪" },
  { id: "米、パン、麺", name: "米、パン、麺", icon: "🍚" },
  { id: "調味料", name: "調味料", icon: "🧂" },
  { id: "飲料", name: "飲料", icon: "🥤" },
  { id: "その他", name: "その他", icon: "📦" },
];

export const FoodPage = () => {
  const { token } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [foodItems, setFoodItems] = useState<Food[]>([]);
  const [daysLeftMap, setDaysLeftMap] = useState<{
    [foodId: number]: number | null;
  }>({});
  const [editingItem, setEditingItem] = useState<Food | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    quantity: "",
    unit: "g",
    expiration_date: "",
  });
  const [forceEditConfirmVisible, setForceEditConfirmVisible] = useState(false);
  const [editErrorMessage, setEditErrorMessage] = useState("");
  const [sortOrder, setSortOrder] = useState("created_at");
  const [usingItem, setUsingItem] = useState<Food | null>(null);
  const [usedQuantity, setUsedQuantity] = useState<number>(1);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        // ✅ fetchWithAuth を使用
        const res = await fetchWithAuth(getApiUrl("/api/me/foods"), token!);
        if (!res.ok) throw new Error("食品の取得に失敗しました");
        const data = await res.json();
        setFoodItems(data);
      } catch (err) {
        console.error("❌ 食品取得エラー:", err);
      }
    };
    if (token) {
      fetchFoods();
    }
  }, [token]);

  useEffect(() => {
    const fetchAllDaysLeft = async () => {
      const newDaysMap: { [id: number]: number | null } = {};
      await Promise.all(
        foodItems.map(async (item) => {
          try {
            // ✅ fetchWithAuth を使用
            const res = await fetchWithAuth(
              getApiUrl(`/api/foods/${item.id}/days_left`),
              token!
            );
            if (!res.ok) throw new Error();
            const data = await res.json();
            newDaysMap[item.id] = data.days_left;
          } catch {
            newDaysMap[item.id] = null;
          }
        })
      );
      setDaysLeftMap(newDaysMap);
    };
    if (foodItems.length > 0 && token) {
      fetchAllDaysLeft();
    }
  }, [foodItems, token]);

  const handleUse = (item: Food) => {
    setUsingItem(item);
    setUsedQuantity(1);
  };

  const confirmUse = async () => {
    if (!usingItem || !token) return;
    try {
      const res = await fetchWithAuth(getApiUrl(`/api/foods/${usingItem.id}/use`), token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ used_quantity: usedQuantity }),
      });

      if (!res.ok) throw new Error("使用に失敗しました");

      const updatedItems = foodItems.map((item) => {
        if (item.id === usingItem.id) {
          const newQuantity = item.quantity - usedQuantity;
          return { ...item, quantity: newQuantity > 0 ? newQuantity : 0 };
        }
        return item;
      });

      setFoodItems(updatedItems);
      setUsingItem(null);
      alert("✅ 使用処理が完了しました");
    } catch (err) {
      console.error("❌ 使用エラー:", err);
      alert("使用に失敗しました");
    }
  };


  const handleEdit = (item: Food) => {
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
    if (!editingItem || !token) return;
    try {
      const url = new URL(getApiUrl(`/api/foods/${editingItem.id}`));
      if (force) url.searchParams.set("force", "true");

      // ✅ fetchWithAuth を使用
      const res = await fetchWithAuth(url.toString(), token, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
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
          if (
            res.status === 409 &&
            errJson.detail?.includes("分類されません")
          ) {
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
      setForceEditConfirmVisible(false);
      alert("✅ 食品を更新しました");
    } catch (error) {
      console.error("❌ 更新エラー:", error);
      let errorMessage = "更新に失敗しました";

      if (error instanceof Error) {
        errorMessage += ": " + error.message;
      } else if (typeof error === "string") {
        errorMessage += ": " + error;
      } else {
        errorMessage += ": 不明なエラーが発生しました";
      }

      alert(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("この食品を削除しますか？");
    if (!confirmDelete || !token) return;

    try {
      // ✅ fetchWithAuth を使用
      const res = await fetchWithAuth(getApiUrl(`/api/foods/${id}`), token, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("削除に失敗しました");
      setFoodItems((prev) => prev.filter((item: Food) => item.id !== id));
      alert("✅ 食品を削除しました");
    } catch (err) {
      console.error("❌ 削除エラー:", err);
      alert("削除に失敗しました");
    }
  };

  const currentCategoryName = foodCategories.find(
    (c) => c.id === selectedCategory
  )?.name;
  const filteredItems = foodItems
    .filter(
      (item) =>
        (selectedCategory === "all" || item.category === currentCategoryName) &&
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === "created_at") {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      } else if (sortOrder === "days_left") {
        return (
          (daysLeftMap[a.id] ?? Infinity) - (daysLeftMap[b.id] ?? Infinity)
        );
      } else {
        return 0;
      }
    });

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

      <div className="flex flex-col sm:flex-row gap-4">
        <select
          className="w-full sm:w-64 p-2 rounded-lg border border-gray-300"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {foodCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.icon} {category.name}
            </option>
          ))}
        </select>

        <select
          className="w-full sm:w-64 p-2 rounded-lg border border-gray-300"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="created_at">登録順</option>
          <option value="days_left">期限まで近い順</option>
        </select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <GlassCard key={item.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-medium text-gray-800 mb-1">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.category}</p>
              </div>
              <div
                className="w-4 h-4 rounded-full shadow-lg mt-1"
                style={{
                  backgroundColor:
                    daysLeftMap[item.id] != null
                      ? daysLeftMap[item.id]! < 0
                        ? "#f87171"
                        : daysLeftMap[item.id]! <= 3
                          ? "#fbbf24"
                          : "#34d399"
                      : "#d1d5db",
                }}
              />
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
                <span className="text-gray-800 font-medium">
                  {item.expiration_date}
                </span>
              </div>
              <div className="flex justify-between">
                <span>期限まで</span>
                <span className="text-gray-800 font-medium">
                  {daysLeftMap[item.id] != null
                    ? daysLeftMap[item.id]! >= 0
                      ? `あと ${daysLeftMap[item.id]} 日`
                      : "期限切れ"
                    : "取得中..."}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => handleUse(item)}
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded">
                🍳 料理する
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
            <h2 className="text-lg font-semibold text-gray-800">
              食品情報の編集
            </h2>
            <div className="space-y-3">
              <label className="block">
                <span className="text-sm text-gray-600">食品名</span>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="mt-1 w-full rounded border-gray-300 shadow-sm"
                />
              </label>
              <label className="block">
                <span className="text-sm text-gray-600">カテゴリ</span>
                <select
                  value={editForm.category}
                  onChange={(e) =>
                    setEditForm({ ...editForm, category: e.target.value })
                  }
                  className="mt-1 w-full rounded border-gray-300 shadow-sm"
                >
                  {foodCategories
                    .filter((c) => c.id !== "all")
                    .map((c) => (
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
                  onChange={(e) =>
                    setEditForm({ ...editForm, quantity: e.target.value })
                  }
                  className="mt-1 w-full rounded border-gray-300 shadow-sm"
                />
              </label>
              <label className="block">
                <span className="text-sm text-gray-600">単位</span>
                <select
                  value={editForm.unit}
                  onChange={(e) =>
                    setEditForm({ ...editForm, unit: e.target.value })
                  }
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
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      expiration_date: e.target.value,
                    })
                  }
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

      {usingItem && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
                  <h2 className="text-lg font-semibold mb-4">
                    {usingItem.name} を料理する（{usingItem.unit}）
                  </h2>
                  <input
                    type="number"
                    value={usedQuantity}
                    min={1}
                    max={usingItem.quantity}
                    onChange={(e) => setUsedQuantity(Number(e.target.value))}
                    className="w-full mb-4 px-3 py-2 border rounded"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setUsingItem(null)} className="px-4 py-2 bg-gray-200 rounded">キャンセル</button>
                    <button onClick={confirmUse} className="px-4 py-2 bg-green-500 text-white rounded">使用</button>
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
