<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FilaEspera extends Model
{
    protected $table = 'fila_espera';

    protected $fillable = [
        'crianca_id',
        'pontuacao_total',
        'criterios_aplicados',
        'posicao_fila',
        'data_inscricao',
        'status'
    ];

    protected $casts = [
        'criterios_aplicados' => 'array',
        'data_inscricao' => 'date'
    ];

    public function crianca(): BelongsTo
    {
        return $this->belongsTo(Crianca::class);
    }

    /**
     * Reordena a fila de espera baseada na pontuação e data de inscrição.
     * Método estático para ser reutilizado por controladores/serviços.
     */
    public static function reordenarFila(): void
    {
        $itens = self::where('status', 'aguardando')
            ->orderBy('pontuacao_total', 'desc')
            ->orderBy('data_inscricao', 'asc')
            ->get();

        $posicao = 1;
        foreach ($itens as $item) {
            $item->update(['posicao_fila' => $posicao++]);
        }
    }
}
