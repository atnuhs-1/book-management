// frontend/src/types/food.ts

// 食品カテゴリの列挙型
export type FoodCategory =
  | "生鮮食品"
  | "非常食"
  | "飲料"
  | "調味料"
  | "冷凍食品"
  | "お菓子";

// 食品の単位の列挙型
export type FoodUnit =
  | "個"
  // | "本"
  // | "袋"
  // | "パック"
  // | "kg"
  | "g"
  // | "L"
  // | "ml"
  // | "缶"
  // | "箱";

// バックエンドのスキーマに対応した食品型
export interface Food {
  id: number;
  name: string;
  category: FoodCategory;
  quantity: number;
  unit: FoodUnit; // ✅ 追加
  expiration_date: string; // ISO 8601 format
  barcode?: string; // バーコードがある場合
  barcode_type?: "JAN" | "EAN"; // バーコード種別
  user_id: number;
  created_at: string; // ISO 8601 format
  updated_at: string; // ISO 8601 format
}

// 食品作成用の型
export interface FoodCreate {
  name: string;
  category: FoodCategory;
  quantity: number;
  unit: FoodUnit; // ✅ 追加
  expiration_date: string;
  barcode?: string;
  barcode_type?: "JAN" | "EAN";
  // user_id は自動設定されるため不要
}

// 食品更新用の型（任意のフィールドを更新可能）
export interface FoodUpdate {
  name?: string;
  category?: FoodCategory;
  quantity?: number;
  unit?: FoodUnit; // ✅ 追加
  expiration_date?: string;
  barcode?: string;
  barcode_type?: "JAN" | "EAN";
  // user_id は更新不可（セキュリティ上の理由）
}

// 外部APIから取得する商品情報の型
export interface ProductInfo {
  name: string;
  category?: FoodCategory; // 推定カテゴリ
  unit?: FoodUnit; // ✅ 追加: 推定単位
  brand?: string; // ブランド名
  manufacturer?: string; // 製造者
  image_url?: string; // 商品画像URL
  description?: string; // 商品説明
  jan_code?: string; // JANコード
  ean_code?: string; // EANコード

  // API固有の情報
  api_source?: string; // 'rakuten' | 'custom' | 'manual'
  confidence?: number; // 情報の信頼度 (0-1)
}

// バーコード登録リクエストの型
export interface BarcodeRegistrationRequest {
  barcode: string;
  barcode_type: "JAN" | "EAN";
  product_info?: ProductInfo;
  // 手動で補完する情報
  manual_category?: FoodCategory;
  manual_unit?: FoodUnit; // ✅ 追加
  manual_expiration_date?: string;
  manual_quantity?: number;
}

// 食品カテゴリの定義（UI表示用）
export interface FoodCategoryInfo {
  id: FoodCategory;
  name: string;
  icon: string;
  color?: string;
}

// 食品単位の定義（UI表示用）
export interface FoodUnitInfo {
  id: FoodUnit;
  name: string;
  shortName: string;
  category: "count" | "weight" | "volume";
}

// 食品カテゴリの定数
export const FOOD_CATEGORIES: FoodCategoryInfo[] = [
  { id: "生鮮食品", name: "生鮮食品", icon: "🥬", color: "green" },
  { id: "非常食", name: "非常食", icon: "🥫", color: "orange" },
  { id: "飲料", name: "飲料", icon: "🥤", color: "blue" },
  { id: "調味料", name: "調味料", icon: "🧂", color: "purple" },
  { id: "冷凍食品", name: "冷凍食品", icon: "🧊", color: "cyan" },
  { id: "お菓子", name: "お菓子", icon: "🍪", color: "pink" },
] as const;

// ✅ 新規追加: 食品単位の定数
export const FOOD_UNITS: FoodUnitInfo[] = [
  // 個数系
  { id: "個", name: "個", shortName: "個", category: "count" },
  // { id: "本", name: "本", shortName: "本", category: "count" },
  // { id: "袋", name: "袋", shortName: "袋", category: "count" },
  // { id: "パック", name: "パック", shortName: "パック", category: "count" },
  // { id: "缶", name: "缶", shortName: "缶", category: "count" },
  // { id: "箱", name: "箱", shortName: "箱", category: "count" },

  // 重量系
  // { id: "kg", name: "キログラム", shortName: "kg", category: "weight" },
  { id: "g", name: "グラム", shortName: "g", category: "weight" },

  // 容量系
  // { id: "L", name: "リットル", shortName: "L", category: "volume" },
  // { id: "ml", name: "ミリリットル", shortName: "ml", category: "volume" },
] as const;

// 賞味期限の状態
export type ExpirationStatus = "fresh" | "warning" | "expired";

// 賞味期限チェック用のユーティリティ型
export interface ExpirationInfo {
  status: ExpirationStatus;
  daysRemaining: number;
  message: string;
  color: string;
}

// API関連の型
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// UI状態の型
export interface FoodUIState {
  isLoading: boolean;
  error: string | null;
  selectedCategory?: FoodCategory;
  sortBy?: "name" | "expiration_date" | "created_at";
  sortOrder?: "asc" | "desc";
  searchQuery?: string;
}

// 統計情報の型
export interface FoodStats {
  totalItems: number;
  expiringSoon: number; // 7日以内
  expired: number;
  byCategory: Record<FoodCategory, number>;
}

// フィルター条件の型
export interface FoodFilter {
  categories?: FoodCategory[];
  expirationStatus?: ExpirationStatus[];
  searchQuery?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

// バーコードスキャン結果の型（汎用バーコードバリデーターと連携）
export interface FoodBarcodeResult {
  barcode: string;
  type: "JAN" | "EAN";
  productInfo?: ProductInfo;
  suggestedFood?: Partial<FoodCreate>;
}

// 手動入力補助の型
export interface FoodInputAssistance {
  suggestedNames: string[];
  suggestedCategories: FoodCategory[];
  defaultExpirationDays: number;
}

// バッチ操作の型
export interface FoodBatchOperation {
  type: "delete" | "update_category" | "extend_expiration";
  foodIds: number[];
  data?: Partial<FoodUpdate>;
}

// インポート/エクスポート用の型
export interface FoodExportData {
  foods: Food[];
  exportDate: string;
  version: string;
}

export interface FoodImportData {
  foods: Omit<Food, "id" | "user_id" | "created_at" | "updated_at">[];
  importOptions?: {
    skipDuplicates?: boolean;
    updateExisting?: boolean;
  };
}
