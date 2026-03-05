import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEvent, getEventsByCreator } from '@/services/eventService';
import { getLocationsByEvent, createLocation, deleteLocation, getLocationColor, LocationType } from '@/services/ticketLocationService';
import { LocationChip } from '@/components/LocationChip';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2, Copy, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

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
  const { user } = useAuth();

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

  // For copying from previous events
  const { data: myEvents = [] } = useQuery({
    queryKey: ['my-events', user?.id],
    queryFn: () => getEventsByCreator(user!.id),
    enabled: !!user,
  });

  const previousEvents = myEvents.filter(e => e.id !== eventId);

  // Single add form
  const [name, setName] = useState('');
  const [type, setType] = useState<LocationType>('pista');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');

  // Batch add form
  const [batchType, setBatchType] = useState<LocationType>('camarote');
  const [batchQuantity, setBatchQuantity] = useState('');
  const [batchPrice, setBatchPrice] = useState('');
  const [batchDescription, setBatchDescription] = useState('');

  // Copy dialog
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [copyingEventId, setCopyingEventId] = useState<string | null>(null);

  const { data: copyLocations = [] } = useQuery({
    queryKey: ['locations', copyingEventId],
    queryFn: () => getLocationsByEvent(copyingEventId!),
    enabled: !!copyingEventId,
  });

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

  const [batchLoading, setBatchLoading] = useState(false);

  const handleBatchAdd = async () => {
    const qty = parseInt(batchQuantity);
    const priceVal = parseFloat(batchPrice);
    if (!qty || qty < 1 || !priceVal) { toast.error('Preencha quantidade e preço'); return; }

    const label = TYPES.find(t => t.value === batchType)?.label || batchType;
    setBatchLoading(true);

    try {
      for (let i = 1; i <= qty; i++) {
        const num = String(i).padStart(2, '0');
        await createLocation({
          event_id: eventId!,
          location_type: batchType,
          name: `${label} - ${num}`,
          description: batchDescription,
          price: priceVal,
          quantity: 1,
          available_quantity: 1,
          color: getLocationColor(batchType),
        });
      }
      queryClient.invalidateQueries({ queryKey: ['locations', eventId] });
      setBatchQuantity(''); setBatchPrice(''); setBatchDescription('');
      toast.success(`${qty} ${label}(s) criados com sucesso!`);
    } catch {
      toast.error('Erro ao criar locais em lote');
    } finally {
      setBatchLoading(false);
    }
  };

  const [copyLoading, setCopyLoading] = useState(false);

  const handleCopyLocations = async () => {
    if (!copyLocations.length) return;
    setCopyLoading(true);
    try {
      for (const loc of copyLocations) {
        await createLocation({
          event_id: eventId!,
          location_type: loc.location_type,
          name: loc.name,
          description: loc.description || '',
          price: loc.price,
          quantity: loc.quantity,
          available_quantity: loc.quantity,
          color: loc.color || getLocationColor(loc.location_type),
        });
      }
      queryClient.invalidateQueries({ queryKey: ['locations', eventId] });
      setCopyDialogOpen(false);
      setCopyingEventId(null);
      toast.success(`${copyLocations.length} locais copiados!`);
    } catch {
      toast.error('Erro ao copiar locais');
    } finally {
      setCopyLoading(false);
    }
  };

  // Group locations by type for display
  const groupedLocations = locations.reduce((acc, loc) => {
    const key = loc.location_type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(loc);
    return acc;
  }, {} as Record<string, typeof locations>);

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
        {/* Copy from previous event */}
        {previousEvents.length > 0 && (
          <Dialog open={copyDialogOpen} onOpenChange={setCopyDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full h-12 rounded-xl border-dashed border-2">
                <Copy className="w-4 h-4 mr-2" /> Copiar locais de evento anterior
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Copiar Locais</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {previousEvents.map(ev => (
                  <button key={ev.id} onClick={() => setCopyingEventId(ev.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${copyingEventId === ev.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                    <p className="font-semibold text-sm">{ev.title}</p>
                    <p className="text-xs text-muted-foreground">{new Date(ev.date).toLocaleDateString('pt-BR')}</p>
                  </button>
                ))}
              </div>
              {copyingEventId && copyLocations.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{copyLocations.length} locais encontrados</p>
                  <Button onClick={handleCopyLocations} disabled={copyLoading} className="w-full gradient-primary border-0 rounded-xl">
                    {copyLoading ? 'Copiando...' : `Copiar ${copyLocations.length} locais`}
                  </Button>
                </div>
              )}
              {copyingEventId && copyLocations.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum local neste evento</p>
              )}
            </DialogContent>
          </Dialog>
        )}

        {/* Single add */}
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

        {/* Batch add for camarotes/bistros */}
        <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-display font-semibold text-lg flex items-center gap-2">
            <Layers className="w-5 h-5 text-accent" /> Criar em Lote
          </h2>
          <p className="text-xs text-muted-foreground">Crie múltiplos locais de uma vez. Ex: 10 Camarotes serão nomeados Camarote - 01, Camarote - 02...</p>
          <div className="grid grid-cols-2 gap-4">
            <Select value={batchType} onValueChange={v => setBatchType(v as LocationType)}>
              <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="number" value={batchQuantity} onChange={e => setBatchQuantity(e.target.value)} placeholder="Quantidade (ex: 10)" className="h-12 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input type="number" value={batchPrice} onChange={e => setBatchPrice(e.target.value)} placeholder="Preço unitário (R$)" className="h-12 rounded-xl" />
            <Input value={batchDescription} onChange={e => setBatchDescription(e.target.value)} placeholder="Descrição (opcional)" className="h-12 rounded-xl" />
          </div>
          <Button onClick={handleBatchAdd} disabled={batchLoading} className="w-full h-12 gradient-primary border-0 rounded-xl font-display font-bold">
            {batchLoading ? 'Criando...' : 'Criar em Lote'}
          </Button>
        </div>

        {/* Locations grouped by type - collapsible */}
        <div className="space-y-3">
          <h2 className="font-display font-semibold text-lg">Locais Cadastrados ({locations.length})</h2>

          {Object.entries(groupedLocations).map(([type, locs]) => {
            const label = TYPES.find(t => t.value === type)?.label || type;
            return (
              <Collapsible key={type} defaultOpen={locs.length <= 5}>
                <CollapsibleTrigger className="w-full bg-card rounded-xl border border-border p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getLocationColor(type) }} />
                    <span className="font-display font-semibold text-sm">{label}</span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{locs.length}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200" />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2">
                  {locs.map(loc => (
                    <motion.div key={loc.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      className="bg-card rounded-xl border border-border p-4 flex items-center justify-between ml-4">
                      <div className="flex-1">
                        <LocationChip type={loc.location_type as LocationType} name={loc.name} price={loc.price} available={loc.available_quantity} />
                        {loc.description && <p className="text-xs text-muted-foreground mt-2 ml-1">{loc.description}</p>}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(loc.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            );
          })}

          {locations.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Nenhum local cadastrado</p>}
        </div>
      </motion.div>
    </div>
  );
}
