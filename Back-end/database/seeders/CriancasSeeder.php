<?php

namespace Database\Seeders;

use App\Models\Crianca;
use App\Models\Responsavel;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class CriancasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('pt_BR');
        
        // Obter todos os responsáveis
        $responsaveis = Responsavel::all();
        $totalResponsaveis = $responsaveis->count();
        
        // Criar 458 crianças (258 + 200)
        for ($i = 0; $i < 458; $i++) {
            // Distribuir as crianças entre os responsáveis
            $responsavelId = $responsaveis[($i % $totalResponsaveis)]->id;
            
            // Gerar data de nascimento para crianças entre 0 e 5 anos
            $dataNascimento = $faker->dateTimeBetween('-5 years', 'now')->format('Y-m-d');
            
            // Calcular idade baseada na data de nascimento
            $idade = Carbon::parse($dataNascimento)->age;
            
            Crianca::create([
                'nome' => $faker->firstName . ' ' . $faker->lastName,
                'data_nascimento' => $dataNascimento,
                'idade' => $idade,
                'cpf' => $faker->numerify('###.###.###-##'),
                'responsavel_id' => $responsavelId
            ]);
        }
    }
}
