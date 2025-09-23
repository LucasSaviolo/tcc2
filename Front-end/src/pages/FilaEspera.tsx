import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Filter, RefreshCw, ChevronUp, ChevronDown, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiService } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { hasNestedProperty } from '../utils/objectUtils';
import type { FilterParams, FilaEspera } from '../types';

const FilaEsperaPage: React.FC = () => {
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState<FilterParams>({
    page: 1,
    per_page: 10,
    search: '',
    status: 'aguardando',
  });

  const { data: filaData, isLoading, isError, error } = useQuery({
    queryKey: ['fila-espera', filters],
    queryFn: () => apiService.getFilaEspera(filters),
    retry: 1,
  });

  const recalcularMutation = useMutation({
    mutationFn: () => apiService.recalcularFila(),
    onSuccess: () => {
      toast.success('Fila recalculada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['fila-espera'] });
    },
    onError: () => {
      toast.error('Erro ao recalcular a fila. Tente novamente.');
    }
  });

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }));
  };

  const handleRecalcular = () => {
    recalcularMutation.mutate();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string, label: string }> = {
      'aguardando': { color: 'bg-yellow-100 text-yellow-800', label: 'Aguardando' },
      'alocada': { color: 'bg-green-100 text-green-800', label: 'Alocada' },
      'desistente': { color: 'bg-gray-100 text-gray-800', label: 'Desistente' }
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
    console.error('Erro ao carregar fila de espera:', error);
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
              Erro ao carregar dados da fila de espera. Por favor, verifique se o backend está rodando e tente novamente.
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
            Fila de Espera
          </h2>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Button
            onClick={handleRecalcular}
            className="ml-3"
            disabled={recalcularMutation.isPending}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {recalcularMutation.isPending ? 'Recalculando...' : 'Recalcular Fila'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <Input
              placeholder="Buscar por nome da criança..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              leftIcon={<Search className="h-5 w-5 text-gray-400" />}
            />
          </div>
          <div className="w-full md:w-48">
            <Select
              value={filters.status || ''}
              onChange={handleStatusChange}
              leftIcon={<Filter className="h-5 w-5 text-gray-400" />}
            >
              <option value="">Todos os status</option>
              <option value="aguardando">Aguardando</option>
              <option value="alocada">Alocada</option>
              <option value="desistente">Desistente</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Lista */}
      <Card>
        {!filaData?.data || filaData.data.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhuma criança na fila de espera encontrada.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posição
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Criança
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Idade
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pontuação
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data de Inscrição
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Detalhes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filaData?.data.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.posicao_fila}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.crianca?.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.crianca?.idade} anos
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.pontuacao_total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(item.data_inscricao)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        className="text-primary-600 hover:text-primary-900 transition-colors"
                        title="Ver detalhes"
                      >
                        <Info className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginação */}
        {filaData && filaData.meta && filaData.meta.pagination && filaData.meta.pagination.total > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex flex-col sm:flex-row justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  variant="outline"
                  disabled={filaData.meta.pagination.current_page === 1}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page! - 1 }))}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  disabled={filaData.meta.pagination.current_page === filaData.meta.pagination.last_page}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))}
                >
                  Próximo
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando{' '}
                    <span className="font-medium">{filaData.meta.pagination.from}</span>
                    {' '}até{' '}
                    <span className="font-medium">{filaData.meta.pagination.to}</span>
                    {' '}de{' '}
                    <span className="font-medium">{filaData.meta.pagination.total}</span>
                    {' '}resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <Button
                      variant="outline"
                      disabled={filaData.meta.pagination.current_page === 1}
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page! - 1 }))}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Anterior</span>
                      <ChevronUp className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="outline"
                      disabled={filaData.meta.pagination.current_page === filaData.meta.pagination.last_page}
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

export default FilaEsperaPage;

