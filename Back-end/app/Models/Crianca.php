<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Carbon\Carbon;

class Crianca extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'nome',
        'data_nascimento',
        'idade',
        'cpf',
        'sexo',
        'status',
        'turma_id',
        'data_solicitacao',
        'endereco_diferente',
        'ano_letivo',
        'responsavel_id'
    ];

    protected $casts = [
        'data_nascimento' => 'date',
        'data_solicitacao' => 'date'
    ];

    protected $appends = ['idade_calculada'];

    // Mutator: Calcular automaticamente a idade quando a data de nascimento for definida
    public function setDataNascimentoAttribute($value)
    {
        $this->attributes['data_nascimento'] = $value;
        
        if ($value) {
            $dataNascimento = Carbon::parse($value);
            $this->attributes['idade'] = $dataNascimento->age;
        }
    }

    // Accessor: Retornar idade calculada dinamicamente
    public function getIdadeCalculadaAttribute(): int
    {
        if ($this->data_nascimento) {
            return Carbon::parse($this->data_nascimento)->age;
        }
        
        return $this->idade ?? 0;
    }

    // Accessor: Garantir que o campo idade sempre retorne a idade calculada
    public function getIdadeAttribute($value): int
    {
        if ($this->data_nascimento) {
            return Carbon::parse($this->data_nascimento)->age;
        }
        
        return $value ?? 0;
    }

    public function responsavel(): BelongsTo
    {
        return $this->belongsTo(Responsavel::class);
    }

    public function turma(): BelongsTo
    {
        return $this->belongsTo(Turma::class);
    }

    public function preferenciasCreche(): HasMany
    {
        return $this->hasMany(PreferenciaCreche::class);
    }

    public function filaEspera(): HasOne
    {
        return $this->hasOne(FilaEspera::class);
    }

    public function alocacao(): HasOne
    {
        return $this->hasOne(Alocacao::class);
    }

    public function documentos(): HasMany
    {
        return $this->hasMany(Documento::class);
    }

    public function transferencias(): HasMany
    {
        return $this->hasMany(Transferencia::class);
    }
}
