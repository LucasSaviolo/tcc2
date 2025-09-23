<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CriteriosPrioridadeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $criterios = [
            [
                'nome' => 'Renda Familiar',
                'descricao' => 'Pontuação baseada na renda familiar per capita',
                'peso' => 8,
                'ativo' => true,
            ],
            [
                'nome' => 'Mãe Trabalhadora',
                'descricao' => 'Mãe que trabalha fora de casa',
                'peso' => 7,
                'ativo' => true,
            ],
            [
                'nome' => 'Família Monoparental',
                'descricao' => 'Criança que vive apenas com um dos pais',
                'peso' => 6,
                'ativo' => true,
            ],
            [
                'nome' => 'Necessidades Especiais',
                'descricao' => 'Criança com necessidades especiais',
                'peso' => 10,
                'ativo' => true,
            ],
            [
                'nome' => 'Distância da Residência',
                'descricao' => 'Proximidade da residência à creche',
                'peso' => 5,
                'ativo' => true,
            ],
            [
                'nome' => 'Irmão na Instituição',
                'descricao' => 'Criança que possui irmão já matriculado na creche',
                'peso' => 4,
                'ativo' => true,
            ],
            [
                'nome' => 'Situação de Vulnerabilidade',
                'descricao' => 'Família em situação de vulnerabilidade social',
                'peso' => 9,
                'ativo' => true,
            ],
        ];

        foreach ($criterios as $criterio) {
            \App\Models\CriterioPrioridade::create($criterio);
        }
    }
}
