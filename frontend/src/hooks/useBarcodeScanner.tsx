// frontend/src/hooks/useBarcodeScanner.ts
import { useRef, useEffect, useState, useCallback } from "react";
import {
  BrowserMultiFormatReader,
  NotFoundException,
  Result,
} from "@zxing/library";
import { extractISBNFromScannedText } from "../utils/isbnValidator";

interface UseBarcodeScanner {
  isScanning: boolean;
  error: string | null;
  isInitialized: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  startScanning: () => Promise<void>;
  stopScanning: () => void;
  onISBNDetected: (callback: (isbn: string) => void) => void;
  clearError: () => void;
}

interface ScannerConfig {
  preferBackCamera?: boolean;
  continuousScan?: boolean;
  scanDelay?: number;
}

export const useBarcodeScanner = (
  config: ScannerConfig = {}
): UseBarcodeScanner => {
  const {
    preferBackCamera = true,
    continuousScan = false,
    scanDelay = 100,
  } = config;

  // ZXing リーダーのインスタンス
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 状態管理
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // コールバック関数
  const callbackRef = useRef<((isbn: string) => void) | null>(null);

  // スキャン制御用
  const lastScanTimeRef = useRef<number>(0);
  const currentControlsRef = useRef<any>(null);

  /**
   * ZXingリーダーの初期化
   */
  useEffect(() => {
    const initializeReader = async () => {
      try {
        console.log("📷 ZXing リーダー初期化開始");
        readerRef.current = new BrowserMultiFormatReader();

        // カメラ権限の事前チェック
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: preferBackCamera ? "environment" : "user" },
        });
        stream.getTracks().forEach((track) => track.stop()); // 即座に停止

        setIsInitialized(true);
        console.log("✅ ZXing リーダー初期化完了");
      } catch (err: any) {
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
  }, [preferBackCamera]);

  /**
   * エラーメッセージの統一化
   */
  const getErrorMessage = (err: any): string => {
    if (err.name === "NotAllowedError") {
      return "カメラへのアクセス許可が必要です。ブラウザの設定でカメラを許可してください。";
    } else if (err.name === "NotFoundError") {
      return "カメラが見つかりません。デバイスにカメラが接続されているか確認してください。";
    } else if (err.name === "NotSupportedError") {
      return "お使いのブラウザはカメラ機能をサポートしていません。";
    } else if (err.name === "NotReadableError") {
      return "カメラは他のアプリケーションで使用中です。";
    } else {
      return err.message || "カメラアクセスに失敗しました。";
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
   * バーコードスキャン結果の処理
   */
  const handleScanResult = useCallback(
    (result: Result | null, error?: any) => {
      const now = Date.now();

      if (result) {
        // スキャン間隔制御
        if (now - lastScanTimeRef.current < scanDelay) {
          return;
        }
        lastScanTimeRef.current = now;

        const scannedText = result.getText();
        console.log("🔍 バーコード検出:", scannedText);

        // ISBNの抽出と検証
        const isbn = extractISBNFromScannedText(scannedText);
        if (isbn) {
          console.log("✅ 有効なISBN抽出:", isbn);

          if (callbackRef.current) {
            callbackRef.current(isbn);
          }

          // 連続スキャンモードでない場合は停止
          if (!continuousScan) {
            stopScanning();
          }
        } else {
          console.log("❌ ISBNではないバーコード:", scannedText);
          // 継続してスキャン
        }
      }

      // ZXingのNotFoundException以外のエラーはログ出力
      if (error && !(error instanceof NotFoundException)) {
        console.error("スキャンエラー:", error);
      }
    },
    [scanDelay, continuousScan]
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
      console.log("🚀 バーコードスキャン開始");
      setError(null);
      setIsScanning(true);

      // カメラデバイスを選択
      const selectedDeviceId = await selectCamera();

      // スキャン開始
      currentControlsRef.current =
        await readerRef.current.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current,
          handleScanResult
        );

      console.log("✅ スキャン開始成功");
    } catch (err: any) {
      console.error("❌ スキャン開始エラー:", err);
      setError(getErrorMessage(err));
      setIsScanning(false);
    }
  };

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
   * ISBNが検出された時のコールバック登録
   */
  const onISBNDetected = useCallback(
    (callback: (isbn: string) => void): void => {
      callbackRef.current = callback;
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
    onISBNDetected,
    clearError,
  };
};

/**
 * カメラ権限チェック用のユーティリティフック
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
            const stream = await navigator.mediaDevices.getUserMedia({
              video: true,
            });
            stream.getTracks().forEach((track) => track.stop());
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
