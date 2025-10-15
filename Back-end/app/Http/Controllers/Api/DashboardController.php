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
    public function stats(): JsonResponse
    {
        // Total de crianças cadastradas no ano letivo atual (fonte canônica para "total de crianças")
        $totalCriancas = Crianca::where('ano_letivo', date('Y'))->count();

        // Total na fila (usar mesmo critério dos relatórios: status 'aguardando_vaga' no ano letivo atual)
        $totalFila = Crianca::where('status', 'aguardando_vaga')
            ->where('ano_letivo', date('Y'))
            ->count();
        // Calcular capacidade total a partir das turmas ativas (fonte canônica)
        $capacidadeTotal = Turma::where('ativa', true)->sum('capacidade') ?? 0;

        // Contar crianças matriculadas (ocupadas)
        $ocupadas = Crianca::where('status', 'matriculada')->count();

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

        $alocacoesRecentes = Alocacao::with(['crianca', 'creche'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        foreach ($alocacoesRecentes as $alocacao) {
            $activities[] = [
                'id' => $alocacao->id,
                'type' => 'alocacao',
                'description' => $alocacao->crianca->nome . ' foi alocada na ' . $alocacao->creche->nome,
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
