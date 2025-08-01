// frontend/src/utils/foodUtils.ts
import type {
  Food,
  FoodCategory,
  ExpirationInfo,
  ExpirationStatus,
  FoodStats,
  FoodFilter,
  FOOD_CATEGORIES,
} from "../types/food";

/**
 * 賞味期限の状態を判定する
 */
export const getExpirationInfo = (expirationDate: string): ExpirationInfo => {
  const today = new Date();
  const expDate = new Date(expirationDate);
  const diffTime = expDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return {
      status: "expired",
      daysRemaining,
      message: `${Math.abs(daysRemaining)}日前に期限切れ`,
      color: "red",
    };
  } else if (daysRemaining <= 7) {
    return {
      status: "warning",
      daysRemaining,
      message: daysRemaining === 0 ? "今日が期限" : `あと${daysRemaining}日`,
      color: "orange",
    };
  } else {
    return {
      status: "fresh",
      daysRemaining,
      message: `あと${daysRemaining}日`,
      color: "green",
    };
  }
};

/**
 * 食品カテゴリの情報を取得する
 */
export const getCategoryInfo = (category: FoodCategory) => {
  // FOOD_CATEGORIESが型定義ファイルにあるため、ここで再定義
  const categories = [
    { id: "生鮮食品", name: "生鮮食品", icon: "🥬", color: "green" },
    { id: "非常食", name: "非常食", icon: "🥫", color: "orange" },
    { id: "飲料", name: "飲料", icon: "🥤", color: "blue" },
    { id: "調味料", name: "調味料", icon: "🧂", color: "purple" },
    { id: "冷凍食品", name: "冷凍食品", icon: "🧊", color: "cyan" },
    { id: "お菓子", name: "お菓子", icon: "🍪", color: "pink" },
  ] as const;

  return (
    categories.find((cat) => cat.id === category) || {
      id: category,
      name: category,
      icon: "📦",
      color: "gray",
    }
  );
};

/**
 * 食品統計を計算する
 */
export const calculateFoodStats = (foods: Food[]): FoodStats => {
  const stats: FoodStats = {
    totalItems: foods.length,
    expiringSoon: 0,
    expired: 0,
    byCategory: {
      生鮮食品: 0,
      非常食: 0,
      飲料: 0,
      調味料: 0,
      冷凍食品: 0,
      お菓子: 0,
    },
  };

  foods.forEach((food) => {
    const expirationInfo = getExpirationInfo(food.expiration_date);

    // 期限状態の集計
    if (expirationInfo.status === "expired") {
      stats.expired++;
    } else if (expirationInfo.status === "warning") {
      stats.expiringSoon++;
    }

    // カテゴリ別の集計
    stats.byCategory[food.category]++;
  });

  return stats;
};

/**
 * 食品をフィルタリングする
 */
export const filterFoods = (foods: Food[], filter: FoodFilter): Food[] => {
  return foods.filter((food) => {
    // カテゴリフィルター
    if (filter.categories && filter.categories.length > 0) {
      if (!filter.categories.includes(food.category)) {
        return false;
      }
    }

    // 期限状態フィルター
    if (filter.expirationStatus && filter.expirationStatus.length > 0) {
      const expirationInfo = getExpirationInfo(food.expiration_date);
      if (!filter.expirationStatus.includes(expirationInfo.status)) {
        return false;
      }
    }

    // 検索クエリフィルター
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      const matchesName = food.name.toLowerCase().includes(query);
      const matchesCategory = food.category.toLowerCase().includes(query);
      if (!matchesName && !matchesCategory) {
        return false;
      }
    }

    // 日付範囲フィルター（作成日）
    if (filter.dateRange) {
      const createdDate = new Date(food.created_at);
      const startDate = new Date(filter.dateRange.start);
      const endDate = new Date(filter.dateRange.end);

      if (createdDate < startDate || createdDate > endDate) {
        return false;
      }
    }

    return true;
  });
};

/**
 * 食品をソートする
 */
export const sortFoods = (
  foods: Food[],
  sortBy: "name" | "expiration_date" | "created_at" = "expiration_date",
  sortOrder: "asc" | "desc" = "asc"
): Food[] => {
  return [...foods].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name, "ja");
        break;
      case "expiration_date":
        comparison =
          new Date(a.expiration_date).getTime() -
          new Date(b.expiration_date).getTime();
        break;
      case "created_at":
        comparison =
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
    }

    return sortOrder === "desc" ? -comparison : comparison;
  });
};

