import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useCreche } from '../../hooks/useMutations';
import type { CrecheFormData } from '../../types';

interface CrecheFormProps {
  initialData?: CrecheFormData & { id?: number };
  onSuccess?: () => void;
  onCancel: () => void;
}

const schema = yup.object({
  nome: yup.string().required('Nome é obrigatório'),
  endereco: yup.string().required('Endereço é obrigatório'),
  telefone: yup.string().required('Telefone é obrigatório'),
  capacidade_total: yup.number().required('Capacidade total é obrigatória').positive('Deve ser um número positivo'),
  idades_aceitas: yup.array().of(yup.number()).min(1, 'Selecione pelo menos uma idade'),
  ativa: yup.boolean().required(),
}).required();

const CrecheForm: React.FC<CrecheFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const { createCreche, updateCreche } = useCreche();
  
  const { control, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<CrecheFormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: initialData || {
      nome: '',
      endereco: '',
      telefone: '',
      capacidade_total: 0,
      idades_aceitas: [],
      ativa: true,
    }
  });

  const idades = [0, 1, 2, 3, 4, 5];
  const idades_selecionadas = watch('idades_aceitas') || [];

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const toggleIdade = (idade: number) => {
    const current = watch('idades_aceitas') || [];
    
    if (current.includes(idade)) {
      setValue('idades_aceitas', current.filter(i => i !== idade));
    } else {
      setValue('idades_aceitas', [...current, idade]);
    }
  };

  const onSubmit = async (data: CrecheFormData) => {
    try {
      if (initialData?.id) {
        await updateCreche.mutateAsync({ id: initialData.id, data });
      } else {
        await createCreche.mutateAsync(data);
      }
      
      reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Erro ao salvar creche:', error);
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
              label="Nome da Creche"
              placeholder="Digite o nome da creche"
              error={errors.nome?.message}
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
          name="capacidade_total"
          control={control}
          render={({ field }) => (
            <Input
              type="number"
              label="Capacidade Total"
              min={1}
              error={errors.capacidade_total?.message}
              {...field}
              onChange={(e) => field.onChange(parseInt(e.target.value))}
            />
          )}
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Idades Aceitas
            {errors.idades_aceitas && (
              <span className="text-red-500 text-xs ml-2">{errors.idades_aceitas.message}</span>
            )}
          </label>
          <div className="flex flex-wrap gap-2">
            {idades.map((idade) => (
              <button
                key={idade}
                type="button"
                className={`px-3 py-2 rounded-md text-sm ${
                  idades_selecionadas.includes(idade)
                    ? 'bg-primary-100 text-primary-700 border-primary-300'
                    : 'bg-gray-100 text-gray-700 border-gray-300'
                } border hover:bg-opacity-80 transition-colors`}
                onClick={() => toggleIdade(idade)}
              >
                {idade === 0 ? 'Bebês (< 1 ano)' : `${idade} ${idade === 1 ? 'ano' : 'anos'}`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Controller
            name="ativa"
            control={control}
            render={({ field }) => (
              <input
                type="checkbox"
                id="ativa"
                className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
            )}
          />
          <label htmlFor="ativa" className="text-sm font-medium text-gray-700">
            Creche Ativa
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
          loading={createCreche.isPending || updateCreche.isPending}
        >
          {initialData?.id ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </div>
    </form>
  );
};

export default CrecheForm;

