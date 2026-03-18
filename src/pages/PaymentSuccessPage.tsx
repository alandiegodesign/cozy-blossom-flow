import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();

  // In mock mode, always show success
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center space-y-6"
      >
        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <h1 className="font-display font-bold text-2xl">Pedido Confirmado!</h1>
        <p className="text-muted-foreground">
          Seus ingressos já estão disponíveis na sua conta.
        </p>
        <div className="space-y-3 pt-4">
          <Button onClick={() => navigate('/my-orders')}
            className="w-full h-12 gradient-primary border-0 rounded-xl font-display font-bold glow-primary">
            Ver Meus Ingressos
          </Button>
          <Button onClick={() => navigate('/')} variant="outline" className="w-full h-12 rounded-xl">
            Voltar ao Início
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
