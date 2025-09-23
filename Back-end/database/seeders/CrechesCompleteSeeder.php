<?php

namespace Database\Seeders;

use App\Models\Creche;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class CrechesCompleteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('pt_BR');
        
        $bairros = [
            'Centro', 'Vila Nova', 'Jardim Primavera', 'Vila São Paulo', 'Jardim das Flores',
            'Parque Industrial', 'Vila Esperança', 'Jardim Europa', 'Vila Santa Maria', 'Jardim Paraíso',
            'Vila América', 'Parque São Jorge'
        ];
        
        $nomes = [
            'Pequenos Sonhos', 'Arco-Íris', 'Cantinho Feliz', 'Futuro Brilhante', 'Mundo da Criança',
            'Espaço Criativo', 'Crescer com Amor', 'Brincando e Aprendendo', 'Semente do Saber', 'Aconchego',
            'Passos do Conhecimento', 'Novo Horizonte'
        ];
        
        // Criar exatamente 12 creches
        for ($i = 0; $i < 12; $i++) {
            $capacidade = $faker->numberBetween(40, 100);
            $vagas = $faker->numberBetween(5, 30);
            $idadesAceitas = [];
            
            // Gerar aleatoriamente quais idades são aceitas (0 a 5 anos)
            $idadeMin = $faker->numberBetween(0, 2);
            $idadeMax = $faker->numberBetween($idadeMin + 1, 5);
            
            for ($idade = $idadeMin; $idade <= $idadeMax; $idade++) {
                $idadesAceitas[] = $idade;
            }
            
            Creche::create([
                'nome' => 'Creche ' . $nomes[$i],
                'endereco' => 'Rua ' . $faker->streetName . ', ' . $faker->buildingNumber . ' - ' . $bairros[$i],
                'telefone' => $faker->numerify('(##) ####-####'),
                'capacidade_total' => $capacidade,
                'vagas_disponiveis' => $vagas,
                'idades_aceitas' => $idadesAceitas,
                'ativa' => true,
            ]);
        }
    }
}
