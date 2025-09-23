<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Creche;

class CrechesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $creches = [
            [
                'nome' => 'Creche Pequenos Sonhos',
                'endereco' => 'Rua das Flores, 123 - Centro',
                'telefone' => '(11) 3456-7890',
                'capacidade_total' => 37,
                'vagas_disponiveis' => 0,
                'idades_aceitas' => [0, 1, 2, 3],
                'ativa' => true,
            ],
            [
                'nome' => 'Centro Educacional Arco-Íris',
                'endereco' => 'Av. Principal, 456 - Jardim Alegre',
                'telefone' => '(11) 3456-7891',
                'capacidade_total' => 80,
                'vagas_disponiveis' => 25,
                'idades_aceitas' => [1, 2, 3, 4, 5],
                'ativa' => true,
            ],
            [
                'nome' => 'Creche Municipal Vila Nova',
                'endereco' => 'Rua da Esperança, 789 - Vila Nova',
                'telefone' => '(11) 3456-7892',
                'capacidade_total' => 60,
                'vagas_disponiveis' => 10,
                'idades_aceitas' => [0, 1, 2],
                'ativa' => true,
            ],
            [
                'nome' => 'Escola Infantil Futuro Brilhante',
                'endereco' => 'Rua do Saber, 321 - Educação',
                'telefone' => '(11) 3456-7893',
                'capacidade_total' => 70,
                'vagas_disponiveis' => 20,
                'idades_aceitas' => [2, 3, 4, 5],
                'ativa' => true,
            ],
            [
                'nome' => 'Creche Comunitária Crescer',
                'endereco' => 'Av. da Comunidade, 654 - Bairro Unido',
                'telefone' => '(11) 3456-7894',
                'capacidade_total' => 40,
                'vagas_disponiveis' => 8,
                'idades_aceitas' => [0, 1, 2, 3, 4],
                'ativa' => true,
            ],
        ];

        foreach ($creches as $creche) {
            Creche::create($creche);
        }
    }
}
