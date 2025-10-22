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
        // Torna o recurso resiliente a relacionamentos ausentes e datas nulas
        $crianca = $this->crianca;
        $responsavel = $crianca->responsavel ?? null;
        $creche = $this->creche;

        $dataInicio = $this->data_inicio ? $this->data_inicio->format('Y-m-d') : null;
        $dataFim = $this->data_fim ? $this->data_fim->format('Y-m-d') : null;

        return [
            'id' => $this->id,
            'crianca' => $crianca ? [
                'id' => $crianca->id,
                'nome' => $crianca->nome,
                'idade' => $crianca->idade,
                'responsavel_nome' => $responsavel->nome ?? null,
                'responsavel_telefone' => $responsavel->telefone ?? null,
            ] : null,
            'creche' => $creche ? [
                'id' => $creche->id,
                'nome' => $creche->nome,
                'endereco' => $creche->endereco,
                'telefone' => $creche->telefone,
            ] : null,
            // Manter o campo original e adicionar alias para compatibilidade com o front-end
            'data_inicio' => $dataInicio,
            'data_alocacao' => $dataInicio,
            'data_fim' => $dataFim,
            'status' => $this->status,
            'observacoes' => $this->observacoes,
            'created_at' => $this->created_at ? $this->created_at->format('Y-m-d H:i:s') : null,
            'updated_at' => $this->updated_at ? $this->updated_at->format('Y-m-d H:i:s') : null,
        ];
    }
}
