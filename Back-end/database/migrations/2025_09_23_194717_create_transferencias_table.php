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
        Schema::create('transferencias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('crianca_id')->constrained('criancas');
            $table->foreignId('creche_origem_id')->nullable()->constrained('creches');
            $table->foreignId('creche_destino_id')->nullable()->constrained('creches');
            $table->enum('tipo_movimentacao', [
                'transferencia', 
                'desistencia', 
                'matricula_inicial'
            ]);
            $table->enum('status', ['pendente', 'aprovada', 'negada'])->default('pendente');
            $table->text('motivo')->nullable();
            $table->date('data_solicitacao')->default(now());
            $table->date('data_processamento')->nullable();
            $table->integer('ano_letivo')->default(date('Y'));
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transferencias');
    }
};
