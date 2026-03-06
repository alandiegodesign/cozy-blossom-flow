import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getOrdersByUser, getOrderItems } from '@/services/orderService';
import { getEvent } from '@/services/eventService';
import { getLocation } from '@/services/ticketLocationService';
import { ArrowLeft, ShoppingBag, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import TicketQRCode from '@/components/TicketQRCode';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import TransferTicketDialog from '@/components/TransferTicketDialog';

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
            <ShoppingBag className="w-6 h-6" /> Meus Ingressos
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
  const [showQR, setShowQR] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
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
          <p className="text-xs text-muted-foreground">
            {event?.date
              ? new Date(event.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) + ' às ' + (event.time || '')
              : new Date(order.created_at).toLocaleDateString('pt-BR')}
          </p>
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

      {order.status === 'confirmed' && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={() => setShowTransfer(true)}>
            <Send className="w-4 h-4" /> Enviar Ingresso
          </Button>
        </div>
      )}

      {order.status === 'confirmed' && (
        <Collapsible open={showQR} onOpenChange={setShowQR}>
          <CollapsibleTrigger className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            <ChevronDown className={`w-4 h-4 transition-transform ${showQR ? 'rotate-180' : ''}`} />
            {showQR ? 'Ocultar QR Code' : 'Mostrar QR Code do Ingresso'}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="flex flex-col items-center py-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-3">Apresente este QR Code na entrada do evento</p>
              <TicketQRCode orderId={order.id} size={180} />
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      <TransferTicketDialog open={showTransfer} onOpenChange={setShowTransfer} orderId={order.id} />
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
