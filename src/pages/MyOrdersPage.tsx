import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getOrdersByUser, getOrderItems } from '@/services/orderService';
import { getEvent } from '@/services/eventService';
import { getLocation } from '@/services/ticketLocationService';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pendente', className: 'bg-yellow-500/20 text-yellow-400' },
  confirmed: { label: 'Confirmado', className: 'bg-green-500/20 text-green-400' },
  cancelled: { label: 'Cancelado', className: 'bg-red-500/20 text-red-400' },
};

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: () => getOrdersByUser(user!.id),
    enabled: !!user,
  });

  return (
    <div className="min-h-screen pb-8">
      <div className="gradient-primary px-6 pt-8 pb-12 rounded-b-[2rem]">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/80 mb-4">
            <ArrowLeft className="w-5 h-5" /> Voltar
          </button>
          <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6" /> Meus Pedidos
          </h1>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto px-6 -mt-6 space-y-4">
        {isLoading && <div className="text-center py-20 text-muted-foreground">Carregando...</div>}

        {!isLoading && orders.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-display text-lg">Nenhum pedido ainda</p>
            <p className="text-sm mt-1">Explore os eventos e faça sua primeira compra!</p>
          </div>
        )}

        {orders.map(order => (
          <OrderCard key={order.id} order={order} />
        ))}
      </motion.div>
    </div>
  );
}

function OrderCard({ order }: { order: { id: string; event_id: string; status: string; total_amount: number; created_at: string } }) {
  const status = STATUS_STYLES[order.status] || STATUS_STYLES.pending;

  const { data: event } = useQuery({
    queryKey: ['event', order.event_id],
    queryFn: () => getEvent(order.event_id),
  });

  const { data: items = [] } = useQuery({
    queryKey: ['orderItems', order.id],
    queryFn: () => getOrderItems(order.id),
  });

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
      className="bg-card rounded-2xl border border-border p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-display font-semibold">{event?.title || 'Evento'}</h3>
          <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${status.className}`}>{status.label}</span>
      </div>

      <div className="space-y-1">
        {items.map(item => (
          <OrderItemRow key={item.id} item={item} />
        ))}
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-border">
        <span className="text-sm text-muted-foreground">Total</span>
        <span className="font-display font-bold text-lg text-gradient">R$ {Number(order.total_amount).toFixed(2)}</span>
      </div>
    </motion.div>
  );
}

function OrderItemRow({ item }: { item: { id: string; ticket_location_id: string; quantity: number; subtotal: number } }) {
  const { data: loc } = useQuery({
    queryKey: ['location', item.ticket_location_id],
    queryFn: () => getLocation(item.ticket_location_id),
  });

  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{loc?.name || 'Local'} x{item.quantity}</span>
      <span>R$ {Number(item.subtotal).toFixed(2)}</span>
    </div>
  );
}
