import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getEvent } from '@/services/eventService';
import { getCurrentUser } from '@/services/userService';
import { createOrder, CartItem } from '@/services/orderService';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, Music, Star, Crown, UtensilsCrossed } from 'lucide-react';
import { LocationType } from '@/types/models';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const ICONS: Record<LocationType, React.ElementType> = {
  pista: Music, vip: Star, camarote: Crown, bistro: UtensilsCrossed,
};

interface CheckoutItem extends CartItem {
  name: string;
  type: LocationType;
  color: string;
}

export default function CheckoutPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const event = getEvent(eventId!);
  const user = getCurrentUser();
  const state = location.state as { items: CheckoutItem[]; total: number } | null;

  if (!event || !state) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        <p>Dados inválidos. <button onClick={() => navigate('/')} className="text-primary underline">Voltar</button></p>
      </div>
    );
  }

  const handleConfirm = () => {
    const cartItems: CartItem[] = state.items.map(i => ({
      ticket_location_id: i.ticket_location_id,
      quantity: i.quantity,
      unit_price: i.unit_price,
    }));
    const order = createOrder(eventId!, user.id, cartItems);
    if (order) {
      toast.success('Pedido confirmado com sucesso!');
      navigate('/my-orders');
    } else {
      toast.error('Erro ao criar pedido. Ingressos indisponíveis.');
    }
  };

  return (
    <div className="min-h-screen pb-8">
      <div className="gradient-primary px-6 pt-8 pb-12 rounded-b-[2rem]">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/80 mb-4">
            <ArrowLeft className="w-5 h-5" /> Voltar
          </button>
          <h1 className="font-display font-bold text-2xl text-white">Checkout</h1>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto px-6 -mt-6 space-y-5">
        {/* Event info */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <h2 className="font-display font-semibold text-lg mb-2">{event.title}</h2>
          <p className="text-sm text-muted-foreground">
            {new Date(event.date).toLocaleDateString('pt-BR')} às {event.time}
          </p>
        </div>

        {/* User info */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <h3 className="font-display font-semibold mb-2">Dados do Comprador</h3>
          <p className="text-sm text-foreground">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="text-sm text-muted-foreground">{user.phone}</p>
        </div>

        {/* Items */}
        <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
          <h3 className="font-display font-semibold">Itens do Pedido</h3>
          {state.items.map((item, idx) => {
            const Icon = ICONS[item.type];
            return (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5" style={{ color: item.color }} />
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.quantity}x R$ {item.unit_price.toFixed(2)}</p>
                  </div>
                </div>
                <p className="font-bold" style={{ color: item.color }}>
                  R$ {(item.quantity * item.unit_price).toFixed(2)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div className="bg-card rounded-2xl border-2 border-primary p-6 text-center glow-primary">
          <p className="text-sm text-muted-foreground mb-1">Total</p>
          <p className="font-display font-bold text-4xl text-gradient">R$ {state.total.toFixed(2)}</p>
        </div>

        <Button
          onClick={handleConfirm}
          className="w-full h-14 text-lg font-display font-bold gradient-primary border-0 rounded-xl glow-primary flex items-center gap-2"
        >
          <CheckCircle2 className="w-6 h-6" /> Confirmar Pedido
        </Button>
      </motion.div>
    </div>
  );
}
