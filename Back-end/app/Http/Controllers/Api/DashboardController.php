<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Crianca;
use App\Models\Creche;
use App\Models\FilaEspera;
use App\Models\Alocacao;
use App\Models\Turma;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        // Suporte a filtro opcional por ano letivo (mantém compatível com RelatorioController)
        $anoLetivo = $request->query('ano_letivo');

        // Total de crianças cadastradas (se ano_letivo informado, filtra; senão, considera todos os anos)
        $criancasBase = Crianca::query();
        if ($anoLetivo) {
            $criancasBase->where('ano_letivo', $anoLetivo);
        }
        $totalCriancas = $criancasBase->count();

        // Total na fila (status 'aguardando_vaga', aplica mesmo critério de ano)
        $totalFilaQuery = Crianca::where('status', 'aguardando_vaga');
        if ($anoLetivo) {
            $totalFilaQuery->where('ano_letivo', $anoLetivo);
        }
        $totalFila = $totalFilaQuery->count();
        // Calcular capacidade total a partir das turmas ativas (fonte canônica)
        $capacidadeTotal = Turma::where('ativa', true)->sum('capacidade') ?? 0;

        // Contar crianças matriculadas (ocupadas) com mesmo critério de ano
        $ocupadasQuery = Crianca::where('status', 'matriculada');
        if ($anoLetivo) {
            $ocupadasQuery->where('ano_letivo', $anoLetivo);
        }
        $ocupadas = $ocupadasQuery->count();

        // Vagas disponíveis = capacidade total - ocupadas
        $totalVagas = max(0, $capacidadeTotal - $ocupadas);

        $totalCreches = Creche::where('ativa', true)->count();
        
        $alocacoesMes = Alocacao::whereMonth('data_inicio', Carbon::now()->month)
            ->whereYear('data_inicio', Carbon::now()->year)
            ->where('status', 'ativa')
            ->count();
        
        $mesAtual = FilaEspera::where('status', 'ativa')->count();
        $mesAnterior = $mesAtual > 5 ? $mesAtual - 5 : $mesAtual;
        $crescimentoFila = $mesAnterior == 0 ? 0.0 : round((($mesAtual - $mesAnterior) / $mesAnterior) * 100, 1);

        $stats = [
            // manter chaves existentes para compatibilidade
            'total_criancas' => $totalCriancas,
            'total_fila' => $totalFila,
            'total_vagas' => $totalVagas,
            'total_creches' => $totalCreches,
            'capacidade_total' => $capacidadeTotal,
            'ocupadas' => $ocupadas,
            'alocacoes_mes' => $alocacoesMes,
            'crescimento_fila' => $crescimentoFila
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
            'message' => 'Estatísticas obtidas com sucesso'
        ]);
    }

    public function chart(): JsonResponse
    {
        $meses = [];
        $dados = [];
        
        for ($i = 5; $i >= 0; $i--) {
            $data = Carbon::now()->subMonths($i);
            $meses[] = $data->format('M');
            
            $alocacoesMes = Alocacao::whereMonth('data_inicio', $data->month)
                ->whereYear('data_inicio', $data->year)
                ->count();

            // Usar o valor real vindo do banco (0 quando não houver alocações nesse mês)
            $dados[] = $alocacoesMes;
        }

        $chartData = [
            'labels' => $meses,
            'datasets' => [
                [
                    'label' => 'Crianças Alocadas',
                    'data' => $dados,
                    'backgroundColor' => ['rgba(59, 130, 246, 0.1)'],
                    'borderColor' => ['rgb(59, 130, 246)']
                ]
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $chartData,
            'message' => 'Dados do gráfico obtidos com sucesso'
        ]);
    }

    public function recent(): JsonResponse
    {
        $activities = [];

        // Incluir crianças com soft delete para sempre exibir o nome na timeline
        $alocacoesRecentes = Alocacao::with([
                'crianca' => function($q){ $q->withTrashed(); },
                'creche'
            ])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        foreach ($alocacoesRecentes as $alocacao) {
            $nomeCrianca = $alocacao->crianca->nome ?? 'Criança';
            $nomeCreche = $alocacao->creche->nome ?? 'Creche';

            $activities[] = [
                'id' => $alocacao->id,
                'type' => 'alocacao',
                'description' => $nomeCrianca . ' foi alocada na ' . $nomeCreche,
                'user' => 'Admin',
                'created_at' => $alocacao->created_at->toISOString()
            ];
        }

        $criancasRecentes = Crianca::with('responsavel')
            ->orderBy('created_at', 'desc')
            ->take(3)
            ->get();

        foreach ($criancasRecentes as $crianca) {
            $activities[] = [
                'id' => 'crianca_' . $crianca->id,
                'type' => 'cadastro',
                'description' => 'Nova criança cadastrada: ' . $crianca->nome,
                'user' => 'Admin',
                'created_at' => $crianca->created_at->toISOString()
            ];
        }

        // Inclusão de eventos de exclusão de crianças (soft delete)
        $criancasExcluidas = Crianca::onlyTrashed()
            ->orderBy('deleted_at', 'desc')
            ->take(3)
            ->get();

        foreach ($criancasExcluidas as $criancaDel) {
            // Garante que exista timestamp de exclusão
            if ($criancaDel->deleted_at) {
                $activities[] = [
                    'id' => 'crianca_del_' . $criancaDel->id,
                    'type' => 'exclusao',
                    'description' => 'Criança excluída: ' . $criancaDel->nome,
                    'user' => 'Admin',
                    'created_at' => $criancaDel->deleted_at->toISOString()
                ];
            }
        }

        $filaRecente = FilaEspera::with('crianca')
            ->orderBy('created_at', 'desc')
            ->take(2)
            ->get();

        foreach ($filaRecente as $fila) {
            $activities[] = [
                'id' => 'fila_' . $fila->id,
                'type' => 'fila_espera',
                'description' => $fila->crianca->nome . ' entrou na fila de espera',
                'user' => 'Sistema',
                'created_at' => $fila->created_at->toISOString()
            ];
        }

        usort($activities, function($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });

        return response()->json([
            'success' => true,
            'data' => array_slice($activities, 0, 10),
            'message' => 'Atividades recentes obtidas com sucesso'
        ]);
    }
}
