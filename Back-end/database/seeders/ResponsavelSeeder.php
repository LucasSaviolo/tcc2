<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Responsavel;
use Carbon\Carbon;

class ResponsavelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $responsaveis = [
            [
                'nome' => 'Amanda Silva Santos',
                'cpf' => '123.456.789-01',
                'data_nascimento' => '1985-03-15',
                'telefone' => '(11) 99999-0001',
                'email' => 'amanda.silva@email.com',
                'endereco' => 'Rua das Acácias, 45, Jardim das Flores',
                'logradouro' => 'Rua das Acácias',
                'numero' => '45',
                'bairro' => 'Jardim das Flores',
                'cep' => '01234-000',
                'cidade' => 'São Paulo',
                'grau_parentesco' => 'mae',
                'renda_familiar' => 2500.00,
                'numero_filhos' => 2,
                'situacao' => 'regular'
            ],
            [
                'nome' => 'Carlos Eduardo Oliveira',
                'cpf' => '234.567.890-12',
                'data_nascimento' => '1982-07-22',
                'telefone' => '(11) 99999-0002',
                'email' => 'carlos.oliveira@email.com',
                'endereco' => 'Av. São João, 123, Centro',
                'logradouro' => 'Av. São João',
                'numero' => '123',
                'bairro' => 'Centro',
                'cep' => '01235-001',
                'cidade' => 'São Paulo',
                'grau_parentesco' => 'pai',
                'renda_familiar' => 3200.00,
                'numero_filhos' => 1,
                'situacao' => 'regular'
            ],
            [
                'nome' => 'Maria José da Costa',
                'cpf' => '345.678.901-23',
                'data_nascimento' => '1978-11-08',
                'telefone' => '(11) 99999-0003',
                'email' => 'maria.costa@email.com',
                'endereco' => 'Rua da Esperança, 67, Vila Nova',
                'logradouro' => 'Rua da Esperança',
                'numero' => '67',
                'bairro' => 'Vila Nova',
                'cep' => '01236-002',
                'cidade' => 'São Paulo',
                'grau_parentesco' => 'mae',
                'renda_familiar' => 1800.00,
                'numero_filhos' => 3,
                'situacao' => 'regular'
            ],
            [
                'nome' => 'João Pedro Ferreira',
                'cpf' => '456.789.012-34',
                'data_nascimento' => '1990-05-12',
                'telefone' => '(11) 99999-0004',
                'email' => 'joao.ferreira@email.com',
                'endereco' => 'Rua das Palmeiras, 89, Jardim Primavera',
                'logradouro' => 'Rua das Palmeiras',
                'numero' => '89',
                'bairro' => 'Jardim Primavera',
                'cep' => '01237-003',
                'cidade' => 'São Paulo',
                'grau_parentesco' => 'pai',
                'renda_familiar' => 2800.00,
                'numero_filhos' => 1,
                'situacao' => 'regular'
            ],
            [
                'nome' => 'Ana Lucia Pereira',
                'cpf' => '567.890.123-45',
                'data_nascimento' => '1987-09-30',
                'telefone' => '(11) 99999-0005',
                'email' => 'ana.pereira@email.com',
                'endereco' => 'Av. Brasil, 234, Vila Esperança',
                'logradouro' => 'Av. Brasil',
                'numero' => '234',
                'bairro' => 'Vila Esperança',
                'cep' => '01238-004',
                'cidade' => 'São Paulo',
                'grau_parentesco' => 'mae',
                'renda_familiar' => 1500.00,
                'numero_filhos' => 2,
                'situacao' => 'irregular'
            ],
            [
                'nome' => 'Roberto Silva Lima',
                'cpf' => '678.901.234-56',
                'data_nascimento' => '1975-12-18',
                'telefone' => '(11) 99999-0006',
                'email' => 'roberto.lima@email.com',
                'endereco' => 'Rua do Porto, 156, Beira Mar',
                'logradouro' => 'Rua do Porto',
                'numero' => '156',
                'bairro' => 'Beira Mar',
                'cep' => '01239-005',
                'cidade' => 'São Paulo',
                'grau_parentesco' => 'pai',
                'renda_familiar' => 4500.00,
                'numero_filhos' => 2,
                'situacao' => 'regular'
            ],
            [
                'nome' => 'Fernanda Alves Souza',
                'cpf' => '789.012.345-67',
                'data_nascimento' => '1988-04-07',
                'telefone' => '(11) 99999-0007',
                'email' => 'fernanda.souza@email.com',
                'endereco' => 'Rua da Paz, 78, Jardim Primavera',
                'logradouro' => 'Rua da Paz',
                'numero' => '78',
                'bairro' => 'Jardim Primavera',
                'cep' => '01240-006',
                'cidade' => 'São Paulo',
                'grau_parentesco' => 'mae',
                'renda_familiar' => 2200.00,
                'numero_filhos' => 1,
                'situacao' => 'regular'
            ],
            [
                'nome' => 'Luiz Carlos Santos',
                'cpf' => '890.123.456-78',
                'data_nascimento' => '1983-01-25',
                'telefone' => '(11) 99999-0008',
                'email' => 'luiz.santos@email.com',
                'endereco' => 'Av. Liberdade, 345, Vila Nova',
                'logradouro' => 'Av. Liberdade',
                'numero' => '345',
                'bairro' => 'Vila Nova',
                'cep' => '01241-007',
                'cidade' => 'São Paulo',
                'grau_parentesco' => 'pai',
                'renda_familiar' => 3500.00,
                'numero_filhos' => 3,
                'situacao' => 'regular'
            ]
        ];

        foreach ($responsaveis as $responsavel) {
            Responsavel::create($responsavel);
        }
    }
}
