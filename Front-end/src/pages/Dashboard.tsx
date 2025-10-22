import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Building, Clock, TrendingUp, UserCheck, AlertTriangle } from 'lucide-react';
import { apiService } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Normaliza e agrega dados do gráfico (rótulos duplicados, ordenação numérica quando possível)
function normalizeChartData(raw: any): { labels: string[]; data: number[] } {
  if (!raw || !Array.isArray(raw.labels) || !Array.isArray(raw.datasets?.[0]?.data)) {
    return { labels: [], data: [] };
  }

  const labels: any[] = raw.labels;
  const values: number[] = raw.datasets[0].data.map((v: any) => Number(v) || 0);

  const map = new Map<string, number>();
  labels.forEach((label, idx) => {
    const key = String(label);
    const val = values[idx] ?? 0;
    map.set(key, (map.get(key) || 0) + val);
  });

  const entries = Array.from(map.entries());
  const isNumeric = entries.every(([k]) => /^\d+$/.test(k));
  const sorted = isNumeric ? entries.sort((a, b) => Number(a[0]) - Number(b[0])) : entries;

  return {
    labels: sorted.map(([k]) => k),
    data: sorted.map(([, v]) => v),
  };
}

interface StatsCardProps {
  title: string;
  value: number;
  change?: number;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    red: 'text-red-600 bg-red-100',
  } as const;

  return (
    <Card hover className="p-6">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{value.toLocaleString()}</p>
            {change !== undefined && (
              <p className={`ml-2 flex items-baseline text-sm font-semibold ${
                change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className="h-4 w-4 mr-1" />
                {change >= 0 ? '+' : ''}{change}%
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiService.getDashboardStats(),
  });

  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['dashboard-chart'],
    queryFn: () => apiService.getDashboardChart(),
  });

  const { data: recentActions } = useQuery({
    queryKey: ['recent-actions'],
    queryFn: () => apiService.getRecentActions(),
  });

  // Preparação e métricas do gráfico de barras
  const normalized = React.useMemo(() => normalizeChartData(chartData), [chartData]);
  const isNumericLabels = React.useMemo(() => normalized.labels.every(l => /^\d+$/.test(l)), [normalized]);
  const totalBar = React.useMemo(() => normalized.data.reduce((a, b) => a + b, 0), [normalized]);
  const avgBar = React.useMemo(() => normalized.data.length ? totalBar / normalized.data.length : 0, [normalized, totalBar]);
  const chartHeading = isNumericLabels ? 'Crianças Cadastradas por Idade' : 'Resumo das alocações';
  const xAxisTitle = isNumericLabels ? 'Idade (anos)' : 'Mês';
  const yAxisTitle = isNumericLabels ? 'Quantidade de Crianças' : 'Quantidade de Alocações';
  const datasetLabel = isNumericLabels ? 'Qtd. de Crianças' : 'Qtd. de Alocações';

  // Métricas do donut (status das vagas)
  const capacidadeTotal = stats?.capacidade_total ?? 0;
  const ocupadas = (stats as any)?.ocupadas ?? Math.max(0, capacidadeTotal - (stats?.total_vagas ?? 0));
  const taxaOcupacao = capacidadeTotal > 0 ? (ocupadas * 100) / capacidadeTotal : 0;
  const ySuggestedMax = React.useMemo(() => {
    const max = normalized.data.length ? Math.max(...normalized.data) : 0;
    return max + Math.ceil(max * 0.15);
  }, [normalized]);

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                  <div className="ml-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Visão geral do sistema de alocação de creches
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Button variant="primary" onClick={() => window.location.href = '/alocacoes'}>
            Nova Alocação
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Crianças"
          value={(stats as any)?.total_criancas ?? (stats as any)?.totalCriancas ?? 0}
          icon={<Users className="h-6 w-6" />}
          color="blue"
        />
        <StatsCard
          title="Total na Fila"
          value={stats?.total_fila || 0}
          change={stats?.crescimento_fila}
          icon={<Clock className="h-6 w-6" />}
          color="yellow"
        />
        <StatsCard
          title="Vagas Disponíveis"
          value={stats?.total_vagas || 0}
          icon={<Building className="h-6 w-6" />}
          color="green"
        />
        <StatsCard
          title="Total de Creches"
          value={stats?.total_creches || 0}
          icon={<Building className="h-6 w-6" />}
          color="blue"
        />
        <StatsCard
          title="Alocações do Mês"
          value={stats?.alocacoes_mes || 0}
          icon={<UserCheck className="h-6 w-6" />}
          color="green"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Distribution Chart */}
        <Card className="p-6">
          <div className="mb-2">
            <h3 className="text-lg font-medium text-gray-900">{chartHeading}</h3>
            <div className="mt-1 text-sm text-gray-600 flex items-center gap-3">
              <span>Total: <strong>{totalBar}</strong></span>
              <span className="hidden sm:inline">•</span>
              <span>Média mensal: <strong>{avgBar.toFixed(1)}</strong></span>
            </div>
          </div>
          {(chartData && normalized.labels.length > 0) && (
            <div className="h-80">
              {normalized.data.every((v: number) => v === 0) ? (
                <div className="h-80 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="text-lg font-semibold">Sem dados suficientes para exibir o gráfico</div>
                    <div className="text-sm mt-2">Nenhuma alocação registrada nos últimos meses.</div>
                  </div>
                </div>
              ) : (
                <Bar 
                  data={{
                    labels: normalized.labels,
                    datasets: [
                      {
                        label: datasetLabel,
                        data: normalized.data,
                        backgroundColor: (ctx: any) => {
                          const { ctx: c, chartArea } = ctx.chart;
                          if (!chartArea) return 'rgba(99, 102, 241, 0.85)';
                          const gradient = c.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                          gradient.addColorStop(0, 'rgba(129, 140, 248, 0.45)'); // indigo-400
                          gradient.addColorStop(1, 'rgba(79, 70, 229, 0.95)'); // indigo-600
                          return gradient;
                        },
                        borderColor: 'rgba(67, 56, 202, 1)', // indigo-700
                        borderWidth: 2,
                        borderRadius: 10,
                        borderSkipped: false,
                        maxBarThickness: 46,
                        categoryPercentage: 0.62,
                        barPercentage: 0.9,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: {
                      padding: { top: 36, bottom: 10, left: 10, right: 10 }
                    },
                    plugins: {
                      legend: { display: false },
                      title: { display: false },
                      tooltip: {
                        callbacks: {
                          title: (context: any) => {
                            const raw = context?.[0]?.label ?? '';
                            const labelStr = String(raw);
                            if (isNumericLabels) {
                              const n = Number(labelStr);
                              return `Idade: ${n} ${n === 1 ? 'ano' : 'anos'}`;
                            }
                            return `Mês: ${labelStr}`;
                          },
                          label: (context: any) => {
                            const count = context.parsed.y;
                            if (isNumericLabels) {
                              return `${count} criança${count !== 1 ? 's' : ''} cadastrada${count !== 1 ? 's' : ''}`;
                            }
                            return `${count} alocação${count !== 1 ? 'es' : ''}`;
                          }
                        },
                        backgroundColor: 'rgba(17, 24, 39, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(67, 56, 202, 0.8)',
                        borderWidth: 1,
                        padding: 10,
                        displayColors: false,
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        suggestedMax: ySuggestedMax,
                        ticks: { stepSize: 1, font: { size: 11 }, color: '#6B7280' },
                        grid: { color: 'rgba(229, 231, 235, 0.6)' },
                        border: { display: false },
                        title: { display: true, text: yAxisTitle, font: { size: 12, weight: 'bold' }, color: '#374151' }
                      },
                      x: {
                        ticks: { font: { size: 11, weight: 'bold' }, color: '#374151', maxRotation: 0, autoSkip: true, autoSkipPadding: 8 },
                        grid: { display: false },
                        border: { display: false },
                        title: { display: true, text: xAxisTitle, font: { size: 12, weight: 'bold' }, color: '#374151' }
                      }
                    },
                    elements: { bar: { borderWidth: 2 } },
                    interaction: { intersect: false, mode: 'index' },
                  }}
                  plugins={[
                    {
                      id: 'dataLabels',
                      afterDatasetsDraw: function(chart: any) {
                        const ctx = chart.ctx;
                        chart.data.datasets.forEach((dataset: any, i: number) => {
                          const meta = chart.getDatasetMeta(i);
                          meta.data.forEach((bar: any, index: number) => {
                            const data = dataset.data[index];
                            if (data > 0) {
                              ctx.fillStyle = '#374151';
                              ctx.font = 'bold 11px Arial';
                              ctx.textAlign = 'center';
                              ctx.textBaseline = 'bottom';
                              const x = bar.x;
                              const y = bar.y - 8;
                              ctx.fillText(data.toString(), x, y);
                            }
                          });
                        });
                      }
                    },
                    {
                      id: 'avgLine',
                      afterDatasetsDraw: (chart: any) => {
                        const { ctx, chartArea, scales } = chart;
                        const yScale = scales?.y;
                        if (!chartArea || !yScale || !isFinite(avgBar)) return;
                        const y = yScale.getPixelForValue(avgBar);
                        ctx.save();
                        ctx.strokeStyle = 'rgba(107, 114, 128, 0.6)';
                        ctx.setLineDash([6, 4]);
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(chartArea.left, y);
                        ctx.lineTo(chartArea.right, y);
                        ctx.stroke();
                        ctx.setLineDash([]);
                        ctx.fillStyle = '#6B7280';
                        ctx.font = 'bold 10px Arial';
                        ctx.textAlign = 'right';
                        ctx.fillText(`Média: ${avgBar.toFixed(1)}`, chartArea.right, y - 6);
                        ctx.restore();
                      }
                    }
                  ]}
                />
              )}
            </div>
          )}
          {chartLoading && (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="mt-2 h-4 w-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          )}
        </Card>

        {/* Status Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Status das Vagas</h3>
          {capacidadeTotal === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-600">
              <div className="text-center">
                <div className="text-base font-medium">Sem turmas ativas ou capacidade cadastrada</div>
                <div className="text-sm mt-1">Cadastre turmas e defina capacidade para visualizar o status de vagas.</div>
              </div>
            </div>
          ) : chartData && (
            <div className="h-64 flex items-center justify-center">
              <div style={{ width: '250px', height: '250px' }}>
                <Doughnut 
                  data={{
                    labels: ['Ocupadas', 'Disponíveis'],
                    datasets: [
                      {
                        data: [ocupadas, stats?.total_vagas ?? 0],
                        backgroundColor: [
                          'rgba(79, 70, 229, 0.9)',
                          'rgba(16, 185, 129, 0.85)',
                        ],
                        borderColor: ['#fff', '#fff'],
                        borderWidth: 2,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          usePointStyle: true,
                          boxWidth: 8,
                          boxHeight: 8,
                          padding: 16,
                          font: { size: 12 },
                          color: '#374151',
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context: any) {
                            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                            const percentage = total > 0 ? ((context.parsed * 100) / total).toFixed(1) : '0';
                            return `${context.label}: ${context.parsed} vagas (${percentage}%)`;
                          }
                        },
                        backgroundColor: 'rgba(17, 24, 39, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(67, 56, 202, 0.8)',
                        borderWidth: 1,
                      }
                    },
                  }}
                  plugins={[
                    {
                      id: 'centerText',
                      afterDraw: function(chart: any) {
                        const meta = chart.getDatasetMeta(0);
                        if (!meta?.data?.length) return;
                        const ctx = chart.ctx;
                        const centerX = meta.data[0].x;
                        const centerY = meta.data[0].y;
                        ctx.save();
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = '#111827';
                        ctx.font = 'bold 22px Arial';
                        ctx.fillText(`${Math.round(taxaOcupacao)}%`, centerX, centerY - 6);
                        ctx.font = 'normal 11px Arial';
                        ctx.fillStyle = '#6B7280';
                        ctx.fillText('ocupação', centerX, centerY + 12);
                        ctx.restore();
                      }
                    }
                  ]}
                />
              </div>
            </div>
          )}
          {chartLoading && (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-32 w-32 bg-gray-200 rounded-full"></div>
                <div className="mt-4 h-4 w-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ações Recentes</h3>
          <div className="space-y-4">
            {recentActions && recentActions.length > 0 ? (
              recentActions.slice(0, 5).map((action) => (
                <div key={action.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary-600" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900">{action.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(action.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">Nenhuma ação recente</p>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h3>
          <div className="space-y-3">
            <Button 
              fullWidth 
              variant="outline" 
              className="justify-start"
              onClick={() => window.location.href = '/criancas'}
            >
              <Users className="h-4 w-4 mr-2" />
              Cadastrar Nova Criança
            </Button>
            <Button 
              fullWidth 
              variant="outline" 
              className="justify-start"
              onClick={() => window.location.href = '/creches'}
            >
              <Building className="h-4 w-4 mr-2" />
              Cadastrar Nova Creche
            </Button>
            <Button 
              fullWidth 
              variant="outline" 
              className="justify-start"
              onClick={() => window.location.href = '/fila'}
            >
              <Clock className="h-4 w-4 mr-2" />
              Recalcular Fila de Espera
            </Button>
            <Button 
              fullWidth 
              variant="outline" 
              className="justify-start"
              onClick={() => window.location.href = '/alocacoes'}
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Executar Alocação Automática
            </Button>
          </div>
        </Card>
      </div>

      {/* Alerts */}
      {stats && stats.total_vagas < 10 && (
        <Card className="p-4 border-l-4 border-yellow-400 bg-yellow-50">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Atenção:</strong> Poucas vagas disponíveis ({stats.total_vagas}). 
                Considere adicionar mais creches ou aumentar a capacidade.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;

