import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FileDown, Filter, Calendar, Building2, Users, UserCheck, TrendingUp } from 'lucide-react';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

// opções de gráficos em escopo global do arquivo (usadas também por ReportTab)
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
      const data = await apiService.getRelatorioDashboard();

      // debug: logar payload recebido para diagnosticar problemas
      // (ex.: resposta direta ou envelopada em { dashboard: ... })
      // eslint-disable-next-line no-console
      console.debug('Relatorio dashboard payload:', data);

      // Normaliza payloads que venham como { dashboard: {...}, creches: [...] }
      let payload: any = data;
      if (payload && typeof payload === 'object' && payload.dashboard) {
        payload = payload.dashboard;
      }

      // Usar APENAS os dados vindos do backend (com fallback seguro)
      setDashboardData({
        totalCriancas: payload.totalCriancas ?? payload.total_criancas ?? 0,
        totalCreches: payload.totalCreches ?? payload.total_creches ?? 0,
        totalResponsaveis: payload.totalResponsaveis ?? payload.total_responsaveis ?? 0,
        totalVagasDisponiveis: payload.totalVagasDisponiveis ?? payload.total_vagas_disponiveis ?? 0,
  criancasPorIdade: (payload.criancasPorIdade ?? payload.criancas_por_idade_chart ?? payload.criancas_por_idade) || [],
  criancasPorStatus: (payload.criancasPorStatus ?? payload.criancas_por_status) || [],
  crechesPorRegiao: (payload.crechesPorRegiao ?? payload.creches_por_regiao) || []
      });

      // Definir as creches vindas do backend para o filtro (procura em ambos locais)
      setCreches(data.creches || payload.creches || []);
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

  const blob = await apiService.exportRelatorioPdf(tipo, Object.fromEntries(params));
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
                type="button"
                onClick={() => setActiveTab(tab.id)}
                aria-current={activeTab === tab.id ? 'true' : undefined}
                className={`${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600 font-semibold'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 text-sm flex items-center gap-2`}
              >
                <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400'}`} />
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

          {/* Outros tabs: carregar dados reais do backend por tipo de relatório */}
          {activeTab !== 'dashboard' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Relatório {activeTab}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReportTab
                    tipo={activeTab}
                    filtroCreche={filtroCreche}
                    dataInicio={filtroDataInicio}
                    dataFim={filtroDataFim}
                    onExport={() => exportPDF(activeTab)}
                  />
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

// Componente simples para renderizar dados de cada relatório
const ReportTab: React.FC<{
  tipo: string;
  filtroCreche?: string;
  dataInicio?: string;
  dataFim?: string;
  onExport: () => void;
}> = ({ tipo, filtroCreche, dataInicio, dataFim, onExport }) => {
  const [data, setData] = useState<any>(null);
  const [payloadRaw, setPayloadRaw] = useState<any>(null); // guarda o payload original para detectar `dashboard` e `indicadores`
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  // campos técnicos globais que geralmente escondemos
  const GLOBAL_HIDDEN_FIELDS = ['id', 'created_at', 'updated_at', 'senha', 'password', 'token'];
  // colunas selecionadas pelo usuário (persistidas por tipo de relatório)
  const [selectedCols, setSelectedCols] = useState<string[]>([]);
  // controle do painel de seleção de colunas
  const [colsOpen, setColsOpen] = useState(false);
  const REPORT_COLUMN_CONFIG: Record<string, { visible?: string[]; hidden?: string[]; labelMap?: Record<string,string> }> = {
    // Relatório Geral de Crianças (tabela_simplificada)
    'criancas': {
      visible: ['nome', 'idade', 'status', 'creche_preferencia'],
      hidden: ['cpf', 'id', 'created_at', 'updated_at']
    },
    // Por Creche -> por turma (tabela_simplificada)
    'creches': {
      visible: ['turma', 'vagas_ofertadas', 'ocupadas', 'disponiveis'],
      hidden: ['id', 'created_at', 'updated_at']
    },
    // Responsáveis
    'responsaveis': {
      visible: ['nome', 'cpf', 'telefone', 'email', 'situacao', 'num_criancas_vinculadas'],
      hidden: ['created_at', 'updated_at']
    },
    // Vagas e demandas (creche-level)
    'vagas': {
      visible: ['creche', 'vagas_ofertadas', 'criancas_na_fila', 'ocupacao_percentual'],
      hidden: ['id']
    },
    // Transferências (padrão quando houver dados)
    'transferencias': {
      visible: ['nome', 'status', 'data_solicitacao', 'motivo'],
      hidden: ['id']
    },
    // Estatístico: normalmente retorna objeto de indicadores e rankings (sem tabela)
    'estatistico': {
      visible: [],
      hidden: []
    }
  };
  
  const exportCSV = (rows: any[], visibleKeys?: string[], filename = `relatorio-${tipo}.csv`) => {
    if (!Array.isArray(rows) || rows.length === 0) {
      alert('Nenhum dado para exportar');
      return;
    }
  const keys = visibleKeys && visibleKeys.length ? visibleKeys : Array.from(new Set(rows.flatMap((r: any) => Object.keys(r))));
  const csv = [keys.join(',')].concat(rows.map(r => keys.map(k => `"${String(renderFormattedValue(k, r[k]) ?? '')}"`).join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportXLSX = async (rows: any[], visibleKeys?: string[], filename = `relatorio-${tipo}.xlsx`) => {
    if (!Array.isArray(rows) || rows.length === 0) {
      alert('Nenhum dado para exportar');
      return;
    }
    const XLSX = await import('xlsx');
  const keys = visibleKeys && visibleKeys.length ? visibleKeys : Array.from(new Set(rows.flatMap((r: any) => Object.keys(r))));
  const data = rows.map(r => keys.map(k => renderFormattedValue(k, r[k]) ?? ''));
    const ws = XLSX.utils.aoa_to_sheet([keys, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório');
    XLSX.writeFile(wb, filename);
  };

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filtroCreche) params.append('creche_id', filtroCreche);
        if (dataInicio) params.append('data_inicio', dataInicio);
        if (dataFim) params.append('data_fim', dataFim);

  const queryParams = Object.fromEntries(params);
  const json = await apiService.getRelatorio(mapTipoToEndpoint(tipo), queryParams);

          // Normaliza o payload retornado pelo backend:
          // - se existir `tabela_simplificada` (array) usa como fonte principal
          // - senão, se existir `dados_completos` (array) usa essa
          // - senão, se for um array usa diretamente
          // - caso contrário mantém o objeto (por exemplo `{ dashboard: ..., indicadores: ... }`)
          let payload: any = json.data ?? json;
          setPayloadRaw(payload);
          let finalData: any = payload;

          if (payload && typeof payload === 'object') {
            if (Array.isArray(payload.tabela_simplificada)) {
              finalData = payload.tabela_simplificada;
            } else if (Array.isArray(payload.dados_completos)) {
              finalData = payload.dados_completos;
            }
          }

          if (active) setData(finalData ?? []);
      } catch (err:any) {
        console.error('Erro ao carregar relatório', tipo, err);
        if (active) {
          // seta mensagem de erro como objeto para o ReportTab renderizar
          setData({ __error: err.message || 'Erro ao carregar relatório' });
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchData();
    return () => { active = false; };
  }, [tipo, filtroCreche, dataInicio, dataFim]);

  // inicializa seleção de colunas quando os dados/carregamento mudam
  useEffect(() => {
    if (!Array.isArray(data)) return;
  const allKeys = Array.from(new Set(data.flatMap((row: any) => Object.keys(row))));
    // aplicar configuração por tipo se houver
    const cfg = REPORT_COLUMN_CONFIG[tipo];
    let keys = allKeys.filter(k => !GLOBAL_HIDDEN_FIELDS.includes(k));
    if (cfg) {
      if (cfg.visible && cfg.visible.length) keys = cfg.visible.filter(k => allKeys.includes(k));
      else if (cfg.hidden && cfg.hidden.length) keys = keys.filter(k => !cfg.hidden!.includes(k));
    }
    try {
      const raw = localStorage.getItem(`relatorio_cols_${tipo}`);
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        setSelectedCols(parsed.filter(k => keys.includes(k)));
        return;
      }
    } catch {}
    // seleção padrão: primeiras colunas
    setSelectedCols(keys.slice(0, Math.min(8, keys.length)));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(data), tipo]);

  // persiste seleção quando muda
  useEffect(() => {
    try { localStorage.setItem(`relatorio_cols_${tipo}`, JSON.stringify(selectedCols)); } catch {}
  }, [selectedCols, tipo]);

  if (loading) return <p>Carregando relatório...</p>;
  // quando não há dados — permitir export mesmo sem linhas
  if (!data || (Array.isArray(data) && data.length === 0)) return (
    <div>
      <p className="text-gray-600 mb-4">Nenhum dado disponível para este relatório.</p>
      <div className="flex justify-end">
        <Button onClick={onExport} className="flex items-center gap-2">
          <FileDown className="h-4 w-4" /> Exportar PDF
        </Button>
      </div>
    </div>
  );

  // Renderizar tabela simples quando houver array de objetos
  if (Array.isArray(data)) {
    // Paginação e detalhes por linha
    // esconder campos técnicos por padrão e mapear labels amigáveis
    const HIDDEN_FIELDS = ['id', 'created_at', 'updated_at', 'senha', 'password', 'token'];
    const LABEL_MAP: Record<string, string> = {
      // crianças / gerais
      nome: 'Nome',
      idade: 'Idade',
      status: 'Status',
      creche_preferencia: 'Creche (preferência)',
      responsavel: 'Responsável',
      turma: 'Turma',
      nome_turma: 'Turma',
      data_nascimento: 'Data de Nascimento',
      // contato / responsável
      telefone: 'Telefone',
      email: 'E-mail',
      cpf: 'CPF',
      situacao: 'Situação',
      num_criancas_vinculadas: 'Crianças vinculadas',
      // vagas / creches
      creche: 'Creche',
      vagas_ofertadas: 'Vagas ofertadas',
      vagas_disponiveis: 'Vagas disponíveis',
      ocupadas: 'Ocupadas',
      disponiveis: 'Disponíveis',
      criancas_na_fila: 'Crianças na fila',
      ocupacao_percentual: 'Ocupação (%)',
      capacidade_total: 'Capacidade total',
      cidade: 'Cidade',
      telefone_institucional: 'Telefone (creche)'
    };

    const allKeys = Array.from(new Set(data.flatMap((row: any) => Object.keys(row))));
    // aplicar configuração por tipo se houver
    const cfg = REPORT_COLUMN_CONFIG[tipo];
    let keys = allKeys.filter(k => !HIDDEN_FIELDS.includes(k));
    if (cfg) {
      if (cfg.visible && cfg.visible.length) {
        keys = cfg.visible.filter(k => allKeys.includes(k));
      } else if (cfg.hidden && cfg.hidden.length) {
        keys = keys.filter(k => !cfg.hidden!.includes(k));
      }
      // mescla labels do config
      Object.assign(LABEL_MAP, cfg.labelMap || {});
    }
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const pageData = data.slice((page - 1) * pageSize, page * pageSize);
  const displayKeys = (selectedCols && selectedCols.length) ? selectedCols : keys;

    const toggleRow = (idx: number) => {
      setExpandedRows(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    return (
      <div>
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Colunas visíveis</div>
            <div className="flex items-center gap-2">
              <button onClick={() => setColsOpen(o => !o)} className="text-sm text-primary-600 underline">{colsOpen ? 'Fechar' : 'Editar'} colunas</button>
              <button onClick={() => setSelectedCols(keys.slice())} className="text-sm px-2 py-1 border rounded">Selecionar tudo</button>
              <button onClick={() => setSelectedCols([])} className="text-sm px-2 py-1 border rounded">Limpar</button>
            </div>
          </div>
          {colsOpen && (
            <div className="mt-3 flex flex-wrap gap-2">
              {keys.map(k => (
                <label key={k} className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={selectedCols.includes(k)} onChange={(e) => {
                    if (e.target.checked) setSelectedCols(prev => Array.from(new Set([...prev, k])));
                    else setSelectedCols(prev => prev.filter(x => x !== k));
                  }} />
                  <span>{LABEL_MAP[k] ?? formatHeaderLabel(k)}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr>
                {displayKeys.map((k) => (
                  <th key={k} className="px-4 py-2 text-left text-sm text-gray-600">{LABEL_MAP[k] ?? formatHeaderLabel(k)}</th>
                ))}
                <th className="px-4 py-2 text-left text-sm text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((row: any, idx: number) => {
                const globalIdx = (page - 1) * pageSize + idx;
                return (
                  <React.Fragment key={globalIdx}>
                    <tr className="border-t">
                      {displayKeys.map((k) => (
                        <td key={k} className="px-4 py-2 text-sm text-gray-700">{renderFormattedValue(k, row[k])}</td>
                      ))}
                      <td className="px-4 py-2 text-sm text-gray-700">
                        <div className="flex gap-2">
                          <Button onClick={() => toggleRow(globalIdx)} variant="outline" className="text-xs">{expandedRows[globalIdx] ? 'Esconder' : 'Ver'}</Button>
                        </div>
                      </td>
                    </tr>
                    {expandedRows[globalIdx] && (
                      <tr>
                        <td colSpan={keys.length + 1} className="bg-gray-50 p-4">
                          <pre className="text-xs overflow-auto">{JSON.stringify(row, null, 2)}</pre>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Paginação simples */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">Mostrando {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, data.length)} de {data.length}</div>
          <div className="flex gap-2">
            <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Anterior</Button>
            <Button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Próxima</Button>
          </div>
        </div>

          <div className="flex justify-end mt-4 gap-2">
          <Button onClick={() => exportCSV(data, displayKeys)} className="flex items-center gap-2">
            CSV
          </Button>
          <Button onClick={() => exportXLSX(data, displayKeys)} className="flex items-center gap-2">
            XLSX
          </Button>
          <Button onClick={() => onExport()} className="flex items-center gap-2">
            <FileDown className="h-4 w-4" /> Exportar PDF
          </Button>
        </div>
      </div>
    );
  }

  // Caso seja objeto com métricas (por exemplo { dashboard: ..., indicadores: ... })
  if (payloadRaw && typeof payloadRaw === 'object' && payloadRaw.dashboard) {
    const dash = payloadRaw.dashboard;
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent>
              <p className="text-sm text-gray-500">Total de Crianças</p>
              <p className="text-2xl font-bold">{dash.total_criancas ?? dash.totalCriancas ?? '-'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-sm text-gray-500">Total de Creches</p>
              <p className="text-2xl font-bold">{dash.total_creches ?? dash.totalCreches ?? '-'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-sm text-gray-500">Total de Responsáveis</p>
              <p className="text-2xl font-bold">{dash.total_responsaveis ?? dash.totalResponsaveis ?? '-'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-sm text-gray-500">Faixa etária mais frequente</p>
              <p className="text-2xl font-bold">{dash.faixa_etaria_mais_frequente ?? dash.most_frequent_age ?? '-'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Se houver gráficos analíticos, renderizar */}
        {payloadRaw.criancas_por_idade_chart && (
          <Card>
            <CardHeader>
              <CardTitle>Crianças por Faixa Etária</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Pie
                  data={{
                    labels: payloadRaw.criancas_por_idade_chart.map((i: any) => `${i.faixa_etaria ?? i.idade} anos`),
                    datasets: [{ data: payloadRaw.criancas_por_idade_chart.map((i: any) => i.total), backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'] }]
                  }}
                  options={pieChartOptions}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Exibir indicadores completos (se houver) */}
        {payloadRaw.indicadores && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Indicadores</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-gray-50 p-4 rounded">{JSON.stringify(payloadRaw.indicadores, null, 2)}</pre>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={onExport} className="flex items-center gap-2">
            <FileDown className="h-4 w-4" /> Exportar PDF
          </Button>
        </div>
      </div>
    );
  }

  // Caso seja outro objeto sem dashboard, exibir JSON para inspeção
  return (
    <div>
      <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(payloadRaw ?? data, null, 2)}</pre>
      <div className="flex justify-end mt-4">
        <Button onClick={onExport} className="flex items-center gap-2">
          <FileDown className="h-4 w-4" /> Exportar PDF
        </Button>
      </div>
    </div>
  );
};

function formatHeaderLabel(k: string) {
  // transforma snake_case e camelCase em labels amigáveis
  if (!k) return '';
  const fromSnake = k.replace(/_/g, ' ');
  const spaced = fromSnake.replace(/([a-z])([A-Z])/g, '$1 $2');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function mapTipoToEndpoint(tipo: string) {
  switch (tipo) {
    case 'criancas': return 'geral-criancas';
    case 'creches': return 'por-creche';
    case 'responsaveis': return 'responsaveis';
    case 'vagas': return 'vagas-demandas';
    case 'transferencias': return 'transferencias';
    case 'estatistico': return 'estatistico';
    default: return 'geral-criancas';
  }
}



// formatação por tipo de campo/coluna
function formatPercent(v: any) {
  if (v === null || v === undefined || v === '') return '';
  const num = Number(v);
  if (Number.isNaN(num)) return String(v);
  return `${(num * 100).toFixed(2)}%`;
}

function formatPhone(v: any) {
  if (!v) return '';
  const s = String(v).replace(/\D/g, '');
  if (s.length === 11) return s.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  if (s.length === 10) return s.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  return v;
}

function formatCPF(v: any) {
  if (!v) return '';
  const s = String(v).replace(/\D/g, '');
  if (s.length === 11) return s.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  return v;
}

function formatDateIso(v: any) {
  if (!v) return '';
  try {
    return new Date(v).toLocaleDateString();
  } catch {
    return String(v);
  }
}

// versão atualizada que formata com base no nome da chave quando possível
function renderFormattedValue(key: string, value: any) {
  if (value === null || value === undefined) return '';
  const lower = key.toLowerCase();
  if (lower.includes('percent') || lower.includes('ocupacao') || lower.includes('percentual')) return formatPercent(value);
  if (lower.includes('cpf')) return formatCPF(value);
  if (lower.includes('telefone') || lower.includes('tel')) return formatPhone(value);
  if (/data_|_at$|_date|date/.test(lower) || (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value))) return formatDateIso(value);
  // objetos e arrays continuam com a heurística anterior
  if (typeof value === 'object') {
    if (value.nome) return value.nome;
    if (value.id && value.nome === undefined) return String(value.id);
    return JSON.stringify(value);
  }
  return String(value);
}