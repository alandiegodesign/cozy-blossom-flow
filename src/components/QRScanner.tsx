import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

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
  onScanRef.current = onScan;

  useEffect(() => {
    const scannerId = 'qr-scanner-container';
    let cancelled = false;

    const startScanner = async () => {
      try {
        // Ensure the container element exists
        const container = document.getElementById(scannerId);
        if (!container) {
          console.error('QR Scanner: container element not found');
          return;
        }

        const html5QrCode = new Html5Qrcode(scannerId);
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (hasScanned.current) return;
            hasScanned.current = true;
            console.log('QR Scanner: scanned:', decodedText);
            // Stop scanner then notify parent
            html5QrCode.stop().then(() => {
              setStarted(false);
              onScanRef.current(decodedText);
            }).catch(() => {
              onScanRef.current(decodedText);
            });
          },
          () => {} // ignore scan failures
        );
        if (!cancelled) setStarted(true);
      } catch (err: any) {
        console.error('QR Scanner error:', err);
        if (err?.toString().includes('NotAllowedError') || err?.toString().includes('Permission')) {
          setPermissionDenied(true);
        }
        onError?.(err?.toString() || 'Erro ao iniciar câmera');
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(startScanner, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-3">
      <div
        id="qr-scanner-container"
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
