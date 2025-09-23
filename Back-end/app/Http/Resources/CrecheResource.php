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
            'endereco' => $this->endereco,
            'telefone' => $this->telefone,
            'capacidade_total' => $this->capacidade_total,
            'vagas_disponiveis' => $this->vagas_disponiveis,
            'vagas_ocupadas' => $this->capacidade_total - $this->vagas_disponiveis,
            'idades_aceitas' => $this->idades_aceitas,
            'ativa' => $this->ativa,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}
