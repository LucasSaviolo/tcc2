import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import Button from '../ui/Button';
import Input from '../ui/Input';
import type { TurmaFormData, Creche } from '../../types';
import { apiService } from '../../services/api';

interface TurmaFormProps {
  turma?: TurmaFormData;
  onSubmit: (data: TurmaFormData) => void;
  onCancel: () => void;
}

const TurmaForm: React.FC<TurmaFormProps> = ({ turma, onSubmit, onCancel }) => {
  const { control, handleSubmit, formState: { errors }, reset, watch } = useForm<TurmaFormData>({
    defaultValues: turma || {
      nome: '',
      creche_id: 0,
      idade_minima: 0,
      idade_maxima: 5,
      turno: 'manha',
      capacidade: 20,
      ativa: true,
    },
  });

  const { data: crechesResponse } = useQuery({
    queryKey: ['creches'],
    queryFn: () => apiService.getCreches(),
  });

  const creches: Creche[] = Array.isArray(crechesResponse) 
    ? crechesResponse 
    : ((crechesResponse as any)?.data || []);

  useEffect(() => {
    if (turma) {
      reset(turma);
    }
  }, [turma, reset]);

  const handleFormSubmit = (data: TurmaFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Seleção de Creche */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Creche <span className="text-red-500">*</span>
        </label>
        <Controller
          name="creche_id"
          control={control}
          rules={{ 
            required: 'Selecione uma creche',
            validate: (value) => value > 0 || 'Selecione uma creche válida'
          }}
          render={({ field }) => (
            <select
              {...field}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.creche_id ? 'border-red-500' : 'border-gray-300'
              }`}
              value={field.value || ''}
              onChange={(e) => field.onChange(Number(e.target.value))}
            >
              <option value="">Selecione uma creche</option>
              {creches.map((creche) => (
                <option key={creche.id} value={creche.id}>
                  {creche.nome}
                </option>
              ))}
            </select>
          )}
        />
        {errors.creche_id && (
          <span className="text-red-500 text-xs mt-1">{errors.creche_id.message}</span>
        )}
      </div>

      {/* Nome da Turma */}
      <Controller
        name="nome"
        control={control}
        rules={{ 
          required: 'Nome da turma é obrigatório',
          minLength: { value: 3, message: 'Nome deve ter pelo menos 3 caracteres' },
        }}
        render={({ field }) => (
          <Input
            {...field}
            label="Nome da Turma"
            placeholder="Ex: Maternal II, Pré III"
            error={errors.nome?.message}
            required
          />
        )}
      />

      {/* Faixa Etária */}
      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="idade_minima"
          control={control}
          rules={{ 
            required: 'Idade mínima é obrigatória',
            min: { value: 0, message: 'Idade mínima deve ser pelo menos 0' },
            max: { value: 6, message: 'Idade mínima deve ser no máximo 6' },
            validate: (value) => {
              const idadeMaxima = watch('idade_maxima');
              return value <= idadeMaxima || 'Idade mínima deve ser menor ou igual à máxima';
            }
          }}
          render={({ field }) => (
            <Input
              {...field}
              type="number"
              label="Idade Mínima"
              placeholder="0"
              error={errors.idade_minima?.message}
              required
              min={0}
              max={6}
              onChange={(e) => field.onChange(Number(e.target.value))}
            />
          )}
        />

        <Controller
          name="idade_maxima"
          control={control}
          rules={{ 
            required: 'Idade máxima é obrigatória',
            min: { value: 0, message: 'Idade máxima deve ser pelo menos 0' },
            max: { value: 6, message: 'Idade máxima deve ser no máximo 6' },
            validate: (value) => {
              const idadeMinima = watch('idade_minima');
              return value >= idadeMinima || 'Idade máxima deve ser maior ou igual à mínima';
            }
          }}
          render={({ field }) => (
            <Input
              {...field}
              type="number"
              label="Idade Máxima"
              placeholder="5"
              error={errors.idade_maxima?.message}
              required
              min={0}
              max={6}
              onChange={(e) => field.onChange(Number(e.target.value))}
            />
          )}
        />
      </div>

      {/* Turno */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Turno <span className="text-red-500">*</span>
        </label>
        <Controller
          name="turno"
          control={control}
          rules={{ required: 'Selecione um turno' }}
          render={({ field }) => (
            <select
              {...field}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.turno ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="manha">Manhã</option>
              <option value="tarde">Tarde</option>
              <option value="integral">Integral</option>
            </select>
          )}
        />
        {errors.turno && (
          <span className="text-red-500 text-xs mt-1">{errors.turno.message}</span>
        )}
      </div>

      {/* Capacidade */}
      <Controller
        name="capacidade"
        control={control}
        rules={{ 
          required: 'Capacidade é obrigatória',
          min: { value: 1, message: 'Capacidade deve ser pelo menos 1' },
          max: { value: 100, message: 'Capacidade deve ser no máximo 100' },
        }}
        render={({ field }) => (
          <Input
            {...field}
            type="number"
            label="Capacidade da Turma"
            placeholder="20"
            error={errors.capacidade?.message}
            required
            min={1}
            max={100}
            onChange={(e) => field.onChange(Number(e.target.value))}
          />
        )}
      />

      {/* Status */}
      <div className="flex items-center">
        <Controller
          name="ativa"
          control={control}
          render={({ field }) => (
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Turma Ativa</span>
            </label>
          )}
        />
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          {turma?.id ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </div>
    </form>
  );
};

export default TurmaForm;
