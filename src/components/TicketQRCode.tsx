import { QRCodeSVG } from 'qrcode.react';

interface TicketQRCodeProps {
  orderId: string;
  size?: number;
}

export default function TicketQRCode({ orderId, size = 160 }: TicketQRCodeProps) {
  // The QR code contains the order ID which the producer can scan to validate
  const qrValue = `ticketvibe://validate/${orderId}`;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="bg-white p-3 rounded-xl">
        <QRCodeSVG
          value={qrValue}
          size={size}
          bgColor="#ffffff"
          fgColor="#000000"
          level="H"
        />
      </div>
      <p className="text-[10px] text-muted-foreground font-mono break-all text-center max-w-[180px]">
        {orderId.slice(0, 8)}...
      </p>
    </div>
  );
}