/**
 * 期限切れ間近の食品を取得する
 */
export const getExpiringSoonFoods = (
  foods: Food[],
  days: number = 7
): Food[] => {
  return foods.filter((food) => {
    const expirationInfo = getExpirationInfo(food.expiration_date);
    return (
      expirationInfo.status === "warning" &&
      expirationInfo.daysRemaining <= days
    );
  });
};

/**
 * 期限切れの食品を取得する
 */
export const getExpiredFoods = (foods: Food[]): Food[] => {
  return foods.filter((food) => {
    const expirationInfo = getExpirationInfo(food.expiration_date);
    return expirationInfo.status === "expired";
  });
};

/**
 * 商品名からカテゴリを推定する（簡易版）
 */
export const suggestCategoryFromName = (name: string): FoodCategory | null => {
  const lowerName = name.toLowerCase();

  // キーワードベースの分類
  const categoryKeywords: Record<FoodCategory, string[]> = {
    生鮮食品: [
      "野菜",
      "肉",
      "魚",
      "卵",
      "牛乳",
      "パン",
      "豆腐",
      "サラダ",
      "フルーツ",
      "果物",
    ],
    非常食: [
      "缶詰",
      "乾麺",
      "レトルト",
      "インスタント",
      "カップ",
      "保存食",
      "非常食",
    ],
    飲料: [
      "ジュース",
      "お茶",
      "コーヒー",
      "水",
      "ビール",
      "ワイン",
      "酒",
      "ドリンク",
      "飲料",
    ],
    調味料: [
      "醤油",
      "味噌",
      "塩",
      "砂糖",
      "酢",
      "油",
      "ソース",
      "ドレッシング",
      "スパイス",
      "調味料",
    ],
    冷凍食品: ["冷凍", "アイス", "冷凍食品", "冷食"],
    お菓子: [
      "チョコ",
      "クッキー",
      "スナック",
      "お菓子",
      "ケーキ",
      "アメ",
      "グミ",
      "せんべい",
    ],
  };

  // 各カテゴリのキーワードをチェック
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword) => lowerName.includes(keyword))) {
      return category as FoodCategory;
    }
  }

  return null;
};

/**
 * カテゴリに基づく推奨賞味期限日数を取得
 */
export const getDefaultExpirationDays = (category: FoodCategory): number => {
  const defaultDays: Record<FoodCategory, number> = {
    生鮮食品: 3, // 3日後
    非常食: 365, // 1年後
    飲料: 30, // 1ヶ月後
    調味料: 180, // 6ヶ月後
    冷凍食品: 90, // 3ヶ月後
    お菓子: 60, // 2ヶ月後
  };

  return defaultDays[category] || 30;
};

/**
 * 推奨賞味期限日を計算
 */
export const calculateDefaultExpirationDate = (
  category: FoodCategory
): string => {
  const days = getDefaultExpirationDays(category);
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0]; // YYYY-MM-DD形式
};

/**
 * 食品データの検証
 */
