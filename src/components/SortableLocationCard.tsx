import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, Trash2 } from 'lucide-react';
import { LocationChip } from '@/components/LocationChip';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { LocationType } from '@/services/ticketLocationService';

interface SortableLocationCardProps {
  loc: any;
  onToggleActive: (id: string, isActive: boolean) => void;
  onToggleSoldOut: (id: string, isSoldOut: boolean) => void;
  onDelete: (id: string) => void;
}

export function SortableLocationCard({ loc, onToggleActive, onToggleSoldOut, onDelete }: SortableLocationCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: loc.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-card rounded-xl border border-border p-4 flex items-center gap-3 ml-4 ${loc.is_active === false ? 'opacity-50' : ''}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      <div className="flex-1 min-w-0">
        <LocationChip type={loc.location_type as LocationType} name={loc.name} price={loc.price} available={loc.available_quantity} />
        {loc.description && <p className="text-xs text-muted-foreground mt-2 ml-1">{loc.description}</p>}
        {loc.is_active === false && <p className="text-xs text-destructive mt-1 ml-1">Oculto para clientes</p>}
        {loc.is_sold_out === true && loc.is_active !== false && <p className="text-xs text-amber-500 mt-1 ml-1">Marcado como esgotado</p>}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Switch
          checked={loc.is_sold_out !== true}
          onCheckedChange={(checked) => onToggleSoldOut(loc.id, !checked)}
          title={loc.is_sold_out ? 'Marcar como disponível' : 'Marcar como esgotado'}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onToggleActive(loc.id, loc.is_active === false)}
          className="text-muted-foreground hover:text-foreground"
          title={loc.is_active === false ? 'Mostrar para clientes' : 'Ocultar para clientes'}
        >
          {loc.is_active === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(loc.id)} className="text-destructive hover:text-destructive">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
