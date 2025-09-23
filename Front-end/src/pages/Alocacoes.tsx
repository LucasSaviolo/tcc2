import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiService } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import type { PaginationParams } from '../types';

const AlocacoesPage: React.FC = () => {
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState<PaginationParams>({
    page: 1,
    per_page: 10,
  });

  const { data: alocacoesData, isLoading, isError, error } = useQuery({
    queryKey: ['alocacoes', filters],
    queryFn: () => apiService.getAlocacoes(filters),
    retry: 1,
  });

  const executarAlocacaoMutation = useMutation({
    mutationFn: () => apiService.executarAlocacao(),
    onSuccess: (data) => {
      toast.success(`${data.alocacoes_realizadas} alocações realizadas com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ['alocacoes'] });
      queryClient.invalidateQueries({ queryKey: ['fila-espera'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: any) => {
      console.error('Erro na alocação:', error);
      const errorMessage = error?.response?.data?.message || 'Erro ao executar alocações. Tente novamente.';
      toast.error(errorMessage);
    }
  });

  const handleExecutarAlocacao = () => {
    executarAlocacaoMutation.mutate();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string, label: string }> = {
      'ativa': { color: 'bg-green-100 text-green-800', label: 'Ativa' },
      'finalizada': { color: 'bg-blue-100 text-blue-800', label: 'Finalizada' },
      'cancelada': { color: 'bg-red-100 text-red-800', label: 'Cancelada' }
    };

    const statusInfo = statusMap[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
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
    console.error('Erro ao carregar alocações:', error);
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
              Erro ao carregar dados de alocações. Por favor, verifique se o backend está rodando e tente novamente.
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
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate">
            Alocações
          </h2>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Button
            onClick={handleExecutarAlocacao}
            className="ml-3"
            disabled={executarAlocacaoMutation.isPending}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {executarAlocacaoMutation.isPending ? 'Executando...' : 'Executar Alocação'}
          </Button>
        </div>
      </div>

      {/* Resultados da última alocação */}
      {executarAlocacaoMutation.isSuccess && executarAlocacaoMutation.data && (
        <Card>
          <h3 className="text-lg font-semibold mb-2">Resultado da Alocação</h3>
          <p className="mb-4">
            {executarAlocacaoMutation.data.alocacoes_realizadas} alocações realizadas com sucesso!
          </p>
          
          {executarAlocacaoMutation.data?.detalhes?.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Criança
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Creche
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {executarAlocacaoMutation.data.detalhes.map((detalhe) => (
                    <tr key={`${detalhe.crianca_id}-${detalhe.creche_id}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {detalhe.nome_crianca}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {detalhe.nome_creche}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {executarAlocacaoMutation.data?.errors && executarAlocacaoMutation.data.errors.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 rounded border border-red-200">
              <h4 className="text-sm font-semibold text-red-800 mb-2">Erros encontrados:</h4>
              <ul className="list-disc pl-5">
                {executarAlocacaoMutation.data.errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-700">{error}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {/* Lista de Alocações */}
      <Card>
        {!alocacoesData?.data || alocacoesData.data.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhuma alocação encontrada.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Criança
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Creche
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data de Alocação
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {alocacoesData?.data.map((alocacao) => (
                  <tr key={alocacao.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {alocacao.crianca?.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {alocacao.creche?.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(alocacao.data_alocacao)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getStatusBadge(alocacao.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginação */}
        {alocacoesData && alocacoesData.meta && alocacoesData.meta.pagination && alocacoesData.meta.pagination.total > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex flex-col sm:flex-row justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  variant="outline"
                  disabled={alocacoesData.meta.pagination.current_page === 1}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page! - 1 }))}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  disabled={alocacoesData.meta.pagination.current_page === alocacoesData.meta.pagination.last_page}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))}
                >
                  Próximo
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando{' '}
                    <span className="font-medium">{alocacoesData.meta.pagination.from}</span>
                    {' '}até{' '}
                    <span className="font-medium">{alocacoesData.meta.pagination.to}</span>
                    {' '}de{' '}
                    <span className="font-medium">{alocacoesData.meta.pagination.total}</span>
                    {' '}resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <Button
                      variant="outline"
                      disabled={alocacoesData.meta.pagination.current_page === 1}
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page! - 1 }))}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Anterior</span>
                      <ChevronUp className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="outline"
                      disabled={alocacoesData.meta.pagination.current_page === alocacoesData.meta.pagination.last_page}
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Próximo</span>
                      <ChevronDown className="h-5 w-5" />
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AlocacoesPage;

