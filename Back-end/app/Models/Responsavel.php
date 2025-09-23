<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Responsavel extends Model
{
    protected $table = 'responsaveis';

    protected $fillable = [
        'nome',
        'cpf',
        'data_nascimento',
        'telefone',
        'email',
        'endereco',
        'logradouro',
        'numero',
        'bairro',
        'cep',
        'cidade',
        'grau_parentesco',
        'renda_familiar',
        'numero_filhos',
        'situacao'
    ];

    protected $casts = [
        'data_nascimento' => 'date',
        'renda_familiar' => 'decimal:2'
    ];

    public function criancas(): HasMany
    {
        return $this->hasMany(Crianca::class);
    }

    // Accessor para obter número de crianças vinculadas
    public function getCriancasVinculadasAttribute(): int
    {
        return $this->criancas()->count();
    }
}
