// frontend/src/utils/isbnValidator.ts
/**
 * ISBN（国際標準図書番号）の検証とフォーマット関数
 */

/**
 * ISBN-13の有効性を検証する
 * @param isbn - 検証するISBN文字列
 * @returns 有効なISBNの場合true
 */
export const isValidISBN = (isbn: string): boolean => {
  // ハイフン、スペース、その他の文字を除去して数字のみにする
  const cleanISBN = isbn.replace(/[^\d]/g, "");

  // 13桁の数字かチェック
  if (!/^\d{13}$/.test(cleanISBN)) {
    console.log(
      `❌ ISBN形式エラー: ${isbn} -> ${cleanISBN} (13桁ではありません)`
    );
    return false;
  }

  // ISBN-13のチェックディジット検証
  const digits = cleanISBN.split("").map(Number);
  const checkSum = digits.slice(0, 12).reduce((sum, digit, index) => {
    return sum + digit * (index % 2 === 0 ? 1 : 3);
  }, 0);

  const checkDigit = (10 - (checkSum % 10)) % 10;
  const isValid = checkDigit === digits[12];

  if (!isValid) {
    console.log(`❌ ISBN チェックディジットエラー: ${cleanISBN}`);
  } else {
    console.log(`✅ 有効なISBN: ${cleanISBN}`);
  }

  return isValid;
};

/**
 * ISBNを読みやすい形式にフォーマットする
 * @param isbn - フォーマットするISBN
 * @returns フォーマット済みISBN (例: 978-4-7981-6957-0)
 */
export const formatISBN = (isbn: string): string => {
  const clean = isbn.replace(/[^\d]/g, "");

  if (clean.length === 13) {
    return `${clean.slice(0, 3)}-${clean.slice(3, 4)}-${clean.slice(4, 9)}-${clean.slice(9, 12)}-${clean.slice(12)}`;
  }

  return clean;
};

/**
 * バーコードから読み取った文字列がISBNかどうかを判定
 * @param scannedText - スキャンされたテキスト
 * @returns ISBNと判定される場合、クリーンなISBNを返す。そうでなければnull
 */
export const extractISBNFromScannedText = (
  scannedText: string
): string | null => {
  // ISBNは通常978または979で始まる13桁
  const potentialISBN = scannedText.replace(/[^\d]/g, "");

  // 13桁で978または979で始まる場合のみISBNとして扱う
  if (
    potentialISBN.length === 13 &&
    (potentialISBN.startsWith("978") || potentialISBN.startsWith("979"))
  ) {
    if (isValidISBN(potentialISBN)) {
      return potentialISBN;
    }
  }

  return null;
};

/**
 * テスト用のISBNリスト（開発時の動作確認用）
 */
export const TEST_ISBNS = {
  valid: [
    "9784798069371", // Clean Code
    "9784873119038", // リーダブルコード
    "9784797382570", // JavaScript本格入門
    "9784774182209", // Web API: The Good Parts
    "9784873118468", // Effective TypeScript
  ],
  invalid: [
    "1234567890123", // チェックディジット不正
    "978479838257", // 12桁
    "97847973825701", // 14桁
    "abcdefghijklm", // 数字以外
  ],
} as const;

/**
 * 開発用：ISBNバリデーターのテスト実行
 */
export const testISBNValidator = (): void => {
  console.log("📚 ISBN Validator テスト開始");

  console.log("\n✅ 有効なISBNのテスト:");
  TEST_ISBNS.valid.forEach((isbn) => {
    const result = isValidISBN(isbn);
    console.log(`${result ? "✅" : "❌"} ${isbn} -> ${formatISBN(isbn)}`);
  });

  console.log("\n❌ 無効なISBNのテスト:");
  TEST_ISBNS.invalid.forEach((isbn) => {
    const result = isValidISBN(isbn);
    console.log(`${result ? "⚠️" : "✅"} ${isbn} (無効として正しく判定)`);
  });

  console.log("\n🔍 バーコードテキスト抽出テスト:");
  const testTexts = [
    "9784798069371", // 純粋なISBN
    "ISBN 978-4-7981-6957-0", // ISBN接頭辞付き
    "9784798069371 Japan", // 国名付き
    "hello world", // 全く関係ないテキスト
  ];

  testTexts.forEach((text) => {
    const extracted = extractISBNFromScannedText(text);
    console.log(`"${text}" -> ${extracted || "null"}`);
  });
};

// 開発環境でのみテスト実行
if (import.meta.env.DEV) {
  // testISBNValidator(); // 必要に応じてコメントアウト
}
