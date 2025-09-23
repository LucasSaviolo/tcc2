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
        Schema::create('fila_espera', function (Blueprint $table) {
            $table->id();
            $table->foreignId('crianca_id')->constrained('criancas');
            $table->decimal('pontuacao_total', 8, 2)->default(0);
            $table->json('criterios_aplicados')->nullable();
            $table->integer('posicao_fila')->default(0);
            $table->date('data_inscricao');
            $table->datetime('data_cadastro')->nullable(); // Manter compatibilidade
            $table->integer('pontuacao')->default(0); // Manter compatibilidade
            $table->enum('status', ['aguardando', 'ativa', 'pausada', 'removida'])->default('aguardando');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fila_espera');
    }
};
