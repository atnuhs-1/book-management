// src/pages/FoodExpiryPage.tsx

import { useEffect, useState } from "react";
import { GlassCard } from "../components/ui/GlassUI";
import { useAuthStore } from "../stores/authStore";

type FoodItem = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  expiration_date: string;
};

export const FoodExpiryPage = () => {
  const { token } = useAuthStore();
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/food-items/", {
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

  const today = new Date();

  const expiredItems = foodItems.filter((item) => {
    const expiry = new Date(item.expiration_date);
    return expiry < today;
  });

  const expiringItems = foodItems.filter((item) => {
    const expiry = new Date(item.expiration_date);
    const diff = (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 3;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-4xl font-light text-gray-800">期限管理</h1>

      <GlassCard className="p-6">
        <h2 className="text-2xl font-light text-red-600 mb-4 flex items-center">
          <span className="mr-2">🚨</span>
          期限切れ ({expiredItems.length}件)
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {expiredItems.map((item) => (
            <div
              key={item.id}
              className="bg-red-50/50 backdrop-blur-sm rounded-xl p-4 border border-red-200/30"
            >
              <h3 className="font-medium text-red-800">{item.name}</h3>
              <p className="text-sm text-red-600">
                期限: {item.expiration_date}
              </p>
              <p className="text-sm text-gray-600">{item.quantity} 個</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="text-2xl font-light text-amber-600 mb-4 flex items-center">
          <span className="mr-2">⚠️</span>
          期限間近 ({expiringItems.length}件)
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {expiringItems.map((item) => (
            <div
              key={item.id}
              className="bg-amber-50/50 backdrop-blur-sm rounded-xl p-4 border border-amber-200/30"
            >
              <h3 className="font-medium text-amber-800">{item.name}</h3>
              <p className="text-sm text-amber-600">
                期限: {item.expiration_date}
              </p>
              <p className="text-sm text-gray-600">{item.quantity} 個</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};
