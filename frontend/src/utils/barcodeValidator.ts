// frontend/src/utils/barcodeValidator.ts
/**
 * 汎用バーコード検証とフォーマット関数
 * 書籍（ISBN）と食品（JAN/EAN）の両方に対応
 */

// バーコードの種類を定義
export type BarcodeType = "ISBN" | "JAN" | "EAN" | "UNKNOWN";

// バーコード検証結果の型
export interface BarcodeValidationResult {
  isValid: boolean;
  type: BarcodeType;
  cleanCode: string;
  formattedCode: string;
  errors: string[];
}

/**
 * ISBN-13の有効性を検証する（既存機能を移植）
 */
export const validateISBN = (code: string): boolean => {
  const cleanCode = code.replace(/[^\d]/g, "");

  if (!/^\d{13}$/.test(cleanCode)) {
    return false;
  }

  // ISBN-13のチェックディジット検証
  const digits = cleanCode.split("").map(Number);
  const checkSum = digits.slice(0, 12).reduce((sum, digit, index) => {
    return sum + digit * (index % 2 === 0 ? 1 : 3);
  }, 0);

  const checkDigit = (10 - (checkSum % 10)) % 10;
  return checkDigit === digits[12];
};

/**
 * JAN/EAN-13の有効性を検証する
 */
export const validateJAN = (code: string): boolean => {
  const cleanCode = code.replace(/[^\d]/g, "");

  if (!/^\d{13}$/.test(cleanCode)) {
    return false;
  }

  // JAN/EAN-13のチェックディジット検証（ISBNと同じアルゴリズム）
  const digits = cleanCode.split("").map(Number);
  const checkSum = digits.slice(0, 12).reduce((sum, digit, index) => {
    return sum + digit * (index % 2 === 0 ? 1 : 3);
  }, 0);

  const checkDigit = (10 - (checkSum % 10)) % 10;
  return checkDigit === digits[12];
};

/**
 * EAN-8の有効性を検証する
 */
export const validateEAN8 = (code: string): boolean => {
  const cleanCode = code.replace(/[^\d]/g, "");

  if (!/^\d{8}$/.test(cleanCode)) {
    return false;
  }

  // EAN-8のチェックディジット検証
  const digits = cleanCode.split("").map(Number);
  const checkSum = digits.slice(0, 7).reduce((sum, digit, index) => {
    return sum + digit * (index % 2 === 0 ? 3 : 1);
  }, 0);

  const checkDigit = (10 - (checkSum % 10)) % 10;
  return checkDigit === digits[7];
};

/**
 * バーコードの種類を判定する
 */
export const detectBarcodeType = (code: string): BarcodeType => {
  const cleanCode = code.replace(/[^\d]/g, "");

  // ISBN: 978または979で始まる13桁
  if (
    cleanCode.length === 13 &&
    (cleanCode.startsWith("978") || cleanCode.startsWith("979"))
  ) {
    return "ISBN";
  }

  // JAN: 日本の商品コード（45または49で始まる13桁）
  if (
    cleanCode.length === 13 &&
    (cleanCode.startsWith("45") || cleanCode.startsWith("49"))
  ) {
    return "JAN";
  }

  // EAN-13: その他の13桁
  if (cleanCode.length === 13) {
    return "EAN";
  }

  // EAN-8: 8桁
  if (cleanCode.length === 8) {
    return "EAN";
  }

  return "UNKNOWN";
};

/**
 * バーコードを読みやすい形式にフォーマットする
 */
export const formatBarcode = (code: string, type: BarcodeType): string => {
  const clean = code.replace(/[^\d]/g, "");

  switch (type) {
    case "ISBN":
      if (clean.length === 13) {
        return `${clean.slice(0, 3)}-${clean.slice(3, 4)}-${clean.slice(4, 9)}-${clean.slice(9, 12)}-${clean.slice(12)}`;
      }
      break;

    case "JAN":
    case "EAN":
      if (clean.length === 13) {
        return `${clean.slice(0, 1)}-${clean.slice(1, 7)}-${clean.slice(7, 12)}-${clean.slice(12)}`;
      } else if (clean.length === 8) {
        return `${clean.slice(0, 4)}-${clean.slice(4, 7)}-${clean.slice(7)}`;
      }
      break;
  }

  return clean;
};

/**
 * 汎用バーコード検証機能
 */
