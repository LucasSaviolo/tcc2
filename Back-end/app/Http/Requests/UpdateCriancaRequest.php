<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCriancaRequest extends FormRequest
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
            'nome' => 'sometimes|required|string|max:255',
            'data_nascimento' => 'sometimes|required|date|before:today',
            'cpf' => [
                'nullable',
                'string',
                'regex:/^\d{11}$/',
                Rule::unique('criancas', 'cpf')->ignore($this->route('crianca'))
            ],
            'responsavel_id' => 'sometimes|required|exists:responsaveis,id',
            'preferencias_creche' => 'sometimes|required|array|min:1|max:3',
            'preferencias_creche.*.creche_id' => 'required_with:preferencias_creche|exists:creches,id',
            'preferencias_creche.*.ordem_preferencia' => 'required_with:preferencias_creche|integer|between:1,3',
        ];
    }

    /**
     * Get custom messages for validation errors.
     */
    public function messages(): array
    {
        return [
            'nome.required' => 'O nome da criança é obrigatório.',
            'data_nascimento.required' => 'A data de nascimento é obrigatória.',
            'data_nascimento.before' => 'A data de nascimento deve ser anterior a hoje.',
            'cpf.unique' => 'Este CPF já está cadastrado.',
            'cpf.regex' => 'O CPF deve conter exatamente 11 dígitos.',
            'responsavel_id.required' => 'É necessário informar o responsável.',
            'responsavel_id.exists' => 'Responsável não encontrado.',
            'preferencias_creche.required' => 'É necessário informar ao menos uma preferência de creche.',
            'preferencias_creche.max' => 'Máximo de 3 preferências de creche.',
        ];
    }
}
