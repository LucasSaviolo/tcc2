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
        if (!User::where('email', 'admin@teste.com')->exists()) {
            User::factory()->create([
                'name' => 'Administrador',
                'email' => 'admin@teste.com',
            ]);
        }

        // Executar seeder completo de dados de teste
        $this->call([
            CompleteDataSeeder::class,
        ]);
    }
}
