<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('creches', function (Blueprint $table) {
            $table->string('email_institucional')->after('telefone');
            $table->string('nome_responsavel')->after('email_institucional');
            $table->string('email_responsavel')->after('nome_responsavel');
            $table->string('logradouro')->after('endereco');
            $table->string('numero')->after('logradouro');
            $table->string('bairro')->after('numero');
            $table->string('cep', 10)->after('bairro');
            $table->string('cidade')->after('cep');
            $table->json('turnos_disponiveis')->after('idades_aceitas'); // ['manha', 'tarde', 'integral']
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('creches', function (Blueprint $table) {
            $table->dropColumn([
                'email_institucional',
                'nome_responsavel', 
                'email_responsavel',
                'logradouro',
                'numero',
                'bairro',
                'cep',
                'cidade',
                'turnos_disponiveis'
            ]);
        });
    }
};
