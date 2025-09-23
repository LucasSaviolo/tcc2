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
        Schema::table('criancas', function (Blueprint $table) {
            $table->enum('sexo', ['masculino', 'feminino'])->after('cpf');
            $table->enum('status', [
                'aguardando_vaga', 
                'matriculada', 
                'irregular', 
                'desistiu', 
                'transferida'
            ])->default('aguardando_vaga')->after('sexo');
            $table->foreignId('turma_id')->nullable()->constrained('turmas')->after('status');
            $table->date('data_solicitacao')->default(now())->after('turma_id');
            $table->text('endereco_diferente')->nullable()->after('data_solicitacao');
            $table->integer('ano_letivo')->default(date('Y'))->after('endereco_diferente');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('criancas', function (Blueprint $table) {
            $table->dropForeign(['turma_id']);
            $table->dropColumn([
                'sexo',
                'status',
                'turma_id',
                'data_solicitacao',
                'endereco_diferente',
                'ano_letivo'
            ]);
        });
    }
};
