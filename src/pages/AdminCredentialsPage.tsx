import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminCredentialsPage() {
  const { session } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Credenciais do Projeto</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" /> Modo Demonstração
          </CardTitle>
          <CardDescription>
            Este projeto está rodando em modo mockado sem banco de dados.
            Não há credenciais reais para exibir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Para usar credenciais reais, conecte o projeto a um banco de dados.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
