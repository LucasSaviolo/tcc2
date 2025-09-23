<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Creche;

class CrecheSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $creches = [
            [
                'nome' => 'Creche Municipal Pequenos Sonhos',
                'endereco' => 'Rua das Flores, 123, Centro',
                'logradouro' => 'Rua das Flores',
                'numero' => '123',
                'bairro' => 'Centro',
                'cep' => '12345-000',
                'cidade' => 'São Paulo',
                'telefone' => '(11) 3333-1111',
                'email_institucional' => 'pequenos.sonhos@prefeitura.sp.gov.br',
                'nome_responsavel' => 'Maria Silva',
                'email_responsavel' => 'maria.silva@prefeitura.sp.gov.br',
                'capacidade_total' => 120,
                'vagas_disponiveis' => 25,
                'idades_aceitas' => [0, 1, 2, 3, 4, 5],
                'turnos_disponiveis' => ['manha', 'tarde', 'integral'],
                'ativa' => true
            ],
            [
                'nome' => 'CEMEI Arco-Íris',
                'endereco' => 'Av. Brasil, 456, Vila Esperança',
                'logradouro' => 'Av. Brasil',
                'numero' => '456',
                'bairro' => 'Vila Esperança',
                'cep' => '12345-001',
                'cidade' => 'São Paulo',
                'telefone' => '(11) 3333-2222',
                'email_institucional' => 'arco.iris@prefeitura.sp.gov.br',
                'nome_responsavel' => 'João Santos',
                'email_responsavel' => 'joao.santos@prefeitura.sp.gov.br',
                'capacidade_total' => 150,
                'vagas_disponiveis' => 15,
                'idades_aceitas' => [0, 1, 2, 3, 4, 5],
                'turnos_disponiveis' => ['manha', 'tarde', 'integral'],
                'ativa' => true
            ],
            [
                'nome' => 'Creche Girassol',
                'endereco' => 'Rua da Paz, 789, Jardim Primavera',
                'logradouro' => 'Rua da Paz',
                'numero' => '789',
                'bairro' => 'Jardim Primavera',
                'cep' => '12345-002',
                'cidade' => 'São Paulo',
                'telefone' => '(11) 3333-3333',
                'email_institucional' => 'girassol@prefeitura.sp.gov.br',
                'nome_responsavel' => 'Ana Costa',
                'email_responsavel' => 'ana.costa@prefeitura.sp.gov.br',
                'capacidade_total' => 80,
                'vagas_disponiveis' => 8,
                'idades_aceitas' => [1, 2, 3, 4, 5],
                'turnos_disponiveis' => ['manha', 'tarde'],
                'ativa' => true
            ],
            [
                'nome' => 'CEMEI Estrela do Mar',
                'endereco' => 'Rua do Porto, 321, Beira Mar',
                'logradouro' => 'Rua do Porto',
                'numero' => '321',
                'bairro' => 'Beira Mar',
                'cep' => '12345-003',
                'cidade' => 'São Paulo',
                'telefone' => '(11) 3333-4444',
                'email_institucional' => 'estrela.mar@prefeitura.sp.gov.br',
                'nome_responsavel' => 'Carlos Oliveira',
                'email_responsavel' => 'carlos.oliveira@prefeitura.sp.gov.br',
                'capacidade_total' => 100,
                'vagas_disponiveis' => 30,
                'idades_aceitas' => [0, 1, 2, 3],
                'turnos_disponiveis' => ['integral'],
                'ativa' => true
            ],
            [
                'nome' => 'Creche Mundo Feliz',
                'endereco' => 'Av. Liberdade, 654, Vila Nova',
                'logradouro' => 'Av. Liberdade',
                'numero' => '654',
                'bairro' => 'Vila Nova',
                'cep' => '12345-004',
                'cidade' => 'São Paulo',
                'telefone' => '(11) 3333-5555',
                'email_institucional' => 'mundo.feliz@prefeitura.sp.gov.br',
                'nome_responsavel' => 'Lucia Pereira',
                'email_responsavel' => 'lucia.pereira@prefeitura.sp.gov.br',
                'capacidade_total' => 90,
                'vagas_disponiveis' => 12,
                'idades_aceitas' => [2, 3, 4, 5],
                'turnos_disponiveis' => ['manha', 'tarde', 'integral'],
                'ativa' => true
            ]
        ];

        foreach ($creches as $creche) {
            Creche::create($creche);
        }
    }
}
