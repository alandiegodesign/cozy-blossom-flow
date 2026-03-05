import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onError?: (error: string) => void;
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    const scannerId = 'qr-scanner-container';

    const startScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode(scannerId);
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            onScan(decodedText);
            // Stop after successful scan
            html5QrCode.stop().catch(() => {});
            setStarted(false);
          },
          () => {} // ignore scan failures
        );
        setStarted(true);
      } catch (err: any) {
        console.error('QR Scanner error:', err);
        if (err?.toString().includes('NotAllowedError') || err?.toString().includes('Permission')) {
          setPermissionDenied(true);
        }
        onError?.(err?.toString() || 'Erro ao iniciar câmera');
      }
    };

    startScanner();

    return () => {
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
        ref={containerRef}
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
