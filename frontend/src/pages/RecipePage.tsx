import { useEffect, useState } from "react";
import axios from "axios";
import { GlassCard } from "../components/ui/GlassUI";
import { useAuthStore } from "../stores/authStore";

interface FoodItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  expiration_date: string;
}

interface RecipeFromGPT {
  source: string;
  recipes: string[];
}

export const RecipePage = () => {
  const { token } = useAuthStore();
  const [expiringFoods, setExpiringFoods] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<string | null>(null);
  const [mainFoodRecipes, setMainFoodRecipes] = useState<string[]>([]);
  const [suggestedRecipes, setSuggestedRecipes] = useState<string[]>([]);
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
        const res = await fetch("http://localhost:8000/api/foods/expiring_soon", {
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
        const res = await axios.get<RecipeFromGPT>("http://localhost:8000/api/foods/recipe_by_main_food", {
          headers: { Authorization: `Bearer ${token}` },
          params: { food_name: selectedFood },
        });
        const rawRecipes = res.data.recipes;
        const extracted = rawRecipes.flatMap((entry) =>
          entry
            .split(/^##\s*レシピ名[:：]/gm)
            .filter(Boolean)
            .map((r) => "## レシピ名: " + r.trim())
        );
        setMainFoodRecipes(extracted);
      } catch (err) {
        console.warn("主材料レシピ取得失敗:", err);
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
        const res = await axios.get<RecipeFromGPT>("http://localhost:8000/api/foods/recipe_suggestions", {
          headers: { Authorization: `Bearer ${token}` },
          params: { days: 3 },
        });
        const rawRecipes = res.data.recipes;
        const extracted = rawRecipes.flatMap((entry) =>
          entry
            .split(/^##\s*レシピ名[:：]/gm)
            .filter(Boolean)
            .map((r) => "## レシピ名: " + r.trim())
        );
        setSuggestedRecipes(extracted);
      } catch (err) {
        console.warn("複数食材レシピ取得失敗:", err);
        setSuggestedRecipes([]);
      } finally {
        setLoadingSuggested(false);
      }
    };
    fetchSuggestedRecipes();
  }, [token, suggestedReloadKey]);

  const normalizeRecipe = (text: string) => {
    return text
      .replace(/#+\s*(レシピ名[:：]?\s*)+/gi, "## レシピ名: ")
      .replace(/材料[:：]/g, "### 材料:\n- ")
      .replace(/、/g, "\n- ")
      .replace(/　/g, " ")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "-" && line !== "")
      .join("\n")
      .trim();
  };

  const Spinner = () => (
    <div className="flex justify-center p-4">
      <div className="w-6 h-6 border-4 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
      <h1 className="text-5xl font-extralight text-center text-gray-800 drop-shadow-md">レシピ提案</h1>

      <GlassCard className="p-6">
        <h2 className="text-xl font-medium text-gray-700 mb-4">期限が迫っている食品</h2>
        {loadingExpiring ? (
          <Spinner />
        ) : (
          <div className="flex flex-wrap gap-3">
            {expiringFoods.length === 0 ? (
              <p className="text-gray-500">期限間近の食品はありません。</p>
            ) : (
              expiringFoods.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedFood(item.name);
                    setMainReloadKey((prev) => prev + 1);
                  }}
                  className={`px-4 py-2 rounded-full text-sm border transition ${
                    selectedFood === item.name
                      ? "bg-blue-500 text-white shadow-md"
                      : "bg-white text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  {item.name}
                </button>
              ))
            )}
          </div>
        )}
      </GlassCard>

      {selectedFood && (
        <GlassCard className="p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">
            「{selectedFood}」を主材料に使ったレシピ
          </h2>
          {loadingMain ? (
            <Spinner />
          ) : mainFoodRecipes.length > 0 ? (
            <>
              {mainFoodRecipes.map((recipeText, idx) => (
                <GlassCard key={idx} className="p-4 bg-white/60 backdrop-blur-sm whitespace-pre-wrap">
                  {normalizeRecipe(recipeText)}
                </GlassCard>
              ))}
              <div className="text-right">
                <button
                  onClick={() => setMainReloadKey((prev) => prev + 1)}
                  className="mt-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                >
                  別のレシピを提案
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-500">
              該当するレシピが見つかりませんでした。
              <br />
              食材名の表記（例：あじ／アジ／鯵）を変えてみてください。
            </p>
          )}
        </GlassCard>
      )}

      <GlassCard className="p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">
          期限間近の食品を活用したレシピ
        </h2>
        {loadingSuggested ? (
          <Spinner />
        ) : suggestedRecipes.length > 0 ? (
          <>
            {suggestedRecipes.map((recipeText, idx) => (
              <GlassCard key={idx} className="p-4 bg-white/60 backdrop-blur-sm whitespace-pre-wrap">
                {normalizeRecipe(recipeText)}
              </GlassCard>
            ))}
            <div className="text-right">
              <button
                onClick={() => setSuggestedReloadKey((prev) => prev + 1)}
                className="mt-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
              >
                別のレシピを提案
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-500">該当するレシピが見つかりませんでした。</p>
        )}
      </GlassCard>
    </div>
  );
};
