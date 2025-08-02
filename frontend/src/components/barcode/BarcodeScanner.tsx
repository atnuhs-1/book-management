// frontend/src/components/barcode/BarcodeScanner.tsx - モバイルフルスクリーン対応版
import React, { useEffect, useState } from "react";
import {
  useBarcodeScanner,
  useCameraPermission,
} from "../../hooks/useBarcodeScanner";
import { formatISBN } from "../../utils/isbnValidator";
import {
  type BarcodeValidationResult,
  type BarcodeType,
} from "../../utils/barcodeValidator";
import { GlassCard, GlassButton, GlassError } from "../ui/GlassUI";

interface BarcodeScannerProps {
  // ✅ 既存のISBN専用プロパティ（後方互換性）
  onISBNDetected?: (isbn: string) => void;

  // ✅ 新規追加: 汎用バーコード検出プロパティ
  onBarcodeDetected?: (result: BarcodeValidationResult) => void;
  supportedTypes?: BarcodeType[];

  // ✅ 既存のプロパティ（変更なし）
  onClose: () => void;
  title?: string;
  subtitle?: string;

  // ✅ 新規追加: 手動起動オプション
  manualStart?: boolean;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onISBNDetected,
  onBarcodeDetected,
  supportedTypes = ["ISBN"], // デフォルトはISBNのみ（既存動作を維持）
  onClose,
  title = "バーコードスキャン",
  subtitle = "バーコードをカメラに向けてください",
  manualStart = false, // ✅ 新規追加: デフォルトは自動起動（既存動作維持）
}) => {
  const {
    isScanning,
    error,
    isInitialized,
    videoRef,
    startScanning,
    stopScanning,
    onBarcodeDetected: registerCallback, // ✅ フック側も汎用化予定
    clearError,
  } = useBarcodeScanner({
    preferBackCamera: true,
    continuousScan: false,
    scanDelay: 1000,
    supportedTypes, // ✅ 新規: サポートするバーコード種別
  });

  const cameraPermission = useCameraPermission();
  const [detectedBarcode, setDetectedBarcode] =
    useState<BarcodeValidationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraActivated, setCameraActivated] = useState(!manualStart); // ✅ 新規追加: カメラ起動状態

  /**
   * バーコード検出時の処理（汎用化）
   */
  useEffect(() => {
    registerCallback(async (result: BarcodeValidationResult) => {
      console.log(`📷 ${result.type}検出:`, result.formattedCode);

      setDetectedBarcode(result);
      setIsProcessing(true);

      try {
        // ✅ 既存のISBN専用コールバック（後方互換性）
        if (result.type === "ISBN" && onISBNDetected) {
          await onISBNDetected(result.cleanCode);
        }

        // ✅ 新規: 汎用バーコードコールバック
        if (onBarcodeDetected) {
          await onBarcodeDetected(result);
        }
        // 正常終了時もリセット
        setIsProcessing(false);
        setDetectedBarcode(null);
      } catch (error) {
        console.error("バーコード処理エラー:", error);
        // エラーが発生した場合はスキャンを再開可能にする
        setIsProcessing(false);
        setDetectedBarcode(null);
      }
    });
  }, [registerCallback, onISBNDetected, onBarcodeDetected]);

  /**
   * コンポーネントのクリーンアップ
   */
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  /**
   * スキャン開始処理
   */
  const handleStartScanning = async () => {
    clearError();
    setDetectedBarcode(null);
    setIsProcessing(false);
    await startScanning();
  };

  /**
   * スキャン停止処理
   */
  const handleStopScanning = () => {
    stopScanning();
    setDetectedBarcode(null);
    setIsProcessing(false);
  };

  /**
   * カメラ起動処理
   */
  const handleActivateCamera = async () => {
    setCameraActivated(true);
    // カメラ起動後、少し待ってから自動でスキャン開始
    setTimeout(async () => {
      await handleStartScanning();
    }, 500);
  };

  /**
   * 閉じる処理
   */
  const handleClose = () => {
    handleStopScanning();
    onClose();
  };

  /**
   * サポートされているバーコード種別の表示テキスト
   */
  const getSupportedTypesText = (): string => {
    if (supportedTypes.includes("ISBN") && supportedTypes.length === 1) {
      return "書籍のISBNバーコード";
    }

    const typeNames = supportedTypes.map((type) => {
      switch (type) {
        case "ISBN":
          return "書籍(ISBN)";
        case "JAN":
          return "商品(JAN)";
        case "EAN":
          return "商品(EAN)";
        default:
          return type;
      }
    });

    return typeNames.join("、");
  };

  /**
   * バーコード種別に応じたアイコン
   */
  const getBarcodeIcon = (type: BarcodeType): string => {
    switch (type) {
      case "ISBN":
        return "📚";
      case "JAN":
        return "🛒";
      case "EAN":
        return "🏷️";
      default:
        return "📄";
    }
  };

  /**
   * フォーマット関数の選択（後方互換性）
   */
  const formatDetectedCode = (result: BarcodeValidationResult): string => {
    if (result.type === "ISBN") {
      return formatISBN(result.cleanCode); // 既存のフォーマット関数を使用
    }
    return result.formattedCode;
  };

  /**
   * カメラ権限が拒否されている場合のUI
   */
  if (cameraPermission === "denied") {
    return (
      <GlassCard className="p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-400/30 backdrop-blur-sm rounded-2xl mb-6 shadow-xl">
            <span className="text-3xl">🚫</span>
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-4">
            カメラアクセスが拒否されています
          </h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            バーコードスキャンを使用するには、カメラへのアクセス許可が必要です。
            <br />
            ブラウザの設定でカメラを許可してからもう一度お試しください。
          </p>
          <div className="space-y-3">
            <GlassButton
              variant="primary"
              onClick={() => window.location.reload()}
            >
              🔄 ページを再読み込み
            </GlassButton>
            <GlassButton variant="outline" onClick={handleClose}>
              閉じる
            </GlassButton>
          </div>

          {/* カメラ許可の手順 */}
          <div className="mt-6 p-4 bg-blue-50/50 backdrop-blur-sm rounded-xl text-left">
            <h4 className="font-medium text-blue-900 mb-2">
              📱 カメラ許可の手順
            </h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• ブラウザのアドレスバー左側のカメラアイコンをクリック</p>
              <p>• 「カメラを許可」を選択</p>
              <p>• ページを再読み込みしてください</p>
            </div>
          </div>
        </div>
      </GlassCard>
    );
  }

  /**
   * カメラ起動前の初期画面
   */
  if (manualStart && !cameraActivated) {
    return (
      <>
        {/* デスクトップ用: カメラ起動前画面 */}
        <GlassCard className="p-8 hidden md:block">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-400/30 to-blue-500/30 backdrop-blur-sm rounded-3xl mb-8 shadow-xl">
              <span className="text-4xl">📷</span>
            </div>
            <h2 className="text-2xl font-light text-gray-800 mb-4">{title}</h2>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              {subtitle}
            </p>

            {/* サポートバーコード表示 */}
            <div className="mb-8 p-4 bg-blue-50/30 backdrop-blur-sm rounded-xl border border-blue-200/30">
              <h3 className="font-medium text-blue-900 mb-3">対応バーコード</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {supportedTypes.map((type) => (
                  <span
                    key={type}
                    className="inline-flex items-center px-4 py-2 bg-blue-100/50 rounded-lg text-sm font-medium text-blue-800"
                  >
                    <span className="mr-2 text-lg">{getBarcodeIcon(type)}</span>
                    {type === "ISBN" ? "書籍(ISBN)" :
                     type === "JAN" ? "商品(JAN)" :
                     type === "EAN" ? "商品(EAN)" : type}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <GlassButton
                variant="primary"
                size="lg"
                onClick={handleActivateCamera}
              >
                <span className="mr-2">📷</span>
                カメラを起動する
              </GlassButton>
              <GlassButton
                variant="outline"
                size="lg"
                onClick={handleClose}
              >
                キャンセル
              </GlassButton>
            </div>

            {/* 使用方法のヒント */}
            <div className="mt-8 bg-gray-50/30 backdrop-blur-sm rounded-xl p-4 border border-gray-200/30">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <span className="mr-2">💡</span>
                スキャンのコツ
              </h4>
              <div className="text-sm text-gray-800 space-y-2 text-left">
                <div className="flex items-start space-x-2">
                  <span className="text-xs mt-0.5">📱</span>
                  <span>スマートフォンは横向きにすると読み取りやすくなります</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-xs mt-0.5">💡</span>
                  <span>十分な明るさの場所で撮影してください</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-xs mt-0.5">📏</span>
                  <span>バーコードとカメラの距離を10〜30cm程度に調整してください</span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* モバイル用: カメラ起動前画面 */}
        <div className="md:hidden fixed inset-0 z-50 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="p-8 text-center max-w-sm mx-4">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-400/30 to-blue-500/30 backdrop-blur-sm rounded-3xl mb-8 shadow-xl">
              <span className="text-4xl">📷</span>
            </div>

            <h2 className="text-2xl font-light text-gray-800 mb-4">{title}</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {subtitle}
            </p>

            {/* サポートバーコード表示 */}
            <div className="mb-8 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-blue-200/30">
              <div className="flex flex-wrap justify-center gap-2">
                {supportedTypes.map((type) => (
                  <span
                    key={type}
                    className="inline-flex items-center px-3 py-1 bg-blue-100/50 rounded-lg text-xs font-medium text-blue-800"
                  >
                    <span className="mr-1">{getBarcodeIcon(type)}</span>
                    {type === "ISBN" ? "書籍" :
                     type === "JAN" ? "商品" :
                     type === "EAN" ? "商品" : type}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleActivateCamera}
                className="w-full flex items-center justify-center px-6 py-4 bg-blue-500/20 backdrop-blur-sm rounded-xl border border-blue-400/30 text-blue-800 font-medium"
              >
                <span className="mr-2 text-xl">📷</span>
                カメラを起動する
              </button>
              <button
                onClick={handleClose}
                className="w-full flex items-center justify-center px-6 py-3 bg-gray-200/50 backdrop-blur-sm rounded-xl border border-gray-300/30 text-gray-700"
              >
                キャンセル
              </button>
            </div>

            <div className="mt-6 text-xs text-gray-600">
              📱 縦向きでバーコードをスキャンします
            </div>
          </div>
        </div>
      </>
    );
  }

  /**
   * 初期化中のUI
   */
  if (!isInitialized) {
    return (
      <GlassCard className="p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-400/30 backdrop-blur-sm rounded-2xl mb-6 shadow-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-4">
            カメラを初期化中...
          </h3>
          <p className="text-gray-600">初回起動時はカメラの許可が必要です</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <>
      {/* デスクトップ用: カード型デザイン */}
      <GlassCard className="p-6 hidden md:block">
        <div className="text-center">
          {/* サポートされているバーコード種別の表示 */}
          {supportedTypes.length > 1 && (
            <div className="mb-4 p-3 bg-blue-50/30 backdrop-blur-sm rounded-xl border border-blue-200/30">
              <div className="text-sm text-blue-800">
                <span className="font-medium">対応バーコード:</span>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {supportedTypes.map((type) => (
                    <span
                      key={type}
                      className="inline-flex items-center px-2 py-1 bg-blue-100/50 rounded-lg text-xs"
                    >
                      <span className="mr-1">{getBarcodeIcon(type)}</span>
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* デスクトップ用カメラビューエリア */}
          <div className="relative mb-6">
            <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/20">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />

              {/* スキャンオーバーレイ */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* スキャンガイドライン */}
                <div className="relative">
                  <div className="w-64 h-40 border-2 border-white border-dashed rounded-lg bg-black/20 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-white text-sm mb-2">
                        {supportedTypes.length === 1
                          ? getBarcodeIcon(supportedTypes[0])
                          : "📄"}
                      </div>
                      <p className="text-white text-xs">バーコードをここに</p>
                    </div>
                  </div>

                  {/* スキャンライン（アニメーション） */}
                  {isScanning && (
                    <div className="absolute inset-0 overflow-hidden rounded-lg">
                      <div className="h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* 処理中オーバーレイ */}
              {isProcessing && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-lg font-medium">
                      {detectedBarcode?.type === "ISBN"
                        ? "書籍情報を取得中..."
                        : "商品情報を処理中..."}
                    </p>
                    {detectedBarcode && (
                      <p className="text-sm opacity-75 mt-2">
                        {detectedBarcode.type}:{" "}
                        {formatDetectedCode(detectedBarcode)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* スキャン状態インジケーター */}
            <div className="absolute top-4 right-4">
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                  isScanning
                    ? "bg-green-400/20 text-green-700 border border-green-400/30"
                    : "bg-gray-400/20 text-gray-700 border border-gray-400/30"
                }`}
              >
                {isScanning ? "🔴 スキャン中" : "⚫ 停止中"}
              </div>
            </div>
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="mb-6">
              <GlassError message={error} onRetry={clearError} />
            </div>
          )}

          {/* 検出されたバーコード表示 */}
          {detectedBarcode && !isProcessing && (
            <div className="mb-6 p-4 bg-green-50/50 backdrop-blur-sm rounded-xl border border-green-200/30">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-green-600">✅</span>
                <span className="font-medium text-green-800">
                  {detectedBarcode.type}検出:{" "}
                  {formatDetectedCode(detectedBarcode)}
                </span>
              </div>
            </div>
          )}

          {/* 操作ボタン */}
          <div className="flex gap-3 mb-6">
            {!isScanning ? (
              <GlassButton
                variant="primary"
                onClick={handleStartScanning}
                className="flex-1"
                disabled={isProcessing}
              >
                <span className="mr-2">📷</span>
                スキャン開始
              </GlassButton>
            ) : (
              <GlassButton
                variant="secondary"
                onClick={handleStopScanning}
                className="flex-1"
                disabled={isProcessing}
              >
                <span className="mr-2">⏹️</span>
                スキャン停止
              </GlassButton>
            )}

            <GlassButton
              variant="outline"
              onClick={handleClose}
              disabled={isProcessing}
            >
              キャンセル
            </GlassButton>
          </div>

          {/* 使用方法のヒント */}
          <div className="bg-blue-50/30 backdrop-blur-sm rounded-xl p-4 border border-blue-200/30">
            <h4 className="font-medium text-blue-900 mb-3 flex items-center">
              <span className="mr-2">💡</span>
              スキャンのコツ
            </h4>
            <div className="text-sm text-blue-800 space-y-2 text-left">
              <div className="flex items-start space-x-2">
                <span className="text-xs mt-0.5">📱</span>
                <span>スマートフォンは横向きにすると読み取りやすくなります</span>
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
      </GlassCard>

      {/* モバイル用: フルスクリーンデザイン */}
      <div className="md:hidden fixed inset-0 z-50 bg-black">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />

        {/* スキャンオーバーレイ */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* スキャンガイドライン */}
          <div className="relative">
            <div className="w-48 h-64 border-2 border-white border-dashed rounded-lg bg-black/20 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center">
                <div className="text-white text-sm mb-2">
                  {supportedTypes.length === 1
                    ? getBarcodeIcon(supportedTypes[0])
                    : "📄"}
                </div>
                <p className="text-white text-xs">バーコードをここに</p>
              </div>
            </div>

            {/* スキャンライン（アニメーション） */}
            {isScanning && (
              <div className="absolute inset-0 overflow-hidden rounded-lg">
                <div className="w-0.5 h-full bg-gradient-to-b from-transparent via-green-400 to-transparent animate-pulse mx-auto"></div>
              </div>
            )}
          </div>
        </div>

        {/* 処理中オーバーレイ */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center text-white px-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-lg font-medium">
                {detectedBarcode?.type === "ISBN"
                  ? "書籍情報を取得中..."
                  : "商品情報を処理中..."}
              </p>
              {detectedBarcode && (
                <p className="text-sm opacity-75 mt-2">
                  {detectedBarcode.type}:{" "}
                  {formatDetectedCode(detectedBarcode)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* 上部操作バー */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex items-center justify-between">
            {/* 戻るボタン */}
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="flex items-center space-x-2 px-4 py-2 bg-black/30 backdrop-blur-sm rounded-full text-white border border-white/20 disabled:opacity-50"
            >
              <span>←</span>
              <span className="text-sm">戻る</span>
            </button>

            {/* タイトル */}
            <div className="text-center">
              <h2 className="text-white font-medium text-lg">{title}</h2>
              <p className="text-white/80 text-xs mt-1">
                {supportedTypes.length === 1
                  ? getBarcodeIcon(supportedTypes[0])
                  : "📄"}{" "}
                {getSupportedTypesText()}
              </p>
            </div>

            {/* スキャン状態インジケーター */}
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                isScanning
                  ? "bg-green-400/20 text-green-200 border border-green-400/30"
                  : "bg-gray-400/20 text-gray-200 border border-gray-400/30"
              }`}
            >
              {isScanning ? "🔴" : "⚫"}
            </div>
          </div>
        </div>

        {/* 下部操作バー */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
          {/* 操作ヒント */}
          <div className="text-center">
            {isScanning ? (
              <p className="text-white/80 text-sm">
                📱 縦向きでバーコードをガイドライン内に合わせてください
              </p>
            ) : (
              <p className="text-white/80 text-sm">
                📷 カメラを初期化しています...
              </p>
            )}
          </div>

          {/* 検出されたバーコード表示 */}
          {detectedBarcode && !isProcessing && (
            <div className="mt-4 p-3 bg-green-500/20 backdrop-blur-sm rounded-xl border border-green-400/30">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-green-300">✅</span>
                <span className="font-medium text-green-200">
                  {detectedBarcode.type}検出:{" "}
                  {formatDetectedCode(detectedBarcode)}
                </span>
              </div>
            </div>
          )}

          {/* エラー表示 */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/20 backdrop-blur-sm rounded-xl border border-red-400/30">
              <div className="text-center">
                <p className="text-red-200 text-sm">{error}</p>
                <button
                  onClick={clearError}
                  className="mt-2 px-3 py-1 bg-red-500/30 rounded-lg text-red-200 text-xs"
                >
                  再試行
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

/**
 * カメラ権限確認用のコンポーネント（変更なし）
 */
export const CameraPermissionGuard: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const permission = useCameraPermission();

  if (permission === "unknown") {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">カメラ権限を確認中...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
