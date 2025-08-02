// frontend/src/hooks/useBarcodeScanner.ts - 型エラー修正版
import { useRef, useEffect, useState, useCallback } from "react";
import {
  BrowserMultiFormatReader,
  NotFoundException,
  Result,
} from "@zxing/library";
import {
  extractBarcodeFromScannedText,
  type BarcodeValidationResult,
  type BarcodeType,
} from "../utils/barcodeValidator";

interface UseBarcodeScanner {
  isScanning: boolean;
  error: string | null;
  isInitialized: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  startScanning: () => Promise<void>;
  stopScanning: () => void;

  // ✅ 既存のISBN専用コールバック（後方互換性）
  onISBNDetected: (callback: (isbn: string) => void) => void;

  // ✅ 新規追加: 汎用バーコードコールバック
  onBarcodeDetected: (
    callback: (result: BarcodeValidationResult) => void
  ) => void;

  clearError: () => void;
}

interface ScannerConfig {
  preferBackCamera?: boolean;
  continuousScan?: boolean;
  scanDelay?: number;

  // ✅ 新規追加: サポートするバーコード種別
  supportedTypes?: BarcodeType[];
}

interface CameraError {
  name: string;
  message: string;
}

interface ScanControls {
  stop(): void;
}

export const useBarcodeScanner = (
  config: ScannerConfig = {}
): UseBarcodeScanner => {
  const {
    preferBackCamera = true,
    continuousScan = false,
    scanDelay = 1000,
    supportedTypes = ["ISBN"], // デフォルトはISBNのみ（既存動作を維持）
  } = config;

  // ZXing リーダーのインスタンス
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 状態管理
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // コールバック関数
  const isbnCallbackRef = useRef<((isbn: string) => void) | null>(null);
  const barcodeCallbackRef = useRef<
    ((result: BarcodeValidationResult) => void) | null
  >(null);

  // スキャン制御用
  const lastScanTimeRef = useRef<number>(0);
  const currentControlsRef = useRef<ScanControls | null>(null);

  /**
   * スキャン停止
   */
  const stopScanning = useCallback((): void => {
    if (!isScanning) return;

    try {
      console.log("⏹️ バーコードスキャン停止");

      if (currentControlsRef.current) {
        currentControlsRef.current.stop();
        currentControlsRef.current = null;
      }

      if (readerRef.current) {
        readerRef.current.reset();
      }

      setIsScanning(false);
      console.log("✅ スキャン停止完了");
    } catch (err) {
      console.error("スキャン停止エラー:", err);
      setIsScanning(false);
    }
  }, [isScanning]);

  /**
   * ZXingリーダーの初期化
   */
  useEffect(() => {
    const initializeReader = async () => {
      try {
        console.log(
          "📷 ZXing リーダー初期化開始 - サポート種別:",
          supportedTypes
        );
        readerRef.current = new BrowserMultiFormatReader();

        // カメラ権限の事前チェック
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: preferBackCamera ? "environment" : "user" },
        });
        stream.getTracks().forEach((track) => track.stop()); // 即座に停止

        setIsInitialized(true);
        console.log("✅ ZXing リーダー初期化完了");
      } catch (err: unknown) {
        console.error("❌ ZXing リーダー初期化失敗:", err);
        setError(getErrorMessage(err));
        setIsInitialized(false);
      }
    };

    initializeReader();

    // クリーンアップ
    return () => {
      console.log("🧹 useBarcodeScanner クリーンアップ");
      stopScanning();
      if (readerRef.current) {
        readerRef.current.reset();
      }
    };
  }, [preferBackCamera, supportedTypes, stopScanning]);

  /**
   * エラーメッセージの統一化
   */
  const getErrorMessage = (err: unknown): string => {
    const error = err as CameraError;
    if (error.name === "NotAllowedError") {
      return "カメラへのアクセス許可が必要です。ブラウザの設定でカメラを許可してください。";
    } else if (error.name === "NotFoundError") {
      return "カメラが見つかりません。デバイスにカメラが接続されているか確認してください。";
    } else if (error.name === "NotSupportedError") {
      return "お使いのブラウザはカメラ機能をサポートしていません。";
    } else if (error.name === "NotReadableError") {
      return "カメラは他のアプリケーションで使用中です。";
    } else {
      return error.message || "カメラアクセスに失敗しました。";
    }
  };

  /**
   * 利用可能なカメラデバイスを取得
   */
  const getVideoDevices = async (): Promise<MediaDeviceInfo[]> => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter((device) => device.kind === "videoinput");
    } catch (err) {
      console.error("デバイス一覧取得エラー:", err);
      return [];
    }
  };

  /**
   * 最適なカメラデバイスを選択
   */
  const selectCamera = async (): Promise<string | undefined> => {
    const videoDevices = await getVideoDevices();

    if (videoDevices.length === 0) {
      throw new Error("利用可能なカメラが見つかりません");
    }

    console.log(`📷 利用可能なカメラ: ${videoDevices.length}台`);
    videoDevices.forEach((device, index) => {
      console.log(`  ${index + 1}. ${device.label || `カメラ ${index + 1}`}`);
    });

    if (preferBackCamera) {
      // 背面カメラを優先的に選択
      const backCamera = videoDevices.find(
        (device) =>
          device.label.toLowerCase().includes("back") ||
          device.label.toLowerCase().includes("rear") ||
          device.label.toLowerCase().includes("environment")
      );
      if (backCamera) {
        console.log("✅ 背面カメラを選択:", backCamera.label);
        return backCamera.deviceId;
      }
    }

    // フロントカメラまたはデフォルトカメラ
    const frontCamera = videoDevices[0];
    console.log("✅ フロントカメラを選択:", frontCamera.label);
    return frontCamera.deviceId;
  };

  /**
   * バーコードスキャン結果の処理（汎用化）
   */
  const handleScanResult = useCallback(
    (result: Result | null, error?: unknown) => {
      const now = Date.now();

      if (result) {
        // スキャン間隔制御
        if (now - lastScanTimeRef.current < scanDelay) {
          return;
        }
        lastScanTimeRef.current = now;

        const scannedText = result.getText();
        console.log("🔍 バーコード検出:", scannedText);

        // ✅ 汎用バーコード検証を使用
        const barcodeResult = extractBarcodeFromScannedText(scannedText);

        if (barcodeResult && supportedTypes.includes(barcodeResult.type)) {
          console.log(
            `✅ 有効な${barcodeResult.type}抽出:`,
            barcodeResult.formattedCode
          );

          // ✅ 既存のISBNコールバック（後方互換性）
          if (barcodeResult.type === "ISBN" && isbnCallbackRef.current) {
            isbnCallbackRef.current(barcodeResult.cleanCode);
          }

          // ✅ 新規: 汎用バーコードコールバック
          if (barcodeCallbackRef.current) {
            barcodeCallbackRef.current(barcodeResult);
          }

          // 連続スキャンモードでない場合は停止
          if (!continuousScan) {
            stopScanning();
          }
        } else {
          console.log("❌ サポートされていないバーコード:", scannedText);
          console.log("  検出種別:", barcodeResult?.type || "UNKNOWN");
          console.log("  サポート種別:", supportedTypes);
          // 継続してスキャン
        }
      }

      // ZXingのNotFoundException以外のエラーはログ出力
      if (error && !(error instanceof NotFoundException)) {
        console.error("スキャンエラー:", error);
      }
    },
    [scanDelay, continuousScan, supportedTypes, stopScanning]
  );

  /**
   * スキャン開始
   */
  const startScanning = async (): Promise<void> => {
    if (!readerRef.current || !videoRef.current) {
      setError("スキャナーが初期化されていません");
      return;
    }

    if (isScanning) {
      console.log("⚠️ 既にスキャン中です");
      return;
    }

    try {
      console.log("🚀 バーコードスキャン開始 - サポート種別:", supportedTypes);
      setError(null);
      setIsScanning(true);

      // カメラデバイスを選択
      const selectedDeviceId = await selectCamera();

      // selectedDeviceIdがundefinedの場合のチェック
      if (!selectedDeviceId) {
        throw new Error("利用可能なカメラが見つかりませんでした");
      }

      // スキャン開始
      currentControlsRef.current =
        (await readerRef.current.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current,
          handleScanResult
        )) as unknown as ScanControls;

      console.log("✅ スキャン開始成功");
    } catch (err: unknown) {
      console.error("❌ スキャン開始エラー:", err);
      setError(getErrorMessage(err));
      setIsScanning(false);
    }
  };

  /**
   * ISBNが検出された時のコールバック登録（既存）
   */
  const onISBNDetected = useCallback(
    (callback: (isbn: string) => void): void => {
      isbnCallbackRef.current = callback;
    },
    []
  );

  /**
   * ✅ 新規追加: 汎用バーコードが検出された時のコールバック登録
   */
  const onBarcodeDetected = useCallback(
    (callback: (result: BarcodeValidationResult) => void): void => {
      barcodeCallbackRef.current = callback;
    },
    []
  );

  /**
   * エラークリア
   */
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  return {
    isScanning,
    error,
    isInitialized,
    videoRef,
    startScanning,
    stopScanning,
    onISBNDetected, // ✅ 既存のISBNコールバック（後方互換性）
    onBarcodeDetected, // ✅ 新規: 汎用バーコードコールバック
    clearError,
  };
};

/**
 * カメラ権限チェック用のユーティリティフック（変更なし）
 */
export const useCameraPermission = () => {
  const [permission, setPermission] = useState<
    "granted" | "denied" | "prompt" | "unknown"
  >("unknown");

  useEffect(() => {
    const checkPermission = async () => {
      try {
        if ("permissions" in navigator) {
          const result = await navigator.permissions.query({
            name: "camera" as PermissionName,
          });
          setPermission(result.state);

          result.addEventListener("change", () => {
            setPermission(result.state);
          });
        } else {
          // Permissions API が利用できない場合は直接確認
          try {
            const stream = await (
              navigator as unknown as { mediaDevices: MediaDevices }
            ).mediaDevices.getUserMedia({
              video: true,
            });
            stream
              .getTracks()
              .forEach((track: MediaStreamTrack) => track.stop());
            setPermission("granted");
          } catch {
            setPermission("denied");
          }
        }
      } catch (err) {
        console.error("権限チェックエラー:", err);
        setPermission("unknown");
      }
    };

    checkPermission();
  }, []);

  return permission;
};
