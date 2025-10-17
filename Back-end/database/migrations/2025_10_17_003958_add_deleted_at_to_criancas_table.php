<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Roda as migrations.
     */
    public function up(): void
    {
        Schema::table('criancas', function (Blueprint $table) {
                $table->softDeletes();
        });
    }

    /**
     * Reverte as migrations.
     */
    public function down(): void
    {
        Schema::table('criancas', function (Blueprint $table) {
                $table->dropSoftDeletes();
        });
    }
};
