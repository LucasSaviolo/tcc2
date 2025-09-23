import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useQuery } from '@tanstack/react-query';

import { useCriancaMutations } from '../../hooks/useMutations';
import { apiService } from '../../services/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import FileUpload from '../ui/FileUpload';
import type { CriancaFormData, Responsavel } from '../../types';

interface CriancaFormProps {
  initialData?: CriancaFormData;
  onSuccess?: () => void;
  onCancel: () => void;
}

const schema = yup.object({
  nome: yup.string().required('Nome é obrigatório'),
  data_nascimento: yup.string().required('Data de nascimento é obrigatória'),
  cpf: yup.string().nullable().optional(),
  responsavel_id: yup.number().required('Responsável é obrigatório'),
  criterios_prioridade_ids: yup.array().of(yup.number()).nullable().optional(),
  primeira_opcao_creche_id: yup.number().nullable().required('Primeira opção de creche é obrigatória'),
  segunda_opcao_creche_id: yup.number().nullable().optional(),
  terceira_opcao_creche_id: yup.number().nullable().optional(),
});

const CriancaForm: React.FC<CriancaFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [showResponsavelForm, setShowResponsavelForm] = useState(false);
  const [documentosMatricula, setDocumentosMatricula] = useState<File[]>([]);
  const [documentosCriterios, setDocumentosCriterios] = useState<{ [key: number]: File }>({});
  const [criteriosSelecionados, setCriteriosSelecionados] = useState<number[]>([]);
  
  const { createCrianca, updateCrianca } = useCriancaMutations();
  
  const { control, handleSubmit, formState: { errors }, reset, watch } = useForm<any>({
    resolver: yupResolver(schema),
    defaultValues: initialData || {
      nome: '',
      data_nascimento: '',
      cpf: '',
      responsavel_id: 0,
      criterios_prioridade_ids: [],
      primeira_opcao_creche_id: undefined,
      segunda_opcao_creche_id: undefined,
      terceira_opcao_creche_id: undefined,
    },
  });

  // Carregar lista de responsáveis
  const { data: responsaveis, isLoading: isLoadingResponsaveis } = useQuery({
    queryKey: ['responsaveis'],
    queryFn: () => apiService.getResponsaveis(),
  });

  // Carregar lista de critérios
  const { data: criterios, isLoading: isLoadingCriterios } = useQuery({
    queryKey: ['criterios'],
    queryFn: () => apiService.getCriterios(),
  });

  // Carregar lista de creches
  const { data: creches, isLoading: isLoadingCreches } = useQuery({
    queryKey: ['creches'],
    queryFn: () => apiService.getCreches(),
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
      if (initialData.criterios_prioridade_ids) {
        setCriteriosSelecionados(initialData.criterios_prioridade_ids);
      }
    }
  }, [initialData, reset]);

  const handleCriterioChange = (criterioId: number, checked: boolean) => {
    const currentValue = watch('criterios_prioridade_ids') || [];
    let newValue: number[];
    
    if (checked) {
      newValue = [...currentValue, criterioId];
      setCriteriosSelecionados(prev => [...prev, criterioId]);
    } else {
      newValue = currentValue.filter((id: number) => id !== criterioId);
      setCriteriosSelecionados(prev => prev.filter(id => id !== criterioId));
      // Remover documento do critério se desmarcado
      setDocumentosCriterios(prev => {
        const updated = { ...prev };
        delete updated[criterioId];
        return updated;
      });
    }
    
    // Atualizar o form
    reset({ ...watch(), criterios_prioridade_ids: newValue });
  };

  const handleDocumentoCriterioChange = (criterioId: number, file: File[]) => {
    setDocumentosCriterios(prev => ({
      ...prev,
      [criterioId]: file[0] // Apenas um arquivo por critério
    }));
  };

  const onSubmit = async (data: CriancaFormData) => {
    try {
      const formData = new FormData();
      
      // Dados básicos
      formData.append('nome', data.nome);
      formData.append('data_nascimento', data.data_nascimento);
      if (data.cpf) formData.append('cpf', data.cpf);
      formData.append('responsavel_id', data.responsavel_id.toString());
      
      // Critérios de prioridade
      if (data.criterios_prioridade_ids && data.criterios_prioridade_ids.length > 0) {
        data.criterios_prioridade_ids.forEach((id, index) => {
          formData.append(`criterios_prioridade_ids[${index}]`, id.toString());
        });
      }
      
      // Preferências de creches
      if (data.primeira_opcao_creche_id) {
        formData.append('primeira_opcao_creche_id', data.primeira_opcao_creche_id.toString());
      }
      if (data.segunda_opcao_creche_id) {
        formData.append('segunda_opcao_creche_id', data.segunda_opcao_creche_id.toString());
      }
      if (data.terceira_opcao_creche_id) {
        formData.append('terceira_opcao_creche_id', data.terceira_opcao_creche_id.toString());
      }
      
      // Documentos de matrícula
      documentosMatricula.forEach((file, index) => {
        formData.append(`documentos_matricula[${index}]`, file);
      });
      
      // Documentos dos critérios
      Object.entries(documentosCriterios).forEach(([criterioId, file]) => {
        formData.append(`documentos_criterios[${criterioId}]`, file);
      });
      
      if (initialData?.id) {
        await updateCrianca.mutateAsync({ id: initialData.id, data: formData });
      } else {
        await createCrianca.mutateAsync(formData);
      }
      
      reset();
      setDocumentosMatricula([]);
      setDocumentosCriterios({});
      setCriteriosSelecionados([]);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Erro ao salvar criança:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {initialData?.id ? 'Editar Criança' : 'Cadastrar Nova Criança'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Preencha todas as informações necessárias para o cadastro da criança.
          </p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
          {/* Seção 1: Dados Básicos */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">1</div>
              Dados Básicos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Controller
                  name="nome"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Nome Completo"
                      placeholder="Digite o nome completo da criança"
                      error={errors.nome?.message as string}
                      {...field}
                    />
                  )}
                />
              </div>

              <Controller
                name="data_nascimento"
                control={control}
                render={({ field }) => (
                  <Input
                    type="date"
                    label="Data de Nascimento"
                    error={errors.data_nascimento?.message as string}
                    {...field}
                  />
                )}
              />

              <Controller
                name="cpf"
                control={control}
                render={({ field }) => (
                  <Input
                    label="CPF (opcional)"
                    placeholder="000.000.000-00"
                    error={errors.cpf?.message as string}
                    {...field}
                  />
                )}
              />
            </div>
          </div>

          {/* Seção 2: Responsável */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">2</div>
              Responsável
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Selecione o responsável pela criança</p>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  onClick={() => setShowResponsavelForm(!showResponsavelForm)}
                >
                  {showResponsavelForm ? 'Selecionar existente' : 'Cadastrar novo'}
                </button>
              </div>

              {!showResponsavelForm ? (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <Controller
                    name="responsavel_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        label="Responsável"
                        error={errors.responsavel_id?.message as string}
                        disabled={isLoadingResponsaveis}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      >
                        <option value="">
                          {isLoadingResponsaveis ? "Carregando..." : "Selecione um responsável"}
                        </option>
                        {responsaveis?.map((resp: Responsavel) => (
                          <option key={resp.id} value={resp.id}>
                            {resp.nome} ({resp.cpf})
                          </option>
                        ))}
                      </Select>
                    )}
                  />
                </div>
              ) : (
                <div className="p-4 border border-gray-200 rounded-md bg-white">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Cadastrar Novo Responsável</h4>
                  <p className="text-sm text-gray-500">
                    Formulário de responsável será implementado como um componente separado.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Seção 3: Critérios de Prioridade */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">3</div>
              Critérios de Prioridade
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Selecione todos os critérios que se aplicam à criança. Para cada critério selecionado, será necessário anexar um documento comprobatório.
            </p>
            
            {isLoadingCriterios ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Carregando critérios...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {criterios?.map((criterio) => {
                  const isSelected = criteriosSelecionados.includes(criterio.id);
                  return (
                    <div key={criterio.id} className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id={`criterio_${criterio.id}`}
                          checked={isSelected}
                          onChange={(e) => handleCriterioChange(criterio.id, e.target.checked)}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={`criterio_${criterio.id}`}
                            className="text-sm font-medium text-gray-900 cursor-pointer"
                          >
                            {criterio.nome}
                          </label>
                          {criterio.descricao && (
                            <p className="text-xs text-gray-500 mt-1">{criterio.descricao}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Upload de documento para o critério selecionado */}
                      {isSelected && (
                        <div className="mt-4 ml-7 space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Documento Comprobatório
                          </label>
                          <FileUpload
                            files={documentosCriterios[criterio.id] ? [documentosCriterios[criterio.id]] : []}
                            onChange={(files) => handleDocumentoCriterioChange(criterio.id, files)}
                            accept=".pdf,.jpg,.jpeg,.png"
                            maxFiles={1}
                            maxSize={5} // 5MB
                            label="Arraste o documento ou clique para selecionar"
                            description="PDF ou imagem até 5MB. Apenas 1 arquivo."
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Seção 4: Documentos de Matrícula */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">4</div>
              Documentos de Matrícula
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Anexe todos os documentos necessários para a matrícula da criança.
            </p>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <FileUpload
                files={documentosMatricula}
                onChange={setDocumentosMatricula}
                accept=".pdf,.jpg,.jpeg,.png"
                multiple={true}
                maxFiles={5}
                maxSize={10} // 10MB
                label="Arraste os documentos ou clique para selecionar"
                description="PDF ou imagens até 10MB cada. Máximo 5 arquivos."
              />
            </div>
          </div>

          {/* Seção 5: Preferências de Creches */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">5</div>
              Preferências de Creches
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Selecione até 3 creches em ordem de preferência para a matrícula da criança.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Controller
                name="primeira_opcao_creche_id"
                control={control}
                render={({ field }) => (
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <Select
                      label="1ª Opção (Obrigatória)"
                      error={errors.primeira_opcao_creche_id?.message as string}
                      disabled={isLoadingCreches}
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value ? Number(value) : undefined);
                      }}
                    >
                      <option value="">
                        {isLoadingCreches ? "Carregando..." : "Selecione a primeira opção"}
                      </option>
                      {creches?.map((creche) => (
                        <option key={creche.id} value={creche.id}>
                          {creche.nome}
                        </option>
                      ))}
                    </Select>
                  </div>
                )}
              />

              <Controller
                name="segunda_opcao_creche_id"
                control={control}
                render={({ field }) => (
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <Select
                      label="2ª Opção (Opcional)"
                      error={errors.segunda_opcao_creche_id?.message as string}
                      disabled={isLoadingCreches}
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value ? Number(value) : undefined);
                      }}
                    >
                      <option value="">
                        {isLoadingCreches ? "Carregando..." : "Selecione a segunda opção"}
                      </option>
                      {creches?.filter(creche => 
                        creche.id !== watch('primeira_opcao_creche_id') &&
                        creche.id !== watch('terceira_opcao_creche_id')
                      ).map((creche) => (
                        <option key={creche.id} value={creche.id}>
                          {creche.nome}
                        </option>
                      ))}
                    </Select>
                  </div>
                )}
              />

              <Controller
                name="terceira_opcao_creche_id"
                control={control}
                render={({ field }) => (
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <Select
                      label="3ª Opção (Opcional)"
                      error={errors.terceira_opcao_creche_id?.message as string}
                      disabled={isLoadingCreches}
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value ? Number(value) : undefined);
                      }}
                    >
                      <option value="">
                        {isLoadingCreches ? "Carregando..." : "Selecione a terceira opção"}
                      </option>
                      {creches?.filter(creche => 
                        creche.id !== watch('primeira_opcao_creche_id') &&
                        creche.id !== watch('segunda_opcao_creche_id')
                      ).map((creche) => (
                        <option key={creche.id} value={creche.id}>
                          {creche.nome}
                        </option>
                      ))}
                    </Select>
                  </div>
                )}
              />
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="bg-white border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
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
              loading={createCrianca.isPending || updateCrianca.isPending}
            >
              {initialData?.id ? 'Atualizar Criança' : 'Cadastrar Criança'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CriancaForm;

