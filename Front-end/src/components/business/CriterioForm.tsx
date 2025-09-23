import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import type { CriterioFormData } from '../../types';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CriterioFormProps {
  initialData?: CriterioFormData;
  onSuccess?: () => void;
  onCancel: () => void;
}

const schema = yup.object({
  nome: yup.string().required('Nome é obrigatório'),
  descricao: yup.string().required('Descrição é obrigatória'),
  peso: yup.number().required('Peso é obrigatório').min(0, 'Peso deve ser positivo'),
  ativo: yup.boolean().required(),
  tipo: yup.string().oneOf(['booleano', 'numerico', 'texto'], 'Tipo inválido').required('Tipo é obrigatório'),
  opcoes: yup.array().of(yup.string()),
});

const CriterioForm: React.FC<CriterioFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const queryClient = useQueryClient();
  
  const { control, handleSubmit, formState: { errors }, reset, watch } = useForm<CriterioFormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: initialData || {
      nome: '',
      descricao: '',
      peso: 1,
      ativo: true,
      tipo: 'booleano',
      opcoes: [],
    }
  });

  const selectedTipo = watch('tipo');

  const createCriterio = useMutation({
    mutationFn: (data: CriterioFormData) => apiService.createCriterio(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['criterios'] });
      toast.success('Critério cadastrado com sucesso!');
      reset();
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao cadastrar critério');
    },
  });

  const updateCriterio = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CriterioFormData> }) =>
      apiService.updateCriterio(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['criterios'] });
      toast.success('Critério atualizado com sucesso!');
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar critério');
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const onSubmit = async (data: CriterioFormData) => {
    try {
      if (initialData?.id) {
        await updateCriterio.mutateAsync({ id: initialData.id, data });
      } else {
        await createCriterio.mutateAsync(data);
      }
    } catch (error) {
      console.error('Erro ao salvar critério:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <Controller
          name="nome"
          control={control}
          render={({ field }) => (
            <Input
              label="Nome do Critério"
              placeholder="Ex: Renda Familiar, Necessidade Especial..."
              error={errors.nome?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="descricao"
          control={control}
          render={({ field }) => (
            <Input
              label="Descrição"
              placeholder="Descreva como este critério é avaliado"
              error={errors.descricao?.message}
              {...field}
            />
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="peso"
            control={control}
            render={({ field }) => (
              <Input
                type="number"
                label="Peso"
                min={0}
                step={0.1}
                placeholder="1.0"
                error={errors.peso?.message}
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
              />
            )}
          />

          <Controller
            name="tipo"
            control={control}
            render={({ field }) => (
              <Select
                label="Tipo de Critério"
                error={errors.tipo?.message}
                {...field}
              >
                <option value="booleano">Sim/Não</option>
                <option value="numerico">Numérico</option>
                <option value="texto">Texto/Lista</option>
              </Select>
            )}
          />
        </div>

        {selectedTipo === 'texto' && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Opções (separadas por vírgula)
            </label>
            <Controller
              name="opcoes"
              control={control}
              render={({ field }) => (
                <Input
                  placeholder="Opção 1, Opção 2, Opção 3..."
                  value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                  onChange={(e) => {
                    const opcoes = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                    field.onChange(opcoes);
                  }}
                />
              )}
            />
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Controller
            name="ativo"
            control={control}
            render={({ field }) => (
              <input
                type="checkbox"
                id="ativo"
                className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
            )}
          />
          <label htmlFor="ativo" className="text-sm font-medium text-gray-700">
            Critério Ativo
          </label>
        </div>
      </div>

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
          loading={createCriterio.isPending || updateCriterio.isPending}
        >
          {initialData?.id ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </div>
    </form>
  );
};

export default CriterioForm;

