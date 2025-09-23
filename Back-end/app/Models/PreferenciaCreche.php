<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PreferenciaCreche extends Model
{
    protected $table = 'preferencias_creche';

    protected $fillable = [
        'crianca_id',
        'creche_id',
        'ordem_preferencia'
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
