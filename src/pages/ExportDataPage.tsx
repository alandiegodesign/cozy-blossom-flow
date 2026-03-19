import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Database, Users, HardDrive, Zap, KeyRound, ScrollText, Shield, Download, Loader2, ArrowLeft, Copy, Check, Code
} from 'lucide-react';

interface ExportItem {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  resource: string;
}

const EXPORT_ITEMS: ExportItem[] = [
  { id: 'tables', label: 'Tabelas do Banco', description: 'profiles, events, orders, order_items, ticket_locations, user_roles', icon: Database, resource: 'tables' },
  { id: 'users', label: 'Usuários (Auth)', description: 'Lista de todos os usuários registrados com e-mail e metadados', icon: Users, resource: 'users' },
  { id: 'storage', label: 'Storage (Buckets)', description: 'Buckets e arquivos armazenados', icon: HardDrive, resource: 'storage' },
  { id: 'edge_functions', label: 'Edge Functions', description: 'Lista de funções serverless do projeto', icon: Zap, resource: 'edge_functions' },
  { id: 'secrets', label: 'Secrets (Nomes)', description: 'Nomes das variáveis de ambiente configuradas', icon: KeyRound, resource: 'secrets' },
  { id: 'db_functions', label: 'Funções do DB', description: 'Funções PostgreSQL registradas no schema public', icon: ScrollText, resource: 'db_functions' },
  { id: 'rls_policies', label: 'Políticas RLS', description: 'Regras de segurança por tabela', icon: Shield, resource: 'rls_policies' },
];

function flattenForCSV(data: any): { headers: string[]; rows: any[][] } {
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return { headers: ['(vazio)'], rows: [] };
  }

  let arr: any[];
  if (Array.isArray(data)) {
    arr = data;
  } else if (typeof data === 'object') {
    // For nested objects like tables resource
    const allRows: any[] = [];
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        for (const row of value) {
          allRows.push({ _tabela: key, ...row });
        }
      } else {
        allRows.push({ _chave: key, _valor: typeof value === 'object' ? JSON.stringify(value) : String(value) });
      }
    }
    arr = allRows;
  } else {
    return { headers: ['valor'], rows: [[String(data)]] };
  }

  if (arr.length === 0) return { headers: ['(vazio)'], rows: [] };

  const headers = [...new Set(arr.flatMap(r => Object.keys(r)))];
  const rows = arr.map(r => headers.map(h => {
    const val = r[h];
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  }));

  return { headers, rows };
}