export const validateFoodData = (
  data: Partial<Food>
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // 必須フィールドのチェック
  if (!data.name || data.name.trim().length === 0) {
    errors.push("食品名は必須です");
  }

  if (!data.category) {
    errors.push("カテゴリは必須です");
  }

  if (!data.quantity || data.quantity < 1) {
    errors.push("数量は1以上である必要があります");
  }

  if (!data.expiration_date) {
    errors.push("賞味期限は必須です");
  } else {
    // 日付形式のチェック
    const date = new Date(data.expiration_date);
    if (isNaN(date.getTime())) {
      errors.push("賞味期限の形式が正しくありません");
    }
  }

  // 食品名の長さチェック
  if (data.name && data.name.length > 100) {
    errors.push("食品名は100文字以内で入力してください");
  }

  // 数量の範囲チェック
  if (data.quantity && data.quantity > 9999) {
    errors.push("数量は9999以下で入力してください");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * バーコード形式の検証（JAN/EAN用）
 */
export const validateFoodBarcode = (
  barcode: string,
  type: "JAN" | "EAN"
): boolean => {
  const cleanBarcode = barcode.replace(/[^\d]/g, "");

  if (type === "JAN") {
    // JAN: 13桁で45または49で始まる
    return (
      /^\d{13}$/.test(cleanBarcode) &&
      (cleanBarcode.startsWith("45") || cleanBarcode.startsWith("49"))
    );
  } else if (type === "EAN") {
    // EAN: 8桁または13桁
    return /^\d{8}$/.test(cleanBarcode) || /^\d{13}$/.test(cleanBarcode);
  }

  return false;
};

/**
 * 食品の重複チェック
 */
export const isDuplicateFood = (
  foods: Food[],
  newFood: Partial<Food>
): boolean => {
  return foods.some(
    (food) =>
      food.name.toLowerCase() === newFood.name?.toLowerCase() &&
      food.category === newFood.category &&
      food.expiration_date === newFood.expiration_date
  );
};

/**
 * 食品データのフォーマット（表示用）
 */
export const formatFoodForDisplay = (food: Food) => {
  const expirationInfo = getExpirationInfo(food.expiration_date);
  const categoryInfo = getCategoryInfo(food.category);

  return {
    ...food,
    displayName: food.name,
    displayCategory: `${categoryInfo.icon} ${categoryInfo.name}`,
    displayExpiration: expirationInfo.message,
    expirationStatus: expirationInfo.status,
    expirationColor: expirationInfo.color,
    displayQuantity: `${food.quantity}個`,
    hasBarcode: !!food.barcode,
  };
};

/**
 * CSVエクスポート用のデータ変換
 */
export const convertFoodsToCSV = (foods: Food[]): string => {
  const headers = [
    "名前",
    "カテゴリ",
    "数量",
    "賞味期限",
    "バーコード",
    "登録日",
  ];

  const rows = foods.map((food) => [
    food.name,
    food.category,
    food.quantity.toString(),
    food.expiration_date,
    food.barcode || "",
    food.created_at.split("T")[0], // 日付部分のみ
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  return csvContent;
};

/**
 * 食品アラートメッセージの生成
 */
export const generateAlertMessages = (foods: Food[]): string[] => {
  const messages: string[] = [];
  const expiredFoods = getExpiredFoods(foods);
  const expiringSoonFoods = getExpiringSoonFoods(foods);

  if (expiredFoods.length > 0) {
    messages.push(`⚠️ ${expiredFoods.length}個の食品が期限切れです`);
  }

  if (expiringSoonFoods.length > 0) {
    messages.push(
      `🔔 ${expiringSoonFoods.length}個の食品の期限が近づいています`
    );
  }

  return messages;
};

/**
 * テスト用のサンプル食品データ
 */
export const SAMPLE_FOODS: Omit<
  Food,
  "id" | "user_id" | "created_at" | "updated_at"
>[] = [
  {
    name: "カップラーメン",
    category: "非常食",
    quantity: 5,
    expiration_date: "2024-12-31",
    barcode: "4901301234567",
    barcode_type: "JAN",
  },
  {
    name: "牛乳",
    category: "生鮮食品",
    quantity: 1,
    expiration_date: "2024-08-05",
  },
  {
    name: "お茶",
    category: "飲料",
    quantity: 24,
    expiration_date: "2024-10-15",
  },
  {
    name: "醤油",
    category: "調味料",
    quantity: 1,
    expiration_date: "2025-03-15",
  },
];

/**
 * 開発用：食品ユーティリティのテスト実行
 */
export const testFoodUtils = (): void => {
  console.log("🍽️ Food Utils テスト開始");

  // サンプルデータでテスト
  const sampleFood: Food = {
    id: 1,
    name: "テスト食品",
    category: "生鮮食品",
    quantity: 2,
    expiration_date: "2024-08-03", // 2日後と仮定
    user_id: 1,
    created_at: "2024-08-01T00:00:00Z",
    updated_at: "2024-08-01T00:00:00Z",
  };

  // 期限チェックテスト
  const expirationInfo = getExpirationInfo(sampleFood.expiration_date);
  console.log("期限情報:", expirationInfo);

  // カテゴリ情報テスト
  const categoryInfo = getCategoryInfo(sampleFood.category);
  console.log("カテゴリ情報:", categoryInfo);

  // カテゴリ推定テスト
  const suggestedCategory = suggestCategoryFromName("カップラーメン");
  console.log("推定カテゴリ:", suggestedCategory);

  // 検証テスト
  const validation = validateFoodData(sampleFood);
  console.log("検証結果:", validation);

  console.log("✅ Food Utils テスト完了");
};

// 開発環境でのみテスト実行
if (import.meta.env.DEV) {
  // testFoodUtils(); // 必要に応じてコメントアウト
}
