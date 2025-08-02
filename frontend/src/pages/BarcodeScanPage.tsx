// frontend/src/pages/BarcodeScanPage.tsx - バーコードスキャン専用ページ

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useBookStore } from "../stores/bookStore";
import { useAuthStore } from "../stores/authStore";
import type { BarcodeValidationResult } from "../utils/barcodeValidator";
import {
  GlassCard,
  GlassButton,
  GlassError,
} from "../components/ui/GlassUI";
import { BarcodeScanner } from "../components/barcode/BarcodeScanner";

export const BarcodeScanPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ✅ URLパラメータから設定を取得
  const returnTo = searchParams.get("returnTo") || "/book-list";
  const mode = searchParams.get("mode") || "book"; // book | food
  const action = searchParams.get("action") || "register"; // register | search

  // ✅ bookStoreから機能を取得
  const {
    createBookByISBN,
    isRegisteringByISBN,
    setRegisteringByISBN,
    error: bookError,
  } = useBookStore();

  const { isAuthenticated } = useAuthStore();

  // ローカル状態
  const [scanError, setScanError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);

  // ✅ 未認証の場合のガード
  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto">
        <GlassCard className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-400/30 to-red-500/30 backdrop-blur-sm rounded-3xl mb-8 shadow-xl">
            <span className="text-4xl">🔒</span>
          </div>
          <h1 className="text-3xl font-light text-gray-800 mb-6">
            バーコードスキャンにはログインが必要です
          </h1>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            アカウントにログインして機能を利用しましょう
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <GlassButton
              variant="primary"
              size="lg"
              onClick={() => navigate("/login")}
            >
              ログイン
            </GlassButton>
            <GlassButton
              variant="outline"
              size="lg"
              onClick={() => navigate("/")}
            >
              ホームに戻る
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    );
  }

  /**
   * ✅ バーコード検出時の汎用処理
   */
  const handleBarcodeDetected = async (result: BarcodeValidationResult) => {
    console.log("🎯 バーコード検出:", result);

    if (isProcessing || lastScannedCode === result.cleanCode) {
      console.log("⚠️ 処理中または重複スキャン、スキップ");
      return;
    }

    setLastScannedCode(result.cleanCode);
    setIsProcessing(true);
    setScanError(null);

    try {
      if (mode === "book" && result.type === "ISBN") {
        await handleBookRegistration(result.cleanCode);
      } else if (
        mode === "food" &&
        (result.type === "JAN" || result.type === "EAN")
      ) {
        await handleFoodRegistration(result);
      } else {
        throw new Error(
          `${mode === "book" ? "書籍登録" : "食品登録"}には${mode === "book" ? "ISBN" : "JAN/EAN"}バーコードが必要です`
        );
      }
    } catch (error: any) {
      console.error("バーコード処理エラー:", error);
      setScanError(error.message);
      setIsProcessing(false);
      setLastScannedCode(null);
    }
  };

  /**
   * ✅ 書籍登録処理
   */
  const handleBookRegistration = async (isbn: string) => {
    try {
      if (action === "register") {
        // 書籍を直接登録
        const registeredBook = await createBookByISBN(isbn);

        // 成功通知とリダイレクト
        alert(`📚 「${registeredBook.title}」を登録しました！`);
        navigate(returnTo);
      } else if (action === "search") {
        // 書籍検索結果へリダイレクト
        navigate(`/search-books?isbn=${isbn}&from=scan`);
      }
    } catch (error: any) {
      console.error("書籍処理エラー:", error);

      // エラーハンドリング: 手動入力への誘導
      const shouldRetry = confirm(
        `❌ ${error.message}\n\n手動入力で書籍を追加しますか？`
      );

      if (shouldRetry) {
        navigate("/add-book");
      } else {
        setIsProcessing(false);
        setLastScannedCode(null);
        setRegisteringByISBN(false);
      }
    }
  };

  /**
   * ✅ 食品登録処理（将来実装）
   */
  const handleFoodRegistration = async (result: BarcodeValidationResult) => {
    // TODO: 食品登録機能の実装
    console.log("🍎 食品登録:", result);

    if (action === "register") {
      // 食品を直接登録（将来実装）
      alert(
        `🍎 商品コード「${result.formattedCode}」を検出しました（食品登録機能は準備中）`
      );
      navigate("/add-food");
    } else if (action === "search") {
      // 食品検索結果へリダイレクト（将来実装）
      navigate(`/food-search?code=${result.cleanCode}&from=scan`);
    }
  };

  /**
   * ✅ スキャン画面を閉じる処理
   */
  const handleClose = () => {
    navigate(returnTo);
  };

  /**
   * ✅ サポートするバーコード種別の決定
   */
  const getSupportedBarcodeTypes = () => {
    switch (mode) {
      case "book":
        return ["ISBN"] as const;
      case "food":
        return ["JAN", "EAN"] as const;
      default:
        return ["ISBN", "JAN", "EAN"] as const;
    }
  };

  /**
   * ✅ タイトルとサブタイトルの生成
   */
  const getTitle = () => {
    switch (mode) {
      case "book":
        return action === "register" ? "📚 書籍を登録" : "📚 書籍を検索";
      case "food":
        return action === "register" ? "🍎 食品を登録" : "🍎 食品を検索";
      default:
        return "📷 バーコードスキャン";
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case "book":
        return "書籍のISBNバーコードをカメラに向けてください";
      case "food":
        return "商品のJAN/EANバーコードをカメラに向けてください";
      default:
        return "バーコードをカメラに向けてください";
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* ✅ ヘッダー */}


      {/* ✅ エラー表示 */}
      {(scanError || bookError) && (
        <div>
          <GlassError
            className="hidden md:block"
            message={scanError || bookError || "エラーが発生しました"}
            onRetry={() => {
              setScanError(null);
              setIsProcessing(false);
              setLastScannedCode(null);
            }}
          />
        </div>
      )}

      {/* ✅ バーコードスキャナー */}
      <BarcodeScanner
        onBarcodeDetected={handleBarcodeDetected}
        supportedTypes={getSupportedBarcodeTypes()}
        onClose={handleClose}
        title={getTitle()}
        subtitle={getSubtitle()}
        manualStart={true}
      />

      {/* ✅ 操作ガイド */}
      <GlassCard className="p-8 mt-8 hidden md:block">
        <h3 className="text-2xl font-light text-gray-800 mb-6 flex items-center">
          <span className="mr-3">💡</span>
          使い方
        </h3>

        <div className="space-y-4">
          {mode === "book" && (
            <div className="bg-blue-50/30 backdrop-blur-sm rounded-xl p-4 border border-blue-200/30">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                <span className="mr-2">📚</span>
                書籍バーコード（ISBN）について
              </h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• 書籍の裏表紙にある13桁のバーコードを読み取ります</p>
                <p>• 978または979から始まる番号が対象です</p>
                <p>
                  •{" "}
                  {action === "register"
                    ? "検出後、自動的にGoogle Books APIから情報を取得して登録します"
                    : "検出後、書籍検索結果ページへ移動します"}
                </p>
              </div>
            </div>
          )}

          {mode === "food" && (
            <div className="bg-green-50/30 backdrop-blur-sm rounded-xl p-4 border border-green-200/30">
              <h4 className="font-medium text-green-900 mb-2 flex items-center">
                <span className="mr-2">🍎</span>
                商品バーコード（JAN/EAN）について
              </h4>
              <div className="text-sm text-green-800 space-y-1">
                <p>
                  •
                  食品・商品パッケージにある13桁または8桁のバーコードを読み取ります
                </p>
                <p>• 日本の商品は45または49から始まります</p>
                <p>
                  •{" "}
                  {action === "register"
                    ? "検出後、商品情報を確認して登録します"
                    : "検出後、商品検索結果ページへ移動します"}
                </p>
              </div>
            </div>
          )}

          {/* 共通のスキャンのコツ */}
          <div className="bg-gray-50/30 backdrop-blur-sm rounded-xl p-4 border border-gray-200/30">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <span className="mr-2">🎯</span>
              スキャンのコツ
            </h4>
            <div className="text-sm text-gray-800 space-y-2">
              <div className="flex items-start space-x-2">
                <span className="text-xs mt-0.5">📱</span>
                <span>
                  スマートフォンは横向きにすると読み取りやすくなります
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-xs mt-0.5">💡</span>
                <span>十分な明るさの場所で撮影してください</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-xs mt-0.5">📏</span>
                <span>
                  バーコードとカメラの距離を10〜30cm程度に調整してください
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-xs mt-0.5">🎯</span>
                <span>
                  バーコード全体がガイドライン内に収まるようにしてください
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 戻るボタン */}
        <div className="mt-6 flex justify-center">
          <GlassButton
            variant="outline"
            size="lg"
            onClick={handleClose}
            disabled={isProcessing}
          >
            {returnTo === "/book-list"
              ? "📚 書籍一覧に戻る"
              : returnTo === "/add-book"
                ? "📝 書籍追加に戻る"
                : "戻る"}
          </GlassButton>
        </div>
      </GlassCard>

      {/* ✅ 書籍登録中の全画面ローディング */}
      {isRegisteringByISBN && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <GlassCard className="p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
              <h3 className="text-xl font-light text-gray-800 mb-4">
                📚 書籍を登録しています...
              </h3>
              <p className="text-gray-600 text-sm">
                Google Books APIから書籍情報を取得中です
              </p>
              {lastScannedCode && (
                <p className="text-gray-500 text-xs mt-2">
                  ISBN: {lastScannedCode}
                </p>
              )}
            </div>
          </GlassCard>
        </div>
      )}

      {/* ✅ 汎用処理中ローディング */}
      {isProcessing && !isRegisteringByISBN && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <GlassCard className="p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-6"></div>
              <h3 className="text-xl font-light text-gray-800 mb-4">
                {mode === "book"
                  ? "📚 書籍情報を処理中..."
                  : "🍎 商品情報を処理中..."}
              </h3>
              <p className="text-gray-600 text-sm">
                バーコード情報を確認しています
              </p>
              {lastScannedCode && (
                <p className="text-gray-500 text-xs mt-2">
                  コード: {lastScannedCode}
                </p>
              )}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
