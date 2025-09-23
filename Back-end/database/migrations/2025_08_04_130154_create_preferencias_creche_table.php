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
        Schema::create('preferencias_creche', function (Blueprint $table) {
            $table->id();
            $table->foreignId('crianca_id')->constrained('criancas')->onDelete('cascade');
            $table->foreignId('creche_id')->constrained('creches')->onDelete('cascade');
            $table->integer('ordem_preferencia');
            $table->timestamps();
            
            // Garantir que uma criança não tenha a mesma creche em mais de uma preferência
            $table->unique(['crianca_id', 'creche_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('preferencias_creche');
    }
};
