<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ExecutarAlocacaoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'recalcular_pontuacoes' => 'sometimes|boolean',
            'limite_alocacoes' => 'sometimes|integer|min:1|max:100',
            'creches_especificas' => 'sometimes|array',
            'creches_especificas.*' => 'exists:creches,id',
            'confirmar_execucao' => 'required|boolean|accepted',
        ];
    }

    /**
     * Get custom messages for validation errors.
     */
    public function messages(): array
    {
        return [
            'confirmar_execucao.required' => 'É necessário confirmar a execução da alocação.',
            'confirmar_execucao.accepted' => 'É necessário confirmar a execução da alocação.',
            'limite_alocacoes.min' => 'O limite de alocações deve ser pelo menos 1.',
            'limite_alocacoes.max' => 'O limite de alocações não pode exceder 100.',
            'creches_especificas.*.exists' => 'Uma das creches selecionadas não existe.',
        ];
    }
}
