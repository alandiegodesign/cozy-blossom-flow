import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { User, Briefcase, Eye, EyeOff, Lock, Mail, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import goodVibesLogo from '@/assets/good-vibes-logo.png';

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

export default function LoginPage() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'cliente' | 'produtor'>('cliente');
  const [loginMethod, setLoginMethod] = useState<'email' | 'cpf'>('email');
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credential || !password) {
      toast.error('Preencha todos os campos');
      return;
    }
    setLoading(true);

    let email = credential;

    if (loginMethod === 'cpf') {
      const cpfClean = cleanCpf(credential);
      if (cpfClean.length !== 11) {
        toast.error('CPF inválido');
        setLoading(false);
        return;
      }
      const { data, error: fnError } = await supabase.rpc('get_email_by_cpf', { p_cpf: cpfClean });
      if (fnError || !data) {
        toast.error('CPF não encontrado');
        setLoading(false);
        return;
      }
      email = data as string;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message === 'Invalid login credentials' ? 'Email/CPF ou senha incorretos' : error.message);
    } else {
      toast.success('Login realizado com sucesso!');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: 'var(--gradient-bg)' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md flex flex-col items-center"
      >
        {/* Logo & Welcome */}
        <div className="mb-8 flex flex-col items-center">
          <img src={goodVibesLogo} alt="Good Vibes" className="h-24 w-auto mb-3" />
          <p className="text-muted-foreground text-sm">Bem-vindo de volta!</p>
        </div>

        {/* User type toggle */}
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

        <form onSubmit={handleLogin} className="w-full bg-card rounded-2xl border border-border p-6 space-y-4">
          {/* Login method toggle */}
          <div className="flex gap-2 mb-2">
            <button type="button" onClick={() => { setLoginMethod('email'); setCredential(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                loginMethod === 'email' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}>
              <Mail className="w-4 h-4 inline mr-1" /> Email
            </button>
            <button type="button" onClick={() => { setLoginMethod('cpf'); setCredential(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                loginMethod === 'cpf' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}>
              <CreditCard className="w-4 h-4 inline mr-1" /> CPF
            </button>
          </div>

          <div className="relative">
            {loginMethod === 'email' ? (
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            ) : (
              <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            )}
            <Input
              type={loginMethod === 'email' ? 'email' : 'text'}
              placeholder={loginMethod === 'email' ? 'Email' : 'CPF (000.000.000-00)'}
              value={credential}
              onChange={e => setCredential(loginMethod === 'cpf' ? formatCpf(e.target.value) : e.target.value)}
              className="pl-12 h-14 bg-background border-border rounded-xl text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="pl-12 pr-12 h-14 bg-background border-border rounded-xl text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-secondary hover:underline">
              Esqueceu a senha?
            </Link>
          </div>

          <Button type="submit" disabled={loading}
            className="w-full h-14 text-lg font-display font-bold rounded-xl gradient-primary border-0 glow-primary text-white">
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <p className="mt-8 text-muted-foreground text-sm">
          Não tem uma conta?{' '}
          <Link to="/signup" className="text-gradient font-semibold underline hover:no-underline">
            Cadastre-se
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
