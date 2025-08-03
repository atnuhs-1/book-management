// frontend/src/utils/errorFormatter.ts - 既存実装ベースの改善版

import { isAxiosError, AxiosError } from "axios";

/**
 * エラーレスポンスの型定義
 */
interface ErrorResponse {
  detail?: string | ValidationError[];
  message?: string;
  error?: string;
  code?: string;
}

interface ValidationError {
  loc: string[];
  msg: string;
  type: string;
}

/**
 * フォーマット結果の型定義
 */
export interface FormattedError {
  message: string;
  isAuthError: boolean;
  status?: number;
  code?: string;
  retryable?: boolean;
}

/**
 * 🎨 UI表示用のエラー分類
 */
export interface ErrorCategory {
  type: 'network' | 'server' | 'client' | 'auth' | 'validation' | 'unknown';
  title: string;
  message: string;
  action: string;
  retryable: boolean;
  severity: 'low' | 'medium' | 'high';
}

/**
 * 🎯 汎用エラーメッセージフォーマッター（既存ロジック移植 + Axios対応）
 */
export const formatErrorMessage = (error: unknown): FormattedError => {
  // 文字列エラー
  if (typeof error === "string") {
    return { message: error, isAuthError: false };
  }

  // ✅ Axiosエラーの型安全な処理
  if (isAxiosError(error)) {
    return formatAxiosError(error);
  }

  // 通常のErrorオブジェクト
  if (error instanceof Error) {
    return { message: error.message, isAuthError: false };
  }

  // オブジェクトでmessageプロパティがある場合
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === "string") {
      return { message, isAuthError: false };
    }
  }

  // フォールバック
  return {
    message: "予期しないエラーが発生しました",
    isAuthError: false,
  };
};

/**
 * 🔧 Axiosエラー専用フォーマッター（既存ロジックを移植）
 */
const formatAxiosError = (error: AxiosError<ErrorResponse>): FormattedError => {
  // ネットワークエラー
  if (!error.response) {
    return {
      message:
        "ネットワークエラーが発生しました。インターネット接続を確認してください。",
      isAuthError: false,
      retryable: true,
    };
  }

  const { status, data } = error.response;

  // HTTPステータスコード別の詳細メッセージ（既存ロジック）
  switch (status) {
    case 401:
      return handle401Error(data, status);

    case 400:
      return handle400Error(data, status);

    case 403:
      return {
        message: "この操作を行う権限がありません。",
        isAuthError: false,
        status,
      };

    case 404:
      return {
        message: "リソースが見つかりません。削除された可能性があります。",
        isAuthError: false,
        status,
      };

    case 422:
      return handle422Error(data, status);

    case 429:
      return {
        message:
          "API利用制限に達しました。しばらく待ってから再試行してください。",
        isAuthError: false,
        status,
        retryable: true,
      };

    case 500:
      return {
        message:
          "サーバーエラーが発生しました。しばらく待ってから再試行してください。",
        isAuthError: false,
        status,
        retryable: true,
      };

    case 502:
    case 503:
    case 504:
      return {
        message:
          "サーバーが一時的に利用できません。しばらく待ってから再試行してください。",
        isAuthError: false,
        status,
        retryable: true,
      };

    default:
      return handleDefaultError(data, status);
  }
};

/**
 * 401エラーの詳細処理（既存ロジック）
 */
const handle401Error = (
  data: ErrorResponse | undefined,
  status: number
): FormattedError => {
  const detail = data?.detail || "";

  // バックエンドからの期限切れメッセージを検出
  if (
    typeof detail === "string" &&
    (detail.includes("有効期限が切れました") || detail.includes("expired"))
  ) {
    return {
      message: "セッションの有効期限が切れました。再度ログインしてください。",
      isAuthError: true,
      status,
      code: "SESSION_EXPIRED",
    };
  }

  if (
    typeof detail === "string" &&
    (detail.includes("認証情報が無効です") ||
      detail.includes("トークンが無効です"))
  ) {
    return {
      message: "認証情報が無効です。ログインし直してください。",
      isAuthError: true,
      status,
      code: "INVALID_TOKEN",
    };
  }

  if (
    typeof detail === "string" &&
    detail.includes("ユーザーが見つかりません")
  ) {
    return {
      message: "ユーザー情報が見つかりません。再度ログインしてください。",
      isAuthError: true,
      status,
      code: "USER_NOT_FOUND",
    };
  }

  return {
    message:
      typeof detail === "string"
        ? detail
        : "認証に失敗しました。ログインしてください。",
    isAuthError: true,
    status,
    code: "AUTH_FAILED",
  };
};

