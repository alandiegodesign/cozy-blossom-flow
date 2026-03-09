import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getAdminProducers, getAdminEvents, ProducerOverview, AdminEventRow } from '@/services/adminService';
import { Shield, Users, Calendar, DollarSign, Ticket, TrendingUp, Search, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  const { data: producers = [], isLoading: loadingProducers } = useQuery({
    queryKey: ['admin-producers'],
    queryFn: getAdminProducers,
    enabled: !!user,
  });

  const { data: events = [], isLoading: loadingEvents } = useQuery({
    queryKey: ['admin-events'],
    queryFn: getAdminEvents,
    enabled: !!user,
  });

  const globalStats = useMemo(() => ({
    totalProducers: producers.length,
    totalEvents: events.length,
    totalRevenue: producers.reduce((s, p) => s + Number(p.total_revenue), 0),
    totalTickets: producers.reduce((s, p) => s + Number(p.total_tickets_sold), 0),
    totalOrders: producers.reduce((s, p) => s + Number(p.total_orders), 0),
  }), [producers, events]);

  const filteredProducers = useMemo(() => {
    if (!search) return producers;
    const q = search.toLowerCase();
    return producers.filter(p =>
      p.producer_name.toLowerCase().includes(q) || p.producer_email.toLowerCase().includes(q)
    );
  }, [producers, search]);

  const filteredEvents = useMemo(() => {
    if (!search) return events;
    const q = search.toLowerCase();
    return events.filter(e =>
      e.event_title.toLowerCase().includes(q) || e.producer_name.toLowerCase().includes(q)
    );
  }, [events, search]);

  const isLoading = loadingProducers || loadingEvents;

  return (
    <div className="min-h-screen pb-8">
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 px-6 pt-8 pb-12 rounded-b-[2rem]">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-7 h-7 text-amber-400" />
            <h1 className="font-display font-bold text-2xl text-white">Painel ADM</h1>
          </div>
          <p className="text-white/60 text-sm">Monitoramento global de produtores, eventos e faturamento</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto px-6 -mt-6 space-y-5">
        {/* Global stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={Users} label="Produtores" value={globalStats.totalProducers} />
          <StatCard icon={Calendar} label="Eventos" value={globalStats.totalEvents} />
          <StatCard icon={DollarSign} label="Receita Total" value={`R$ ${globalStats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
          <StatCard icon={Ticket} label="Ingressos" value={globalStats.totalTickets} />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtor ou evento..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">Carregando dados...</div>
        ) : (
          <Tabs defaultValue="producers">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="producers">Produtores ({filteredProducers.length})</TabsTrigger>
              <TabsTrigger value="events">Eventos ({filteredEvents.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="producers" className="space-y-3 mt-4">
              {filteredProducers.length === 0 ? (
                <p className="text-center text-muted-foreground py-10">Nenhum produtor encontrado</p>
              ) : filteredProducers.map(p => (
                <ProducerCard key={p.producer_id} producer={p} onClick={() => navigate(`/admin/producer/${p.producer_id}`)} />
              ))}
            </TabsContent>

            <TabsContent value="events" className="space-y-3 mt-4">
              {filteredEvents.length === 0 ? (
                <p className="text-center text-muted-foreground py-10">Nenhum evento encontrado</p>
              ) : filteredEvents.map(e => (
                <EventCard key={e.event_id} event={e} onClick={() => navigate(`/admin/producer/${e.producer_id}`)} />
              ))}
            </TabsContent>
          </Tabs>
        )}
      </motion.div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-4 space-y-1">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-500/10">
        <Icon className="w-5 h-5 text-amber-500" />
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-display font-bold text-sm">{typeof value === 'number' ? value.toLocaleString('pt-BR') : value}</p>
    </div>
  );
}

function ProducerCard({ producer, onClick }: { producer: ProducerOverview; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full bg-card rounded-2xl border border-border p-4 flex items-center gap-4 hover:border-amber-500/40 transition-colors text-left">
      <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold text-lg shrink-0">
        {producer.producer_name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <p className="font-display font-bold text-sm truncate">{producer.producer_name}</p>
        <p className="text-xs text-muted-foreground truncate">{producer.producer_email}</p>
        <div className="flex gap-3 text-xs text-muted-foreground">
          <span>{producer.total_events} eventos</span>
          <span>•</span>
          <span>R$ {Number(producer.total_revenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          <span>•</span>
          <span>{producer.total_tickets_sold} ingressos</span>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
    </button>
  );
}

function EventCard({ event, onClick }: { event: AdminEventRow; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full bg-card rounded-2xl border border-border p-4 flex items-center gap-4 hover:border-amber-500/40 transition-colors text-left">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Calendar className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <p className="font-display font-bold text-sm truncate">{event.event_title}</p>
        <p className="text-xs text-muted-foreground">
          {event.producer_name} • {new Date(event.event_date).toLocaleDateString('pt-BR')}
          {!event.is_visible && <span className="ml-2 text-amber-500">(oculto)</span>}
        </p>
        <div className="flex gap-3 text-xs text-muted-foreground">
          <span>R$ {Number(event.total_revenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          <span>•</span>
          <span>{event.total_tickets_sold} ingressos</span>
          <span>•</span>
          <span>{event.total_orders} pedidos</span>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
    </button>
  );
}
