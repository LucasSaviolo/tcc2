<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CrecheResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nome' => $this->nome,
            'logradouro' => $this->logradouro,
            'numero' => $this->numero,
            'bairro' => $this->bairro,
            'cep' => $this->cep,
            'cidade' => $this->cidade,
            'endereco' => $this->endereco,
            'telefone' => $this->telefone,
            'capacidade_total' => $this->capacidade_total,
            'vagas_disponiveis' => $this->vagas_disponiveis,
            'vagas_ocupadas' => $this->capacidade_total - $this->vagas_disponiveis,
            'idades_aceitas' => $this->idades_aceitas,
            'turnos_disponiveis' => $this->turnos_disponiveis,
            'email_institucional' => $this->email_institucional,
            'nome_responsavel' => $this->nome_responsavel,
            'email_responsavel' => $this->email_responsavel,
            'quantidade_turmas' => $this->turmas()->count(),
            'criancas_matriculadas' => $this->criancas_matriculadas,
            'ativa' => $this->ativa,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}
