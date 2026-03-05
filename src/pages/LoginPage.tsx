import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Ticket, User, Briefcase, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'cliente' | 'produtor'>('cliente');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Preencha todos os campos');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message === 'Invalid login credentials' ? 'Email ou senha incorretos' : error.message);
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
        {/* Logo */}
        <div className="mb-6 flex flex-col items-center">
          <div className="w-16 h-16 bg-foreground rounded-xl flex items-center justify-center mb-4">
            <Ticket className="w-8 h-8 text-background" />
          </div>
          <h1 className="font-display font-bold text-3xl text-foreground">TicketVibe</h1>
          <p className="text-muted-foreground mt-1">Bem-vindo de volta!</p>
        </div>

        {/* User type toggle */}
        <div className="w-full bg-card rounded-2xl border border-border p-1.5 flex mb-8">
          <button
            type="button"
            onClick={() => setUserType('cliente')}
            className={`flex-1 flex flex-col items-center gap-1 py-4 rounded-xl transition-all font-display font-semibold text-sm ${
              userType === 'cliente'
                ? 'bg-[hsl(145,63%,42%)] text-white shadow-lg'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <User className="w-6 h-6" />
            Cliente
          </button>
          <button
            type="button"
            onClick={() => setUserType('produtor')}
            className={`flex-1 flex flex-col items-center gap-1 py-4 rounded-xl transition-all font-display font-semibold text-sm ${
              userType === 'produtor'
                ? 'bg-[hsl(145,63%,42%)] text-white shadow-lg'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Briefcase className="w-6 h-6" />
            Sou Produtor
          </button>
        </div>

        {/* Login form */}
        <form onSubmit={handleLogin} className="w-full bg-card rounded-2xl border border-border p-6 space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Email ou CPF"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="pl-12 h-14 bg-background border-border rounded-xl text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="pl-12 pr-12 h-14 bg-background border-border rounded-xl text-foreground placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-[hsl(145,63%,42%)] hover:underline">
              Esqueceu a senha?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 text-lg font-display font-bold rounded-xl bg-[hsl(145,63%,42%)] hover:bg-[hsl(145,63%,36%)] text-white border-0"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <p className="mt-8 text-muted-foreground text-sm">
          Não tem uma conta?{' '}
          <Link to="/signup" className="text-foreground font-semibold underline hover:no-underline">
            Cadastre-se
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
