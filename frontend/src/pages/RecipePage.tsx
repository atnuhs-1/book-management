// src/pages/RecipePage.tsx

import { useState } from "react";
import { GlassCard } from "../components/ui/GlassUI";

const sampleFoodItems = [
  { id: 1, name: "牛乳", status: "expiring" },
  { id: 6, name: "ポテトチップス", status: "expiring" },
];

const sampleRecipes = [
  {
    id: 1,
    title: "パンケーキ",
    ingredients: ["牛乳", "小麦粉", "卵"],
    steps: ["材料を混ぜる", "焼く"],
  },
  {
    id: 2,
    title: "ミルクスープ",
    ingredients: ["牛乳", "玉ねぎ", "ベーコン"],
    steps: ["炒める", "牛乳を加える", "煮込む"],
  },
];

export const RecipePage = () => {
  const expiringFoods = sampleFoodItems.filter(
    (item) => item.status === "expiring"
  );

  const [selectedFood, setSelectedFood] = useState<string | null>(null);

  const matchingRecipes = selectedFood
    ? sampleRecipes.filter((r) => r.ingredients.includes(selectedFood))
    : [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-4xl font-light text-gray-800">レシピ提案</h1>

      <div>
        <h2 className="text-lg font-medium text-gray-700 mb-2">期限が迫っている食品</h2>
        <div className="flex flex-wrap gap-3">
          {expiringFoods.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedFood(item.name)}
              className={`px-4 py-2 rounded-full text-sm border ${
                selectedFood === item.name
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-800"
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {selectedFood && (
        <div>
          <h2 className="text-lg font-medium text-gray-700 mt-6 mb-3">
            「{selectedFood}」を使ったレシピ
          </h2>
          {matchingRecipes.length > 0 ? (
            matchingRecipes.map((recipe) => (
              <GlassCard key={recipe.id} className="p-6 space-y-3">
                <h3 className="text-xl font-semibold text-gray-800">{recipe.title}</h3>
                <p className="text-sm text-gray-600">材料: {recipe.ingredients.join(", ")}</p>
                <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
                  {recipe.steps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </GlassCard>
            ))
          ) : (
            <p className="text-gray-500">該当するレシピが見つかりませんでした。</p>
          )}
        </div>
      )}
    </div>
  );
};
