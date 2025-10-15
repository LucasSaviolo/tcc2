<?php

namespace Database\Seeders;

use App\Models\Crianca;
use App\Models\FilaEspera;
use App\Models\PreferenciaCreche;
use App\Models\Creche;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class FilaEsperaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Pegar crianças que não estão alocadas
        $criancasNaoAlocadas = Crianca::whereDoesntHave('alocacao')->take(40)->get();
        
        // Pegar todas as creches
        $creches = Creche::all();
        $totalCreches = $creches->count();
        
        foreach ($criancasNaoAlocadas as $index => $crianca) {
            // Criar entre 1 e 3 preferências de creche
            $numPreferencias = rand(1, 3);
            
            for ($i = 0; $i < $numPreferencias; $i++) {
                $crecheIndex = ($index + $i) % $totalCreches;
                
                // Verificar se a preferência já existe
                if (!PreferenciaCreche::where('crianca_id', $crianca->id)
                    ->where('creche_id', $creches[$crecheIndex]->id)
                    ->exists()) {
                    
                    PreferenciaCreche::create([
                        'crianca_id' => $crianca->id,
                        'creche_id' => $creches[$crecheIndex]->id,
                        'ordem_preferencia' => $i + 1
                    ]);
                }
            }
            
            // Criar fila de espera
            $dataInscricao = Carbon::now()->subDays(rand(1, 60));
            FilaEspera::create([
                'crianca_id' => $crianca->id,
                'pontuacao_total' => rand(10, 100),
                // armazenar como array; o model faz o cast para JSON
                'criterios_aplicados' => [
                    ['criterio' => 'Renda Familiar', 'pontuacao' => rand(5, 20)],
                    ['criterio' => 'Mãe Trabalhadora', 'pontuacao' => rand(3, 10)]
                ],
                // deixar 0 para que a reordenação calcule a posição de forma determinística
                'posicao_fila' => 0,
                'data_inscricao' => $dataInscricao->toDateString(),
                'data_cadastro' => $dataInscricao,
                'pontuacao' => rand(10, 100),
                'status' => 'aguardando'
            ]);
        }
    }
}
