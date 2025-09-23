<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Creche extends Model
{
    protected $fillable = [
        'nome',
        'endereco',
        'logradouro',
        'numero',
        'bairro',
        'cep',
        'cidade',
        'telefone',
        'email_institucional',
        'nome_responsavel',
        'email_responsavel',
        'capacidade_total',
        'vagas_disponiveis',
        'idades_aceitas',
        'turnos_disponiveis',
        'ativa'
    ];

    protected $casts = [
        'idades_aceitas' => 'array',
        'turnos_disponiveis' => 'array',
        'ativa' => 'boolean'
    ];

    public function preferenciasCreche(): HasMany
    {
        return $this->hasMany(PreferenciaCreche::class);
    }

    public function alocacoes(): HasMany
    {
        return $this->hasMany(Alocacao::class);
    }

    public function turmas(): HasMany
    {
        return $this->hasMany(Turma::class);
    }

    public function transferenciasOrigem(): HasMany
    {
        return $this->hasMany(Transferencia::class, 'creche_origem_id');
    }

    public function transferenciasDestino(): HasMany
    {
        return $this->hasMany(Transferencia::class, 'creche_destino_id');
    }

    // Accessor para obter total de crianças matriculadas na creche
    public function getCriancasMatriculadasAttribute(): int
    {
        return $this->turmas()->withCount(['criancas' => function ($query) {
            $query->where('status', 'matriculada');
        }])->get()->sum('criancas_count');
    }

    // Accessor para obter taxa de ocupação
    public function getTaxaOcupacaoAttribute(): float
    {
        if ($this->capacidade_total == 0) return 0;
        return ($this->criancas_matriculadas / $this->capacidade_total) * 100;
    }
}
