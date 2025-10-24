<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Cria ou atualiza o usuário admin solicitado
        User::updateOrCreate(
            ['email' => 'admin@teste.com'],
            [
                'name' => 'Administrador',
                'password' => 'password', // será hasheado automaticamente pelo cast 'hashed'
            ]
        );
    }
}
