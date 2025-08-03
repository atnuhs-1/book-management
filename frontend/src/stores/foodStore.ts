// frontend/src/stores/foodStore.ts - 型安全版（error: any修正）

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios, { isAxiosError } from "axios";
import type { Food, FoodCreate, FoodUpdate, ProductInfo } from "../types/food";

// ✅ errorFormatterをインポート
import {
  formatFoodError,
  formatErrorMessage,
  logError,
  type FoodErrorResult,
} from "../utils/errorFormatter";

// ✅ 新規追加: 商品名検索結果の型
interface ProductLookupResult {
  name: string;
  quantity?: number;
  unit?: string;
  found: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface FoodStore {
  foods: Food[];
  isLoading: boolean;
  error: string | null;
  selectedFood: Food | null;

  // バーコード関連の状態
  isRegisteringByBarcode: boolean;
  lastScannedBarcode: string | null;

  // 認証関連エラーの状態
  lastAuthError: string | null;
  hasAuthError: boolean;

  isLookingUpByBarcode: boolean;

  // 基本アクション
  setFoods: (foods: Food[]) => void;
  addFood: (food: Food) => void;
  updateFood: (updatedFood: Food) => void;
  removeFood: (foodId: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedFood: (food: Food | null) => void;
  getFoodById: (id: number) => Food | null;

  // バーコード関連のアクション
  setRegisteringByBarcode: (registering: boolean) => void;
  setLastScannedBarcode: (barcode: string | null) => void;
  createFoodByBarcode: (barcode: string, type: "JAN" | "EAN") => Promise<Food>;

  // 認証エラー管理
  setAuthError: (error: string | null) => void;
  clearAuthError: () => void;

  // API アクション
  fetchFoods: () => Promise<void>;
  fetchFoodById: (id: number) => Promise<Food | null>;
  createFood: (foodData: FoodCreate & { force?: boolean }) => Promise<void>; // ✅ 型を明確化
  updateFoodById: (id: number, updateData: FoodUpdate) => Promise<void>;
  deleteFoodById: (id: number) => Promise<void>;

  // 外部API（認証不要）
  fetchProductByBarcode: (
    barcode: string,
    type: "JAN" | "EAN"
  ) => Promise<ProductInfo | null>;

  setLookingUpByBarcode: (looking: boolean) => void;
  lookupFoodByBarcode: (
    barcode: string,
    type: "JAN" | "EAN"
  ) => Promise<ProductLookupResult>;
}

// ✅ 既存のformatErrorMessage関数を削除（errorFormatterを使用）

export const useFoodStore = create<FoodStore>()(
  devtools((set, get) => ({
    foods: [],
    isLoading: false,
    error: null,
    selectedFood: null,
    lastAuthError: null,
    hasAuthError: false,
    isRegisteringByBarcode: false,
    lastScannedBarcode: null,
    isLookingUpByBarcode: false,

    // 基本アクション
    setFoods: (foods) => set({ foods }),
    addFood: (food) => set((state) => ({ foods: [...state.foods, food] })),

    setLookingUpByBarcode: (looking) => set({ isLookingUpByBarcode: looking }),

    updateFood: (updatedFood) =>
      set((state) => ({
        foods: state.foods.map((food) =>
          food.id === updatedFood.id ? updatedFood : food
        ),
      })),

    removeFood: (foodId) =>
      set((state) => ({
        foods: state.foods.filter((food) => food.id !== foodId),
      })),

    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    setSelectedFood: (food) => set({ selectedFood: food }),

    getFoodById: (id) => {
      const { foods } = get();
      return foods.find((f) => f.id === id) || null;
    },

    // バーコード関連のアクション
    setRegisteringByBarcode: (registering) =>
      set({ isRegisteringByBarcode: registering }),

    setLastScannedBarcode: (barcode) => set({ lastScannedBarcode: barcode }),

    // 認証エラー管理
    setAuthError: (error) =>
      set({ lastAuthError: error, hasAuthError: !!error }),
    clearAuthError: () => set({ lastAuthError: null, hasAuthError: false }),

    // ✅ 修正1: 型安全な食品一覧取得
    fetchFoods: async () => {
      set({ isLoading: true, error: null });

      try {
        const response = await axios.get(`${API_BASE_URL}/me/foods`);
        set({ foods: response.data, isLoading: false });

        // 成功時は認証エラー状態をクリア
        get().clearAuthError();
      } catch (error: unknown) {
        console.error("食品取得エラー:", error);

        // ✅ errorFormatterを使用した型安全なエラーハンドリング
        const errorResult = formatFoodError(error);
        logError(error, "foodStore.fetchFoods");

        if (errorResult.isAuthError) {
          get().setAuthError(errorResult.message);
          set({ isLoading: false });
        } else {
          set({
            error: errorResult.message,
            isLoading: false,
            foods: [],
          });
        }
      }
    },

    // ✅ 修正2: 型安全な食品詳細取得
    fetchFoodById: async (id: number) => {
      set({ isLoading: true, error: null });

      try {
        const response = await axios.get(`${API_BASE_URL}/foods/${id}`);
        set({ isLoading: false });

        get().clearAuthError();
        return response.data;
      } catch (error: unknown) {
        console.error("食品詳細取得エラー:", error);

        // ✅ errorFormatterを使用した型安全なエラーハンドリング
        const errorResult = formatFoodError(error);
        logError(error, "foodStore.fetchFoodById");

        if (errorResult.isAuthError) {
          get().setAuthError(errorResult.message);
          set({ isLoading: false });
        } else {
          set({ error: errorResult.message, isLoading: false });
        }
        return null;
      }
    },

    // ✅ 修正3: 型安全な食品作成
    createFood: async (foodData: FoodCreate & { force?: boolean }) => {
      set({ isLoading: true, error: null });

      try {
        const response = await axios.post(`${API_BASE_URL}/foods`, foodData, {
          params: foodData.force ? { force: true } : {},
        });

        set((state) => ({
          foods: [...state.foods, response.data],
          isLoading: false,
        }));

        get().clearAuthError();
      } catch (error: unknown) {
        console.error("食品作成エラー:", error);

        // ✅ 拡張されたformatFoodErrorを使用
        const errorResult = formatFoodError(error) as FoodErrorResult;
        logError(error, "foodStore.createFood");

        console.log("🔍 createFood errorResult:", errorResult); // ← 追加
        console.log("🔍 needsConfirmation:", errorResult.needsConfirmation); // ← 追加
        console.log("🔍 canForce:", errorResult.canForce); // ← 追加

        if (errorResult.isAuthError) {
          get().setAuthError(errorResult.message);
          set({ isLoading: false });
          throw new Error("認証が必要です");
        }
        // ✅ 409エラーで確認が必要な場合の特別処理
        else if (errorResult.needsConfirmation && errorResult.canForce) {
          console.log("✅ 確認ダイアログ用エラーを作成");
          set({ isLoading: false });

          // ✅ 専用のエラークラスでUIに情報を渡す
          const confirmationError = new Error(errorResult.message) as Error & {
            needsConfirmation: boolean;
            confirmationMessage: string;
            canForce: boolean;
            originalFoodData: FoodCreate;
          };

          confirmationError.needsConfirmation = true;
          confirmationError.confirmationMessage =
            errorResult.confirmationMessage || errorResult.message;
          confirmationError.canForce = true;
          confirmationError.originalFoodData = foodData;

          console.log("✅ confirmationError created:", confirmationError);
          throw confirmationError;
        } else {
          set({
            error: errorResult.message,
            isLoading: false,
          });
          throw new Error(errorResult.message);
        }
      }
    },

    // ✅ 修正4: 型安全なバーコード食品登録
    createFoodByBarcode: async (barcode: string, type: "JAN" | "EAN") => {
      set({
        isRegisteringByBarcode: true,
        error: null,
        lastScannedBarcode: barcode,
      });

      try {
        console.log(`🛒 ${type}バーコードで食品登録開始:`, barcode);

        // まず外部APIから商品情報を取得
        const productInfo = await get().fetchProductByBarcode(barcode, type);

        if (!productInfo) {
          throw new Error(
            "商品情報が見つかりませんでした。手動で入力してください。"
          );
        }

        // バックエンドAPIで食品登録
        const response = await axios.post(
          `${API_BASE_URL}/foods/register-by-barcode`,
          {
            barcode,
            barcode_type: type,
            product_info: productInfo,
          }
        );

        const registeredFood = response.data.food || response.data;

        set((state) => ({
          foods: [...state.foods, registeredFood],
          isRegisteringByBarcode: false,
        }));

        get().clearAuthError();
        console.log("✅ バーコード食品登録成功:", registeredFood.name);

        return registeredFood;
      } catch (error: unknown) {
        console.error("❌ バーコード食品登録エラー:", error);

        // ✅ errorFormatterを使用した型安全なエラーハンドリング
        const errorResult = formatFoodError(error);
        logError(error, "foodStore.createFoodByBarcode");

        if (errorResult.isAuthError) {
          get().setAuthError(errorResult.message);
          set({ isRegisteringByBarcode: false });
          throw new Error("認証が必要です。再度ログインしてください。");
        } else {
          set({
            error: errorResult.message,
            isRegisteringByBarcode: false,
          });
          throw new Error(errorResult.message);
        }
      }
    },

    // ✅ 修正5: 型安全な食品更新
    updateFoodById: async (id: number, updateData: FoodUpdate) => {
      set({ isLoading: true, error: null });

      try {
        const response = await axios.put(
          `${API_BASE_URL}/foods/${id}`,
          updateData
        );

        // ローカル状態を更新
        const { updateFood } = get();
        updateFood(response.data);

        set({ isLoading: false });
        get().clearAuthError();
      } catch (error: unknown) {
        console.error("食品更新エラー:", error);

        // ✅ errorFormatterを使用した型安全なエラーハンドリング
        const errorResult = formatFoodError(error);
        logError(error, "foodStore.updateFoodById");

        if (errorResult.isAuthError) {
          get().setAuthError(errorResult.message);
          set({ isLoading: false });
          throw new Error("認証が必要です");
        } else {
          set({
            error: errorResult.message,
            isLoading: false,
          });
          throw new Error(errorResult.message);
        }
      }
    },

    // ✅ 修正6: 型安全な食品削除
    deleteFoodById: async (id: number) => {
      set({ isLoading: true, error: null });

      try {
        await axios.delete(`${API_BASE_URL}/foods/${id}`);

        // ローカル状態から削除
        const { removeFood } = get();
        removeFood(id);

        set({ isLoading: false });
        get().clearAuthError();
      } catch (error: unknown) {
        console.error("食品削除エラー:", error);

        // ✅ errorFormatterを使用した型安全なエラーハンドリング
        const errorResult = formatFoodError(error);
        logError(error, "foodStore.deleteFoodById");

        if (errorResult.isAuthError) {
          get().setAuthError(errorResult.message);
          set({ isLoading: false });
          throw new Error("認証が必要です");
        } else {
          set({
            error: errorResult.message,
            isLoading: false,
          });
          throw new Error(errorResult.message);
        }
      }
    },

    // ✅ 修正7: 型安全な外部API商品検索
    fetchProductByBarcode: async (barcode: string, type: "JAN" | "EAN") => {
      try {
        console.log(`🔍 ${type}バーコード検索:`, barcode);

        // バックエンド経由で商品情報を取得
        const response = await axios.get(
          `${API_BASE_URL}/products/search-by-barcode`,
          {
            params: { barcode, type },
          }
        );

        const productInfo = response.data;
        console.log("✅ 商品情報取得成功:", productInfo.name);

        return productInfo;
      } catch (error: unknown) {
        console.error("❌ 商品情報取得エラー:", error);

        // ✅ errorFormatterを使用した型安全なエラーハンドリング
        const errorResult = formatErrorMessage(error); // 外部APIなので汎用フォーマッター
        logError(error, "foodStore.fetchProductByBarcode");

        // 商品が見つからない場合は null を返す（エラーではない）
        if (isAxiosError(error) && error.response?.status === 404) {
          console.log("商品情報が見つかりませんでした");
          return null;
        }

        // その他のエラーはログに記録してnullを返す
        set({ error: errorResult.message });
        return null;
      }
    },

    // ✅ 新規追加: バーコードから商品名取得
    lookupFoodByBarcode: async (
      barcode: string,
      type: "JAN" | "EAN"
    ): Promise<ProductLookupResult> => {
      set({
        isLookingUpByBarcode: true,
        error: null,
        lastScannedBarcode: barcode,
      });

      try {
        console.log(`🔍 ${type}バーコードで商品名検索:`, barcode);

        const response = await axios.get(`${API_BASE_URL}/foods/lookup_name`, {
          params: { barcode, type },
        });

        const result = response.data;
        console.log("✅ 商品名取得成功:", result);

        set({ isLookingUpByBarcode: false });
        get().clearAuthError();

        return {
          name: result.name,
          quantity: result.quantity,
          unit: result.unit,
          found: true,
        };
      } catch (error: unknown) {
        console.error("❌ 商品名取得エラー:", error);

        const errorResult = formatErrorMessage(error);
        logError(error, "foodStore.lookupFoodByBarcode");

        set({
          isLookingUpByBarcode: false,
          error: errorResult.message,
        });

        // 404の場合は商品が見つからないだけなので、foundをfalseで返す
        if (isAxiosError(error) && error.response?.status === 404) {
          return {
            name: "",
            found: false,
          };
        }

        // その他のエラーの場合は例外を投げる
        throw new Error(errorResult.message);
      }
    },
  }))
);
