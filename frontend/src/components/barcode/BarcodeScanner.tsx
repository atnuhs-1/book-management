// frontend/src/components/barcode/BarcodeScanner.tsx
import React, { useEffect, useState } from "react";
import {
  useBarcodeScanner,
  useCameraPermission,
} from "../../hooks/useBarcodeScanner";
import { formatISBN } from "../../utils/isbnValidator";
import { GlassCard, GlassButton, GlassError } from "../ui/GlassUI";

interface BarcodeScannerProps {
  onISBNDetected: (isbn: string) => void;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onISBNDetected,
  onClose,
  title = "バーコードスキャン",
  subtitle = "書籍のISBNバーコードをカメラに向けてください",
}) => {
  const {
    isScanning,
    error,
    isInitialized,
    videoRef,
    startScanning,
    stopScanning,
    onISBNDetected: registerCallback,
    clearError,
  } = useBarcodeScanner({
    preferBackCamera: true,
    continuousScan: false,
    scanDelay: 1000,
  });

  const cameraPermission = useCameraPermission();
  const [detectedISBN, setDetectedISBN] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * ISBN検出時の処理
   */
  useEffect(() => {
    registerCallback(async (isbn: string) => {
      console.log("📚 ISBN検出コールバック:", isbn);

      setDetectedISBN(isbn);
      setIsProcessing(true);

      try {
        // 親コンポーネントに通知
        await onISBNDetected(isbn);
      } catch (error) {
        console.error("ISBN処理エラー:", error);
        // エラーが発生した場合はスキャンを再開可能にする
        setIsProcessing(false);
        setDetectedISBN(null);
      }
    });
  }, [registerCallback, onISBNDetected]);

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
    setDetectedISBN(null);
    setIsProcessing(false);
    await startScanning();
  };

  /**
   * スキャン停止処理
   */
  const handleStopScanning = () => {
    stopScanning();
    setDetectedISBN(null);
    setIsProcessing(false);
  };

  /**
   * 閉じる処理
   */
  const handleClose = () => {
    handleStopScanning();
    onClose();
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
    <GlassCard className="p-6">
      <div className="text-center">
        <h3 className="text-2xl font-light text-gray-800 mb-2 flex items-center justify-center">
          <span className="mr-3">📷</span>
          {title}
        </h3>
        <p className="text-gray-600 mb-6">{subtitle}</p>

        {/* カメラビューエリア */}
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
                    <div className="text-white text-sm mb-2">📚</div>
                    <p className="text-white text-xs">ISBNバーコードをここに</p>
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
                  <p className="text-lg font-medium">書籍情報を取得中...</p>
                  {detectedISBN && (
                    <p className="text-sm opacity-75 mt-2">
                      ISBN: {formatISBN(detectedISBN)}
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

        {/* 検出されたISBN表示 */}
        {detectedISBN && !isProcessing && (
          <div className="mb-6 p-4 bg-green-50/50 backdrop-blur-sm rounded-xl border border-green-200/30">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-green-600">✅</span>
              <span className="font-medium text-green-800">
                ISBN検出: {formatISBN(detectedISBN)}
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
  );
};

/**
 * カメラ権限確認用のコンポーネント
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
