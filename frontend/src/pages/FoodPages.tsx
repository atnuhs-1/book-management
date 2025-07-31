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

  // ステータス判定
  const getStatus = (dateStr: string) => {
    const today = new Date();
    const expiry = new Date(dateStr);
    const diff = (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return "expired";
    if (diff <= 3) return "expiring";
    return "fresh";
  };

  const filteredItems = foodItems.filter(
    (item) =>
      (selectedCategory === "all" || item.category === selectedCategory) &&
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentCategory = foodCategories.find(
    (cat) => cat.id === selectedCategory
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h1 className="text-4xl font-light text-gray-800">食品一覧</h1>
        <GlassInput
          placeholder="食品名・カテゴリで検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon="🔍"
          className="w-full sm:w-64"
        />
      </div>

      {/* ✅ モバイル用：カテゴリモーダル起動ボタン */}
      <div className="sm:hidden">
        <button
          onClick={() => setShowModal(true)}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/30 backdrop-blur shadow flex items-center justify-between text-sm text-gray-700"
        >
          <span>
            {currentCategory?.icon} {currentCategory?.name}
          </span>
          <span className="text-xs text-gray-500">カテゴリ変更 ⬇️</span>
        </button>
      </div>

      {/* ✅ PC用：カテゴリボタン */}
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
            <div className="text-xs font-medium text-gray-700">
              {category.name}
            </div>
          </button>
        ))}
      </div>

      {/* ✅ モーダル */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6 space-y-4">
            <h2 className="text-lg font-medium text-gray-800 mb-2 text-center">
              カテゴリを選択
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {foodCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setShowModal(false);
                  }}
                  className={`p-3 border rounded-xl text-center text-sm transition ${
                    selectedCategory === category.id
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
              onClick={() => setShowModal(false)}
              className="block w-full mt-4 text-sm text-gray-500 hover:text-gray-700 text-center"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* ✅ 一覧表示 */}
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
                  {item.quantity}
                </span>
              </div>
              <div className="flex justify-between">
                <span>期限</span>
                <span className="text-gray-800 font-medium">
                  {item.expiration_date}
                </span>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

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
