import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ScanLine, Search, CheckCircle, XCircle, Camera, Keyboard } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import QRScanner from '@/components/QRScanner';

interface TicketResult {
  valid: boolean;
  event?: string;
  location?: string;
  buyer?: string;
  quantity?: number;
  orderId?: string;
}

export default function ValidateTicketsPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TicketResult | null>(null);
  const [mode, setMode] = useState<'scanner' | 'manual'>('scanner');

  const validateOrder = async (orderId: string) => {
    setLoading(true);
    setResult(null);

    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select('*, events:event_id(title)')
        .eq('id', orderId)
        .maybeSingle();

      if (error || !order) {
        setResult({ valid: false });
      } else {
        const { data: items } = await supabase
          .from('order_items')
          .select('*, ticket_locations:ticket_location_id(name)')
          .eq('order_id', order.id);

        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('user_id', order.user_id)
          .maybeSingle();

        setResult({
          valid: order.status === 'confirmed',
          event: (order as any).events?.title || '—',
          location: items?.[0] ? (items[0] as any).ticket_locations?.name : '—',
          buyer: profile?.name || '—',
          quantity: items?.reduce((sum, i) => sum + i.quantity, 0) || 0,
          orderId: order.id,
        });
      }
    } catch {
      setResult({ valid: false });
    } finally {
      setLoading(false);
    }
  };

  const handleManualValidate = () => {
    if (!code.trim()) return;
    validateOrder(code.trim());
  };

  const handleQRScan = (decodedText: string) => {
    // Extract order ID from QR code format: ticketvibe://validate/{orderId}
    const match = decodedText.match(/ticketvibe:\/\/validate\/(.+)/);
    const orderId = match ? match[1] : decodedText;
    setCode(orderId);
    validateOrder(orderId);
  };

  const resetScan = () => {
    setResult(null);
    setCode('');
  };

  return (
    <div className="min-h-screen pb-8">
      <div className="gradient-primary px-6 pt-8 pb-12 rounded-b-[2rem]">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/80 mb-4">
            <ArrowLeft className="w-5 h-5" /> Voltar
          </button>
          <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
            <ScanLine className="w-6 h-6" /> Validar Ingressos
          </h1>
          <p className="text-white/70 text-sm mt-1">Escaneie o QR Code ou insira o código manualmente</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto px-6 -mt-6 space-y-4">
        {/* Mode toggle */}
        <div className="flex gap-2">
          <Button
            variant={mode === 'scanner' ? 'default' : 'outline'}
            className={mode === 'scanner' ? 'gradient-primary text-white flex-1' : 'flex-1'}
            onClick={() => { setMode('scanner'); resetScan(); }}
          >
            <Camera className="w-4 h-4 mr-2" /> Câmera
          </Button>
          <Button
            variant={mode === 'manual' ? 'default' : 'outline'}
            className={mode === 'manual' ? 'gradient-primary text-white flex-1' : 'flex-1'}
            onClick={() => { setMode('manual'); resetScan(); }}
          >
            <Keyboard className="w-4 h-4 mr-2" /> Manual
          </Button>
        </div>

        {/* Scanner or Manual input */}
        <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
          {mode === 'scanner' && !result && (
            <QRScanner
              onScan={handleQRScan}
              onError={() => setMode('manual')}
            />
          )}

          {mode === 'manual' && (
            <div className="flex gap-2">
              <Input
                placeholder="Código do pedido (UUID)"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleManualValidate} disabled={loading} className="gradient-primary text-white">
                <Search className="w-4 h-4 mr-1" /> Validar
              </Button>
            </div>
          )}

          {loading && (
            <p className="text-center text-muted-foreground text-sm">Validando...</p>
          )}

          {result && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
              {result.valid ? (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                  <CheckCircle className="w-8 h-8 text-green-400 shrink-0" />
                  <div>
                    <p className="font-display font-bold text-green-400">Ingresso Válido ✓</p>
                    <p className="text-sm text-muted-foreground mt-1">Evento: {result.event}</p>
                    <p className="text-sm text-muted-foreground">Local: {result.location}</p>
                    <p className="text-sm text-muted-foreground">Comprador: {result.buyer}</p>
                    <p className="text-sm text-muted-foreground">Quantidade: {result.quantity}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                  <XCircle className="w-8 h-8 text-red-400 shrink-0" />
                  <div>
                    <p className="font-display font-bold text-red-400">Ingresso Inválido ✗</p>
                    <p className="text-sm text-muted-foreground">Código não encontrado ou cancelado</p>
                  </div>
                </div>
              )}

              <Button variant="outline" className="w-full" onClick={resetScan}>
                Escanear outro ingresso
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
