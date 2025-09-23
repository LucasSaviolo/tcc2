<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Turma;
use App\Models\Creche;

class TurmaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $creches = Creche::all();

        foreach ($creches as $creche) {
            // Turmas para creche com diferentes configurações baseadas nos turnos
            $turnos = $creche->turnos_disponiveis;
            
            // Berçário (0-1 anos)
            if (in_array(0, $creche->idades_aceitas) || in_array(1, $creche->idades_aceitas)) {
                foreach ($turnos as $turno) {
                    Turma::create([
                        'creche_id' => $creche->id,
                        'nome' => 'Berçário I - ' . ucfirst($turno),
                        'idade_minima' => 0,
                        'idade_maxima' => 1,
                        'turno' => $turno,
                        'capacidade' => $turno == 'integral' ? 15 : 20,
                        'ativa' => true
                    ]);
                }
            }

            // Maternal I (1-2 anos)  
            if (in_array(1, $creche->idades_aceitas) || in_array(2, $creche->idades_aceitas)) {
                foreach ($turnos as $turno) {
                    Turma::create([
                        'creche_id' => $creche->id,
                        'nome' => 'Maternal I - ' . ucfirst($turno),
                        'idade_minima' => 1,
                        'idade_maxima' => 2,
                        'turno' => $turno,
                        'capacidade' => $turno == 'integral' ? 18 : 25,
                        'ativa' => true
                    ]);
                }
            }

            // Maternal II (2-3 anos)
            if (in_array(2, $creche->idades_aceitas) || in_array(3, $creche->idades_aceitas)) {
                foreach ($turnos as $turno) {
                    Turma::create([
                        'creche_id' => $creche->id,
                        'nome' => 'Maternal II - ' . ucfirst($turno),
                        'idade_minima' => 2,
                        'idade_maxima' => 3,
                        'turno' => $turno,
                        'capacidade' => $turno == 'integral' ? 20 : 28,
                        'ativa' => true
                    ]);
                }
            }

            // Pré I (3-4 anos)
            if (in_array(3, $creche->idades_aceitas) || in_array(4, $creche->idades_aceitas)) {
                foreach ($turnos as $turno) {
                    Turma::create([
                        'creche_id' => $creche->id,
                        'nome' => 'Pré I - ' . ucfirst($turno),
                        'idade_minima' => 3,
                        'idade_maxima' => 4,
                        'turno' => $turno,
                        'capacidade' => $turno == 'integral' ? 22 : 30,
                        'ativa' => true
                    ]);
                }
            }

            // Pré II (4-5 anos)
            if (in_array(4, $creche->idades_aceitas) || in_array(5, $creche->idades_aceitas)) {
                foreach ($turnos as $turno) {
                    Turma::create([
                        'creche_id' => $creche->id,
                        'nome' => 'Pré II - ' . ucfirst($turno),
                        'idade_minima' => 4,
                        'idade_maxima' => 5,
                        'turno' => $turno,
                        'capacidade' => $turno == 'integral' ? 25 : 32,
                        'ativa' => true
                    ]);
                }
            }
        }
    }
}
