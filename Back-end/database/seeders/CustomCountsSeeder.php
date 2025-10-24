<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Creche;
use App\Models\Responsavel;
use App\Models\Turma;
use App\Models\Crianca;
use Illuminate\Support\Str;
use Carbon\Carbon;

class CustomCountsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 2 creches
        $creches = [];
        for ($i = 1; $i <= 2; $i++) {
            $creches[$i] = Creche::create([
                'nome' => "Creche Municipal $i",
                'endereco' => "Rua Exemplo, $i",
                'telefone' => '(11) 4000-000'. $i,
                'capacidade_total' => 120,
                'vagas_disponiveis' => 120,
                'idades_aceitas' => [0,1,2,3,4,5],
                'email_institucional' => "contato$i@creche.exemplo.br",
                'nome_responsavel' => "Diretora $i",
                'email_responsavel' => "diretora$i@creche.exemplo.br",
                'logradouro' => 'Rua Exemplo',
                'numero' => (string)(100 + $i),
                'bairro' => 'Centro',
                'cep' => '01000-000',
                'cidade' => 'São Paulo',
                'turnos_disponiveis' => ['manha','tarde','integral'],
                'ativa' => true,
            ]);
        }

        // 3 responsáveis
        $responsaveis = [];
        for ($i = 1; $i <= 3; $i++) {
            $responsaveis[$i] = Responsavel::create([
                'nome' => "Responsável $i",
                'cpf' => str_pad((string)(10000000000 + $i), 11, '0', STR_PAD_LEFT),
                'telefone' => '(11) 9' . str_pad((string)(40000000 + $i), 8, '0', STR_PAD_LEFT),
                'email' => "resp$i@teste.com",
                'endereco' => "Av. Principal, $i",
            ]);
        }

        // 4 turmas (distribuídas entre as 2 creches)
        $turmas = [];
        $turmasSpecs = [
            ['nome' => 'Maternal I', 'idade_minima' => 2, 'idade_maxima' => 3, 'turno' => 'manha', 'capacidade' => 25, 'creche' => 1],
            ['nome' => 'Maternal II', 'idade_minima' => 3, 'idade_maxima' => 4, 'turno' => 'tarde', 'capacidade' => 25, 'creche' => 1],
            ['nome' => 'Pré I', 'idade_minima' => 4, 'idade_maxima' => 5, 'turno' => 'integral', 'capacidade' => 25, 'creche' => 2],
            ['nome' => 'Pré II', 'idade_minima' => 5, 'idade_maxima' => 6, 'turno' => 'manha', 'capacidade' => 25, 'creche' => 2],
        ];
        foreach ($turmasSpecs as $idx => $spec) {
            $turmas[$idx+1] = Turma::create([
                'creche_id' => $creches[$spec['creche']]->id,
                'nome' => $spec['nome'],
                'idade_minima' => $spec['idade_minima'],
                'idade_maxima' => $spec['idade_maxima'],
                'turno' => $spec['turno'],
                'capacidade' => $spec['capacidade'],
                'ativa' => true,
            ]);
        }

        // 5 crianças (vinculadas aos 3 responsáveis, status aguardando_vaga)
        for ($i = 1; $i <= 5; $i++) {
            $resp = $responsaveis[(($i - 1) % 3) + 1];
            $dataNasc = Carbon::now()->subYears(2 + ($i % 4))->subMonths($i);
            Crianca::create([
                'nome' => "Criança $i",
                'data_nascimento' => $dataNasc->format('Y-m-d'),
                // 'idade' será definido pelo mutator em Crianca::setDataNascimentoAttribute
                'cpf' => null,
                'responsavel_id' => $resp->id,
                'sexo' => $i % 2 === 0 ? 'feminino' : 'masculino',
                'status' => 'aguardando_vaga',
                'turma_id' => null,
                'data_solicitacao' => Carbon::now()->format('Y-m-d'),
                'endereco_diferente' => null,
                'ano_letivo' => (int)date('Y'),
            ]);
        }
    }
}
