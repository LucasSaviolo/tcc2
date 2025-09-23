import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FileDown, Filter, Calendar, Building2, Users, UserCheck, TrendingUp } from 'lucide-react';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

interface DashboardData {
  totalCriancas: number;
  totalCreches: number;
  totalResponsaveis: number;
  totalVagasDisponiveis: number;
  criancasPorIdade: any[];
  criancasPorStatus: any[];
  crechesPorRegiao: any[];
}

interface Creche {
  id: number;
  nome: string;
}

const Relatorios: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [creches, setCreches] = useState<Creche[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtroCreche, setFiltroCreche] = useState('');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');

  // Simulação de busca de dados
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/relatorios/dashboard');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Usar APENAS os dados vindos do backend
      setDashboardData({
        totalCriancas: data.totalCriancas || 0,
        totalCreches: data.totalCreches || 0,
        totalResponsaveis: data.totalResponsaveis || 0,
        totalVagasDisponiveis: data.totalVagasDisponiveis || 0,
        criancasPorIdade: data.criancasPorIdade || [],
        criancasPorStatus: data.criancasPorStatus || [],
        crechesPorRegiao: data.crechesPorRegiao || []
      });

      // Definir as creches vindas do backend para o filtro
      setCreches(data.creches || []);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      // Em caso de erro, definir dados vazios em vez de dados mockados
      setDashboardData({
        totalCriancas: 0,
        totalCreches: 0,
        totalResponsaveis: 0,
        totalVagasDisponiveis: 0,
        criancasPorIdade: [],
        criancasPorStatus: [],
        crechesPorRegiao: []
      });
      setCreches([]);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = async (tipo: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtroCreche) params.append('creche_id', filtroCreche);
      if (filtroDataInicio) params.append('data_inicio', filtroDataInicio);
      if (filtroDataFim) params.append('data_fim', filtroDataFim);

      const response = await fetch(`http://127.0.0.1:8000/api/relatorios/pdf/${tipo}?${params}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-${tipo}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Erro ao exportar PDF');
    } finally {
      setLoading(false);
    }
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Estatísticas do Sistema',
      },
    },
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'dashboard', name: 'Dashboard Principal', icon: TrendingUp },
              { id: 'criancas', name: 'Relatório Geral', icon: Users },
              { id: 'creches', name: 'Por Creche', icon: Building2 },
              { id: 'responsaveis', name: 'Responsáveis', icon: UserCheck },
              { id: 'vagas', name: 'Vagas e Demandas', icon: Calendar },
              { id: 'transferencias', name: 'Transferências', icon: FileDown },
              { id: 'estatistico', name: 'Estatístico', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Filters */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Creche</label>
              <select
                value={filtroCreche}
                onChange={(e) => setFiltroCreche(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todas as creches</option>
                {creches.map((creche) => (
                  <option key={creche.id} value={creche.id.toString()}>
                    {creche.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <Input
                label="Data Início"
                type="date"
                value={filtroDataInicio}
                onChange={(e) => setFiltroDataInicio(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Input
                label="Data Fim"
                type="date"
                value={filtroDataFim}
                onChange={(e) => setFiltroDataFim(e.target.value)}
              />
            </div>
            <Button
              onClick={() => fetchDashboardData()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtrar
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'dashboard' && dashboardData && (
            <div className="space-y-6">
              {/* Cards de estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Users className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Total de Crianças</p>
                        <p className="text-2xl font-bold text-gray-900">{dashboardData.totalCriancas}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Building2 className="h-8 w-8 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Total de Creches</p>
                        <p className="text-2xl font-bold text-gray-900">{dashboardData.totalCreches}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <UserCheck className="h-8 w-8 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Total de Responsáveis</p>
                        <p className="text-2xl font-bold text-gray-900">{dashboardData.totalResponsaveis}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Calendar className="h-8 w-8 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Vagas Disponíveis</p>
                        <p className="text-2xl font-bold text-gray-900">{dashboardData.totalVagasDisponiveis}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Gráficos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Crianças por Faixa Etária</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <Pie
                        data={{
                          labels: dashboardData.criancasPorIdade?.map(item => `${item.idade || item.faixa_etaria} anos`) || [],
                          datasets: [{
                            data: dashboardData.criancasPorIdade?.map(item => item.total) || [],
                            backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'],
                          }]
                        }}
                        options={pieChartOptions}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Status das Crianças</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <Bar
                        data={{
                          labels: dashboardData.criancasPorStatus?.map(item => item.status) || [],
                          datasets: [{
                            label: 'Quantidade',
                            data: dashboardData.criancasPorStatus?.map(item => item.total) || [],
                            backgroundColor: '#3B82F6',
                          }]
                        }}
                        options={barChartOptions}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => exportPDF('dashboard')}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <FileDown className="h-4 w-4" />
                  {loading ? 'Exportando...' : 'Exportar PDF'}
                </Button>
              </div>
            </div>
          )}

          {/* Outros tabs com conteúdo similar */}
          {activeTab !== 'dashboard' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Relatório {activeTab}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Este relatório será carregado dinamicamente com dados do backend.
                  </p>
                  <div className="flex justify-end">
                    <Button
                      onClick={() => exportPDF(activeTab)}
                      disabled={loading}
                      className="flex items-center gap-2"
                    >
                      <FileDown className="h-4 w-4" />
                      {loading ? 'Exportando...' : 'Exportar PDF'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Relatorios;