<?php

// Teste simples para verificar as rotas
require_once 'vendor/autoload.php';

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\CrecheController;
use App\Http\Controllers\Api\CriancaController;
use App\Http\Controllers\Api\ResponsavelController;

// Simular uma aplicação Laravel mínima
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== TESTE DAS ROTAS API ===\n";

// Teste Creches
echo "\n1. Testando CrecheController:\n";
try {
    $request = new Request();
    $controller = new CrecheController();
    $response = $controller->index($request);
    $data = json_decode($response->getContent(), true);
    echo "   Sucesso: " . ($data['success'] ? 'SIM' : 'NÃO') . "\n";
    echo "   Total de creches: " . count($data['data']) . "\n";
    echo "   Primeira creche: " . ($data['data'][0]['nome'] ?? 'ERRO') . "\n";
} catch (Exception $e) {
    echo "   ERRO: " . $e->getMessage() . "\n";
}

// Teste Responsáveis
echo "\n2. Testando ResponsavelController:\n";
try {
    $request = new Request();
    $controller = new ResponsavelController();
    $response = $controller->index($request);
    $data = json_decode($response->getContent(), true);
    echo "   Sucesso: " . ($data['success'] ? 'SIM' : 'NÃO') . "\n";
    echo "   Total de responsáveis: " . count($data['data']) . "\n";
    echo "   Primeiro responsável: " . ($data['data'][0]['nome'] ?? 'ERRO') . "\n";
} catch (Exception $e) {
    echo "   ERRO: " . $e->getMessage() . "\n";
}

// Teste Crianças
echo "\n3. Testando CriancaController:\n";
try {
    $request = new Request();
    $controller = new CriancaController(new App\Services\AlocacaoService());
    $response = $controller->index($request);
    $data = json_decode($response->getContent(), true);
    echo "   Sucesso: " . ($data['success'] ? 'SIM' : 'NÃO') . "\n";
    echo "   Total de crianças: " . count($data['data']) . "\n";
    echo "   Primeira criança: " . ($data['data'][0]['nome'] ?? 'ERRO') . "\n";
} catch (Exception $e) {
    echo "   ERRO: " . $e->getMessage() . "\n";
}

echo "\n=== FIM DOS TESTES ===\n";
