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
        Schema::create('turmas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('creche_id')->constrained('creches')->onDelete('cascade');
            $table->string('nome'); // Ex: Maternal II, Pré III
            $table->integer('idade_minima');
            $table->integer('idade_maxima');
            $table->enum('turno', ['manha', 'tarde', 'integral']);
            $table->integer('capacidade');
            $table->boolean('ativa')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('turmas');
    }
};
