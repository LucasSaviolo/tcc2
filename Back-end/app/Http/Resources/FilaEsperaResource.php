<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FilaEsperaResource extends JsonResource
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
            'pontuacao_total' => $this->pontuacao_total,
            'criterios_aplicados' => $this->criterios_aplicados,
            'posicao_fila' => $this->posicao_fila,
            'data_inscricao' => $this->data_inscricao->format('Y-m-d'),
            'status' => $this->status,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}
