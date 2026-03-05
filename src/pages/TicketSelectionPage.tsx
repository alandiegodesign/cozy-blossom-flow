import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEvent } from '@/services/eventService';
import { getLocationsByEvent } from '@/services/ticketLocationService';
import { QuantitySelector } from '@/components/QuantitySelector';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Music, Star, Crown, UtensilsCrossed } from 'lucide-react';
import { LocationType } from '@/types/models';
import { motion } from 'framer-motion';

const ICONS: Record<LocationType, React.ElementType> = {
  pista: Music, vip: Star, camarote: Crown, bistro: UtensilsCrossed,
};

export default function TicketSelectionPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const event = getEvent(eventId!);
  const locations = getLocationsByEvent(eventId!);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const setQty = (id: string, qty: number) => setQuantities(prev => ({ ...prev, [id]: qty }));

  const total = useMemo(() => {
    return locations.reduce((sum, loc) => sum + (quantities[loc.id] || 0) * loc.price, 0);
  }, [locations, quantities]);

  const hasItems = Object.values(quantities).some(q => q > 0);

  if (!event) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Evento não encontrado</div>;

  const handleNext = () => {
    const cartItems = locations
      .filter(loc => (quantities[loc.id] || 0) > 0)
      .map(loc => ({
        ticket_location_id: loc.id,
        quantity: quantities[loc.id],
        unit_price: loc.price,
        name: loc.name,
        type: loc.location_type,
        color: loc.color,
      }));
    navigate(`/checkout/${eventId}`, { state: { items: cartItems, total } });
  };

  return (
    <div className="min-h-screen pb-32">
      <div className="gradient-primary px-6 pt-8 pb-12 rounded-b-[2rem]">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate(`/event/${eventId}`)} className="flex items-center gap-2 text-white/80 mb-4">
            <ArrowLeft className="w-5 h-5" /> Voltar
          </button>
          <h1 className="font-display font-bold text-2xl text-white">Selecionar Ingressos</h1>
          <p className="text-white/70 text-sm mt-1">{event.title}</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto px-6 -mt-6 space-y-4">
        {locations.map(loc => {
          const Icon = ICONS[loc.location_type];
          return (
            <div key={loc.id} className="bg-card rounded-2xl border border-border p-5 flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-5 h-5" style={{ color: loc.color }} />
                  <span className="font-display font-semibold">{loc.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">{loc.description}</p>
                <p className="font-bold text-lg mt-1" style={{ color: loc.color }}>
                  R$ {loc.price.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">{loc.available_quantity} disponíveis</p>
              </div>
              <QuantitySelector
                value={quantities[loc.id] || 0}
                max={loc.available_quantity}
                onChange={v => setQty(loc.id, v)}
                color={loc.color}
              />
            </div>
          );
        })}
      </motion.div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-border p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="font-display font-bold text-2xl text-gradient">R$ {total.toFixed(2)}</p>
          </div>
          <Button
            disabled={!hasItems}
            onClick={handleNext}
            className="h-12 px-8 gradient-primary border-0 rounded-xl font-display font-bold glow-primary"
          >
            Finalizar Compra
          </Button>
        </div>
      </div>
    </div>
  );
}
