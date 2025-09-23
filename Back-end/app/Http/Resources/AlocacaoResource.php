<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AlocacaoResource extends JsonResource
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
            'crianca' => [
                'id' => $this->crianca->id,
                'nome' => $this->crianca->nome,
                'idade' => $this->crianca->idade,
                'responsavel_nome' => $this->crianca->responsavel->nome,
                'responsavel_telefone' => $this->crianca->responsavel->telefone,
            ],
            'creche' => [
                'id' => $this->creche->id,
                'nome' => $this->creche->nome,
                'endereco' => $this->creche->endereco,
                'telefone' => $this->creche->telefone,
            ],
            'data_inicio' => $this->data_inicio->format('Y-m-d'),
            'data_fim' => $this->data_fim ? $this->data_fim->format('Y-m-d') : null,
            'status' => $this->status,
            'observacoes' => $this->observacoes,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}
