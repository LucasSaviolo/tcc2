<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Crianca;
use App\Models\Responsavel;
use App\Models\Turma;
use Carbon\Carbon;

class CriancaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $responsaveis = Responsavel::all();
        $turmas = Turma::all();
        
        $criancas = [
            // Filhos da Amanda Silva Santos
            [
                'nome' => 'Gabriel Silva Santos',
                'data_nascimento' => '2021-06-15',
                'idade' => 3,
                'cpf' => null,
                'sexo' => 'masculino',
                'status' => 'matriculada',
                'responsavel_id' => 1,
                'data_solicitacao' => '2024-01-15',
                'ano_letivo' => 2025
            ],
            [
                'nome' => 'Isabella Silva Santos',
                'data_nascimento' => '2023-03-22',
                'idade' => 1,
                'cpf' => null,
                'sexo' => 'feminino',
                'status' => 'aguardando_vaga',
                'responsavel_id' => 1,
                'data_solicitacao' => '2024-02-10',
                'ano_letivo' => 2025
            ],
            
            // Filho do Carlos Eduardo Oliveira
            [
                'nome' => 'Lucas Eduardo Oliveira',
                'data_nascimento' => '2020-11-08',
                'idade' => 4,
                'cpf' => null,
                'sexo' => 'masculino',
                'status' => 'matriculada',
                'responsavel_id' => 2,
                'data_solicitacao' => '2023-12-05',
                'ano_letivo' => 2025
            ],
            
            // Filhos da Maria José da Costa
            [
                'nome' => 'Sofia da Costa',
                'data_nascimento' => '2022-01-12',
                'idade' => 2,
                'cpf' => null,
                'sexo' => 'feminino',
                'status' => 'matriculada',
                'responsavel_id' => 3,
                'data_solicitacao' => '2023-11-20',
                'ano_letivo' => 2025
            ],
            [
                'nome' => 'Miguel da Costa',
                'data_nascimento' => '2020-05-30',
                'idade' => 4,
                'cpf' => null,
                'sexo' => 'masculino',
                'status' => 'aguardando_vaga',
                'responsavel_id' => 3,
                'data_solicitacao' => '2024-01-08',
                'ano_letivo' => 2025
            ],
            [
                'nome' => 'Helena da Costa',
                'data_nascimento' => '2023-09-14',
                'idade' => 1,
                'cpf' => null,
                'sexo' => 'feminino',
                'status' => 'irregular',
                'responsavel_id' => 3,
                'data_solicitacao' => '2024-02-28',
                'ano_letivo' => 2025
            ],
            
            // Filho do João Pedro Ferreira
            [
                'nome' => 'Arthur Pedro Ferreira',
                'data_nascimento' => '2021-10-03',
                'idade' => 3,
                'cpf' => null,
                'sexo' => 'masculino',
                'status' => 'matriculada',
                'responsavel_id' => 4,
                'data_solicitacao' => '2023-12-12',
                'ano_letivo' => 2025
            ],
            
            // Filhos da Ana Lucia Pereira
            [
                'nome' => 'Valentina Lucia Pereira',
                'data_nascimento' => '2022-07-18',
                'idade' => 2,
                'cpf' => null,
                'sexo' => 'feminino',
                'status' => 'aguardando_vaga',
                'responsavel_id' => 5,
                'data_solicitacao' => '2024-01-25',
                'ano_letivo' => 2025
            ],
            [
                'nome' => 'Benjamin Lucia Pereira',
                'data_nascimento' => '2024-02-05',
                'idade' => 0,
                'cpf' => null,
                'sexo' => 'masculino',
                'status' => 'aguardando_vaga',
                'responsavel_id' => 5,
                'data_solicitacao' => '2024-03-01',
                'ano_letivo' => 2025
            ],
            
            // Filhos do Roberto Silva Lima
            [
                'nome' => 'Lorena Silva Lima',
                'data_nascimento' => '2019-12-11',
                'idade' => 5,
                'cpf' => null,
                'sexo' => 'feminino',
                'status' => 'matriculada',
                'responsavel_id' => 6,
                'data_solicitacao' => '2023-10-15',
                'ano_letivo' => 2025
            ],
            [
                'nome' => 'Theo Silva Lima',
                'data_nascimento' => '2021-08-27',
                'idade' => 3,
                'cpf' => null,
                'sexo' => 'masculino',
                'status' => 'matriculada',
                'responsavel_id' => 6,
                'data_solicitacao' => '2023-11-02',
                'ano_letivo' => 2025
            ],
            
            // Filha da Fernanda Alves Souza
            [
                'nome' => 'Alice Alves Souza',
                'data_nascimento' => '2020-04-19',
                'idade' => 4,
                'cpf' => null,
                'sexo' => 'feminino',
                'status' => 'matriculada',
                'responsavel_id' => 7,
                'data_solicitacao' => '2023-12-18',
                'ano_letivo' => 2025
            ],
            
            // Filhos do Luiz Carlos Santos
            [
                'nome' => 'Pedro Carlos Santos',
                'data_nascimento' => '2020-01-14',
                'idade' => 4,
                'cpf' => null,
                'sexo' => 'masculino',
                'status' => 'transferida',
                'responsavel_id' => 8,
                'data_solicitacao' => '2023-09-10',
                'ano_letivo' => 2025
            ],
            [
                'nome' => 'Manuela Carlos Santos',
                'data_nascimento' => '2022-03-08',
                'idade' => 2,
                'cpf' => null,
                'sexo' => 'feminino',
                'status' => 'matriculada',
                'responsavel_id' => 8,
                'data_solicitacao' => '2023-11-30',
                'ano_letivo' => 2025
            ],
            [
                'nome' => 'Davi Carlos Santos',
                'data_nascimento' => '2023-11-25',
                'idade' => 1,
                'cpf' => null,
                'sexo' => 'masculino',
                'status' => 'aguardando_vaga',
                'responsavel_id' => 8,
                'data_solicitacao' => '2024-02-20',
                'ano_letivo' => 2025
            ]
        ];

        foreach ($criancas as $criancaData) {
            $crianca = Crianca::create($criancaData);
            
            // Atribuir turma para crianças matriculadas
            if ($crianca->status == 'matriculada') {
                $turmasApropriadas = $turmas->filter(function($turma) use ($crianca) {
                    return $crianca->idade >= $turma->idade_minima && 
                           $crianca->idade <= $turma->idade_maxima;
                });
                
                if ($turmasApropriadas->count() > 0) {
                    $turmaEscolhida = $turmasApropriadas->random();
                    $crianca->update(['turma_id' => $turmaEscolhida->id]);
                }
            }
        }
    }
}
