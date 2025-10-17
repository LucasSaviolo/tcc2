<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Creche;
use App\Models\Responsavel;
use App\Models\Criterio;
use App\Models\Crianca;
use App\Models\Turma;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class CompleteDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('pt_BR');
        
        // Limpar dados existentes (em ordem reversa de dependências)
        DB::statement('PRAGMA foreign_keys = OFF;');
        DB::table('alocacoes')->delete();
        DB::table('fila_espera')->delete();
        DB::table('preferencias_creche')->delete();
        DB::table('documentos')->delete();
        DB::table('criterios_prioridade')->delete();
        DB::table('criancas')->delete();
        DB::table('turmas')->delete();
        DB::table('criterios')->delete();
        DB::table('responsaveis')->delete();
        DB::table('creches')->delete();
        DB::statement('PRAGMA foreign_keys = ON;');

        $this->command->info('🏫 Criando Creches...');
        $creches = $this->createCreches($faker);
        
        $this->command->info('📋 Criando Critérios de Prioridade...');
        $criterios = $this->createCriterios();
        
        $this->command->info('👨‍👩‍👧 Criando Responsáveis...');
        $responsaveis = $this->createResponsaveis($faker, 50);
        
        $this->command->info('🏫 Criando Turmas...');
        $turmas = $this->createTurmas($creches);
        
        $this->command->info('👶 Criando Crianças...');
        $this->createCriancas($faker, $responsaveis, $creches, $criterios);
        
        $this->command->info('✅ Dados de teste criados com sucesso!');
    }

    private function createCreches($faker): array
    {
        $bairros = ['Centro', 'Jardim Primavera', 'Vila Nova', 'São José', 'Santa Maria', 'Parque Industrial', 'Alto da Boa Vista', 'Cidade Nova'];
        $nomes = ['Creche Municipal', 'CEI', 'Centro de Educação Infantil', 'Escola Municipal de Educação Infantil'];
        
        $creches = [];
        
        foreach ($bairros as $index => $bairro) {
            $nome = $nomes[array_rand($nomes)] . ' ' . $bairro;
            
            // Variar turnos disponíveis
            $turnosOptions = [
                ['manha', 'tarde'],
                ['manha', 'tarde', 'integral'],
                ['integral'],
                ['manha'],
                ['tarde']
            ];
            $turnos = $turnosOptions[array_rand($turnosOptions)];
            
            // Variar idades aceitas
            $idadesOptions = [
                [0, 1, 2, 3, 4, 5],  // Todas as idades
                [0, 1, 2],            // Berçário e maternal
                [3, 4, 5],            // Pré-escola
                [1, 2, 3, 4],         // Maternal e pré
                [0, 1, 2, 3],         // Berçário ao pré I
            ];
            $idades = $idadesOptions[array_rand($idadesOptions)];
            
            $capacidade = $faker->numberBetween(80, 200);
            
            $creche = Creche::create([
                'nome' => $nome,
                'endereco' => $faker->streetAddress(),
                'logradouro' => $faker->streetName(),
                'numero' => $faker->buildingNumber(),
                'bairro' => $bairro,
                'cep' => $faker->postcode(),
                'cidade' => 'São Paulo',
                'telefone' => $faker->phoneNumber(),
                'email_institucional' => strtolower(str_replace(' ', '', $bairro)) . '@creche.sp.gov.br',
                'nome_responsavel' => $faker->name(),
                'email_responsavel' => $faker->email(),
                'capacidade_total' => $capacidade,
                'vagas_disponiveis' => $capacidade, // Será atualizado depois
                'idades_aceitas' => json_encode($idades),
                'turnos_disponiveis' => json_encode($turnos),
                'ativa' => $index < 7 ? true : false, // Última creche inativa
            ]);
            
            $creches[] = $creche;
        }
        
        $total = count($creches);
        $this->command->info("   ✓ {$total} creches criadas");
        return $creches;
    }

    private function createCriterios(): array
    {
        $criterios = [
            [
                'nome' => 'Criança com Deficiência (PCD)',
                'descricao' => 'Criança com deficiência comprovada por laudo médico',
                'peso' => 10,
                'tipo' => 'booleano',
                'ativo' => true
            ],
            [
                'nome' => 'Responsável com Deficiência',
                'descricao' => 'Responsável possui deficiência comprovada',
                'peso' => 8,
                'tipo' => 'booleano',
                'ativo' => true
            ],
            [
                'nome' => 'Baixa Renda',
                'descricao' => 'Renda familiar per capita até meio salário mínimo',
                'peso' => 7,
                'tipo' => 'booleano',
                'ativo' => true
            ],
            [
                'nome' => 'Mãe/Pai Solo',
                'descricao' => 'Responsável único pela criança',
                'peso' => 6,
                'tipo' => 'booleano',
                'ativo' => true
            ],
            [
                'nome' => 'Irmão Matriculado',
                'descricao' => 'Possui irmão já matriculado na mesma creche',
                'peso' => 5,
                'tipo' => 'booleano',
                'ativo' => true
            ],
            [
                'nome' => 'Situação de Risco',
                'descricao' => 'Criança em situação de vulnerabilidade social',
                'peso' => 9,
                'tipo' => 'booleano',
                'ativo' => true
            ],
            [
                'nome' => 'Trabalha Próximo',
                'descricao' => 'Responsável trabalha próximo à creche',
                'peso' => 3,
                'tipo' => 'booleano',
                'ativo' => true
            ],
            [
                'nome' => 'Mora Próximo',
                'descricao' => 'Família reside no mesmo bairro da creche',
                'peso' => 4,
                'tipo' => 'booleano',
                'ativo' => true
            ]
        ];

        $criteriosCreated = [];
        foreach ($criterios as $criterio) {
            $criteriosCreated[] = Criterio::create($criterio);
        }
        
        $total = count($criteriosCreated);
        $this->command->info("   ✓ {$total} critérios criados");
        return $criteriosCreated;
    }

    private function createResponsaveis($faker, int $quantidade): array
    {
        $responsaveis = [];
        
        for ($i = 0; $i < $quantidade; $i++) {
            $genero = $faker->randomElement(['male', 'female']);
            
            $responsavel = Responsavel::create([
                'nome' => $faker->name($genero),
                'cpf' => $this->generateCPF($faker),
                'data_nascimento' => $faker->dateTimeBetween('-50 years', '-20 years')->format('Y-m-d'),
                'telefone' => $faker->cellphoneNumber(),
                'email' => $faker->email(),
                'endereco' => $faker->streetAddress(),
                'logradouro' => $faker->streetName(),
                'numero' => $faker->buildingNumber(),
                'bairro' => $faker->randomElement(['Centro', 'Jardim Primavera', 'Vila Nova', 'São José', 'Santa Maria', 'Parque Industrial', 'Alto da Boa Vista', 'Cidade Nova']),
                'cep' => $faker->postcode(),
                'cidade' => 'São Paulo',
                'grau_parentesco' => $faker->randomElement(['mae', 'pai', 'avo', 'tutor']),
                'renda_familiar' => $faker->randomFloat(2, 1200, 8000),
                'numero_filhos' => $faker->numberBetween(1, 4),
            ]);
            
            $responsaveis[] = $responsavel;
        }
        
        $total = count($responsaveis);
        $this->command->info("   ✓ {$total} responsáveis criados");
        return $responsaveis;
    }

    private function createTurmas(array $creches): array
    {
        $turmas = [];
        
        foreach ($creches as $creche) {
            if (!$creche->ativa) continue;
            
            $turnos = json_decode($creche->turnos_disponiveis, true);
            $idades = json_decode($creche->idades_aceitas, true);
            
            // Berçário I (0-1 anos)
            if (in_array(0, $idades) || in_array(1, $idades)) {
                foreach ($turnos as $turno) {
                    $turmas[] = Turma::create([
                        'creche_id' => $creche->id,
                        'nome' => 'Berçário I',
                        'idade_minima' => 0,
                        'idade_maxima' => 1,
                        'turno' => $turno,
                        'capacidade' => $turno == 'integral' ? 15 : 20,
                        'ativa' => true
                    ]);
                }
            }

            // Maternal I (1-2 anos)
            if (in_array(1, $idades) || in_array(2, $idades)) {
                foreach ($turnos as $turno) {
                    $turmas[] = Turma::create([
                        'creche_id' => $creche->id,
                        'nome' => 'Maternal I',
                        'idade_minima' => 1,
                        'idade_maxima' => 2,
                        'turno' => $turno,
                        'capacidade' => $turno == 'integral' ? 18 : 25,
                        'ativa' => true
                    ]);
                }
            }

            // Maternal II (2-3 anos)
            if (in_array(2, $idades) || in_array(3, $idades)) {
                foreach ($turnos as $turno) {
                    $turmas[] = Turma::create([
                        'creche_id' => $creche->id,
                        'nome' => 'Maternal II',
                        'idade_minima' => 2,
                        'idade_maxima' => 3,
                        'turno' => $turno,
                        'capacidade' => $turno == 'integral' ? 20 : 28,
                        'ativa' => true
                    ]);
                }
            }

            // Pré I (3-4 anos)
            if (in_array(3, $idades) || in_array(4, $idades)) {
                foreach ($turnos as $turno) {
                    $turmas[] = Turma::create([
                        'creche_id' => $creche->id,
                        'nome' => 'Pré I',
                        'idade_minima' => 3,
                        'idade_maxima' => 4,
                        'turno' => $turno,
                        'capacidade' => $turno == 'integral' ? 22 : 30,
                        'ativa' => true
                    ]);
                }
            }

            // Pré II (4-5 anos)
            if (in_array(4, $idades) || in_array(5, $idades)) {
                foreach ($turnos as $turno) {
                    $turmas[] = Turma::create([
                        'creche_id' => $creche->id,
                        'nome' => 'Pré II',
                        'idade_minima' => 4,
                        'idade_maxima' => 5,
                        'turno' => $turno,
                        'capacidade' => $turno == 'integral' ? 25 : 32,
                        'ativa' => true
                    ]);
                }
            }
        }
        
        $total = count($turmas);
        $this->command->info("   ✓ {$total} turmas criadas");
        return $turmas;
    }

    private function createCriancas($faker, array $responsaveis, array $creches, array $criterios): void
    {
        $crechesAtivas = array_filter($creches, fn($c) => $c->ativa);
        $totalCriancas = 0;
        
        foreach ($responsaveis as $responsavel) {
            $numFilhos = $faker->numberBetween(1, min(3, $responsavel->numero_filhos));
            
            for ($i = 0; $i < $numFilhos; $i++) {
                $idade = $faker->numberBetween(0, 5);
                $dataNascimento = now()->subYears($idade)->subMonths($faker->numberBetween(0, 11))->format('Y-m-d');
                
                // Selecionar 3 creches de preferência aleatoriamente
                $preferencias = $faker->randomElements($crechesAtivas, min(3, count($crechesAtivas)));
                
                $crianca = Crianca::create([
                    'nome' => $faker->firstName() . ' ' . $faker->lastName(),
                    'data_nascimento' => $dataNascimento,
                    'idade' => $idade,
                    'cpf' => $idade >= 2 ? $this->generateCPF($faker) : null,
                    'sexo' => $faker->randomElement(['masculino', 'feminino']),
                    'responsavel_id' => $responsavel->id,
                    'status' => 'aguardando_vaga',
                    'data_solicitacao' => now()->subDays($faker->numberBetween(1, 180))->format('Y-m-d'),
                    'ano_letivo' => date('Y'),
                ]);
                
                // Criar preferências de creches
                foreach ($preferencias as $ordem => $creche) {
                    DB::table('preferencias_creche')->insert([
                        'crianca_id' => $crianca->id,
                        'creche_id' => $creche->id,
                        'ordem_preferencia' => $ordem + 1,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
                
                // Aplicar critérios aleatórios (30% das crianças têm critérios)
                // Desabilitado temporariamente devido à estrutura da tabela
                /*
                if ($faker->boolean(30)) {
                    $numCriterios = $faker->numberBetween(1, 3);
                    $criteriosAplicados = $faker->randomElements($criterios, $numCriterios);
                    
                    foreach ($criteriosAplicados as $criterio) {
                        DB::table('criterios_prioridade')->insert([
                            'crianca_id' => $crianca->id,
                            'criterio_id' => $criterio->id,
                            'valor' => 'true',
                            'pontuacao' => $criterio->peso,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
                */
                
                $totalCriancas++;
            }
        }
        
        $this->command->info("   ✓ {$totalCriancas} crianças criadas");
    }

    private function generateCPF($faker): string
    {
        return $faker->numerify('###########');
    }
}
