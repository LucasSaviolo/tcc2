<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Criar usuário administrador
        User::factory()->create([
            'name' => 'Administrador',
            'email' => 'admin@teste.com',
        ]);

        // Executar seeders na ordem correta
        $this->call([
            CrecheSeeder::class,
            TurmaSeeder::class,
            ResponsavelSeeder::class,
            CriancaSeeder::class,
        ]);
    }
}
