import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getEvent } from '@/services/eventService';
import { getLocationsByEvent } from '@/services/ticketLocationService';
import { LocationChip } from '@/components/LocationChip';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CalendarDays, Clock, MapPin, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { LocationType } from '@/services/ticketLocationService';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
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
          <button onClick={() => navigate(`/manage-locations/${event.id}`)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white">
            <Settings className="w-5 h-5" />
          </button>
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
          <Button className="w-full h-14 text-lg font-display font-bold gradient-accent border-0 rounded-xl glow-secondary"
            onClick={() => navigate(`/manage-locations/${event.id}`)}>
            <Settings className="w-5 h-5 mr-2" /> Gerenciar Locais
          </Button>
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
