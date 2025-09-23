<?php

namespace Database\Seeders;

use App\Models\Responsavel;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class ResponsaveisSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('pt_BR');
        
        // Criar 108 responsáveis (58 + 50)
        for ($i = 0; $i < 108; $i++) {
            Responsavel::create([
                'nome' => $faker->name,
                'cpf' => $faker->numerify('###.###.###-##'),
                'telefone' => $faker->numerify('(##) #####-####'),
                'email' => $faker->unique()->safeEmail,
                'endereco' => $faker->address
            ]);
        }
    }
}
