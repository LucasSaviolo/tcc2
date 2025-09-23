<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCrecheRequest extends FormRequest
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
            'nome' => 'required|string|max:255|unique:creches,nome',
            'endereco' => 'required|string|max:500',
            'telefone' => 'required|string|max:20',
            'capacidade_total' => 'required|integer|min:1|max:1000',
            'vagas_disponiveis' => 'required|integer|min:0|lte:capacidade_total',
            'idades_aceitas' => 'required|array|min:1',
            'idades_aceitas.*' => 'integer|between:0,6',
            'ativa' => 'sometimes|boolean',
        ];
    }

    /**
     * Get custom messages for validation errors.
     */
    public function messages(): array
    {
        return [
            'nome.required' => 'O nome da creche é obrigatório.',
            'nome.unique' => 'Já existe uma creche com este nome.',
            'endereco.required' => 'O endereço é obrigatório.',
            'telefone.required' => 'O telefone é obrigatório.',
            'capacidade_total.required' => 'A capacidade total é obrigatória.',
            'capacidade_total.min' => 'A capacidade deve ser de pelo menos 1 vaga.',
            'vagas_disponiveis.required' => 'As vagas disponíveis são obrigatórias.',
            'vagas_disponiveis.lte' => 'Vagas disponíveis não pode ser maior que a capacidade total.',
            'idades_aceitas.required' => 'É necessário informar as idades aceitas.',
            'idades_aceitas.min' => 'Deve haver pelo menos uma idade aceita.',
            'idades_aceitas.*.between' => 'As idades devem estar entre 0 e 6 anos.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('idades_aceitas') && is_string($this->idades_aceitas)) {
            $this->merge([
                'idades_aceitas' => json_decode($this->idades_aceitas, true) ?: []
            ]);
        }
    }
}
