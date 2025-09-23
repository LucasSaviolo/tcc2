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
        Schema::create('alocacoes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('crianca_id')->constrained('criancas');
            $table->foreignId('creche_id')->constrained('creches');
            $table->date('data_inicio');
            $table->date('data_fim')->nullable();
            $table->enum('status', ['ativa', 'cancelada', 'concluida'])->default('ativa');
            $table->text('observacoes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alocacoes');
    }
};
