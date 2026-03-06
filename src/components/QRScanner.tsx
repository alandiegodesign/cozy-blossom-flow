import { useEffect, useId, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onError?: (error: string) => void;
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [started, setStarted] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const hasScanned = useRef(false);
  const onScanRef = useRef(onScan);
  const scannerId = useId().replace(/:/g, '-');

  onScanRef.current = onScan;

  useEffect(() => {
    let cancelled = false;

    const startScanner = async () => {
      try {
        const container = document.getElementById(scannerId);
        if (!container) {
          console.error('QR Scanner: container element not found');
          return;
        }

        const html5QrCode = new Html5Qrcode(scannerId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
        scannerRef.current = html5QrCode;

        const cameras = await Html5Qrcode.getCameras();
        const backCamera = cameras.find((camera) => /back|rear|environment/i.test(camera.label));
        const cameraConfig = backCamera
          ? { deviceId: { exact: backCamera.id } }
          : { facingMode: { exact: 'environment' as const } };

        await html5QrCode.start(
          cameraConfig,
          {
            fps: 12,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
              const edge = Math.max(180, Math.floor(minEdge * 0.72));
              return { width: edge, height: edge };
            },
            aspectRatio: 1,
          },
          (decodedText) => {
            if (hasScanned.current) return;
            hasScanned.current = true;
            onScanRef.current(decodedText);

            html5QrCode
              .stop()
              .then(() => {
                if (!cancelled) setStarted(false);
              })
              .catch(() => {
                // ignore stop errors after successful scan
              });
          },
          () => {
            // ignore per-frame decode failures
          }
        );

        if (!cancelled) setStarted(true);
      } catch (err: any) {
        console.error('QR Scanner error:', err);
        const msg = err?.toString?.() || 'Erro ao iniciar câmera';
        if (msg.includes('NotAllowedError') || msg.includes('Permission')) {
          setPermissionDenied(true);
        }
        onError?.(msg);
      }
    };

    const timer = setTimeout(startScanner, 200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [onError, scannerId]);

  return (
    <div className="space-y-3">
      <div
        id={scannerId}
        className="w-full rounded-xl overflow-hidden bg-muted min-h-[280px]"
      />
      {permissionDenied && (
        <p className="text-sm text-destructive text-center">
          Permissão da câmera negada. Habilite a câmera nas configurações do navegador.
        </p>
      )}
      {!started && !permissionDenied && (
        <p className="text-sm text-muted-foreground text-center">Iniciando câmera...</p>
      )}
    </div>
  );
}
