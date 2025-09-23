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
        Schema::table('responsaveis', function (Blueprint $table) {
            $table->date('data_nascimento')->after('cpf');
            $table->enum('grau_parentesco', [
                'pai', 
                'mae', 
                'tutor', 
                'avo', 
                'ava',
                'outro'
            ])->after('endereco');
            $table->decimal('renda_familiar', 10, 2)->after('grau_parentesco');
            $table->integer('numero_filhos')->after('renda_familiar');
            $table->string('logradouro')->after('endereco');
            $table->string('numero')->after('logradouro');
            $table->string('bairro')->after('numero');
            $table->string('cep', 10)->after('bairro');
            $table->string('cidade')->after('cep');
            $table->enum('situacao', ['regular', 'irregular'])->default('regular')->after('cidade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('responsaveis', function (Blueprint $table) {
            $table->dropColumn([
                'data_nascimento',
                'grau_parentesco',
                'renda_familiar',
                'numero_filhos',
                'logradouro',
                'numero',
                'bairro',
                'cep',
                'cidade',
                'situacao'
            ]);
        });
    }
};
