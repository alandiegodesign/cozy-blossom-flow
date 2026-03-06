import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Menu, Home, PlusCircle, TicketCheck, Archive,
  BarChart3, User, LogOut, Users
} from 'lucide-react';
import { useState } from 'react';

const MENU_ITEMS = [
  { label: 'Início', icon: Home, path: '/' },
  { label: 'Minha Página', icon: User, path: '/my-page' },
  { label: 'Criar Evento', icon: PlusCircle, path: '/create-event' },
  { label: 'Ingressos Vendidos', icon: TicketCheck, path: '/sold-tickets' },
  { label: 'Arquivados', icon: Archive, path: '/archived' },
  { label: 'Dashboard', icon: BarChart3, path: '/dashboard' },
  { label: 'Perfil', icon: User, path: '/profile' },
];

export default function ProducerSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const handleNav = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const handleSwitchToClient = async () => {
    setOpen(false);
    // Navigate to a client-view mode — we'll use a query param
    navigate('/?view=client');
  };

  const handleLogout = async () => {
    setOpen(false);
    await signOut();
    navigate('/login');
  };

  const initials = (profile?.name || 'U').charAt(0).toUpperCase();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
          <Menu className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 bg-sidebar-background border-sidebar-border">
        {/* Profile header */}
        <div className="gradient-primary px-6 pt-10 pb-6 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold text-white mb-3 border-2 border-white/40">
            {initials}
          </div>
          <p className="font-display font-bold text-white text-lg">{profile?.name || 'Usuário'}</p>
          <span className="mt-1 px-3 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white uppercase tracking-wider">
            Produtor
          </span>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 w-full border-white/30 text-white hover:bg-white/20 bg-white/10"
            onClick={handleSwitchToClient}
          >
            <Users className="w-4 h-4 mr-2" /> Mudar para Cliente
          </Button>
        </div>

        {/* Menu items */}
        <nav className="flex flex-col py-4">
          {MENU_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => handleNav(item.path)}
                className={`flex items-center gap-4 px-6 py-3.5 text-sm font-medium transition-colors
                  ${isActive
                    ? 'text-primary bg-sidebar-accent'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-primary'
                  }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="mt-auto border-t border-sidebar-border px-6 py-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 text-sm font-medium text-destructive hover:text-destructive/80 transition-colors"
          >
            <LogOut className="w-5 h-5" /> Sair da conta
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