/**
 * 400エラーの詳細処理（既存ロジック）
 */
const handle400Error = (
  data: ErrorResponse | undefined,
  status: number
): FormattedError => {
  if (data?.detail && typeof data.detail === "string") {
    return {
      message: data.detail,
      isAuthError: false,
      status,
    };
  }

  return {
    message: "リクエストに問題があります。",
    isAuthError: false,
    status,
  };
};

/**
 * 422エラーの詳細処理（既存ロジック）
 */
const handle422Error = (
  data: ErrorResponse | undefined,
  status: number
): FormattedError => {
  // FastAPIのバリデーションエラー
  if (Array.isArray(data?.detail)) {
    const validationErrors = data.detail
      .map((e: ValidationError) => {
        const field = e.loc?.join(".");
        const message = e.msg;
        return `${field}: ${message}`;
      })
      .join(", ");

    return {
      message: `入力エラー: ${validationErrors}`,
      isAuthError: false,
      status,
      code: "VALIDATION_ERROR",
    };
  }

  return {
    message: "入力データに問題があります。",
    isAuthError: false,
    status,
  };
};

/**
 * デフォルトエラーの処理（既存ロジック）
 */
const handleDefaultError = (
  data: ErrorResponse | undefined,
  status: number
): FormattedError => {
  // カスタムメッセージがある場合
  if (data?.detail && typeof data.detail === "string") {
    return {
      message: data.detail,
      isAuthError: false,
      status,
    };
  }

  if (data?.message) {
    return {
      message: data.message,
      isAuthError: false,
      status,
    };
  }

  return {
    message: `エラーが発生しました (${status})`,
    isAuthError: false,
    status,
  };
};

/**
 * 📚 書籍管理用のカスタムエラーフォーマッター
 */
export const formatBookError = (error: unknown): FormattedError => {
  const baseResult = formatErrorMessage(error);

  // 書籍固有のエラー処理
  if (isAxiosError(error) && error.response) {
    const { status, data } = error.response;

    switch (status) {
      case 400:
        if (data?.code === "INVALID_ISBN") {
          return {
            ...baseResult,
            message: "ISBNが無効です。正しいISBNを入力してください",
          };
        }
        if (data?.code === "ISBN_FORMAT_ERROR") {
          return {
            ...baseResult,
            message:
              "ISBNの形式が正しくありません（13桁の数字である必要があります）",
          };
        }
        break;

      case 404:
        return {
          ...baseResult,
          message:
            "指定されたISBNの書籍が見つかりませんでした。Google Books APIに登録されていない可能性があります",
        };

      case 409:
        return {
          ...baseResult,
          message: "この書籍は既に登録されています",
        };

      case 429:
        return {
          ...baseResult,
          message:
            "Google Books APIの利用制限に達しました。しばらく待ってから再試行してください",
        };

      case 503:
        return {
          ...baseResult,
          message:
            "Google Books APIが一時的に利用できません。しばらく待ってから再試行してください",
        };
    }
  }

  return baseResult;
};

/**
 * 🔐 認証用のカスタムエラーフォーマッター
 */
export const formatAuthError = (error: unknown): FormattedError => {
  const baseResult = formatErrorMessage(error);

  // 認証固有のエラー処理
  if (isAxiosError(error) && error.response) {
    const { status, data } = error.response;

    switch (status) {
      case 400:
        if (data?.code === "INVALID_EMAIL") {
          return {
            ...baseResult,
            message: "有効なメールアドレスを入力してください",
          };
        }
        if (data?.code === "WEAK_PASSWORD") {
          return {
            ...baseResult,
            message: "パスワードは8文字以上で、英数字を含める必要があります",
          };
        }
        break;

      case 409:
        return {
          ...baseResult,
          message: "このメールアドレスは既に登録されています",
        };

      case 429:
        return {
          ...baseResult,
          message:
            "ログイン試行回数が上限に達しました。しばらく待ってから再試行してください",
        };
    }
  }

  return baseResult;
};

