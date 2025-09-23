<?php

namespace Database\Seeders;

use App\Models\Alocacao;
use App\Models\Crianca;
use App\Models\Creche;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class AlocacoesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Pegar 20 crianças aleatórias
        $criancas = Crianca::inRandomOrder()->take(20)->get();
        
        // Pegar todas as creches
        $creches = Creche::all();
        $totalCreches = $creches->count();
        
        foreach ($criancas as $index => $crianca) {
            // Selecionar uma creche (distribuindo as crianças entre as creches)
            $creche = $creches[$index % $totalCreches];
            
            // Criar alocação
            Alocacao::create([
                'crianca_id' => $crianca->id,
                'creche_id' => $creche->id,
                'data_inicio' => Carbon::now()->subDays(rand(1, 30))->toDateString(),
                'data_fim' => rand(0, 1) ? Carbon::now()->addDays(rand(60, 180))->toDateString() : null,
                'status' => 'ativa',
                'observacoes' => 'Alocação automática para teste'
            ]);
            
            // Reduzir vagas disponíveis
            $creche->decrement('vagas_disponiveis');
        }
    }
}
