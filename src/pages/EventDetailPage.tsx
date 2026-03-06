import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEvent, softDeleteEvent, toggleEventVisibility } from '@/services/eventService';
import { getLocationsByEvent } from '@/services/ticketLocationService';
import { getProducerSales } from '@/services/orderService';
import { LocationChip } from '@/components/LocationChip';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CalendarDays, Clock, MapPin, Settings, Ticket, DollarSign, Eye, EyeOff, Link2, Copy, BarChart3, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { LocationType } from '@/services/ticketLocationService';
import { useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isProdutor = profile?.user_type === 'produtor';

  const { data: event, isLoading: loadingEvent } = useQuery({
    queryKey: ['event', id],
    queryFn: () => getEvent(id!),
    enabled: !!id,
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['locations', id],
    queryFn: () => getLocationsByEvent(id!),
    enabled: !!id,
  });

  // Only the creator (producer) can manage this event
  const isOwner = isProdutor && event?.created_by === user?.id;

  // Fetch sales data for owner stats
  const { data: sales = [] } = useQuery({
    queryKey: ['producer-sales', user?.id],
    queryFn: () => getProducerSales(user!.id),
    enabled: !!user && !!isOwner,
  });

  const eventStats = useMemo(() => {
    if (!event) return { tickets: 0, revenue: 0 };
    const eventSales = sales.filter(s => s.event_id === event.id);
    const tickets = eventSales.reduce((sum, s) => sum + s.item_quantity, 0);
    const revenue = eventSales.reduce((sum, s) => sum + Number(s.item_subtotal), 0);
    return { tickets, revenue };
  }, [sales, event]);

  const deleteMutation = useMutation({
    mutationFn: () => softDeleteEvent(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({ title: 'Evento movido para a lixeira!', description: 'Será excluído permanentemente em 7 dias.' });
      navigate('/');
    },
    onError: () => toast({ title: 'Erro ao excluir evento', variant: 'destructive' }),
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: () => toggleEventVisibility(id!, !(event as any)?.is_visible),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
      toast({ title: (event as any)?.is_visible ? 'Evento ocultado!' : 'Evento visível!' });
    },
    onError: () => toast({ title: 'Erro ao alterar visibilidade', variant: 'destructive' }),
  });

  const shareLink = typeof window !== 'undefined' ? `${window.location.origin}/event/${id}` : '';

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast({ title: 'Link copiado!', description: 'Compartilhe com seus clientes.' });
  };

  if (loadingEvent) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Evento não encontrado</p></div>;

  return (
    <div className="min-h-screen pb-8">
      <div className="relative h-64 overflow-hidden">
        {event.banner_image ? (
          <img src={event.banner_image} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full gradient-primary" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <button onClick={() => navigate('/')} className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        {isOwner && (
          <div className="absolute top-4 right-4 flex gap-2">
            <button onClick={() => toggleVisibilityMutation.mutate()} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white">
              {(event as any)?.is_visible !== false ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            <button onClick={() => navigate(`/manage-locations/${event.id}`)} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto px-6 -mt-12 relative z-10 space-y-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-gradient">{event.title}</h1>
          <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-secondary" />
              {new Date(event.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-accent" />
              {event.time}
            </span>
          </div>
        </div>

        <p className="text-muted-foreground leading-relaxed">{event.description}</p>

        {/* Quick stats for event owner */}
        {isOwner && (
          <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
            <h2 className="font-display font-semibold text-lg flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" /> Visão rápida do evento
            </h2>
            <div className="space-y-3">
              <p className="text-sm font-semibold flex items-center gap-2">
                <Ticket className="w-4 h-4 text-primary" /> Estatísticas do evento
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  <Ticket className="w-3.5 h-3.5" /> Ingressos vendidos: {eventStats.tickets}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  <DollarSign className="w-3.5 h-3.5" /> Faturamento: R$ {eventStats.revenue.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold">Link de compartilhamento</p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 flex-1 bg-muted rounded-lg px-3 py-2 overflow-hidden">
                  <Link2 className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground truncate">{shareLink}</span>
                </div>
                <Button size="sm" variant="outline" onClick={copyLink} className="shrink-0 border-primary text-primary hover:bg-primary/10">
                  <Copy className="w-4 h-4 mr-1" /> Copiar link
                </Button>
              </div>
            </div>
          </div>
        )}

        {event.map_image && (
          <div className="space-y-2">
            <h2 className="font-display font-semibold text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-secondary" /> Mapa do Evento
            </h2>
            <img src={event.map_image} alt="Mapa" className="w-full rounded-xl border border-border" />
          </div>
        )}

        <div className="space-y-3">
          <h2 className="font-display font-semibold text-lg">Locais Disponíveis</h2>
          <div className="flex flex-wrap gap-2">
            {locations.map(loc => (
              <LocationChip key={loc.id} type={loc.location_type as LocationType} name={loc.name} price={loc.price} available={loc.available_quantity} />
            ))}
          </div>
          {locations.length === 0 && <p className="text-sm text-muted-foreground">Nenhum local cadastrado ainda.</p>}
        </div>

        {isOwner ? (
          <div className="flex flex-col gap-3">
            <Button className="w-full h-14 text-lg font-display font-bold gradient-primary border-0 rounded-xl glow-primary"
              onClick={() => navigate(`/dashboard/${event.id}`)}>
              <BarChart3 className="w-5 h-5 mr-2" /> Dashboard de Vendas
            </Button>
            <Button className="w-full h-14 text-lg font-display font-bold gradient-accent border-0 rounded-xl glow-secondary"
              onClick={() => navigate(`/manage-locations/${event.id}`)}>
              <Settings className="w-5 h-5 mr-2" /> Gerenciar Locais
            </Button>
            <Button variant="outline" className="w-full h-14 text-lg font-display font-bold rounded-xl"
              onClick={() => toggleVisibilityMutation.mutate()}>
              {(event as any)?.is_visible !== false ? <><EyeOff className="w-5 h-5 mr-2" /> Ocultar Evento</> : <><Eye className="w-5 h-5 mr-2" /> Tornar Visível</>}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full h-14 text-lg font-display font-bold rounded-xl">
                  <Trash2 className="w-5 h-5 mr-2" /> Mover para Lixeira
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir evento?</AlertDialogTitle>
                  <AlertDialogDescription>Esta ação não pode ser desfeita. Todos os dados do evento serão removidos permanentemente.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteMutation.mutate()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : (
          <Button className="w-full h-14 text-lg font-display font-bold gradient-primary border-0 rounded-xl glow-primary"
            onClick={() => navigate(`/tickets/${event.id}`)} disabled={locations.length === 0}>
            Comprar Ingressos
          </Button>
        )}
      </motion.div>
    </div>
  );
}