function downloadCSV(filename: string, headers: string[], rows: any[][]) {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const SCHEMA_SQL = `-- ============================================================
-- Good Vibes Ingressos — Schema SQL para Migração
-- ============================================================

-- 1. ENUM TYPES
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user', 'atendente', 'desenvolvedor');

-- 2. TABLES

CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  name text NOT NULL DEFAULT '',
  email text DEFAULT '',
  phone text DEFAULT '',
  cpf text,
  user_type text NOT NULL DEFAULT 'cliente',
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);

CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  CONSTRAINT user_roles_pkey PRIMARY KEY (id),
  CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role)
);

CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  date date NOT NULL,
  time text NOT NULL DEFAULT '00:00',
  end_date date,
  end_time text DEFAULT '',
  location_name text DEFAULT '',
  location_address text DEFAULT '',
  banner_image text DEFAULT '',
  map_image text DEFAULT '',
  policies jsonb DEFAULT '[]'::jsonb,
  tags jsonb DEFAULT '[]'::jsonb,
  sales_end_time text,
  is_visible boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT events_pkey PRIMARY KEY (id)
);

CREATE TABLE public.ticket_locations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  location_type text NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 0,
  available_quantity integer NOT NULL DEFAULT 0,
  group_size integer NOT NULL DEFAULT 1,
  color text DEFAULT '#9D4EDD',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  is_sold_out boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ticket_locations_pkey PRIMARY KEY (id)
);

CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id),
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  total_amount numeric NOT NULL DEFAULT 0,
  stripe_session_id text,
  validated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id)
);

CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  ticket_location_id uuid NOT NULL REFERENCES public.ticket_locations(id),
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  subtotal numeric NOT NULL DEFAULT 0,
  validation_code text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT order_items_pkey PRIMARY KEY (id)
);

-- 3. ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- User Roles policies
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Events policies
CREATE POLICY "Anyone can view events" ON public.events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Producers can create events" ON public.events FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Producers can update own events" ON public.events FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Producers can delete own events" ON public.events FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Ticket Locations policies
CREATE POLICY "Anyone can view ticket locations" ON public.ticket_locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Event creator can insert locations" ON public.ticket_locations FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM events WHERE events.id = ticket_locations.event_id AND events.created_by = auth.uid()));
CREATE POLICY "Event creator can update locations" ON public.ticket_locations FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM events WHERE events.id = ticket_locations.event_id AND events.created_by = auth.uid()));
CREATE POLICY "Event creator can delete locations" ON public.ticket_locations FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM events WHERE events.id = ticket_locations.event_id AND events.created_by = auth.uid()));

-- Orders policies
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own orders" ON public.orders FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Order Items policies
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Users can insert order items" ON public.order_items FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
`;

export default function ExportDataPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [loadingAll, setLoadingAll] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  const copySQL = async () => {
    try {
      await navigator.clipboard.writeText(SCHEMA_SQL);
      setSqlCopied(true);
      toast({ title: 'Copiado!', description: 'SQL do schema copiado para a área de transferência.' });
      setTimeout(() => setSqlCopied(false), 2000);
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível copiar.', variant: 'destructive' });
    }
  };

  const downloadSQL = () => {
    const blob = new Blob([SCHEMA_SQL], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'database-schema.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportResource = async (item: ExportItem) => {
    setLoading(prev => ({ ...prev, [item.id]: true }));
    try {
      const { data, error } = await supabase.functions.invoke('export-database', {
        body: { resource: item.resource },
      });
      if (error) throw error;

      const { headers, rows } = flattenForCSV(data);
      downloadCSV(`${item.id}_export.csv`, headers, rows);
      toast({ title: 'Exportado!', description: `${item.label} exportado com sucesso.` });
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message || 'Falha ao exportar', variant: 'destructive' });
    } finally {
      setLoading(prev => ({ ...prev, [item.id]: false }));
    }
  };

  const exportAll = async () => {
    setLoadingAll(true);
    for (const item of EXPORT_ITEMS) {
      await exportResource(item);
    }
    setLoadingAll(false);
    toast({ title: 'Tudo exportado!', description: 'Todos os CSVs foram gerados.' });
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        Acesso restrito a administradores.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">Exportar Dados</h1>
          <p className="text-xs text-muted-foreground">Exporte todos os recursos do backend em CSV</p>
        </div>
      </div>

      {/* SQL Schema Section */}
      <Card className="border-primary/30 bg-card">
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm">SQL das Tabelas (Migração)</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={copySQL} className="h-7 text-xs">
                {sqlCopied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                {sqlCopied ? 'Copiado' : 'Copiar'}
              </Button>
              <Button size="sm" variant="outline" onClick={downloadSQL} className="h-7 text-xs">
                <Download className="w-3 h-3 mr-1" />
                .sql
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <CardDescription className="text-xs mb-2">
            SQL completo para recriar todas as tabelas, RLS e políticas. Copie e execute no editor SQL do Supabase destino.
          </CardDescription>
          <Textarea
            readOnly
            value={SCHEMA_SQL}
            className="font-mono text-xs h-64 bg-muted/50 resize-y"
          />
        </CardContent>
      </Card>

      <Button onClick={exportAll} disabled={loadingAll} className="w-full" size="lg">
        {loadingAll ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
        Exportar Tudo
      </Button>

      <div className="grid gap-3">
        {EXPORT_ITEMS.map((item) => (
          <Card key={item.id} className="border-sidebar-border">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <item.icon className="w-4 h-4 text-primary" />
                  <CardTitle className="text-sm">{item.label}</CardTitle>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => exportResource(item)}
                  disabled={!!loading[item.id]}
                  className="h-7 text-xs"
                >
                  {loading[item.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3 mr-1" />}
                  CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <CardDescription className="text-xs">{item.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
