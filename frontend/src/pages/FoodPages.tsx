// src/pages/FoodPages.tsx

import { useEffect, useState } from "react";
import { GlassCard, GlassInput } from "../components/ui/GlassUI";
import { useAuthStore } from "../stores/authStore";

const foodCategories = [
  { id: "all", name: "すべて", icon: "🍽️" },
  { id: "FRESH", name: "生鮮食品", icon: "🥬" },
  { id: "EMERGENCY", name: "非常食", icon: "🥫" },
  { id: "BEVERAGES", name: "飲料", icon: "🥤" },
  { id: "SEASONINGS", name: "調味料", icon: "🧂" },
  { id: "FROZEN", name: "冷凍食品", icon: "🧊" },
  { id: "SNACKS", name: "お菓子", icon: "🍪" },
];

export const FoodPage = () => {
  const { token } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [foodItems, setFoodItems] = useState([]);

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

  const currentCategory = foodCategories.find(
    (cat) => cat.id === selectedCategory
  );

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("この食品を削除しますか？");
    if (!confirmDelete) return;
  
    try {
      const res = await fetch(`http://localhost:8000/api/foods/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!res.ok) throw new Error("削除に失敗しました");
  
      // 成功したら一覧から削除
      setFoodItems((prev) => prev.filter((item: any) => item.id !== id));
    } catch (err) {
      console.error(err);
      alert("削除に失敗しました");
    }
  };

  const [editingItem, setEditingItem] = useState<any | null>(null);

  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    quantity: "",
    expiration_date: "",
  });

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setEditForm({
      name: item.name,
      category: item.category,
      quantity: String(item.quantity),
      expiration_date: item.expiration_date,
    });
  };

  const handleUpdate = async () => {
    if (!editingItem) return;
  
    try {
      const res = await fetch(`http://localhost:8000/api/foods/${editingItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editForm.name.trim(),
          category: editForm.category,
          quantity: Number(editForm.quantity),
          expiration_date: editForm.expiration_date,
        }),
      });
  
      if (!res.ok) throw new Error("更新に失敗しました");
  
      const updated = await res.json();
      setFoodItems((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      setEditingItem(null); // モーダルを閉じる
    } catch (err) {
      console.error(err);
      alert("更新に失敗しました");
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
                <span className="text-gray-800 font-medium">{item.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span>期限</span>
                <span className="text-gray-800 font-medium">{item.expiration_date}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => handleEdit(item)}
                className="text-sm text-blue-600 hover:underline"
              >
                ✏️ 編集
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-sm text-red-600 hover:underline"
              >
                🗑️ 削除
              </button>
              </div>
          </GlassCard>
        ))}
      </div>

          {editingItem && (
      <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-800 text-center">食品を編集</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdate();
            }}
            className="space-y-4"
          >
            <input
              type="text"
              className="w-full border px-3 py-2 rounded"
              placeholder="商品名"
              value={editForm.name}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
            <input
              type="text"
              className="w-full border px-3 py-2 rounded"
              placeholder="カテゴリ"
              value={editForm.category}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, category: e.target.value }))
              }
              required
            />
            <input
              type="number"
              className="w-full border px-3 py-2 rounded"
              placeholder="数量"
              value={editForm.quantity}
              min={1}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, quantity: e.target.value }))
              }
              required
            />
            <input
              type="date"
              className="w-full border px-3 py-2 rounded"
              value={editForm.expiration_date}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  expiration_date: e.target.value,
                }))
              }
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
            >
              保存
            </button>
          </form>
          <div className="flex justify-center pt-2">
            <button
              className="text-sm text-gray-500 hover:text-gray-700 underline"
              onClick={() => setEditingItem(null)}
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
      )}

      {filteredItems.length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-4 opacity-50">🍎</div>
          <h3 className="text-xl font-light text-gray-800 mb-2">
            食品が見つかりません
          </h3>
          <p className="text-gray-600">別の条件で検索してみてください</p>
        </div>
      )}
    </div>
  );
};
