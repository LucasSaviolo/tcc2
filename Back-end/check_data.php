<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

$dbPath = DB::connection()->getDatabaseName();
echo "DB em uso: $dbPath" . PHP_EOL;
echo "Creches: " . App\Models\Creche::count() . PHP_EOL;
echo "Turmas: " . App\Models\Turma::count() . PHP_EOL;
echo "Criancas (total Eloquent - exclui soft delete): " . App\Models\Crianca::count() . PHP_EOL;
echo "Criancas (TOTAL cruas na tabela - inclui soft delete): " . DB::table('criancas')->count() . PHP_EOL;
echo "Criancas (withTrashed Eloquent): " . App\Models\Crianca::withTrashed()->count() . PHP_EOL;

$porStatus = App\Models\Crianca::select('status', DB::raw('count(*) as total'))
	->groupBy('status')->orderBy('total','desc')->get();
echo "Criancas por status:" . PHP_EOL;
foreach ($porStatus as $row) {
	echo " - {$row->status}: {$row->total}" . PHP_EOL;
}

$porAno = App\Models\Crianca::select('ano_letivo', DB::raw('count(*) as total'))
	->groupBy('ano_letivo')->orderBy('ano_letivo')->get();
echo "Criancas por ano_letivo:" . PHP_EOL;
foreach ($porAno as $row) {
	$ano = $row->ano_letivo ?? 'NULL';
	echo " - {$ano}: {$row->total}" . PHP_EOL;
}
