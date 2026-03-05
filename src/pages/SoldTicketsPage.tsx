import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getProducerSales } from '@/services/orderService';
import { ArrowLeft, TicketCheck, Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SoldTicketsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['producer-sales', user?.id],
    queryFn: () => getProducerSales(user!.id),
    enabled: !!user,
  });

  const tickets = useMemo(() => {
    return sales.map(s => ({
      id: s.item_id,
      event: s.event_title,
      location: s.location_name,
      type: s.location_type,
      quantity: s.item_quantity,
      unitPrice: Number(s.item_unit_price),
      subtotal: Number(s.item_subtotal),
      date: s.order_created_at,
      status: s.order_status,
    }));
  }, [sales]);

  return (
    <div className="min-h-screen pb-8">
      <div className="gradient-primary px-6 pt-8 pb-12 rounded-b-[2rem]">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/80 mb-4">
            <ArrowLeft className="w-5 h-5" /> Voltar
          </button>
          <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
            <TicketCheck className="w-6 h-6" /> Ingressos Vendidos
          </h1>
          <p className="text-white/70 text-sm mt-1">{tickets.length} ingresso{tickets.length !== 1 ? 's' : ''} vendido{tickets.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto px-6 -mt-6 space-y-3">
        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">Carregando...</div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <TicketCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-display">Nenhum ingresso vendido ainda</p>
          </div>
        ) : (
          tickets.map(t => (
            <div key={t.id} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-sm">{t.event}</p>
                <span className="text-xs font-bold text-primary capitalize">{t.type}</span>
              </div>
              <p className="text-xs text-muted-foreground">{t.location} · {t.quantity}x R$ {t.unitPrice.toFixed(2)}</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(t.date).toLocaleDateString('pt-BR')}
                </p>
                <p className="font-display font-bold text-sm">R$ {t.subtotal.toFixed(2)}</p>
              </div>
            </div>
          ))
        )}
      </motion.div>
    </div>
  );
}
