import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getEvents, getEventsByCreator } from '@/services/eventService';
import { EventCard } from '@/components/EventCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search, Ticket, LogOut, ShoppingBag, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [search, setSearch] = useState('');
  const isProdutor = profile?.user_type === 'produtor';

  // Producer sees only their events, Client sees all
  const { data: events = [], isLoading } = useQuery({
    queryKey: isProdutor ? ['my-events', user?.id] : ['events'],
    queryFn: () => isProdutor ? getEventsByCreator(user!.id) : getEvents(),
    enabled: isProdutor ? !!user : true,
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return events;
    const q = search.toLowerCase();
    return events.filter(e => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
  }, [events, search]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="gradient-primary px-6 pt-12 pb-16 rounded-b-[2rem]">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Ticket className="w-8 h-8 text-white" />
              <h1 className="font-display font-bold text-2xl text-white">TicketVibe</h1>
            </div>
            <div className="flex items-center gap-2">
              {!isProdutor && (
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => navigate('/my-orders')}>
                  <ShoppingBag className="w-4 h-4 mr-1" /> Pedidos
                </Button>
              )}
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <p className="text-white/80 text-sm mb-1">
            Olá, {profile?.name || 'Usuário'}!
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-white/20">
              {isProdutor ? '🎬 Produtor' : '🎫 Cliente'}
            </span>
          </p>
          <p className="text-white/60 text-xs mb-4">
            {isProdutor ? 'Gerencie seus eventos' : 'Encontre os melhores eventos da comunidade'}
          </p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input placeholder={isProdutor ? 'Buscar meus eventos...' : 'Buscar eventos...'} value={search} onChange={e => setSearch(e.target.value)}
              className="pl-10 bg-background/90 backdrop-blur border-0 h-12 rounded-xl text-foreground" />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-6">
        {isProdutor && !isLoading && (
          <div className="mb-4 bg-card rounded-2xl border border-border p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-secondary" />
              <div>
                <p className="font-display font-semibold text-sm">{events.length} evento{events.length !== 1 ? 's' : ''}</p>
                <p className="text-xs text-muted-foreground">Criados por você</p>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">Carregando eventos...</div>
        ) : (
          <motion.div className="grid gap-4" initial="hidden" animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            {filtered.map(event => (
              <motion.div key={event.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <EventCard event={event} />
              </motion.div>
            ))}
          </motion.div>
        )}
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="font-display text-lg">
              {isProdutor ? 'Você ainda não criou eventos' : 'Nenhum evento encontrado'}
            </p>
            {isProdutor && <p className="text-sm mt-1">Toque no botão + para criar seu primeiro evento!</p>}
          </div>
        )}
      </div>

      {isProdutor && (
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/create-event')}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full gradient-accent text-white shadow-lg flex items-center justify-center glow-secondary z-50">
          <Plus className="w-7 h-7" />
        </motion.button>
      )}
    </div>
  );
}
