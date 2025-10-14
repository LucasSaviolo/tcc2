import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Building, MapPin, Phone, Users, Settings } from 'lucide-react';
import { apiService } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import CrecheForm from '../components/business/CrecheForm';
import type { Creche } from '../types';

const Creches: React.FC = () => {
  const [selectedCreche, setSelectedCreche] = useState<Creche | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [query, setQuery] = useState('');

  const { data: creches, isLoading, isError, error } = useQuery({
    queryKey: ['creches'],
    queryFn: () => apiService.getCreches(),
    retry: 1,
  });

  const filteredCreches = (creches || []).filter((c) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (c.nome || '').toLowerCase().includes(q) ||
      (c.endereco || '').toLowerCase().includes(q) ||
      (c.nome_responsavel || '').toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (creche: Creche) => {
    if (!creche.ativa) {
      return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Inativa</span>;
    }
    
    const vagasLivres = creche.vagas_disponiveis;
    const capacidadeTotal = creche.capacidade_total;
    
    // Se a creche tem mais de 10 vagas livres OU mais de 30% de vagas livres
    if (vagasLivres > 10 || (vagasLivres / capacidadeTotal) > 0.3) {
      return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Disponível</span>;
    } 
    // Se tem entre 3 e 10 vagas livres OU entre 10% e 30% de vagas livres
    else if (vagasLivres >= 3 || (vagasLivres / capacidadeTotal) > 0.1) {
      return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Quase Lotada</span>;
    } 
    // Menos de 3 vagas livres OU menos de 10% de vagas livres
    else {
      return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Lotada</span>;
    }
  };

  const getIdadesText = (idades: number[]) => {
    if (idades.length === 0) return 'Não especificado';
    const sorted = idades.sort((a, b) => a - b);
    return `${sorted[0]} a ${sorted[sorted.length - 1]} anos`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    console.error('Erro ao carregar creches:', error);
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
              Erro ao carregar dados de creches. Por favor, verifique se o backend está rodando e tente novamente.
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
            Gestão de Creches
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie as creches cadastradas no sistema
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0 items-center space-x-3">
          <input
            type="text"
            placeholder="Buscar creche, endereço ou responsável..."
            className="border rounded px-3 py-2 w-72"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Creche
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <Building className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Creches</p>
              <p className="text-2xl font-bold text-gray-900">{creches?.length || 0}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Vagas Totais</p>
              <p className="text-2xl font-bold text-gray-900">
                {creches?.reduce((acc, creche) => acc + creche.capacidade_total, 0) || 0}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Vagas Disponíveis</p>
              <p className="text-2xl font-bold text-gray-900">
                {creches?.reduce((acc, creche) => acc + creche.vagas_disponiveis, 0) || 0}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <Building className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Creches Ativas</p>
              <p className="text-2xl font-bold text-gray-900">
                {creches?.filter(creche => creche.ativa).length || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Creches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {filteredCreches.map((creche) => (
          <Card key={creche.id} className="p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Building className={`h-10 w-10 ${creche.ativa ? 'text-blue-600' : 'text-gray-400'}`} />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {creche.nome}
                  </h3>
                  {getStatusBadge(creche)}
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="truncate">{creche.endereco}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                <span>{creche.telefone}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                <span>Idades: {getIdadesText(creche.idades_aceitas)}</span>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Alunos Matriculados</span>
                <span className="font-medium text-blue-600">
                  {creche.alunos_matriculados || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Vagas Disponíveis</span>
                <span className="font-medium">
                  {creche.vagas_disponiveis}/{creche.capacidade_total}
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    (() => {
                      const vagasLivres = creche.vagas_disponiveis;
                      const capacidadeTotal = creche.capacidade_total;
                      
                      // Usa a mesma lógica dos status
                      if (vagasLivres > 10 || (vagasLivres / capacidadeTotal) > 0.3) {
                        return 'bg-green-600';
                      } else if (vagasLivres >= 3 || (vagasLivres / capacidadeTotal) > 0.1) {
                        return 'bg-yellow-600';
                      } else {
                        return 'bg-red-600';
                      }
                    })()
                  }`}
                  style={{
                    width: `${((creche.capacidade_total - creche.vagas_disponiveis) / creche.capacidade_total) * 100}%`,
                  }}
                />
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {Math.round(((creche.capacidade_total - creche.vagas_disponiveis) / creche.capacidade_total) * 100)}% ocupada
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => {
                  setSelectedCreche(creche);
                  setShowDetailsModal(true);
                }}
              >
                Ver Detalhes
              </Button>
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => {
                  setSelectedCreche(creche);
                  setShowEditModal(true);
                }}
              >
                Editar
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {creches && creches.length === 0 && (
        <Card className="p-12 text-center">
          <Building className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma creche cadastrada</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comece adicionando uma nova creche ao sistema.
          </p>
          <div className="mt-6">
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Creche
            </Button>
          </div>
        </Card>
      )}

      {/* Modal para Criar Creche */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Cadastrar Nova Creche"
        size="lg"
      >
        <CrecheForm
          onSuccess={() => setShowCreateModal(false)}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Modal para Editar Creche */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Creche"
        size="lg"
      >
        {selectedCreche && (
          <CrecheForm
            initialData={{
              id: selectedCreche.id,
              nome: selectedCreche.nome,
              endereco: selectedCreche.endereco,
              telefone: selectedCreche.telefone,
              capacidade_total: selectedCreche.capacidade_total,
              idades_aceitas: selectedCreche.idades_aceitas,
              ativa: selectedCreche.ativa,
            }}
            onSuccess={() => setShowEditModal(false)}
            onCancel={() => setShowEditModal(false)}
          />
        )}
      </Modal>

      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Detalhes da Creche"
        size="lg"
      >
        {selectedCreche && (
          // componente de detalhes simples
          <div>
            <h3 className="text-lg font-semibold">{selectedCreche.nome}</h3>
            <p className="text-sm text-gray-600 mt-2">{selectedCreche.endereco}</p>
            <div className="mt-4">
              {/* Import dinâmico do componente para evitar bundling pesado */}
              <div>
                {/* Aguardando componente CrecheDetails */}
                {/* eslint-disable-next-line @typescript-eslint/no-var-requires */}
                {/* render inline details */}
                <div className="mt-2">
                  <div className="text-sm text-gray-700">Telefone: {selectedCreche.telefone}</div>
                  <div className="text-sm text-gray-700">E-mail: {selectedCreche.email_institucional || 'N/A'}</div>
                  <div className="text-sm text-gray-700">Responsável: {selectedCreche.nome_responsavel || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Creches;

