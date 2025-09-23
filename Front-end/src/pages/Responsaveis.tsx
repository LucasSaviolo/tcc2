import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Edit, Trash2, Eye, User, Phone, Mail } from 'lucide-react';
import { apiService } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ResponsavelForm from '../components/business/ResponsavelForm';
import type { Responsavel, PaginationParams } from '../types';

const Responsaveis: React.FC = () => {
  const [filters, setFilters] = useState<PaginationParams>({
    page: 1,
    per_page: 10,
    search: '',
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedResponsavel, setSelectedResponsavel] = useState<Responsavel | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: responsaveis, isLoading, isError, error } = useQuery({
    queryKey: ['responsaveis', filters],
    queryFn: () => apiService.getResponsaveis(),
    retry: 1,
  });

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
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
    console.error('Erro ao carregar responsáveis:', error);
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
            Gestão de Responsáveis
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie os responsáveis cadastrados no sistema
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Responsável
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
                  Responsável
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Endereço
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
              {responsaveis && responsaveis.length > 0 ? (
                responsaveis.map((responsavel: Responsavel) => (
                <tr key={responsavel.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {responsavel.nome}
                        </div>
                        <div className="text-sm text-gray-500">
                          CPF: {responsavel.cpf}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {responsavel.telefone}
                    </div>
                    {responsavel.email && (
                      <div className="text-sm text-gray-500 flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {responsavel.email}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {responsavel.endereco}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(responsavel.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedResponsavel(responsavel);
                          setShowEditModal(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Nenhum responsável encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal para Criar Responsável */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Cadastrar Novo Responsável"
        size="lg"
      >
        <ResponsavelForm
          onSuccess={() => setShowCreateModal(false)}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Modal para Editar Responsável */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Responsável"
        size="lg"
      >
        {selectedResponsavel && (
          <ResponsavelForm
            onSuccess={() => setShowEditModal(false)}
            onCancel={() => setShowEditModal(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default Responsaveis;

