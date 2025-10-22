import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
import { apiService } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import CriancaForm from '../components/business/CriancaForm';
import type { Crianca, PaginationParams } from '../types';

const Criancas: React.FC = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<PaginationParams>({
    page: 1,
    per_page: 10,
    search: '',
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCrianca, setSelectedCrianca] = useState<Crianca | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewCriancaData, setViewCriancaData] = useState<any>(null);

  // Função para formatar datas
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const { data: criancasData, isLoading, isError, error } = useQuery({
    queryKey: ['criancas', filters],
    queryFn: () => apiService.getCriancas(filters),
    retry: 1,
  });

  // Mutation para desativar criança
  const desativarCriancaMutation = useMutation({
    mutationFn: async (criancaId: number) => {
      // Usar apiService que já trata 422 encerrando alocação
      await apiService.deleteCrianca(criancaId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['criancas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || 'Erro ao desativar criança';
      alert(msg);
    },
  });

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }));
  };

  const handleDesativarCrianca = (criancaId: number, nomeCrianca: string) => {
    if (window.confirm(`Tem certeza que deseja desativar a criança "${nomeCrianca}"?\n\nObservação: se houver alocação ativa, ela será encerrada automaticamente e a criança será desativada.`)) {
      desativarCriancaMutation.mutate(criancaId);
    }
  };

  const handleViewCrianca = async (criancaId: number) => {
    try {
      const result = await apiService.getCrianca(criancaId);
      setViewCriancaData(result);
      setShowViewModal(true);
    } catch (error) {
      console.error('Erro ao carregar dados da criança:', error);
      alert('Erro ao carregar os dados da criança');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    console.error('Erro ao carregar crianças:', error);
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Erro ao carregar dados. Por favor, verifique se o backend está rodando e tente novamente.
            </p>
          </div>
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
            Gestão de Crianças
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie as crianças cadastradas no sistema
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Criança
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nome ou CPF..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              startIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Criança
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Idade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responsável
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Cadastro
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {criancasData?.data ? (
                criancasData.data.map((crianca: Crianca) => (
                <tr key={crianca.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 font-medium text-sm">
                            {crianca.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {crianca.nome}
                        </div>
                        <div className="text-sm text-gray-500">
                          {crianca.cpf || 'CPF não informado'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{crianca.idade} anos</div>
                    <div className="text-sm text-gray-500">
                      {formatDate(crianca.data_nascimento)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {crianca.responsavel?.nome || 'Não informado'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {crianca.responsavel?.telefone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      crianca.alocacao?.status === 'ativa'
                        ? 'bg-green-100 text-green-800'
                        : crianca.fila_espera?.status === 'aguardando'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {crianca.alocacao?.status === 'ativa'
                        ? 'Alocada'
                        : crianca.fila_espera?.status === 'aguardando'
                        ? 'Na Fila'
                        : 'Cadastrada'
                      }
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {crianca.created_at ? formatDate(crianca.created_at) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewCrianca(crianca.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedCrianca(crianca);
                          setShowEditModal(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDesativarCrianca(crianca.id, crianca.nome)}
                        disabled={desativarCriancaMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Nenhuma criança encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {criancasData?.meta?.pagination && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                variant="outline"
                disabled={criancasData.meta.pagination.current_page === 1}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page! - 1 }))}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                disabled={criancasData.meta.pagination.current_page === criancasData.meta.pagination.last_page}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))}
              >
                Próximo
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando{' '}
                  <span className="font-medium">{criancasData.meta.pagination.from}</span>
                  {' '}até{' '}
                  <span className="font-medium">{criancasData.meta.pagination.to}</span>
                  {' '}de{' '}
                  <span className="font-medium">{criancasData.meta.pagination.total}</span>
                  {' '}resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <Button
                    variant="outline"
                    disabled={criancasData.meta.pagination.current_page === 1}
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page! - 1 }))}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    disabled={criancasData.meta.pagination.current_page === criancasData.meta.pagination.last_page}
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))}
                  >
                    Próximo
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Modal para Criar Criança */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Cadastrar Nova Criança"
        size="lg"
      >
        <CriancaForm
          onSuccess={() => setShowCreateModal(false)}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Modal para Editar Criança */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Criança"
        size="lg"
      >
        {selectedCrianca && (
          <CriancaForm
            initialData={{
              id: selectedCrianca.id,
              nome: selectedCrianca.nome,
              data_nascimento: selectedCrianca.data_nascimento,
              cpf: selectedCrianca.cpf,
              responsavel_id: selectedCrianca.responsavel_id,
            }}
            onSuccess={() => setShowEditModal(false)}
            onCancel={() => setShowEditModal(false)}
          />
        )}
      </Modal>

      {/* Modal para Visualizar Criança */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Informações da Criança"
        size="xl"
      >
        {viewCriancaData && (
          <div className="space-y-6">
            {/* Dados Pessoais */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-4 text-gray-900">Dados Pessoais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <p className="mt-1 text-sm text-gray-900">{viewCriancaData.nome}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(viewCriancaData.data_nascimento)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Idade</label>
                  <p className="mt-1 text-sm text-gray-900">{viewCriancaData.idade} anos</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">CPF</label>
                  <p className="mt-1 text-sm text-gray-900">{viewCriancaData.cpf || 'Não informado'}</p>
                </div>
              </div>
            </div>

            {/* Dados do Responsável */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-4 text-gray-900">Responsável</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <p className="mt-1 text-sm text-gray-900">{viewCriancaData.responsavel.nome}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Telefone</label>
                  <p className="mt-1 text-sm text-gray-900">{viewCriancaData.responsavel.telefone}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">E-mail</label>
                  <p className="mt-1 text-sm text-gray-900">{viewCriancaData.responsavel.email}</p>
                </div>
              </div>
            </div>

            {/* Preferências de Creche */}
            {viewCriancaData.preferencias_creche && viewCriancaData.preferencias_creche.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-4 text-gray-900">Preferências de Creche</h3>
                <div className="space-y-2">
                  {viewCriancaData.preferencias_creche.map((preferencia: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                      <span className="text-sm text-gray-900">{preferencia.creche_nome}</span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {preferencia.ordem_preferencia}ª opção
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status na Fila de Espera */}
            {viewCriancaData.fila_espera && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-4 text-gray-900">Fila de Espera</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{viewCriancaData.fila_espera.status}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Posição na Fila</label>
                    <p className="mt-1 text-sm text-gray-900">{viewCriancaData.fila_espera.posicao_fila}ª</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pontuação Total</label>
                    <p className="mt-1 text-sm text-gray-900">{viewCriancaData.fila_espera.pontuacao_total} pontos</p>
                  </div>
                </div>
              </div>
            )}

            {/* Alocação Atual */}
            {viewCriancaData.alocacao && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-4 text-gray-900">Alocação Atual</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Creche</label>
                    <p className="mt-1 text-sm text-gray-900">{viewCriancaData.alocacao.creche_nome}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data de Início</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {viewCriancaData.alocacao.data_inicio ? formatDate(viewCriancaData.alocacao.data_inicio) : 'Não definida'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{viewCriancaData.alocacao.status}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Informações de Sistema */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-4 text-gray-900">Informações do Sistema</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Data de Cadastro</label>
                  <p className="mt-1 text-sm text-gray-900">{new Date(viewCriancaData.created_at).toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Última Atualização</label>
                  <p className="mt-1 text-sm text-gray-900">{new Date(viewCriancaData.updated_at).toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Criancas;

