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
}
