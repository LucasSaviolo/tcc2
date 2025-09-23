<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transferencia extends Model
{
    protected $fillable = [
        'crianca_id',
        'creche_origem_id',
        'creche_destino_id',
        'tipo_movimentacao',
        'status',
        'motivo',
        'data_solicitacao',
        'data_processamento',
        'ano_letivo'
    ];

    protected $casts = [
        'data_solicitacao' => 'date',
        'data_processamento' => 'date'
    ];

    public function crianca(): BelongsTo
    {
        return $this->belongsTo(Crianca::class);
    }

    public function crecheOrigem(): BelongsTo
    {
        return $this->belongsTo(Creche::class, 'creche_origem_id');
    }

    public function crecheDestino(): BelongsTo
    {
        return $this->belongsTo(Creche::class, 'creche_destino_id');
    }
}
