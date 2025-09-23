<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CriterioPrioridade extends Model
{
    protected $table = 'criterios_prioridade';

    protected $fillable = [
        'nome',
        'descricao',
        'peso',
        'ativo'
    ];

    protected $casts = [
        'ativo' => 'boolean'
    ];
}
