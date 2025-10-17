import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Users, Clock, Eye, Edit, Trash2, School, Filter } from 'lucide-react';
import { apiService } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import TurmaForm from '../components/business/TurmaForm';
import toast from 'react-hot-toast';
import type { Turma, TurmaFormData, Creche } from '../types';

const Turmas: React.FC = () => {
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [query, setQuery] = useState('');
  const [crecheFilter, setCrecheFilter] = useState<number | ''>('');
  const [turnoFilter, setTurnoFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const queryClient = useQueryClient();

  // Buscar turmas
  const { data: turmasResponse, isLoading, isError, error } = useQuery({
    queryKey: ['turmas'],
    queryFn: () => apiService.getTurmas(),
    retry: 1,
  });

  // Buscar creches para o filtro
  const { data: crechesResponse } = useQuery({
    queryKey: ['creches'],
    queryFn: () => apiService.getCreches(),
  });

  const turmas: Turma[] = Array.isArray(turmasResponse) 
    ? turmasResponse 
    : (turmasResponse?.data || []);

  const creches: Creche[] = Array.isArray(crechesResponse) 
    ? crechesResponse 
    : ((crechesResponse as any)?.data || []);

  // Mutation para criar turma
  const createMutation = useMutation({
    mutationFn: (data: TurmaFormData) => apiService.createTurma(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turmas'] });
      toast.success('Turma cadastrada com sucesso!');
      setShowCreateModal(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao cadastrar turma');
    },
  });

  // Mutation para atualizar turma
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TurmaFormData }) => 
      apiService.updateTurma(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turmas'] });
      toast.success('Turma atualizada com sucesso!');
      setShowEditModal(false);
      setSelectedTurma(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao atualizar turma');
    },
  });

  // Mutation para deletar turma
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiService.deleteTurma(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turmas'] });
      toast.success('Turma excluída com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao excluir turma');
    },
  });

  // Filtrar turmas
  const filteredTurmas = turmas.filter((t) => {
    // Filtro por texto
    if (query) {
      const q = query.toLowerCase();
      const matchNome = (t.nome || '').toLowerCase().includes(q);
      const matchCreche = (t.creche?.nome || '').toLowerCase().includes(q);
      if (!matchNome && !matchCreche) return false;
    }

    // Filtro por creche
    if (crecheFilter && t.creche_id !== crecheFilter) return false;

    // Filtro por turno
    if (turnoFilter && t.turno !== turnoFilter) return false;

    // Filtro por status
    if (statusFilter === 'ativa' && !t.ativa) return false;
    if (statusFilter === 'inativa' && t.ativa) return false;

    return true;
  });

  const handleCreate = (data: TurmaFormData) => {
    createMutation.mutate(data);
  };

  const handleEdit = (data: TurmaFormData) => {
    if (selectedTurma) {
      updateMutation.mutate({ id: selectedTurma.id, data });
    }
  };

  const handleDelete = (turma: Turma) => {
    if (window.confirm(`Tem certeza que deseja excluir a turma "${turma.nome}"?`)) {
      deleteMutation.mutate(turma.id);
    }
  };

  const handleViewDetails = (turma: Turma) => {
    setSelectedTurma(turma);
    setShowDetailsModal(true);
  };

  const handleEditClick = (turma: Turma) => {
    setSelectedTurma(turma);
    setShowEditModal(true);
  };

  const getTurnoLabel = (turno: string) => {
    switch (turno) {
      case 'manha': return 'Manhã';
      case 'tarde': return 'Tarde';
      case 'integral': return 'Integral';
      default: return turno;
    }
  };

  const getTurnoBadgeColor = (turno: string) => {
    switch (turno) {
      case 'manha': return 'bg-yellow-100 text-yellow-800';
      case 'tarde': return 'bg-orange-100 text-orange-800';
      case 'integral': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (turma: Turma) => {
    if (!turma.ativa) {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
          Inativa
        </span>
      );
    }

    const ocupacao = turma.criancas_matriculadas || 0;
    const capacidade = turma.capacidade || 1;
    const percentual = (ocupacao / capacidade) * 100;

    if (percentual >= 100) {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          Lotada
        </span>
      );
    } else if (percentual >= 80) {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
          Quase Lotada
        </span>
      );
    } else {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Disponível
        </span>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando turmas...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">
          Erro ao carregar turmas: {error instanceof Error ? error.message : 'Erro desconhecido'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Turmas</h1>
          <p className="text-gray-600 mt-1">
            Gerencie as turmas das creches municipais
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Turma
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nome da turma ou creche..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            
            <select
              value={crecheFilter}
              onChange={(e) => setCrecheFilter(e.target.value ? Number(e.target.value) : '')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas as Creches</option>
              {creches.map((creche) => (
                <option key={creche.id} value={creche.id}>
                  {creche.nome}
                </option>
              ))}
            </select>

            <select
              value={turnoFilter}
              onChange={(e) => setTurnoFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os Turnos</option>
              <option value="manha">Manhã</option>
              <option value="tarde">Tarde</option>
              <option value="integral">Integral</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os Status</option>
              <option value="ativa">Ativa</option>
              <option value="inativa">Inativa</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Turmas</p>
              <p className="text-2xl font-bold text-gray-900">{filteredTurmas.length}</p>
            </div>
            <School className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Turmas Ativas</p>
              <p className="text-2xl font-bold text-green-600">
                {filteredTurmas.filter(t => t.ativa).length}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Vagas</p>
              <p className="text-2xl font-bold text-blue-600">
                {filteredTurmas.reduce((sum, t) => sum + (t.capacidade || 0), 0)}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Crianças Matriculadas</p>
              <p className="text-2xl font-bold text-purple-600">
                {filteredTurmas.reduce((sum, t) => sum + (t.criancas_matriculadas || 0), 0)}
              </p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Lista de Turmas */}
      {filteredTurmas.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <School className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma turma encontrada
            </h3>
            <p className="text-gray-600 mb-4">
              {query || crecheFilter || turnoFilter || statusFilter
                ? 'Tente ajustar os filtros de busca.'
                : 'Comece cadastrando uma nova turma.'}
            </p>
            {!query && !crecheFilter && !turnoFilter && !statusFilter && (
              <Button
                variant="primary"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Turma
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTurmas.map((turma) => (
            <Card key={turma.id} className="hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Cabeçalho do Card */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {turma.nome}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <School className="w-4 h-4" />
                      {turma.creche?.nome || 'Creche não informada'}
                    </p>
                  </div>
                  {getStatusBadge(turma)}
                </div>

                {/* Informações da Turma */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>Faixa Etária: {turma.idade_minima} a {turma.idade_maxima} anos</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTurnoBadgeColor(turma.turno)}`}>
                      {getTurnoLabel(turma.turno)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>
                      Capacidade: {turma.criancas_matriculadas || 0}/{turma.capacidade || 0}
                    </span>
                  </div>

                  {/* Barra de Ocupação */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        ((turma.criancas_matriculadas || 0) / (turma.capacidade || 1)) >= 1
                          ? 'bg-red-500'
                          : ((turma.criancas_matriculadas || 0) / (turma.capacidade || 1)) >= 0.8
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{
                        width: `${Math.min(
                          ((turma.criancas_matriculadas || 0) / (turma.capacidade || 1)) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <button
                    onClick={() => handleViewDetails(turma)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Visualizar"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Visualizar</span>
                  </button>
                  <button
                    onClick={() => handleEditClick(turma)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDelete(turma)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Criação */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Cadastrar Nova Turma"
      >
        <TurmaForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Modal de Edição */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTurma(null);
        }}
        title="Editar Turma"
      >
        {selectedTurma && (
          <TurmaForm
            turma={{
              id: selectedTurma.id,
              nome: selectedTurma.nome,
              creche_id: selectedTurma.creche_id,
              idade_minima: selectedTurma.idade_minima,
              idade_maxima: selectedTurma.idade_maxima,
              turno: selectedTurma.turno,
              capacidade: selectedTurma.capacidade,
              ativa: selectedTurma.ativa,
            }}
            onSubmit={handleEdit}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedTurma(null);
            }}
          />
        )}
      </Modal>

      {/* Modal de Detalhes */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedTurma(null);
        }}
        title="Detalhes da Turma"
      >
        {selectedTurma && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Nome da Turma</label>
                <p className="text-gray-900 mt-1">{selectedTurma.nome}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Creche</label>
                <p className="text-gray-900 mt-1">{selectedTurma.creche?.nome || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Faixa Etária</label>
                <p className="text-gray-900 mt-1">
                  {selectedTurma.idade_minima} a {selectedTurma.idade_maxima} anos
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Turno</label>
                <p className="text-gray-900 mt-1">{getTurnoLabel(selectedTurma.turno)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Capacidade</label>
                <p className="text-gray-900 mt-1">{selectedTurma.capacidade} vagas</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Crianças Matriculadas</label>
                <p className="text-gray-900 mt-1">{selectedTurma.criancas_matriculadas || 0}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Vagas Disponíveis</label>
                <p className="text-gray-900 mt-1">
                  {(selectedTurma.capacidade || 0) - (selectedTurma.criancas_matriculadas || 0)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <p className="text-gray-900 mt-1">{selectedTurma.ativa ? 'Ativa' : 'Inativa'}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedTurma(null);
                }}
              >
                Fechar
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setShowDetailsModal(false);
                  handleEditClick(selectedTurma);
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Turmas;
