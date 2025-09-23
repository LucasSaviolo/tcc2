<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Documento extends Model
{
    protected $fillable = [
        'crianca_id',
        'tipo',
        'arquivo_path',
        'verificado'
    ];

    protected $casts = [
        'verificado' => 'boolean'
    ];

    public function crianca(): BelongsTo
    {
        return $this->belongsTo(Crianca::class);
    }
}
