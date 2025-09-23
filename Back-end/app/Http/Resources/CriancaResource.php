<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CriancaResource extends JsonResource
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
            'data_nascimento' => $this->data_nascimento->format('Y-m-d'),
            'idade' => $this->idade,
            'cpf' => $this->cpf,
            'responsavel' => [
                'id' => $this->responsavel->id,
                'nome' => $this->responsavel->nome,
                'telefone' => $this->responsavel->telefone,
                'email' => $this->responsavel->email,
            ],
            'preferencias_creche' => $this->preferenciasCreche->map(function ($preferencia) {
                return [
                    'creche_id' => $preferencia->creche_id,
                    'creche_nome' => $preferencia->creche->nome,
                    'ordem_preferencia' => $preferencia->ordem_preferencia,
                ];
            }),
            'fila_espera' => $this->when($this->filaEspera, [
                'pontuacao_total' => $this->filaEspera?->pontuacao_total,
                'posicao_fila' => $this->filaEspera?->posicao_fila,
                'status' => $this->filaEspera?->status,
            ]),
            'alocacao' => $this->when($this->alocacao, [
                'creche_nome' => $this->alocacao?->creche?->nome,
                'data_inicio' => $this->alocacao?->data_inicio?->format('Y-m-d'),
                'data_fim' => $this->alocacao?->data_fim?->format('Y-m-d'),
                'status' => $this->alocacao?->status,
            ]),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}
