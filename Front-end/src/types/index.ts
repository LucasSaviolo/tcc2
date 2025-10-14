export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Criterio {
  id: number;
  nome: string;
  descricao: string;
  peso: number;
  ativo: boolean;
  tipo: 'booleano' | 'numerico' | 'texto';
  opcoes?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CriterioFormData {
  id?: number;
  nome: string;
  descricao: string;
  peso: number;
  ativo: boolean;
  tipo: 'booleano' | 'numerico' | 'texto';
  opcoes?: string[];
}

export interface CriterioCrianca {
  id: number;
  crianca_id: number;
  criterio_id: number;
  valor: string | number | boolean;
  pontuacao: number;
  criterio?: Criterio;
  documento_comprovante?: string; // Arquivo de upload para comprovar o critério
  created_at?: string;
  updated_at?: string;
}

export interface Responsavel {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  email?: string;
  endereco: string;
  created_at?: string;
  updated_at?: string;
}

export interface Crianca {
  id: number;
  nome: string;
  data_nascimento: string;
  idade?: number; // Calculado no backend a partir da data de nascimento
  cpf?: string;
  responsavel_id: number;
  responsavel?: Responsavel;
  
  // Novos campos para documentos e preferências
  documentos_matricula?: string[]; // Array de arquivos de documentos de matrícula
  criterios_prioridade?: CriterioCrianca[]; // Múltiplos critérios selecionados
  
  // Preferências de creches (por ordem de prioridade)
  primeira_opcao_creche_id?: number;
  segunda_opcao_creche_id?: number;
  terceira_opcao_creche_id?: number;
  primeira_opcao_creche?: Creche;
  segunda_opcao_creche?: Creche;
  terceira_opcao_creche?: Creche;
  
  criterios?: CriterioCrianca[];
  fila_espera?: FilaEspera;
  alocacao?: Alocacao;
  created_at?: string;
  updated_at?: string;
}

export interface Creche {
  id: number;
  nome: string;
  endereco: string;
  telefone: string;
  capacidade_total: number;
  vagas_disponiveis: number;
  alunos_matriculados?: number; // Campo para simular diferentes ocupações
  idades_aceitas: number[];
  logradouro?: string;
  numero?: string | number;
  bairro?: string;
  cep?: string;
  cidade?: string;
  email_institucional?: string;
  nome_responsavel?: string;
  email_responsavel?: string;
  turnos_disponiveis?: string[] | string;
  ativa: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Turma {
  id: number;
  nome: string;
  creche_id?: number;
  creche?: Creche;
  capacidade?: number;
  vagas_disponiveis?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CriterioAplicado {
  criterio_id: number;
  nome: string;
  peso: number;
  pontuacao: number;
}

export interface FilaEspera {
  id: number;
  crianca_id: number;
  pontuacao_total: number;
  criterios_aplicados: CriterioAplicado[];
  posicao_fila: number;
  data_inscricao: string;
  status: 'aguardando' | 'alocada' | 'desistente';
  crianca?: Crianca;
  created_at?: string;
  updated_at?: string;
}

export interface Alocacao {
  id: number;
  crianca_id: number;
  creche_id: number;
  data_alocacao: string;
  status: 'ativa' | 'finalizada' | 'cancelada';
  observacoes?: string;
  crianca?: Crianca;
  creche?: Creche;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardStats {
  total_fila: number;
  total_vagas: number;
  total_creches: number;
  capacidade_total: number;
  alocacoes_mes: number;
  crescimento_fila: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
  }[];
}

export interface Action {
  id: number;
  type: string;
  description: string;
  created_at: string;
  user?: string;
}

// Form Data Types
export interface CriancaFormData {
  id?: number;
  nome: string;
  data_nascimento: string;
  cpf?: string;
  responsavel_id: number;
  responsavel?: Responsavel;
  
  // Novos campos do formulário
  documentos_matricula?: File[]; // Arquivos para upload
  criterios_prioridade_ids?: number[]; // IDs dos critérios selecionados
  documentos_criterios?: { [criterioId: number]: File }; // Documentos por critério
  
  // Preferências de creches
  primeira_opcao_creche_id?: number;
  segunda_opcao_creche_id?: number;
  terceira_opcao_creche_id?: number;
}

export interface CrecheFormData {
  id?: number;
  nome: string;
  endereco: string;
  telefone: string;
  capacidade_total: number;
  idades_aceitas: number[];
  ativa: boolean;
}

export interface ResponsavelFormData {
  id?: number;
  nome: string;
  cpf: string;
  telefone: string;
  email?: string;
  endereco: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  meta?: {
    pagination?: PaginationMeta;
  };
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    pagination: PaginationMeta;
  };
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

export interface FilterParams extends PaginationParams {
  status?: string;
  idade?: number;
  creche_id?: number;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AlocacaoResult {
  success: boolean;
  alocacoes_realizadas: number;
  detalhes: {
    crianca_id: number;
    creche_id: number;
    nome_crianca: string;
    nome_creche: string;
  }[];
  errors?: string[];
}

// Toast Types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  type?: ToastType;
  duration?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

