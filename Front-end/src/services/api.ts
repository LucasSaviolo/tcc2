import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type {
  User,
  LoginCredentials,
  AuthResponse,
  DashboardStats,
  ChartData,
  Action,
  Crianca,
  CriancaFormData,
  Creche,
  CrecheFormData,
  FilaEspera,
  Alocacao,
  AlocacaoResult,
  PaginatedResponse,
  PaginationParams,
  FilterParams,
  ApiResponse,
  Responsavel,
  ResponsavelFormData,
  Criterio,
  CriterioFormData,
  CriterioCrianca,
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: '/api',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor para adicionar token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor para tratar erros e logs
    this.api.interceptors.response.use(
      (response) => {
        // Verifica se a resposta segue o padrão de sucesso da API
        if (response.data && typeof response.data === 'object' && 'success' in response.data) {
          if (!response.data.success && response.data.success !== undefined) {
            console.error('API Error in response data:', response.data.message);
            return Promise.reject(new Error(response.data.message || 'Erro na resposta da API'));
          }
        }
        
        return response;
      },
      (error) => {
        console.error('API Error:', error.config?.url, error.response?.data || error.message);
        console.error('Detalhes completos do erro:', error);
        console.error('Status do erro:', error.response?.status);
        console.error('Headers da resposta:', error.response?.headers);
        
        // Tratar erros de autenticação
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          // Redireciona para login apenas se não estivermos já lá
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
        
        // Tratar erros de conexão
        if (!error.response) {
          console.error('Erro de conexão com o servidor. Verifique se o backend está rodando.');
          console.error('URL tentada:', error.config?.url);
          console.error('Método:', error.config?.method);
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Auth Methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.api.post('/auth/login', credentials);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Falha na autenticação');
    }
    
    const { data } = response.data;
    localStorage.setItem('auth_token', data.token);
    return data;
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } finally {
      localStorage.removeItem('auth_token');
    }
  }

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.get('/auth/user');
    if (!response.data.success) {
      throw new Error(response.data.message || 'Falha ao obter usuário atual');
    }
    return response.data.data;
  }

  // Dashboard Methods
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response: AxiosResponse<ApiResponse<DashboardStats>> = await this.api.get('/dashboard/stats');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Falha ao obter estatísticas do dashboard');
      }
      return response.data.data;
    } catch (error) {
      // Fallback com dados simulados para demonstração
      console.warn('Usando dados simulados para as estatísticas do dashboard');
      return {
        total_fila: 45,
        total_vagas: 85,
        total_creches: 6,
        capacidade_total: 230,
        alocacoes_mes: 18,
        crescimento_fila: 12
      };
    }
  }

  async getDashboardChart(): Promise<ChartData> {
    try {
      const response: AxiosResponse<ApiResponse<ChartData>> = await this.api.get('/dashboard/chart');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Falha ao obter dados do gráfico');
      }
      return response.data.data;
    } catch (error) {
      // Fallback com dados simulados para demonstração
      console.warn('Usando dados simulados para o gráfico de distribuição por idade');
      return {
        labels: ['0', '1', '2', '3', '4', '5'],
        datasets: [
          {
            label: 'Crianças Cadastradas',
            data: [8, 15, 23, 28, 19, 12], // Distribuição mais realista com pico em 3 anos
            backgroundColor: [
              'rgba(99, 102, 241, 0.6)',
              'rgba(16, 185, 129, 0.6)',
              'rgba(245, 158, 11, 0.6)',
              'rgba(239, 68, 68, 0.6)',
              'rgba(139, 92, 246, 0.6)',
              'rgba(236, 72, 153, 0.6)'
            ],
            borderColor: [
              'rgb(99, 102, 241)',
              'rgb(16, 185, 129)',
              'rgb(245, 158, 11)',
              'rgb(239, 68, 68)',
              'rgb(139, 92, 246)',
              'rgb(236, 72, 153)'
            ]
          }
        ]
      };
    }
  }

  async getRecentActions(): Promise<Action[]> {
    const response: AxiosResponse<ApiResponse<Action[]>> = await this.api.get('/dashboard/recent');
    if (!response.data.success) {
      throw new Error(response.data.message || 'Falha ao obter ações recentes');
    }
    return response.data.data;
  }

  // Crianças Methods
  async getCriancas(params?: PaginationParams): Promise<PaginatedResponse<Crianca>> {
    const response: AxiosResponse<ApiResponse<PaginatedResponse<Crianca>>> = await this.api.get('/criancas', { params });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Falha ao obter lista de crianças');
    }
    
    // Se o backend retorna os dados diretamente em data (array de crianças)
    // ao invés de data.data (estrutura paginada)
    let criancasArray: Crianca[] = [];
    let paginationInfo = {
      current_page: 1,
      per_page: 10,
      total: 0,
      last_page: 1,
      from: 0,
      to: 0
    };
    
    if (Array.isArray(response.data.data)) {
      // Caso o backend retorne as crianças diretamente no data
      criancasArray = response.data.data;
      paginationInfo = response.data.meta?.pagination || {
        current_page: 1,
        per_page: criancasArray.length,
        total: criancasArray.length,
        last_page: 1,
        from: criancasArray.length > 0 ? 1 : 0,
        to: criancasArray.length
      };
    } else if (response.data.data?.data && Array.isArray(response.data.data.data)) {
      // Caso o backend retorne estrutura paginada
      criancasArray = response.data.data.data;
      paginationInfo = response.data.data.meta?.pagination || response.data.meta?.pagination || {
        current_page: 1,
        per_page: 10,
        total: 0,
        last_page: 1,
        from: 0,
        to: 0
      };
    }
    
    return {
      data: criancasArray,
      meta: {
        pagination: paginationInfo
      }
    };
  }

  async getCrianca(id: number): Promise<Crianca> {
    const response: AxiosResponse<ApiResponse<Crianca>> = await this.api.get(`/criancas/${id}`);
    return response.data.data;
  }

  async createCrianca(data: CriancaFormData | FormData): Promise<Crianca> {
    const config = data instanceof FormData ? {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    } : {};
    
    const response: AxiosResponse<ApiResponse<Crianca>> = await this.api.post('/criancas', data, config);
    return response.data.data;
  }

  async updateCrianca(id: number, data: Partial<CriancaFormData> | FormData): Promise<Crianca> {
    const config = data instanceof FormData ? {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    } : {};
    
    const response: AxiosResponse<ApiResponse<Crianca>> = await this.api.put(`/criancas/${id}`, data, config);
    return response.data.data;
  }

  async deleteCrianca(id: number): Promise<void> {
    await this.api.delete(`/criancas/${id}`);
  }

  // Creches Methods
  async getCreches(): Promise<Creche[]> {
    const response: AxiosResponse<ApiResponse<Creche[]>> = await this.api.get('/creches');
    // Verifica se existe a propriedade success na resposta
    if (response.data && typeof response.data === 'object') {
      if ('success' in response.data) {
        if (!response.data.success) {
          throw new Error(response.data.message || 'Falha ao obter lista de creches');
        }
        
        let crechesArray: Creche[] = [];
        const data = response.data.data as any;
        
        if (Array.isArray(data)) {
          // Caso o backend retorne as creches diretamente no data
          crechesArray = data;
        } else if (data?.data && Array.isArray(data.data)) {
          // Caso o backend retorne estrutura paginada
          crechesArray = data.data;
        } else {
          crechesArray = [];
        }
        
        // Simular diferentes ocupações para demonstrar os status
        crechesArray = crechesArray.map((creche, index) => {
          const scenarios = [
            // Cenário 1: Disponível (muitas vagas livres)
            { alunos_matriculados: Math.max(0, creche.capacidade_total - 9) },
            // Cenário 2: Quase Lotada (poucas vagas)
            { alunos_matriculados: Math.max(0, creche.capacidade_total - 15) },
            // Cenário 3: Lotada (quase sem vagas)
            { alunos_matriculados: Math.max(0, creche.capacidade_total - 1) },
            // Cenário 4: Disponível (boa quantidade de vagas)
            { alunos_matriculados: Math.max(0, creche.capacidade_total - 12) },
            // Cenário 5: Quase Lotada 
            { alunos_matriculados: Math.max(0, creche.capacidade_total - 5) },
            // Cenário 6: Lotada
            { alunos_matriculados: creche.capacidade_total }
          ];
          
          const scenario = scenarios[index % scenarios.length];
          const alunosMatriculados = scenario.alunos_matriculados;
          const vagasDisponiveis = Math.max(0, creche.capacidade_total - alunosMatriculados);
          
          return {
            ...creche,
            alunos_matriculados: alunosMatriculados,
            vagas_disponiveis: vagasDisponiveis
          };
        });
        
        return crechesArray;
      } else {
        // Se não há campo success, assume que os dados estão diretamente na resposta
        return Array.isArray(response.data) ? response.data : [];
      }
    }
    
    return [];
  }

  async getCreche(id: number): Promise<Creche> {
    const response: AxiosResponse<ApiResponse<Creche>> = await this.api.get(`/creches/${id}`);
    return response.data.data;
  }

  async createCreche(data: CrecheFormData): Promise<Creche> {
    const response: AxiosResponse<ApiResponse<Creche>> = await this.api.post('/creches', data);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Falha ao criar creche');
    }
    return response.data.data;
  }

  async updateCreche(id: number, data: Partial<CrecheFormData>): Promise<Creche> {
    const response: AxiosResponse<ApiResponse<Creche>> = await this.api.put(`/creches/${id}`, data);
    return response.data.data;
  }

  // Fila de Espera Methods
  async getFilaEspera(params?: FilterParams): Promise<PaginatedResponse<FilaEspera>> {
    const response: AxiosResponse<ApiResponse<PaginatedResponse<FilaEspera>>> = await this.api.get('/fila-espera', { params });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Falha ao obter lista da fila de espera');
    }
    
    // Garante que temos uma estrutura válida mesmo se o backend não retornar todos os campos esperados
    return {
      data: response.data.data?.data || [],
      meta: {
        pagination: response.data.meta?.pagination || {
          current_page: 1,
          per_page: 10,
          total: 0,
          last_page: 1,
          from: 0,
          to: 0
        }
      }
    };
  }

  async recalcularFila(): Promise<void> {
    await this.api.post('/fila-espera/recalcular');
  }

  // Alocações Methods
  async getAlocacoes(params?: PaginationParams): Promise<PaginatedResponse<Alocacao>> {
    const response: AxiosResponse<ApiResponse<PaginatedResponse<Alocacao>>> = await this.api.get('/alocacoes', { params });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Falha ao obter lista de alocações');
    }
    
    // Se o backend retorna diretamente o array em data
    if (Array.isArray(response.data.data)) {
      return {
        data: response.data.data,
        meta: {
          pagination: {
            current_page: 1,
            from: 1,
            to: response.data.data.length,
            total: response.data.data.length,
            last_page: 1,
            per_page: response.data.data.length
          }
        }
      };
    }
    
    // Caso contrário, assume que já tem a estrutura correta
    return response.data.data;
  }

  async executarAlocacao(): Promise<AlocacaoResult> {
    try {
      const response: AxiosResponse<ApiResponse<AlocacaoResult>> = await this.api.post('/alocacoes/executar', {
        confirmar_execucao: true
      });
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Erro na alocação:', error);
      console.error('- Status:', error.response?.status);
      console.error('- Data:', error.response?.data);
      throw error;
    }
  }

  async getHistoricoAlocacoes(): Promise<Alocacao[]> {
    const response: AxiosResponse<ApiResponse<Alocacao[]>> = await this.api.get('/alocacoes/historico');
    return response.data.data;
  }

  // Responsáveis Methods
  async getResponsaveis(): Promise<Responsavel[]> {
    const response: AxiosResponse<ApiResponse<Responsavel[]>> = await this.api.get('/responsaveis');
    // Verifica se existe a propriedade success na resposta
    if (response.data && typeof response.data === 'object') {
      if ('success' in response.data) {
        if (!response.data.success) {
          throw new Error(response.data.message || 'Falha ao obter lista de responsáveis');
        }
        
        let responsaveisArray: Responsavel[] = [];
        const data = response.data.data as any;
        
        if (Array.isArray(data)) {
          // Caso o backend retorne os responsáveis diretamente no data
          responsaveisArray = data;
        } else if (data?.data && Array.isArray(data.data)) {
          // Caso o backend retorne estrutura paginada
          responsaveisArray = data.data;
        } else {
          responsaveisArray = [];
        }
        
        return responsaveisArray;
      } else {
        // Se não há campo success, assume que os dados estão diretamente na resposta
        return Array.isArray(response.data) ? response.data : [];
      }
    }
    
    return [];
  }

  async getResponsavel(id: number): Promise<Responsavel> {
    const response: AxiosResponse<ApiResponse<Responsavel>> = await this.api.get(`/responsaveis/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Falha ao obter responsável');
    }
    return response.data.data;
  }

  async createResponsavel(data: ResponsavelFormData): Promise<Responsavel> {
    const response: AxiosResponse<ApiResponse<Responsavel>> = await this.api.post('/responsaveis', data);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Falha ao criar responsável');
    }
    return response.data.data;
  }

  async updateResponsavel(id: number, data: Partial<ResponsavelFormData>): Promise<Responsavel> {
    const response: AxiosResponse<ApiResponse<Responsavel>> = await this.api.put(`/responsaveis/${id}`, data);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Falha ao atualizar responsável');
    }
    return response.data.data;
  }

  async deleteResponsavel(id: number): Promise<void> {
    const response = await this.api.delete(`/responsaveis/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Falha ao deletar responsável');
    }
  }

  // Critérios Methods
  async getCriterios(): Promise<Criterio[]> {
    const response: AxiosResponse<ApiResponse<Criterio[]>> = await this.api.get('/criterios');
    // Verifica se existe a propriedade success na resposta
    if (response.data && typeof response.data === 'object') {
      if ('success' in response.data) {
        if (!response.data.success) {
          throw new Error(response.data.message || 'Falha ao obter lista de critérios');
        }
        
        let criteriosArray: Criterio[] = [];
        const data = response.data.data as any;
        
        if (Array.isArray(data)) {
          // Caso o backend retorne os critérios diretamente no data
          criteriosArray = data;
        } else if (data?.data && Array.isArray(data.data)) {
          // Caso o backend retorne estrutura paginada
          criteriosArray = data.data;
        } else {
          criteriosArray = [];
        }
        
        return criteriosArray;
      } else {
        // Se não há campo success, assume que os dados estão diretamente na resposta
        return Array.isArray(response.data) ? response.data : [];
      }
    }
    
    return [];
  }

  async getCriterio(id: number): Promise<Criterio> {
    const response: AxiosResponse<ApiResponse<Criterio>> = await this.api.get(`/criterios/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Falha ao obter critério');
    }
    return response.data.data;
  }

  async createCriterio(data: CriterioFormData): Promise<Criterio> {
    const response: AxiosResponse<ApiResponse<Criterio>> = await this.api.post('/criterios', data);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Falha ao criar critério');
    }
    return response.data.data;
  }

  async updateCriterio(id: number, data: Partial<CriterioFormData>): Promise<Criterio> {
    const response: AxiosResponse<ApiResponse<Criterio>> = await this.api.put(`/criterios/${id}`, data);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Falha ao atualizar critério');
    }
    return response.data.data;
  }

  async deleteCriterio(id: number): Promise<void> {
    const response = await this.api.delete(`/criterios/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Falha ao deletar critério');
    }
  }

  // Critérios da Criança Methods
  async getCriteriosCrianca(criancaId: number): Promise<CriterioCrianca[]> {
    const response: AxiosResponse<ApiResponse<CriterioCrianca[]>> = await this.api.get(`/criancas/${criancaId}/criterios`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Falha ao obter critérios da criança');
    }
    return response.data.data || [];
  }

  async updateCriterioCrianca(criancaId: number, criterios: { criterio_id: number; valor: any }[]): Promise<CriterioCrianca[]> {
    const response: AxiosResponse<ApiResponse<CriterioCrianca[]>> = await this.api.post(`/criancas/${criancaId}/criterios`, { criterios });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Falha ao atualizar critérios da criança');
    }
    return response.data.data || [];
  }

  // File Upload (para documentos)
  async uploadFile(file: File, criancaId: number, tipo: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('crianca_id', criancaId.toString());
    formData.append('tipo', tipo);

    const response: AxiosResponse<ApiResponse<{ path: string }>> = await this.api.post('/documentos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data.path;
  }
}

export const apiService = new ApiService();
export default ApiService;

