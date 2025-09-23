<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Turma extends Model
{
    protected $fillable = [
        'creche_id',
        'nome',
        'idade_minima',
        'idade_maxima',
        'turno',
        'capacidade',
        'ativa'
    ];

    protected $casts = [
        'ativa' => 'boolean'
    ];

    public function creche(): BelongsTo
    {
        return $this->belongsTo(Creche::class);
    }

    public function criancas(): HasMany
    {
        return $this->hasMany(Crianca::class);
    }

    // Accessor para obter quantidade de crianças matriculadas
    public function getCriancasMatriculadasAttribute(): int
    {
        return $this->criancas()->where('status', 'matriculada')->count();
    }

    // Accessor para obter vagas disponíveis
    public function getVagasDisponiveisAttribute(): int
    {
        return $this->capacidade - $this->criancas_matriculadas;
    }
}
