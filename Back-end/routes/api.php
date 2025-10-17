<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\CriancaController;
use App\Http\Controllers\Api\CrecheController;
use App\Http\Controllers\Api\FilaEsperaController;
use App\Http\Controllers\Api\AlocacaoController;
use App\Http\Controllers\Api\ResponsavelController;
use App\Http\Controllers\Api\CriterioController;
use App\Http\Controllers\RelatorioController;
use App\Http\Controllers\PdfController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Rotas públicas de autenticação
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
});

// ROTAS DE TESTE (SEM AUTENTICAÇÃO) - REMOVER EM PRODUÇÃO
Route::prefix('test')->group(function () {
    Route::get('creches', [CrecheController::class, 'index']);
    Route::get('criancas', [CriancaController::class, 'index']);
    Route::get('responsaveis', [ResponsavelController::class, 'index']);
    Route::get('criterios', [CriterioController::class, 'index']);
});

// ROTAS PRINCIPAIS SEM AUTENTICAÇÃO (TEMPORÁRIO PARA TESTE)

// Rota de teste simples
Route::get('test-simple', function () {
    return response()->json(['status' => 'ok', 'message' => 'Rota pública funcionando']);
});

// Definindo rotas públicas específicas antes dos resources autenticados
Route::get('creches-public', [CrecheController::class, 'index']);
Route::get('criancas-public', [CriancaController::class, 'index']);
Route::get('criancas-public/{crianca}', [CriancaController::class, 'show']);
Route::post('criancas-public', [CriancaController::class, 'store']);
Route::put('criancas-public/{crianca}', [CriancaController::class, 'update']);
Route::delete('criancas-public/{crianca}', [CriancaController::class, 'destroy']);
// Desativar com encerramento opcional de alocação (público para teste)
Route::post('criancas-public/{crianca}/desativar', [CriancaController::class, 'desativar']);
Route::get('responsaveis-public', [ResponsavelController::class, 'index']);
Route::get('criterios', [CriterioController::class, 'index']);

// Metadados do sistema (idades e turnos derivados do banco)
Route::get('meta', function () {
    $idades = \App\Models\Crianca::query()
        ->select('idade')
        ->distinct()
        ->orderBy('idade')
        ->pluck('idade')
        ->filter(function($v){ return $v !== null; })
        ->values()
        ->all();

    $turnos = \App\Models\Turma::query()
        ->where('ativa', true)
        ->select('turno')
        ->distinct()
        ->orderBy('turno')
        ->pluck('turno')
        ->filter(function($v){ return $v !== null && $v !== ''; })
        ->values()
        ->all();

    return response()->json([
        'success' => true,
        'data' => [
            'idades' => $idades,
            'turnos' => $turnos,
        ],
    ]);
});

// Rotas de relatórios (temporariamente sem autenticação para teste)
Route::prefix('relatorios')->group(function () {
    // Dashboard principal
    Route::get('dashboard', [RelatorioController::class, 'dashboardPrincipal']);
    
    // Utilitários
    Route::get('creches', [RelatorioController::class, 'listarCreches']);
    
    // Relatórios em JSON
    Route::get('geral-criancas', [RelatorioController::class, 'relatorioGeralCriancas']);
    Route::get('por-creche', [RelatorioController::class, 'relatorioPorCreche']);
    Route::get('responsaveis', [RelatorioController::class, 'relatorioResponsaveis']);
    Route::get('vagas-demandas', [RelatorioController::class, 'relatorioVagasDemandas']);
    Route::get('transferencias', [RelatorioController::class, 'relatorioTransferencias']);
    Route::get('estatistico', [RelatorioController::class, 'relatorioEstatistico']);
    
    // Exportações em PDF
    Route::prefix('pdf')->group(function () {
        Route::get('geral-criancas', [PdfController::class, 'exportarGeralCriancas']);
        Route::get('por-creche', [PdfController::class, 'exportarPorCreche']);
        Route::get('responsaveis', [PdfController::class, 'exportarResponsaveis']);
        Route::get('vagas-demandas', [PdfController::class, 'exportarVagasDemandas']);
        Route::get('transferencias', [PdfController::class, 'exportarTransferencias']);
        Route::get('estatistico', [PdfController::class, 'exportarEstatistico']);
        // Dashboard principal (exportação PDF)
        Route::get('dashboard', [PdfController::class, 'exportarDashboard']);
    });
});

// Rotas protegidas por autenticação
Route::middleware('auth:sanctum')->group(function () {
    
    // Autenticação
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('user', [AuthController::class, 'user']);
    });
    
    // Dashboard
    Route::prefix('dashboard')->group(function () {
        Route::get('stats', [DashboardController::class, 'stats']);
        Route::get('chart', [DashboardController::class, 'chart']);
        Route::get('recent', [DashboardController::class, 'recent']);
    });
    
    // Responsáveis - CRUD completo
    Route::apiResource('responsaveis', ResponsavelController::class);
    
    // Crianças - CRUD completo
    Route::apiResource('criancas', CriancaController::class);
    // Desativar com encerramento opcional de alocação
    Route::post('criancas/{crianca}/desativar', [CriancaController::class, 'desativar']);
    
    // Creches - CRUD completo
    Route::apiResource('creches', CrecheController::class);
    
    // Critérios - CRUD completo
    Route::apiResource('criterios', CriterioController::class);
    
    // Turmas - CRUD completo
    Route::apiResource('turmas', App\Http\Controllers\Api\TurmaController::class);
    
    // Fila de Espera
    Route::prefix('fila-espera')->group(function () {
        Route::get('/', [FilaEsperaController::class, 'index']);
        Route::post('recalcular', [FilaEsperaController::class, 'recalcular']);
    });
    
    // Alocações
    Route::prefix('alocacoes')->group(function () {
        Route::get('/', [AlocacaoController::class, 'index']);
        Route::post('executar', [AlocacaoController::class, 'executar']);
        Route::get('historico', [AlocacaoController::class, 'historico']);
    });
});
