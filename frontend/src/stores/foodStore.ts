// frontend/src/stores/foodStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios from "axios";
import type { Food, FoodCreate, FoodUpdate, ProductInfo } from "../types/food";

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
  createFood: (foodData: FoodCreate) => Promise<void>;
  updateFoodById: (id: number, updateData: FoodUpdate) => Promise<void>;
  deleteFoodById: (id: number) => Promise<void>;

  // 外部API（認証不要）
  fetchProductByBarcode: (
    barcode: string,
    type: "JAN" | "EAN"
  ) => Promise<ProductInfo | null>;
}

// エラーメッセージの詳細な判定（bookStoreと同様）
const formatErrorMessage = (
  error: any
): { message: string; isAuthError: boolean } => {
  if (typeof error === "string") {
    return { message: error, isAuthError: false };
  }

  // ネットワークエラー
  if (!error.response) {
    return {
      message:
        "ネットワークエラーが発生しました。インターネット接続を確認してください。",
      isAuthError: false,
    };
  }

  const { status, data } = error.response;

  // HTTPステータスコード別の詳細メッセージ
  switch (status) {
    case 401:
      const detail = data?.detail || "";

      // バックエンドからの期限切れメッセージを検出
      if (
        detail.includes("有効期限が切れました") ||
        detail.includes("expired")
      ) {
        return {
          message:
            "セッションの有効期限が切れました。再度ログインしてください。",
          isAuthError: true,
        };
      }

      if (
        detail.includes("認証情報が無効です") ||
        detail.includes("トークンが無効です")
      ) {
        return {
          message: "認証情報が無効です。ログインし直してください。",
          isAuthError: true,
        };
      }

      if (detail.includes("ユーザーが見つかりません")) {
        return {
          message: "ユーザー情報が見つかりません。再度ログインしてください。",
          isAuthError: true,
        };
      }

      return {
        message: detail || "認証に失敗しました。ログインしてください。",
        isAuthError: true,
      };

    case 403:
      return {
        message: "この操作を行う権限がありません。",
        isAuthError: false,
      };

    case 404:
      return {
        message: "食品が見つかりません。削除された可能性があります。",
        isAuthError: false,
      };

    case 422:
      // FastAPIのバリデーションエラー
      if (Array.isArray(data?.detail)) {
        const validationErrors = data.detail
          .map((e: any) => {
            const field = e.loc?.join(".");
            const message = e.msg;
            return `${field}: ${message}`;
          })
          .join(", ");
        return {
          message: `入力エラー: ${validationErrors}`,
          isAuthError: false,
        };
      }
      return {
        message: "入力データに問題があります。",
        isAuthError: false,
      };

    case 500:
      return {
        message:
          "サーバーエラーが発生しました。しばらく待ってから再試行してください。",
        isAuthError: false,
      };

    default:
      // カスタムメッセージがある場合
      if (data?.detail) {
        if (typeof data.detail === "string") {
          return { message: data.detail, isAuthError: false };
        }
      }
      return {
        message: `エラーが発生しました (${status})`,
        isAuthError: false,
      };
  }
};

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

    // 基本アクション
    setFoods: (foods) => set({ foods }),
    addFood: (food) => set((state) => ({ foods: [...state.foods, food] })),

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

    // 食品一覧取得
    fetchFoods: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await axios.get(`${API_BASE_URL}/me/foods`);
        set({ foods: response.data, isLoading: false });

        // 成功時は認証エラー状態をクリア
        get().clearAuthError();
      } catch (err: any) {
        console.error("食品取得エラー:", err);

        const { message, isAuthError } = formatErrorMessage(err);

        if (isAuthError) {
          get().setAuthError(message);
          set({ isLoading: false });
        } else {
          set({
            error: message,
            isLoading: false,
            foods: [],
          });
        }
      }
    },

    // 食品詳細取得
    fetchFoodById: async (id: number) => {
      set({ isLoading: true, error: null });
      try {
        const response = await axios.get(`${API_BASE_URL}/foods/${id}`);
        set({ isLoading: false });

        get().clearAuthError();
        return response.data;
      } catch (err: any) {
        console.error("食品詳細取得エラー:", err);

        const { message, isAuthError } = formatErrorMessage(err);

        if (isAuthError) {
          get().setAuthError(message);
          set({ isLoading: false });
        } else {
          set({ error: message, isLoading: false });
        }
        return null;
      }
    },

    // 食品作成
    createFood: async (foodData) => {
      set({ isLoading: true, error: null });
      try {
        const response = await axios.post(`${API_BASE_URL}/foods`, foodData);
        set((state) => ({
          foods: [...state.foods, response.data],
          isLoading: false,
        }));

        get().clearAuthError();
      } catch (err: any) {
        console.error("食品作成エラー:", err);

        const { message, isAuthError } = formatErrorMessage(err);

        if (isAuthError) {
          get().setAuthError(message);
          set({ isLoading: false });
          throw new Error("認証が必要です");
        } else {
          set({
            error: message,
            isLoading: false,
          });
          throw new Error(message);
        }
      }
    },

    // バーコードによる食品登録機能
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
      } catch (err: any) {
        console.error("❌ バーコード食品登録エラー:", err);

        const { message, isAuthError } = formatErrorMessage(err);

        if (isAuthError) {
          get().setAuthError(message);
          set({ isRegisteringByBarcode: false });
          throw new Error("認証が必要です。再度ログインしてください。");
        } else {
          set({
            error: message,
            isRegisteringByBarcode: false,
          });
          throw new Error(message);
        }
      }
    },

    // 食品更新
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
      } catch (err: any) {
        console.error("食品更新エラー:", err);

        const { message, isAuthError } = formatErrorMessage(err);

        if (isAuthError) {
          get().setAuthError(message);
          set({ isLoading: false });
          throw new Error("認証が必要です");
        } else {
          set({
            error: message,
            isLoading: false,
          });
          throw new Error(message);
        }
      }
    },

    // 食品削除
    deleteFoodById: async (id: number) => {
      set({ isLoading: true, error: null });
      try {
        await axios.delete(`${API_BASE_URL}/foods/${id}`);

        // ローカル状態から削除
        const { removeFood } = get();
        removeFood(id);

        set({ isLoading: false });
        get().clearAuthError();
      } catch (err: any) {
        console.error("食品削除エラー:", err);

        const { message, isAuthError } = formatErrorMessage(err);

        if (isAuthError) {
          get().setAuthError(message);
          set({ isLoading: false });
          throw new Error("認証が必要です");
        } else {
          set({
            error: message,
            isLoading: false,
          });
          throw new Error(message);
        }
      }
    },

    // 外部API：バーコードから商品情報を取得（認証不要）
    fetchProductByBarcode: async (barcode: string, type: "JAN" | "EAN") => {
      try {
        console.log(`🔍 ${type}バーコード検索:`, barcode);

        // バックエンド経由で商品情報を取得
        // （楽天商品検索API、独自商品データベース等を使用）
        const response = await axios.get(
          `${API_BASE_URL}/products/search-by-barcode`,
          {
            params: { barcode, type },
          }
        );

        const productInfo = response.data;
        console.log("✅ 商品情報取得成功:", productInfo.name);

        return productInfo;
      } catch (err: any) {
        console.error("❌ 商品情報取得エラー:", err);

        const { message } = formatErrorMessage(err);

        // 商品が見つからない場合は null を返す（エラーではない）
        if (err.response?.status === 404) {
          console.log("商品情報が見つかりませんでした");
          return null;
        }

        // その他のエラーはログに記録してnullを返す
        set({ error: message });
        return null;
      }
    },
  }))
);
