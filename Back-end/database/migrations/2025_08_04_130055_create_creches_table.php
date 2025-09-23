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
        Schema::create('creches', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->string('endereco');
            $table->string('telefone');
            $table->integer('capacidade_total');
            $table->integer('vagas_disponiveis');
            $table->json('idades_aceitas'); // [0,1,2,3,4,5]
            $table->boolean('ativa')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('creches');
    }
};
