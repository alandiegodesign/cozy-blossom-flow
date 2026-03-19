import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Download, Loader2, Database, Users, Code2, Key,
  FileText, ArrowLeft, CheckCircle, Table2, HardDrive, Copy, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function downloadCsv(filename: string, rows: Record<string, any>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map(r => headers.map(h => {
      const val = r[h];
      const str = val === null || val === undefined ? '' : String(val);
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(','))
  ].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const TABLE_NAMES = ['profiles', 'user_roles', 'events', 'ticket_locations', 'orders', 'order_items'] as const;

const EDGE_FUNCTIONS = [
  'create-checkout', 'get-events', 'get-stripe-key',
  'purge-deleted-events', 'verify-payment', 'admin-credentials',
];

export default function ExportDataPage() {
  const { session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState<Record<string, boolean>>({});

  const setStatus = (key: string, isLoading: boolean, isDone?: boolean) => {
    setLoading(p => ({ ...p, [key]: isLoading }));
    if (isDone !== undefined) setDone(p => ({ ...p, [key]: isDone }));
  };

  const exportTable = async (table: string) => {
    setStatus(table, true);
    try {
      const { data, error } = await supabase.from(table as any).select('*');
      if (error) throw error;
      if (!data?.length) {
        toast({ title: `Tabela "${table}" está vazia`, variant: 'destructive' });
        setStatus(table, false);
        return;
      }
      downloadCsv(`${table}.csv`, data);
      setStatus(table, false, true);
      toast({ title: `${table}.csv exportado com sucesso!` });
    } catch (e: any) {
      toast({ title: `Erro ao exportar ${table}`, description: e.message, variant: 'destructive' });
      setStatus(table, false);
    }
  };

  const exportAllTables = async () => {
    for (const table of TABLE_NAMES) {
      await exportTable(table);
    }
  };

  const exportSecrets = async () => {
    if (!session?.access_token) return;
    setStatus('secrets', true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-credentials', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      const rows: Record<string, string>[] = [];
      if (data.project_url) rows.push({ key: 'SUPABASE_URL', value: data.project_url });
      if (data.anon_key) rows.push({ key: 'SUPABASE_ANON_KEY', value: data.anon_key });
      if (data.service_role_key) rows.push({ key: 'SUPABASE_SERVICE_ROLE_KEY', value: data.service_role_key });
      Object.entries(data.secrets || {}).forEach(([k, v]) => rows.push({ key: k, value: v as string }));
      if (!rows.length) {
        toast({ title: 'Nenhum secret encontrado', variant: 'destructive' });
        setStatus('secrets', false);
        return;
      }
      downloadCsv('secrets.csv', rows);
      setStatus('secrets', false, true);
      toast({ title: 'secrets.csv exportado!' });
    } catch (e: any) {
      toast({ title: 'Erro ao exportar secrets', description: e.message, variant: 'destructive' });
      setStatus('secrets', false);
    }
  };

  const exportEdgeFunctions = () => {
    setStatus('edge_functions', true);
    const rows = EDGE_FUNCTIONS.map(name => ({ function_name: name, url: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${name}` }));
    downloadCsv('edge_functions.csv', rows);
    setStatus('edge_functions', false, true);
    toast({ title: 'edge_functions.csv exportado!' });
  };

  const exportDatabaseSchema = async () => {
    if (!session?.access_token) return;
    setStatus('schema', true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-credentials', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      const tables = data.database_tables || [];
      if (!tables.length) {
        toast({ title: 'Nenhuma tabela encontrada', variant: 'destructive' });
        setStatus('schema', false);
        return;
      }
      downloadCsv('database_schema.csv', tables);
      setStatus('schema', false, true);
      toast({ title: 'database_schema.csv exportado!' });
    } catch (e: any) {
      toast({ title: 'Erro ao exportar schema', description: e.message, variant: 'destructive' });
      setStatus('schema', false);
    }
  };

  const exportDbFunctions = async () => {
    if (!session?.access_token) return;
    setStatus('db_functions', true);
    try {
      const { data: creds, error: credErr } = await supabase.functions.invoke('admin-credentials', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (credErr) throw credErr;
      // We use admin-credentials edge function which already uses exec_sql
      // Fetch function list via the existing admin client
      const adminClient = (await import('@supabase/supabase-js')).createClient(
        creds.project_url,
        creds.service_role_key
      );
      const { data: fns } = await adminClient.rpc('exec_sql', {
        sql_query: `SELECT routine_name, routine_type, data_type as return_type FROM information_schema.routines WHERE routine_schema='public' ORDER BY routine_name`
      });
      if (!fns?.length) {
        toast({ title: 'Nenhuma função encontrada', variant: 'destructive' });
        setStatus('db_functions', false);
        return;
      }
      downloadCsv('database_functions.csv', fns);
      setStatus('db_functions', false, true);
      toast({ title: 'database_functions.csv exportado!' });
    } catch (e: any) {
      toast({ title: 'Erro ao exportar funções', description: e.message, variant: 'destructive' });
      setStatus('db_functions', false);
    }
  };

  const exportStorageInfo = () => {
    setStatus('storage', true);
    const rows = [{ bucket_name: 'avatars', is_public: 'true', description: 'Fotos de perfil dos usuários' }];
    downloadCsv('storage_buckets.csv', rows);
    setStatus('storage', false, true);
    toast({ title: 'storage_buckets.csv exportado!' });
  };

  const ExportButton = ({ id, label, icon: Icon, onClick }: { id: string; label: string; icon: any; onClick: () => void }) => (
    <Button
      variant={done[id] ? 'secondary' : 'outline'}
      className="justify-start h-auto py-3 px-4"
      disabled={loading[id]}
      onClick={onClick}
    >
      {loading[id] ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2 shrink-0" />
      ) : done[id] ? (
        <CheckCircle className="h-4 w-4 text-green-500 mr-2 shrink-0" />
      ) : (
        <Icon className="h-4 w-4 mr-2 shrink-0" />
      )}
      <span className="text-sm">{label}</span>
    </Button>
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Exportar Dados</h1>
          <p className="text-sm text-muted-foreground">Exporte todos os dados do projeto em CSV</p>
        </div>
      </div>

      <div className="grid gap-4">
        {/* Database Tables */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-5 w-5 text-primary" /> Tabelas do Banco
            </CardTitle>
            <CardDescription>Exporte cada tabela individualmente ou todas de uma vez</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={exportAllTables} disabled={Object.values(loading).some(Boolean)} className="w-full mb-3">
              <Download className="h-4 w-4 mr-2" /> Exportar Todas as Tabelas
            </Button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TABLE_NAMES.map(table => (
                <ExportButton key={table} id={table} label={table} icon={Table2} onClick={() => exportTable(table)} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Schema & Functions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-primary" /> Schema & Funções
            </CardTitle>
            <CardDescription>Estrutura do banco e funções customizadas</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <ExportButton id="schema" label="Schema do Banco" icon={Database} onClick={exportDatabaseSchema} />
            <ExportButton id="db_functions" label="Funções do Banco" icon={Code2} onClick={exportDbFunctions} />
          </CardContent>
        </Card>

        {/* Edge Functions, Secrets, Storage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Key className="h-5 w-5 text-primary" /> Infraestrutura
            </CardTitle>
            <CardDescription>Edge Functions, Secrets e Storage</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <ExportButton id="edge_functions" label="Edge Functions" icon={Code2} onClick={exportEdgeFunctions} />
            <ExportButton id="secrets" label="Secrets" icon={Key} onClick={exportSecrets} />
            <ExportButton id="storage" label="Storage Buckets" icon={HardDrive} onClick={exportStorageInfo} />
          </CardContent>
        </Card>

        {/* SQL Schema Download */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-primary" /> Schema SQL Completo
            </CardTitle>
            <CardDescription>Arquivo SQL para recriar todo o banco em outra instância</CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/database-schema.sql" download>
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" /> Download database-schema.sql
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
