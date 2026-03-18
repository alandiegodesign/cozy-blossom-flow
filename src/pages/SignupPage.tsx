import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { User, Briefcase, Eye, EyeOff, Lock, Mail, Phone, UserCircle, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
const goodVibesLogo = '/good-vibes-logo.png';

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function cleanCpf(value: string) {
  return value.replace(/\D/g, '');
}

export default function SignupPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [userType, setUserType] = useState<'cliente' | 'produtor'>('cliente');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    if (password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }
    setLoading(true);

    const { error } = await signUp(email, password, {
      name,
      user_type: userType,
      phone,
      cpf: cleanCpf(cpf) || undefined,
    });
    setLoading(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success('Conta criada com sucesso! Faça login.');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8" style={{ background: 'var(--gradient-bg)' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md flex flex-col items-center"
      >
        <div className="mb-8 flex flex-col items-center">
          <img src={goodVibesLogo} alt="Good Vibes" className="h-16 w-auto mb-3" />
          <h1 className="font-display font-bold text-2xl text-foreground">Criar Conta</h1>
          <p className="text-muted-foreground text-sm mt-1">Junte-se à comunidade Good Vibes</p>
        </div>

        <div className="w-full bg-card rounded-2xl border border-border p-1.5 flex mb-6">
          <button type="button" onClick={() => setUserType('cliente')}
            className={`flex-1 flex flex-col items-center gap-1 py-3.5 rounded-xl transition-all font-display font-semibold text-sm ${
              userType === 'cliente' ? 'gradient-primary text-white shadow-lg glow-primary' : 'text-muted-foreground hover:text-foreground'
            }`}>
            <User className="w-5 h-5" />
            Cliente
          </button>
          <button type="button" onClick={() => setUserType('produtor')}
            className={`flex-1 flex flex-col items-center gap-1 py-3.5 rounded-xl transition-all font-display font-semibold text-sm ${
              userType === 'produtor' ? 'gradient-primary text-white shadow-lg glow-primary' : 'text-muted-foreground hover:text-foreground'
            }`}>
            <Briefcase className="w-5 h-5" />
            Sou Produtor
          </button>
        </div>

        <form onSubmit={handleSignup} className="w-full bg-card rounded-2xl border border-border p-6 space-y-4">
          <div className="relative">
            <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input placeholder="Nome completo *" value={name} onChange={e => setName(e.target.value)}
              className="pl-12 h-14 bg-background border-border rounded-xl text-foreground placeholder:text-muted-foreground focus-visible:ring-primary" />
          </div>

          <div className="relative">
            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input placeholder="CPF (opcional)" value={cpf} onChange={e => setCpf(formatCpf(e.target.value))}
              className="pl-12 h-14 bg-background border-border rounded-xl text-foreground placeholder:text-muted-foreground focus-visible:ring-primary" />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input type="email" placeholder="Email *" value={email} onChange={e => setEmail(e.target.value)}
              className="pl-12 h-14 bg-background border-border rounded-xl text-foreground placeholder:text-muted-foreground focus-visible:ring-primary" />
          </div>

          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input placeholder="Telefone" value={phone} onChange={e => setPhone(e.target.value)}
              className="pl-12 h-14 bg-background border-border rounded-xl text-foreground placeholder:text-muted-foreground focus-visible:ring-primary" />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input type={showPassword ? 'text' : 'password'} placeholder="Senha *" value={password} onChange={e => setPassword(e.target.value)}
              className="pl-12 pr-12 h-14 bg-background border-border rounded-xl text-foreground placeholder:text-muted-foreground focus-visible:ring-primary" />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <Button type="submit" disabled={loading}
            className="w-full h-14 text-lg font-display font-bold rounded-xl gradient-primary border-0 glow-primary text-white">
            {loading ? 'Criando...' : 'Criar Conta'}
          </Button>
        </form>

        <p className="mt-8 text-muted-foreground text-sm">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-gradient font-semibold underline hover:no-underline">
            Entrar
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
