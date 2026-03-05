import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ScanLine, Search, CheckCircle, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface TicketResult {
  valid: boolean;
  event?: string;
  location?: string;
  buyer?: string;
  quantity?: number;
}

export default function ValidateTicketsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TicketResult | null>(null);

  const handleValidate = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      // Look up order by ID prefix
      const { data: order, error } = await supabase
        .from('orders')
        .select('*, events:event_id(title)')
        .eq('id', code.trim())
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
        });
      }
    } catch {
      setResult({ valid: false });
    } finally {
      setLoading(false);
    }
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
          <p className="text-white/70 text-sm mt-1">Insira o código do pedido para validar</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto px-6 -mt-6 space-y-4">
        <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Código do pedido (UUID)"
              value={code}
              onChange={e => setCode(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleValidate} disabled={loading} className="gradient-primary text-white">
              <Search className="w-4 h-4 mr-1" /> Validar
            </Button>
          </div>

          {result && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
              {result.valid ? (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                  <CheckCircle className="w-8 h-8 text-green-400" />
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
                  <XCircle className="w-8 h-8 text-red-400" />
                  <div>
                    <p className="font-display font-bold text-red-400">Ingresso Inválido ✗</p>
                    <p className="text-sm text-muted-foreground">Código não encontrado ou cancelado</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
