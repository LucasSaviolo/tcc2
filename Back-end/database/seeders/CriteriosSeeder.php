<?php

namespace Database\Seeders;

use App\Models\Criterio;
use Illuminate\Database\Seeder;

class CriteriosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $criterios = [
            [
                'nome' => 'Baixa Renda',
                'descricao' => 'Famílias com renda familiar de até 2 salários mínimos',
                'peso' => 30,
                'tipo' => 'social',
                'ativo' => true,
            ],
            [
                'nome' => 'Irmão na Mesma Creche',
                'descricao' => 'Criança que possui irmão já matriculado na creche',
                'peso' => 25,
                'tipo' => 'familiar',
                'ativo' => true,
            ],
            [
                'nome' => 'Proximidade da Residência',
                'descricao' => 'Distância entre a residência e a creche (até 2km)',
                'peso' => 20,
                'tipo' => 'geografico',
                'ativo' => true,
            ],
            [
                'nome' => 'Mãe Trabalhadora',
                'descricao' => 'Mãe com carteira de trabalho assinada ou autônoma',
                'peso' => 15,
                'tipo' => 'social',
                'ativo' => true,
            ],
            [
                'nome' => 'Pai Trabalhador',
                'descricao' => 'Pai com carteira de trabalho assinada ou autônomo',
                'peso' => 10,
                'tipo' => 'social',
                'ativo' => true,
            ],
            [
                'nome' => 'Família Monoparental',
                'descricao' => 'Criança criada por apenas um dos pais',
                'peso' => 15,
                'tipo' => 'familiar',
                'ativo' => true,
            ],
            [
                'nome' => 'Deficiência ou Necessidades Especiais',
                'descricao' => 'Criança com deficiência ou necessidades especiais',
                'peso' => 35,
                'tipo' => 'especial',
                'ativo' => true,
            ],
            [
                'nome' => 'Vulnerabilidade Social',
                'descricao' => 'Família em situação de vulnerabilidade social comprovada',
                'peso' => 25,
                'tipo' => 'social',
                'ativo' => true,
            ]
        ];

        foreach ($criterios as $criterio) {
            Criterio::create($criterio);
        }
    }
}
