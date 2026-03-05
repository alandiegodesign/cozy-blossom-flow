import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEvent } from '@/services/eventService';
import { getLocationsByEvent, createLocation, deleteLocation, getLocationColor, LocationType } from '@/services/ticketLocationService';
import { LocationChip } from '@/components/LocationChip';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const TYPES: { value: LocationType; label: string }[] = [
  { value: 'pista', label: 'Pista' },
  { value: 'vip', label: 'VIP' },
  { value: 'camarote', label: 'Camarote' },
  { value: 'bistro', label: 'Bistrô' },
];

export default function ManageLocationsPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: event, isLoading: loadingEvent } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => getEvent(eventId!),
    enabled: !!eventId,
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['locations', eventId],
    queryFn: () => getLocationsByEvent(eventId!),
    enabled: !!eventId,
  });

  const [name, setName] = useState('');
  const [type, setType] = useState<LocationType>('pista');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');

  const addMutation = useMutation({
    mutationFn: createLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations', eventId] });
      setName(''); setPrice(''); setQuantity(''); setDescription('');
      toast.success('Local adicionado!');
    },
    onError: () => toast.error('Erro ao adicionar local'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations', eventId] });
      toast.success('Local removido');
    },
  });

  const handleAdd = () => {
    if (!name || !price || !quantity) { toast.error('Preencha todos os campos'); return; }
    addMutation.mutate({
      event_id: eventId!,
      location_type: type,
      name,
      description,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      available_quantity: parseInt(quantity),
      color: getLocationColor(type),
    });
  };

  if (loadingEvent) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Evento não encontrado</div>;

  return (
    <div className="min-h-screen pb-8">
      <div className="gradient-primary px-6 pt-8 pb-12 rounded-b-[2rem]">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate(`/event/${eventId}`)} className="flex items-center gap-2 text-white/80 mb-4">
            <ArrowLeft className="w-5 h-5" /> Voltar
          </button>
          <h1 className="font-display font-bold text-2xl text-white">Gerenciar Locais</h1>
          <p className="text-white/70 text-sm mt-1">{event.title}</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto px-6 -mt-6 space-y-5">
        <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-display font-semibold text-lg flex items-center gap-2">
            <Plus className="w-5 h-5 text-secondary" /> Adicionar Local
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do local" className="h-12 rounded-xl" />
            <Select value={type} onValueChange={v => setType(v as LocationType)}>
              <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="Preço (R$)" className="h-12 rounded-xl" />
            <Input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="Quantidade" className="h-12 rounded-xl" />
          </div>
          <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Descrição (opcional)" className="h-12 rounded-xl" />
          <Button onClick={handleAdd} disabled={addMutation.isPending} className="w-full h-12 gradient-accent border-0 rounded-xl font-display font-bold">
            {addMutation.isPending ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </div>

        <div className="space-y-3">
          <h2 className="font-display font-semibold text-lg">Locais Cadastrados ({locations.length})</h2>
          {locations.map(loc => (
            <motion.div key={loc.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="bg-card rounded-xl border border-border p-4 flex items-center justify-between">
              <div className="flex-1">
                <LocationChip type={loc.location_type as LocationType} name={loc.name} price={loc.price} available={loc.available_quantity} />
                {loc.description && <p className="text-xs text-muted-foreground mt-2 ml-1">{loc.description}</p>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(loc.id)} className="text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </motion.div>
          ))}
          {locations.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Nenhum local cadastrado</p>}
        </div>
      </motion.div>
    </div>
  );
}
