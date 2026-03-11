import { Event } from '@/services/eventService';
import { motion } from 'framer-motion';
import { CalendarDays, EyeOff } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface EventCardProps {
  event: Event;
  showDraftBadge?: boolean;
}

export function EventCard({ event, showDraftBadge }: EventCardProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientView = searchParams.get('view') === 'client';
  const isDraft = showDraftBadge && event.is_visible === false;
  const [searchParams] = useSearchParams();
  const clientView = searchParams.get('view') === 'client';

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={() => navigate(`/event/${event.id}${clientView ? '?view=client' : ''}`)}
      className={`cursor-pointer rounded-2xl overflow-hidden bg-card border group ${isDraft ? 'border-amber-500/50 opacity-80' : 'border-border'}`}
    >
      <div className="relative h-48 overflow-hidden">
        {isDraft && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-amber-500/90 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
            <EyeOff className="w-3.5 h-3.5" /> Rascunho
          </div>
        )}
        {event.banner_image ? (
          <img src={event.banner_image} alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <div className="w-full h-full gradient-primary" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="font-display font-bold text-lg text-white truncate">{event.title}</h3>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <CalendarDays className="w-4 h-4 text-secondary" />
          <span>{new Date(event.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })} às {event.time}</span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
      </div>
    </motion.div>
  );
}
