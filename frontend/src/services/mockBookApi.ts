// frontend/src/services/mockBookApi.ts
import type { Book } from "../types/book";

/**
 * 開発用モックブックデータベース
 * 実際のGoogle Books APIから取得されるような書籍情報を模擬
 */
const mockBooksDatabase: Record<string, Omit<Book, "id" | "user_id">> = {
  // Clean Code
  "9784798069371": {
    title: "Clean Code アジャイルソフトウェア達人の技",
    volume: "第1版",
    author: "Robert C. Martin",
    publisher: "アスキー・メディアワークス",
    cover_image_url:
      "https://m.media-amazon.com/images/I/51E1m-weAFL._SY344_BO1,204,203,200_.jpg",
    published_date: "2017-12-28",
  },

  // リーダブルコード
  "9784873119038": {
    title:
      "リーダブルコード ―より良いコードを書くためのシンプルで実践的なテクニック",
    volume: "第1版",
    author: "Dustin Boswell, Trevor Foucher",
    publisher: "オライリージャパン",
    cover_image_url:
      "https://m.media-amazon.com/images/I/51MgH8Jmr3L._SY344_BO1,204,203,200_.jpg",
    published_date: "2012-06-23",
  },

  // JavaScript本格入門
  "9784797382570": {
    title: "JavaScript本格入門 ~モダンスタイルによる基礎から現場での応用まで",
    volume: "改訂新版",
    author: "山田祥寛",
    publisher: "SBクリエイティブ",
    cover_image_url:
      "https://m.media-amazon.com/images/I/51G9QSFB1FL._SY344_BO1,204,203,200_.jpg",
    published_date: "2016-11-26",
  },

  // Web API: The Good Parts
  "9784774182209": {
    title: "Web API: The Good Parts",
    volume: "第1版",
    author: "水野貴明",
    publisher: "技術評論社",
    cover_image_url:
      "https://m.media-amazon.com/images/I/51wqW7VhtKL._SY346_.jpg",
    published_date: "2014-11-21",
  },

  // Effective TypeScript
  "9784873118468": {
    title: "Effective TypeScript ―型安全性を高める62の特定パターン",
    volume: "第1版",
    author: "Dan Vanderkam",
    publisher: "オライリージャパン",
    cover_image_url:
      "https://m.media-amazon.com/images/I/51WgLz5VSDL._SY346_.jpg",
    published_date: "2020-05-23",
  },

  // React実践の教科書
  "9784295010943": {
    title: "React実践の教科書",
    volume: "第1版",
    author: "岡田拓巳",
    publisher: "マイナビ出版",
    cover_image_url:
      "https://m.media-amazon.com/images/I/51gE4kHdXhL._SY346_.jpg",
    published_date: "2021-09-18",
  },

  // TypeScript入門
  "9784798055305": {
    title:
      "プログラミングTypeScript ―スケールするJavaScriptアプリケーション開発",
    volume: "第1版",
    author: "Boris Cherny",
    publisher: "オライリージャパン",
    cover_image_url:
      "https://m.media-amazon.com/images/I/51u9YK3ggaL._SY346_.jpg",
    published_date: "2020-03-16",
  },
};

/**
 * 実際のAPIコールを模擬する遅延時間の設定
 */
const API_DELAY = {
  min: 500, // 最小遅延（ミリ秒）
  max: 1500, // 最大遅延（ミリ秒）
};

/**
 * ランダムな遅延を生成
 */
const getRandomDelay = (): number => {
  return Math.random() * (API_DELAY.max - API_DELAY.min) + API_DELAY.min;
};

/**
 * 模擬的なネットワーク遅延を追加
 */
const simulateNetworkDelay = async (): Promise<void> => {
  const delay = getRandomDelay();
  console.log(`🌐 模擬ネットワーク遅延: ${Math.round(delay)}ms`);
  await new Promise((resolve) => setTimeout(resolve, delay));
};

/**
 * ISBN指定で書籍を登録（モック版）
 * バックエンドの POST /api/books/register-by-isbn を模擬
 */
