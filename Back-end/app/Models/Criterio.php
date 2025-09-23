<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Criterio extends Model
{
    protected $fillable = [
        'nome',
        'descricao',
        'peso',
        'tipo',
        'ativo'
    ];

    protected $casts = [
        'ativo' => 'boolean',
        'peso' => 'integer'
    ];
}
