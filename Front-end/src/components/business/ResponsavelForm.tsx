import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Button from '../ui/Button';
import Input from '../ui/Input';
import type { ResponsavelFormData, Responsavel } from '../../types';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ResponsavelFormProps {
  onSuccess?: (responsavel: { id: number; nome: string }) => void;
  onCancel: () => void;
}

const schema = yup.object({
  nome: yup.string().required('Nome é obrigatório'),
  cpf: yup.string().required('CPF é obrigatório'),
  telefone: yup.string().required('Telefone é obrigatório'),
  email: yup.string().email('E-mail inválido').optional(),
  endereco: yup.string().required('Endereço é obrigatório'),
});

const ResponsavelForm: React.FC<ResponsavelFormProps> = ({ onSuccess, onCancel }) => {
  const queryClient = useQueryClient();
  
  const { control, handleSubmit, formState: { errors }, reset } = useForm<ResponsavelFormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      nome: '',
      cpf: '',
      telefone: '',
      email: '',
      endereco: '',
    }
  });

  const createResponsavel = useMutation({
    mutationFn: (data: ResponsavelFormData) => apiService.createResponsavel(data),
    onSuccess: (data: Responsavel) => {
      queryClient.invalidateQueries({ queryKey: ['responsaveis'] });
      toast.success('Responsável cadastrado com sucesso!');
      reset();
      if (onSuccess) {
        onSuccess({ id: data.id, nome: data.nome });
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao cadastrar responsável');
    },
  });

  const onSubmit = async (data: ResponsavelFormData) => {
    try {
      await createResponsavel.mutateAsync(data);
    } catch (error) {
      console.error('Erro ao salvar responsável:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Controller
        name="nome"
        control={control}
        render={({ field }) => (
          <Input
            label="Nome Completo"
            placeholder="Digite o nome completo do responsável"
            error={errors.nome?.message}
            {...field}
          />
        )}
      />

      <Controller
        name="cpf"
        control={control}
        render={({ field }) => (
          <Input
            label="CPF"
            placeholder="000.000.000-00"
            error={errors.cpf?.message}
            {...field}
          />
        )}
      />

      <Controller
        name="telefone"
        control={control}
        render={({ field }) => (
          <Input
            label="Telefone"
            placeholder="(00) 00000-0000"
            error={errors.telefone?.message}
            {...field}
          />
        )}
      />

      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <Input
            type="email"
            label="E-mail (opcional)"
            placeholder="exemplo@email.com"
            error={errors.email?.message}
            {...field}
          />
        )}
      />

      <Controller
        name="endereco"
        control={control}
        render={({ field }) => (
          <Input
            label="Endereço"
            placeholder="Digite o endereço completo"
            error={errors.endereco?.message}
            {...field}
          />
        )}
      />

      <div className="flex justify-end space-x-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          variant="primary"
          loading={createResponsavel.isPending}
        >
          Cadastrar
        </Button>
      </div>
    </form>
  );
};

export default ResponsavelForm;

