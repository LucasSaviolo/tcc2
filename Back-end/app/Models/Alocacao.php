<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Alocacao extends Model
{
    protected $table = 'alocacoes';

    protected $fillable = [
        'crianca_id',
        'creche_id',
        'data_inicio',
        'data_fim',
        'status',
        'observacoes'
    ];

    protected $casts = [
        'data_inicio' => 'date',
        'data_fim' => 'date'
    ];

    public function crianca(): BelongsTo
    {
        return $this->belongsTo(Crianca::class);
    }

    public function creche(): BelongsTo
    {
        return $this->belongsTo(Creche::class);
    }
}
