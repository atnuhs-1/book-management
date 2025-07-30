// src/pages/FoodExpiryPage.tsx

import { GlassCard } from "../components/ui/GlassUI";

const sampleFoodItems = [
  {
    id: 1,
    name: "牛乳",
    expiryDate: "2024-02-05",
    quantity: 2,
    unit: "本",
    status: "expiring",
  },
  {
    id: 5,
    name: "冷凍餃子",
    expiryDate: "2024-01-30",
    quantity: 3,
    unit: "袋",
    status: "expired",
  },
  {
    id: 6,
    name: "ポテトチップス",
    expiryDate: "2024-02-10",
    quantity: 4,
    unit: "袋",
    status: "expiring",
  },
];

export const FoodExpiryPage = () => {
  const expiredItems = sampleFoodItems.filter(
    (item) => item.status === "expired"
  );
  const expiringItems = sampleFoodItems.filter(
    (item) => item.status === "expiring"
  );

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
              <p className="text-sm text-red-600">期限: {item.expiryDate}</p>
              <p className="text-sm text-gray-600">
                {item.quantity} {item.unit}
              </p>
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
              <p className="text-sm text-amber-600">期限: {item.expiryDate}</p>
              <p className="text-sm text-gray-600">
                {item.quantity} {item.unit}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};
