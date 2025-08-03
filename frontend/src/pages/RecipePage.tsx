import { useEffect, useState } from "react";
import axios from "axios";
import { GlassCard, GlassButton } from "../components/ui/GlassUI";
import { useAuthStore } from "../stores/authStore";

interface FoodItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  expiration_date: string;
}

interface Ingredient {
  name: string;
  amount: string;
}

interface Recipe {
  title: string;
  ingredients?: Ingredient[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const RecipePage = () => {
  const { token } = useAuthStore();
  const [expiringFoods, setExpiringFoods] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<string | null>(null);
  const [mainFoodRecipes, setMainFoodRecipes] = useState<Recipe[]>([]);
  const [suggestedRecipes, setSuggestedRecipes] = useState<Recipe[]>([]);
  const [mainReloadKey, setMainReloadKey] = useState(0);
  const [suggestedReloadKey, setSuggestedReloadKey] = useState(0);
  const [loadingExpiring, setLoadingExpiring] = useState(false);
  const [loadingMain, setLoadingMain] = useState(false);
  const [loadingSuggested, setLoadingSuggested] = useState(false);

  useEffect(() => {
    const fetchExpiringFoods = async () => {
      if (!token) return;
      setLoadingExpiring(true);
      try {
        const res = await fetch(`${API_BASE_URL}/foods/expiring_soon`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("期限間近の食品取得に失敗");
        const data = await res.json();
        if (Array.isArray(data)) setExpiringFoods(data);
      } catch (err) {
        console.error("期限間近の食品取得エラー:", err);
      } finally {
        setLoadingExpiring(false);
      }
    };
    fetchExpiringFoods();
  }, [token]);

  useEffect(() => {
    const fetchMainFoodRecipe = async () => {
      if (!selectedFood || !token) return;
      setLoadingMain(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/foods/recipe_by_main_food`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { food_name: selectedFood },
        });
        const data = res.data.recipes;
        setMainFoodRecipes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("主食材レシピ取得エラー:", err);
        setMainFoodRecipes([]);
      } finally {
        setLoadingMain(false);
      }
    };
    fetchMainFoodRecipe();
  }, [selectedFood, token, mainReloadKey]);

  useEffect(() => {
    const fetchSuggestedRecipes = async () => {
      if (!token) return;
      setLoadingSuggested(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/foods/recipe_suggestions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const nested = res.data.recipes?.[0]?.recipes;
        setSuggestedRecipes(Array.isArray(nested) ? nested : []);
      } catch (err) {
        console.error("レシピ提案取得エラー:", err);
        setSuggestedRecipes([]);
      } finally {
        setLoadingSuggested(false);
      }
    };
    fetchSuggestedRecipes();
  }, [token, suggestedReloadKey]);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-10 font-sans">
      <div className="bg-white/30 backdrop-blur-xl rounded-[2rem] p-8 border border-white/20 shadow-xl">
        <h1 className="text-4xl font-bold text-gray-800 text-center mb-6">レシピ提案</h1>

        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">期限が迫っている食品</h2>
          {loadingExpiring ? (
            <div className="animate-pulse text-gray-500">読み込み中...</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {expiringFoods.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedFood(item.name)}
                  className={`px-4 py-1 rounded-full border text-sm font-medium transition ${
                    selectedFood === item.name
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          )}
        </section>

        {selectedFood && (
          <section>
            <div className="flex items-center justify-between mb-2 mt-6">
              <h2 className="text-lg font-semibold text-gray-700">
                「{selectedFood}」を主材料に使ったレシピ
              </h2>
              <GlassButton
                size="sm"
                variant="secondary"
                onClick={() => setMainReloadKey((prev) => prev + 1)}
              >
                別のレシピを提案
              </GlassButton>
            </div>
            {loadingMain ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : mainFoodRecipes.length > 0 ? (
              mainFoodRecipes.map((recipe, idx) => (
                <GlassCard key={idx} className="mb-4 whitespace-pre-wrap text-sm">
                  <p className="font-bold text-lg mb-2">{recipe.title}</p>
                  {Array.isArray(recipe.ingredients) ? (
                    <ul className="list-disc list-inside space-y-1">
                      {recipe.ingredients.map((ing, i) => (
                        <li key={i}>{ing.name}（{ing.amount}）</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-red-500">材料データが取得できませんでした。</p>
                  )}
                </GlassCard>
              ))
            ) : (
              <p className="text-sm text-gray-500">該当するレシピが見つかりませんでした。</p>
            )}
          </section>
        )}

        <section className="mt-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-700">
              期限間近の食品を活用したレシピ
            </h2>
            <GlassButton
              size="sm"
              variant="secondary"
              onClick={() => setSuggestedReloadKey((prev) => prev + 1)}
            >
              別のレシピを提案
            </GlassButton>
          </div>
          {loadingSuggested ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : suggestedRecipes.length > 0 ? (
            suggestedRecipes.map((recipe, idx) => (
              <GlassCard key={idx} className="mb-4 whitespace-pre-wrap text-sm">
                <p className="font-bold text-lg mb-2">{recipe.title}</p>
                {Array.isArray(recipe.ingredients) ? (
                  <ul className="list-disc list-inside space-y-1 p-4">
                    {recipe.ingredients.map((ing, i) => (
                      <li key={i}>{ing.name}（{ing.amount}）</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-red-500">材料データが取得できませんでした。</p>
                )}
              </GlassCard>
            ))
          ) : (
            <p className="text-sm text-gray-500">該当するレシピが見つかりませんでした。</p>
          )}
        </section>
      </div>
    </div>
  );
};