export interface FoodErrorResult extends FormattedError {
  needsConfirmation?: boolean; // 確認が必要かどうか
  confirmationMessage?: string; // 確認メッセージ
  canForce?: boolean; // 強行登録可能かどうか
}

/**
 * 🍎 食品管理用のカスタムエラーフォーマッター（将来実装）
 */
export const formatFoodError = (error: unknown): FoodErrorResult => {
  const baseResult = formatErrorMessage(error);

  // 食品固有のエラー処理
  if (isAxiosError(error) && error.response) {
    const { status, data } = error.response;

    switch (status) {
      case 400:
        if (data?.code === "INVALID_JAN") {
          return {
            ...baseResult,
            message: "JANコードが無効です。正しいJANコードを入力してください",
          };
        }
        if (data?.code === "EXPIRED_FOOD") {
          return {
            ...baseResult,
            message: "賞味期限が過ぎた食品は登録できません",
          };
        }
        break;

      case 404:
        return {
          ...baseResult,
          message: "指定されたJANコードの商品が見つかりませんでした",
        };

      case 409:
        // ✅ カテゴリ不一致の確認メッセージかどうかを判定
        // eslint-disable-next-line no-case-declarations
        const detail = data?.detail || "";
        console.log("🔍 409エラー detail:", detail); // ← これを追加
        console.log("🔍 detail type:", typeof detail); // ← これを追加
        console.log("🔍 includes test:", detail.includes("分類されませんが")); // ← これを追加

        if (
          typeof detail === "string" &&
          detail.includes("分類されませんが、本当に追加してよろしいですか")
        ) {
          return {
            ...baseResult,
            message: detail,
            needsConfirmation: true, // ✅ 確認が必要
            confirmationMessage: detail, // ✅ 確認メッセージ
            canForce: true, // ✅ 強行登録可能
          };
        }

        // その他の409エラー（通常の重複など）
        return {
          ...baseResult,
          message: "この食品は既に登録されています",
          needsConfirmation: false,
          canForce: false,
        };
    }
  }

  return {
    ...baseResult,
    needsConfirmation: false,
    canForce: false,
  };
};

/**
 * 🎨 後方互換性のための旧形式サポート
 */
export const formatErrorMessageLegacy = (
  error: unknown
): { message: string; isAuthError: boolean } => {
  const result = formatErrorMessage(error);
  return {
    message: result.message,
    isAuthError: result.isAuthError,
  };
};

export const categorizeError = (error: unknown): ErrorCategory => {
  const details = formatErrorMessage(error);

  if (isAxiosError(error)) {
    const status = error.response?.status;

    // ネットワークエラー
    if (!error.response) {
      return {
        type: "network",
        title: "ネットワークエラー",
        message: details.message,
        action: "インターネット接続を確認してください",
        retryable: true,
        severity: "medium",
      };
    }

    // サーバーエラー
    if (status && status >= 500) {
      return {
        type: "server",
        title: "サーバーエラー",
        message: details.message,
        action: "しばらく待ってから再試行してください",
        retryable: true,
        severity: "high",
      };
    }

    // 認証エラー
    if (status === 401 || status === 403) {
      return {
        type: "auth",
        title: "認証エラー",
        message: details.message,
        action: "再ログインしてください",
        retryable: false,
        severity: "high",
      };
    }

    // バリデーションエラー
    if (status === 400 || status === 422) {
      return {
        type: "validation",
        title: "入力エラー",
        message: details.message,
        action: "入力内容を確認してください",
        retryable: false,
        severity: "low",
      };
    }

    // その他のクライアントエラー
    if (status && status >= 400 && status < 500) {
      return {
        type: "client",
        title: "クライアントエラー",
        message: details.message,
        action: "操作を確認してください",
        retryable: false,
        severity: "medium",
      };
    }
  }

  return {
    type: "unknown",
    title: "エラー",
    message: details.message,
    action: "サポートにお問い合わせください",
    retryable: false,
    severity: "medium",
  };
};

/**
 * 🔧 開発環境用のエラーログ
 */
export const logError = (error: unknown, context?: string): void => {
  if (import.meta.env.DEV) {
    const formatted = formatErrorMessage(error);

    console.group(`🚨 Error ${context ? `in ${context}` : ""}`);
    console.error("Original error:", error);
    console.table(formatted);
    console.groupEnd();
  }
};
