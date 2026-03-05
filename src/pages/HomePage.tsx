import { useState, useMemo } from 'react';
import { getEvents } from '@/services/eventService';
import { EventCard } from '@/components/EventCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const events = getEvents();

  const filtered = useMemo(() => {
    if (!search.trim()) return events;
    const q = search.toLowerCase();
    return events.filter(e => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
  }, [events, search]);

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="gradient-primary px-6 pt-12 pb-16 rounded-b-[2rem]">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Ticket className="w-8 h-8 text-white" />
              <h1 className="font-display font-bold text-2xl text-white">TicketVibe</h1>
            </div>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => navigate('/my-orders')}
            >
              Meus Pedidos
            </Button>
          </div>
          <p className="text-white/80 text-sm mb-4">Encontre os melhores eventos</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar eventos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 bg-background/90 backdrop-blur border-0 h-12 rounded-xl text-foreground"
            />
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-2xl mx-auto px-6 -mt-6">
        <motion.div
          className="grid gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.1 } },
          }}
        >
          {filtered.map(event => (
            <motion.div
              key={event.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <EventCard event={event} />
            </motion.div>
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="font-display text-lg">Nenhum evento encontrado</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/create-event')}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full gradient-accent text-white shadow-lg flex items-center justify-center glow-secondary z-50"
      >
        <Plus className="w-7 h-7" />
      </motion.button>
    </div>
  );
}
