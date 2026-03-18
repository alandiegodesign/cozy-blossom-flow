import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, User, Mail, Phone, CreditCard, LogOut, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url ?? null);

  const initials = (profile?.name || 'U').charAt(0).toUpperCase();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen pb-8">
      <div className="gradient-primary px-6 pt-8 pb-16 rounded-b-[2rem]">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/80 mb-4">
            <ArrowLeft className="w-5 h-5" /> Voltar
          </button>
          <div className="flex flex-col items-center">
            <div className="relative">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-white/40" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold text-white border-2 border-white/40">
                  {initials}
                </div>
              )}
            </div>
            <h1 className="font-display font-bold text-xl text-white mt-3">{profile?.name || 'Usuário'}</h1>
            <span className="mt-1 px-3 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white uppercase">
              {profile?.user_type === 'produtor' ? 'Produtor' : 'Cliente'}
            </span>
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto px-6 -mt-6 space-y-4">
        <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
          <h2 className="font-display font-semibold text-lg">Informações da Conta</h2>
          <InfoRow icon={User} label="Nome" value={profile?.name || '—'} />
          <div className="grid grid-cols-2 gap-3">
            <InfoRow icon={Phone} label="Telefone" value={profile?.phone || '—'} />
            <InfoRow icon={Mail} label="E-mail" value={profile?.email || user?.email || '—'} />
          </div>
          <InfoRow icon={CreditCard} label="CPF" value={profile?.cpf ? formatCpf(profile.cpf) : '—'} />
        </div>

        <Button variant="destructive" className="w-full rounded-xl gap-2" onClick={handleLogout}>
          <LogOut className="w-4 h-4" /> Sair da conta
        </Button>
      </motion.div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-border last:border-0">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function formatCpf(cpf: string) {
  const digits = cpf.replace(/\D/g, '');
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}