export const mockRegisterBookByISBN = async (isbn: string): Promise<Book> => {
  console.log(`📚 Mock API: ISBN "${isbn}" で書籍登録開始`);

  // ネットワーク遅延を模擬
  await simulateNetworkDelay();

  // ISBNをクリーンアップ
  const cleanISBN = isbn.replace(/[^\d]/g, "");

  // モックデータベースから書籍情報を検索
  const bookData = mockBooksDatabase[cleanISBN];

  if (!bookData) {
    console.log(`❌ Mock API: ISBN "${cleanISBN}" の書籍が見つかりません`);
    throw new Error(`ISBN '${isbn}' の書籍情報が見つかりませんでした`);
  }

  // 完全なBookオブジェクトを生成
  const registeredBook: Book = {
    id: Date.now() + Math.floor(Math.random() * 1000), // 一意なIDを生成
    user_id: 1, // 現在のユーザーID（実際は認証から取得）
    ...bookData,
  };

  console.log(`✅ Mock API: 書籍登録成功`, registeredBook);
  return registeredBook;
};

/**
 * エラーを意図的に発生させるバージョン（テスト用）
 */
export const mockRegisterBookByISBNWithRandomError = async (
  isbn: string
): Promise<Book> => {
  console.log(`🎲 Mock API (エラーあり): ISBN "${isbn}" で書籍登録開始`);

  await simulateNetworkDelay();

  // 30%の確率でランダムエラーを発生
  const errorChance = Math.random();
  if (errorChance < 0.1) {
    throw new Error("ネットワークエラーが発生しました");
  } else if (errorChance < 0.2) {
    throw new Error("サーバーエラーが発生しました (500)");
  } else if (errorChance < 0.3) {
    throw new Error("この書籍は既に登録されています");
  }

  return mockRegisterBookByISBN(isbn);
};

/**
 * 書籍検索のモック（既存のsearchBooksByTitleに対応）
 */
export const mockSearchBooksByTitle = async (
  title: string
): Promise<Book[]> => {
  console.log(`🔍 Mock API: タイトル "${title}" で書籍検索`);

  await simulateNetworkDelay();

  // タイトルに含まれる文字で部分マッチ検索
  const results = Object.entries(mockBooksDatabase)
    .filter(
      ([isbn, book]) =>
        book.title.toLowerCase().includes(title.toLowerCase()) ||
        book.author.toLowerCase().includes(title.toLowerCase())
    )
    .map(([isbn, bookData]) => ({
      id: parseInt(isbn),
      user_id: 1,
      ...bookData,
    }));

  console.log(`✅ Mock API: ${results.length}件の検索結果`);
  return results;
};

/**
 * 利用可能な全てのモック書籍データを取得
 */
export const getMockBooksList = (): Array<{
  isbn: string;
  title: string;
  author: string;
}> => {
  return Object.entries(mockBooksDatabase).map(([isbn, book]) => ({
    isbn,
    title: book.title,
    author: book.author,
  }));
};

/**
 * 開発用：モックAPIのテスト実行
 */
export const testMockAPI = async (): Promise<void> => {
  console.log("🧪 Mock API テスト開始");

  try {
    // 成功パターン
    console.log("\n✅ 正常な書籍登録テスト:");
    const book1 = await mockRegisterBookByISBN("9784798069371");
    console.log("登録成功:", book1.title);

    // 存在しないISBN
    console.log("\n❌ 存在しないISBNテスト:");
    try {
      await mockRegisterBookByISBN("9999999999999");
    } catch (error: any) {
      console.log("期待通りのエラー:", error.message);
    }

    // 検索テスト
    console.log("\n🔍 書籍検索テスト:");
    const searchResults = await mockSearchBooksByTitle("JavaScript");
    console.log(`検索結果: ${searchResults.length}件`);
  } catch (error) {
    console.error("テストエラー:", error);
  }
};

/**
 * 開発環境でのモックAPI情報表示
 */
if (import.meta.env.DEV) {
  console.log("📚 Mock Book API 初期化完了");
  console.log(`利用可能な書籍: ${Object.keys(mockBooksDatabase).length}冊`);

  // 利用可能な書籍リストをコンソールに表示
  const booksList = getMockBooksList();
  console.table(booksList);

  // 必要に応じてテスト実行（コメントアウト可能）
  // testMockAPI();
}
