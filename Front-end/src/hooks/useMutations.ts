import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';
import type { CriancaFormData, CrecheFormData, ResponsavelFormData } from '../types';

// Hook para operações com Crianças
export const useCriancaMutations = () => {
  const queryClient = useQueryClient();

  const createCrianca = useMutation({
    mutationFn: (data: CriancaFormData | FormData) => apiService.createCrianca(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['criancas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-actions'] });
      toast.success('Criança cadastrada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao cadastrar criança');
    },
  });

  const updateCrianca = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CriancaFormData> | FormData }) =>
      apiService.updateCrianca(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['criancas'] });
      toast.success('Criança atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar criança');
    },
  });

  const deleteCrianca = useMutation({
    mutationFn: (id: number) => apiService.deleteCrianca(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['criancas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-actions'] });
      toast.success('Criança removida com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao remover criança');
    },
  });

  return {
    createCrianca,
    updateCrianca,
    deleteCrianca,
  };
};

// Hook para operações com Creches
export const useCreche = () => {
  const queryClient = useQueryClient();

  const createCreche = useMutation({
    mutationFn: (data: CrecheFormData) => apiService.createCreche(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creches'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Creche cadastrada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao cadastrar creche');
    },
  });

  const updateCreche = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CrecheFormData> }) =>
      apiService.updateCreche(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creches'] });
      toast.success('Creche atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar creche');
    },
  });

  return {
    createCreche,
    updateCreche,
  };
};

// Hook para operações com Responsáveis
export const useResponsavelMutations = () => {
  const queryClient = useQueryClient();

  const createResponsavel = useMutation({
    mutationFn: (data: ResponsavelFormData) => apiService.createResponsavel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['responsaveis'] });
      toast.success('Responsável cadastrado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao cadastrar responsável');
    },
  });

  const updateResponsavel = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ResponsavelFormData> }) =>
      apiService.updateResponsavel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['responsaveis'] });
      toast.success('Responsável atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar responsável');
    },
  });

  const deleteResponsavel = useMutation({
    mutationFn: (id: number) => apiService.deleteResponsavel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['responsaveis'] });
      toast.success('Responsável removido com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao remover responsável');
    },
  });

  return {
    createResponsavel,
    updateResponsavel,
    deleteResponsavel,
  };
};

// Hook para operações da Fila de Espera
export const useFilaEspera = () => {
  const queryClient = useQueryClient();

  const recalcularFila = useMutation({
    mutationFn: () => apiService.recalcularFila(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fila-espera'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-actions'] });
      toast.success('Fila de espera recalculada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao recalcular fila');
    },
  });

  return {
    recalcularFila,
  };
};

// Hook para operações de Alocação
export const useAlocacao = () => {
  const queryClient = useQueryClient();

  const executarAlocacao = useMutation({
    mutationFn: () => apiService.executarAlocacao(),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['alocacoes'] });
      queryClient.invalidateQueries({ queryKey: ['criancas'] });
      queryClient.invalidateQueries({ queryKey: ['fila-espera'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-actions'] });
      
      if (result.success) {
        toast.success(`Alocação realizada! ${result.alocacoes_realizadas} crianças foram alocadas.`);
      } else {
        toast.error('Alocação finalizada com alguns problemas. Verifique os detalhes.');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao executar alocação');
    },
  });

  return {
    executarAlocacao,
  };
};

