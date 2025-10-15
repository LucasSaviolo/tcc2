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

// Registrando os componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

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
  };

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
          <Button 
            variant="primary"
            onClick={() => window.location.href = '/alocacoes'}
          >
            Nova Alocação
          </Button>
        </div>
      </div>

      {/* Stats */}
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
          <h3 className="text-lg font-medium text-gray-900 mb-6">Crianças Cadastradas por Idade</h3>
          {chartData && (
            <div className="h-80">{/* Aumentei de h-64 para h-80 */}
              {/* Se todos os pontos forem zero, mostramos uma mensagem amigável */}
              {Array.isArray(chartData.datasets?.[0]?.data) && chartData.datasets[0].data.every((v: number) => v === 0) ? (
                <div className="h-80 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="text-lg font-semibold">Sem dados suficientes para exibir o gráfico</div>
                    <div className="text-sm mt-2">Nenhuma alocação registrada nos últimos meses.</div>
                  </div>
                </div>
              ) : (
                <Bar 
                data={{
                  // Usar labels e datasets fornecidos pelo backend (diretamente do banco)
                  labels: chartData.labels || [],
                  datasets: [
                    {
                      label: chartData.datasets?.[0]?.label || 'Dados',
                      data: chartData.datasets?.[0]?.data || [],
                      backgroundColor: chartData.datasets?.[0]?.backgroundColor || [
                        'rgba(99, 102, 241, 0.6)',
                        'rgba(16, 185, 129, 0.6)',
                        'rgba(245, 158, 11, 0.6)',
                        'rgba(239, 68, 68, 0.6)',
                        'rgba(139, 92, 246, 0.6)',
                        'rgba(236, 72, 153, 0.6)'
                      ],
                      borderColor: chartData.datasets?.[0]?.borderColor || [
                        'rgb(99, 102, 241)',
                        'rgb(16, 185, 129)',
                        'rgb(245, 158, 11)',
                        'rgb(239, 68, 68)',
                        'rgb(139, 92, 246)',
                        'rgb(236, 72, 153)'
                      ],
                      borderWidth: 2,
                      borderRadius: 4,
                      borderSkipped: false,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  layout: {
                    padding: {
                      top: 30,
                      bottom: 10,
                      left: 10,
                      right: 10
                    }
                  },
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        font: {
                          size: 12,
                          weight: 'bold',
                        },
                        color: '#374151',
                      }
                    },
                    title: {
                      display: false,
                    },
                    tooltip: {
                      callbacks: {
                        title: function(context: any) {
                          const idade = context[0].label;
                          return `Idade: ${idade} ${idade === '1' ? 'ano' : 'anos'}`;
                        },
                        label: function(context: any) {
                          const count = context.parsed.y;
                          return `${count} criança${count !== 1 ? 's' : ''} cadastrada${count !== 1 ? 's' : ''}`;
                        }
                      },
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleColor: '#fff',
                      bodyColor: '#fff',
                      borderColor: 'rgb(99, 102, 241)',
                      borderWidth: 1,
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      suggestedMax: function(context: any) {
                        const max = Math.max(...context.chart.data.datasets[0].data);
                        return max + Math.ceil(max * 0.15); // Adiciona 15% de espaço extra no topo
                      },
                      ticks: {
                        stepSize: 1,
                        font: {
                          size: 11,
                        },
                        color: '#6B7280',
                      },
                      grid: {
                        color: 'rgba(229, 231, 235, 0.5)',
                      },
                      title: {
                        display: true,
                        text: 'Quantidade de Crianças',
                        font: {
                          size: 12,
                          weight: 'bold',
                        },
                        color: '#374151',
                      }
                    },
                    x: {
                      ticks: {
                        font: {
                          size: 11,
                          weight: 'bold',
                        },
                        color: '#374151',
                      },
                      grid: {
                        display: false,
                      },
                      title: {
                        display: true,
                        text: 'Idade (anos)',
                        font: {
                          size: 12,
                          weight: 'bold',
                        },
                        color: '#374151',
                      }
                    }
                  },
                  elements: {
                    bar: {
                      borderWidth: 2,
                    }
                  },
                  interaction: {
                    intersect: false,
                    mode: 'index',
                  },
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
                            const y = bar.y - 8; // Aumentei o espaço de -5 para -8
                            
                            ctx.fillText(data.toString(), x, y);
                          }
                        });
                      });
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
          {chartData && (
            <div className="h-64 flex items-center justify-center">
              <div style={{ width: '250px', height: '250px' }}>
                <Doughnut 
                  data={{
                    labels: ['Ocupadas', 'Disponíveis'],
                    datasets: [
                        {
                          data: [
                            // Ocupadas = capacidade_total - total_vagas (ambos fornecidos pelo backend)
                            (stats?.capacidade_total ?? 0) - (stats?.total_vagas ?? 0),
                            stats?.total_vagas ?? 0
                          ],
                        backgroundColor: [
                          'rgba(99, 102, 241, 0.5)',
                          'rgba(16, 185, 129, 0.5)',
                        ],
                        borderColor: [
                          'rgb(99, 102, 241)',
                          'rgb(16, 185, 129)',
                        ],
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          font: {
                            size: 12,
                          },
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
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgb(99, 102, 241)',
                        borderWidth: 1,
                      }
                    },
                  }}
                  plugins={[
                    {
                      id: 'percentageLabels',
                      afterDraw: function(chart: any) {
                        const ctx = chart.ctx;
                        const data = chart.data.datasets[0].data;
                        const total = data.reduce((a: number, b: number) => a + b, 0);
                        
                        if (total > 0) {
                          const meta = chart.getDatasetMeta(0);
                          meta.data.forEach((arc: any, index: number) => {
                            const value = data[index];
                            const percentage = ((value * 100) / total).toFixed(1);
                            
                            // Calcular posição no meio do arco
                            const midAngle = (arc.startAngle + arc.endAngle) / 2;
                            const radius = (arc.innerRadius + arc.outerRadius) / 2;
                            const x = arc.x + Math.cos(midAngle) * radius;
                            const y = arc.y + Math.sin(midAngle) * radius;
                            
                            // Configurar texto
                            ctx.save();
                            ctx.fillStyle = '#fff';
                            ctx.font = 'bold 16px Arial';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            
                            // Desenhar sombra do texto para melhor legibilidade
                            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                            ctx.shadowBlur = 4;
                            ctx.shadowOffsetX = 1;
                            ctx.shadowOffsetY = 1;
                            
                            // Desenhar a porcentagem
                            ctx.fillText(`${percentage}%`, x, y);
                            ctx.restore();
                          });
                        }
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
            {recentActions?.slice(0, 5).map((action) => (
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
            )) || (
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

