import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvent } from '@/services/eventService';
import { getCurrentUser } from '@/services/userService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ImagePickerButton } from '@/components/ImagePickerButton';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [banner, setBanner] = useState('');
  const [mapImage, setMapImage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    const user = getCurrentUser();
    const event = createEvent({
      title,
      description,
      date,
      time,
      banner_image: banner,
      map_image: mapImage,
      created_by: user.id,
    });
    toast.success('Evento criado com sucesso!');
    navigate(`/manage-locations/${event.id}`);
  };

  return (
    <div className="min-h-screen pb-8">
      <div className="gradient-primary px-6 pt-8 pb-12 rounded-b-[2rem]">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/80 mb-4">
            <ArrowLeft className="w-5 h-5" /> Voltar
          </button>
          <h1 className="font-display font-bold text-2xl text-white">Criar Evento</h1>
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto px-6 -mt-6 space-y-5"
      >
        <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Título *</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Nome do evento" className="h-12 rounded-xl" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição</label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descreva o evento" className="rounded-xl min-h-[100px]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Data *</label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Hora *</label>
              <Input type="time" value={time} onChange={e => setTime(e.target.value)} className="h-12 rounded-xl" />
            </div>
          </div>
          <ImagePickerButton label="Banner do Evento" value={banner} onChange={setBanner} />
          <ImagePickerButton label="Mapa do Evento" value={mapImage} onChange={setMapImage} />
        </div>

        <Button type="submit" className="w-full h-14 text-lg font-display font-bold gradient-primary border-0 rounded-xl glow-primary">
          Criar Evento
        </Button>
      </motion.form>
    </div>
  );
}