export const validateBarcode = (code: string): BarcodeValidationResult => {
  const cleanCode = code.replace(/[^\d]/g, "");
  const type = detectBarcodeType(cleanCode);
  const errors: string[] = [];
  let isValid = false;

  // 基本的な長さチェック
  if (!cleanCode) {
    errors.push("バーコードが空です");
    return {
      isValid: false,
      type: "UNKNOWN",
      cleanCode: "",
      formattedCode: "",
      errors,
    };
  }

  // タイプ別の検証
  switch (type) {
    case "ISBN":
      isValid = validateISBN(cleanCode);
      if (!isValid) {
        errors.push("ISBNのチェックディジットが無効です");
      }
      break;

    case "JAN":
      isValid = validateJAN(cleanCode);
      if (!isValid) {
        errors.push("JANコードのチェックディジットが無効です");
      }
      break;

    case "EAN":
      if (cleanCode.length === 13) {
        isValid = validateJAN(cleanCode); // EAN-13とJANは同じ検証アルゴリズム
        if (!isValid) {
          errors.push("EANコードのチェックディジットが無効です");
        }
      } else if (cleanCode.length === 8) {
        isValid = validateEAN8(cleanCode);
        if (!isValid) {
          errors.push("EAN-8コードのチェックディジットが無効です");
        }
      } else {
        errors.push("EANコードの桁数が無効です");
      }
      break;

    case "UNKNOWN":
      errors.push("サポートされていないバーコード形式です");
      break;
  }

  const formattedCode = formatBarcode(cleanCode, type);

  return {
    isValid,
    type,
    cleanCode,
    formattedCode,
    errors,
  };
};

/**
 * スキャンされたテキストから有効なバーコードを抽出
 * （既存のextractISBNFromScannedTextの汎用版）
 */
export const extractBarcodeFromScannedText = (
  scannedText: string
): BarcodeValidationResult | null => {
  const result = validateBarcode(scannedText);

  if (result.isValid) {
    console.log(`✅ 有効な${result.type}検出:`, result.formattedCode);
    return result;
  }

  console.log(`❌ 無効なバーコード:`, scannedText, result.errors);
  return null;
};

// 既存のISBN専用関数（後方互換性のため）
export const isValidISBN = (isbn: string): boolean => {
  return validateISBN(isbn);
};

export const formatISBN = (isbn: string): string => {
  return formatBarcode(isbn, "ISBN");
};

export const extractISBNFromScannedText = (
  scannedText: string
): string | null => {
  const result = extractBarcodeFromScannedText(scannedText);
  return result && result.type === "ISBN" ? result.cleanCode : null;
};

/**
 * テスト用のバーコードサンプル
 */
export const TEST_BARCODES = {
  isbn: [
    "9784798069371", // Clean Code
    "9784873119038", // リーダブルコード
    "9784797382570", // JavaScript本格入門
  ],
  jan: [
    "4901301234567", // 日本製品（仮想）
    "4912345678901", // 日本製品（仮想）
    "4567890123456", // 日本製品（仮想）
  ],
  ean13: [
    "5012345678900", // ヨーロッパ製品（仮想）
    "8901234567890", // その他地域（仮想）
  ],
  ean8: [
    "12345670", // EAN-8（仮想）
    "87654321", // EAN-8（仮想）
  ],
  invalid: [
    "1234567890123", // チェックディジット不正
    "123456789012", // 12桁
    "12345678901234", // 14桁
    "abcdefghijk", // 数字以外
  ],
} as const;

/**
 * 開発用：バーコードバリデーターのテスト実行
 */
export const testBarcodeValidator = (): void => {
  console.log("🔍 Universal Barcode Validator テスト開始");

  // ISBN テスト
  console.log("\n📚 ISBN テスト:");
  TEST_BARCODES.isbn.forEach((code) => {
    const result = validateBarcode(code);
    console.log(
      `${result.isValid ? "✅" : "❌"} ${code} -> ${result.formattedCode} (${result.type})`
    );
  });

  // JAN テスト
  console.log("\n🛒 JAN テスト:");
  TEST_BARCODES.jan.forEach((code) => {
    const result = validateBarcode(code);
    console.log(
      `${result.isValid ? "✅" : "❌"} ${code} -> ${result.formattedCode} (${result.type})`
    );
  });

  // EAN テスト
  console.log("\n🌍 EAN テスト:");
  [...TEST_BARCODES.ean13, ...TEST_BARCODES.ean8].forEach((code) => {
    const result = validateBarcode(code);
    console.log(
      `${result.isValid ? "✅" : "❌"} ${code} -> ${result.formattedCode} (${result.type})`
    );
  });

  // 無効なバーコード テスト
  console.log("\n❌ 無効なバーコード テスト:");
  TEST_BARCODES.invalid.forEach((code) => {
    const result = validateBarcode(code);
    console.log(
      `${result.isValid ? "⚠️" : "✅"} ${code} -> ${result.errors.join(", ")}`
    );
  });

  // スキャンテキスト抽出テスト
  console.log("\n🔍 スキャンテキスト抽出テスト:");
  const testTexts = [
    "9784798069371", // 純粋なISBN
    "ISBN 978-4-7981-6957-0", // ISBN接頭辞付き
    "4901301234567", // 純粋なJAN
    "JAN: 4901301234567", // JAN接頭辞付き
    "hello world", // 関係ないテキスト
  ];

  testTexts.forEach((text) => {
    const extracted = extractBarcodeFromScannedText(text);
    console.log(
      `"${text}" -> ${extracted ? `${extracted.type}: ${extracted.formattedCode}` : "null"}`
    );
  });
};

// 開発環境でのみテスト実行
if (import.meta.env.DEV) {
  // testBarcodeValidator(); // 必要に応じてコメントアウト
}
