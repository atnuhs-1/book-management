// src/pages/FoodExpiryPage.tsx

import { useEffect, useState, useRef, useMemo } from "react";
import { GlassCard } from "../components/ui/GlassUI";
import { useAuthStore } from "../stores/authStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type FoodItem = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiration_date: string;
};

export const FoodExpiryPage = () => {
  const { token } = useAuthStore();
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const today = useMemo(() => new Date(), []);
  const hasAlertedRef = useRef(false);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/me/foods`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          const errorText = await res.text();
          console.error("食品取得失敗:", errorText);
          throw new Error("食品の取得に失敗しました");
        }
        const data = await res.json();
        setFoodItems(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchFoods();
  }, [token]);

  useEffect(() => {
    if (hasAlertedRef.current) return;

    const showAlert = () => {
      const alertDays = [7, 5, 3, 1, 0]; // ← 0日を追加
      const alerted: string[] = [];
      foodItems.forEach((item) => {
        const diff = Math.ceil(
          (new Date(item.expiration_date).getTime() - today.getTime()) /
            (1000 * 60 * 60 * 24)
        );
    
        if (alertDays.includes(diff)) {
          if (diff === 0) {
            alerted.push(`${item.name} は今日が期限です`);
          } else {
            alerted.push(`${item.name} があと ${diff} 日で期限です`);
          }
        }
      });
    
      if (alerted.length > 0) {
        alert(alerted.join("\n"));
        hasAlertedRef.current = true;
      }
    };

    showAlert();
  }, [foodItems, today]);

  const handleEat = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/foods/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error("削除失敗:", errorText);
        throw new Error("削除に失敗しました");
      }
      setFoodItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      alert("食べた処理に失敗しました");
    }
  };

  const expiredItems = foodItems.filter((item) => {
    const diff = Math.ceil(
      (new Date(item.expiration_date).getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return diff < 0;
  });

  const expiringItems = foodItems.filter((item) => {
    const diff = Math.ceil(
      (new Date(item.expiration_date).getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24)
    );
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
              <p className="text-sm text-gray-600">
                {item.quantity} {item.unit}
              </p>
              <button
                onClick={() => handleEat(item.id)}
                className="mt-2 px-3 py-1 text-sm text-white bg-red-500 hover:bg-red-600 rounded"
              >
                食べた
              </button>
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
          {expiringItems.map((item) => {
            const expiry = new Date(item.expiration_date);
            const diff = Math.ceil(
              (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            );
            return (
              <div
                key={item.id}
                className="bg-amber-50/50 backdrop-blur-sm rounded-xl p-4 border border-amber-200/30"
              >
                <h3 className="font-medium text-amber-800">{item.name}</h3>
                <p className="text-sm text-amber-600">
                  期限: {item.expiration_date}
                </p>
                <p className="text-sm text-gray-600">あと {diff} 日</p>
                <p className="text-sm text-gray-600">
                  {item.quantity} {item.unit}
                </p>
                <button
                  onClick={() => handleEat(item.id)}
                  className="mt-2 px-3 py-1 text-sm text-white bg-amber-500 hover:bg-amber-600 rounded"
                >
                  食べた
                </button>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
};
