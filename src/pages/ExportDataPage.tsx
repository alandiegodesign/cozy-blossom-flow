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

export default function ExportDataPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [loadingAll, setLoadingAll] = useState(false);

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
