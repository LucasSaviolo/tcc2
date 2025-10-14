<?php

namespace App\Http\Controllers;

use App\Models\Creche;
use App\Models\Crianca;
use App\Models\Responsavel;
use App\Models\Turma;
use App\Models\Transferencia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RelatorioController extends Controller
{
    /**
     * Relatório Geral de Crianças
     */
    public function relatorioGeralCriancas(Request $request)
    {
        // Log temporário para debugging: registrar que o método foi chamado e timestamp
        \Log::info('relatorioGeralCriancas called - file version timestamp: ' . now()->toDateTimeString());
        
        $anoLetivo = $request->input('ano_letivo', date('Y'));
        $faixaEtaria = $request->input('faixa_etaria');
        $status = $request->input('status');
        $crecheId = $request->input('creche_id');

        $query = Crianca::with(['responsavel', 'turma.creche', 'preferenciasCreche.creche'])
            ->where('ano_letivo', $anoLetivo);

        if ($faixaEtaria) {
            $query->where('idade', $faixaEtaria);
        }

        if ($status) {
            $query->where('status', $status);
        }

        if ($crecheId) {
            $query->whereHas('turma', function ($q) use ($crecheId) {
                $q->where('creche_id', $crecheId);
            });
        }

        $criancas = $query->get();

        // Cards e estatísticas
        $totalCriancas = $criancas->count();
        $distribuicaoStatus = $criancas->groupBy('status')->map(function ($group) {
            return $group->count();
        });
        $faixaEtariaMaisFrequente = $criancas->groupBy('idade')->sortByDesc(function ($group) {
            return $group->count();
        })->keys()->first();

        return response()->json([
            'dashboard' => [
                'total_criancas' => $totalCriancas,
                'distribuicao_status' => $distribuicaoStatus,
                'faixa_etaria_mais_frequente' => $faixaEtariaMaisFrequente
            ],
            'tabela_simplificada' => (function() use ($criancas) {
                $rows = [];
                foreach ($criancas as $crianca) {
                    $crecheNome = null;
                    $pref = null;
                    if (isset($crianca->preferenciasCreche) && $crianca->preferenciasCreche) {
                        // evita chamar methods em null
                        $firstPref = $crianca->preferenciasCreche->first();
                        if ($firstPref && isset($firstPref->creche) && $firstPref->creche) {
                            $crecheNome = $firstPref->creche->nome;
                        }
                    }

                    $rows[] = [
                        'nome' => $crianca->nome,
                        'idade' => $crianca->idade,
                        'status' => $crianca->status,
                        'creche_preferencia' => $crecheNome
                    ];
                }
                return $rows;
            })(),
            'dados_completos' => $criancas
        ]);
    }

    /**
     * Relatório por Creche
     */
    public function relatorioPorCreche(Request $request)
    {
        $crecheId = $request->input('creche_id', 1);
        $anoLetivo = $request->input('ano_letivo', date('Y'));
        $turmaId = $request->input('turma_id');
        $status = $request->input('status');

        $creche = Creche::with(['turmas.criancas' => function ($query) use ($anoLetivo, $status) {
            $query->where('ano_letivo', $anoLetivo);
            if ($status) {
                $query->where('status', $status);
            }
        }])->findOrFail($crecheId);

        $turmas = $creche->turmas;
        if ($turmaId) {
            $turmas = $turmas->where('id', $turmaId);
        }

        // Calcular estatísticas
        $capacidadeTotal = $turmas->sum('capacidade');
        $ocupacao = $turmas->sum(function ($turma) {
            return $turma->criancas->where('status', 'matriculada')->count();
        });
        $taxaOcupacao = $capacidadeTotal > 0 ? ($ocupacao / $capacidadeTotal) * 100 : 0;

        return response()->json([
            'dashboard' => [
                'capacidade_total' => $capacidadeTotal,
                'ocupacao' => $ocupacao,
                'taxa_ocupacao' => round($taxaOcupacao, 2)
            ],
            'tabela_simplificada' => $turmas->map(function ($turma) {
                $ocupadas = $turma->criancas->where('status', 'matriculada')->count();
                return [
                    'turma' => $turma->nome,
                    'vagas_ofertadas' => $turma->capacidade,
                    'ocupadas' => $ocupadas,
                    'disponiveis' => $turma->capacidade - $ocupadas
                ];
            }),
            'dados_completos' => $creche
        ]);
    }

    /**
     * Relatório de Responsáveis
     */
    public function relatorioResponsaveis(Request $request)
    {
        $anoLetivo = $request->input('ano_letivo', date('Y'));
        $nome = $request->input('nome');
        $cpf = $request->input('cpf');
        $situacao = $request->input('situacao');
        $bairro = $request->input('bairro');

        $query = Responsavel::with(['criancas' => function ($q) use ($anoLetivo) {
            $q->where('ano_letivo', $anoLetivo);
        }]);

        if ($nome) {
            $query->where('nome', 'like', "%{$nome}%");
        }

        if ($cpf) {
            $query->where('cpf', 'like', "%{$cpf}%");
        }

        if ($situacao) {
            $query->where('situacao', $situacao);
        }

        if ($bairro) {
            $query->where('bairro', 'like', "%{$bairro}%");
        }

        $responsaveis = $query->get();

        // Estatísticas
        $totalResponsaveis = $responsaveis->count();
        $distribuicaoSituacao = $responsaveis->groupBy('situacao')->map(function ($group) {
            return $group->count();
        });
        $mediaCriancasPorResponsavel = $responsaveis->avg(function ($responsavel) {
            return $responsavel->criancas->count();
        });

        return response()->json([
            'dashboard' => [
                'total_responsaveis' => $totalResponsaveis,
                'distribuicao_situacao' => $distribuicaoSituacao,
                'media_criancas_por_responsavel' => round($mediaCriancasPorResponsavel, 2)
            ],
            'tabela_simplificada' => $responsaveis->map(function ($responsavel) {
                return [
                    'nome' => $responsavel->nome,
                    'cpf' => $responsavel->cpf,
                    'situacao' => $responsavel->situacao,
                    'num_criancas_vinculadas' => $responsavel->criancas->count()
                ];
            }),
            'dados_completos' => $responsaveis
        ]);
    }

    /**
     * Relatório de Vagas e Demandas
     */
    public function relatorioVagasDemandas(Request $request)
    {
        $anoLetivo = $request->input('ano_letivo', date('Y'));
        $faixaEtaria = $request->input('faixa_etaria');
        $crecheId = $request->input('creche_id');

        $crechesQuery = Creche::with(['turmas.criancas' => function ($query) use ($anoLetivo) {
            $query->where('ano_letivo', $anoLetivo);
        }]);

        if ($crecheId) {
            $crechesQuery->where('id', $crecheId);
        }

        $creches = $crechesQuery->get();

        // Calcular estatísticas
        $totalVagasOfertadas = $creches->sum(function ($creche) {
            return $creche->turmas->sum('capacidade');
        });
        
        $filaEspera = Crianca::where('status', 'aguardando_vaga')
            ->where('ano_letivo', $anoLetivo);
            
        if ($faixaEtaria) {
            $filaEspera->where('idade', $faixaEtaria);
        }
        
        $totalFilaEspera = $filaEspera->count();

        // Ranking das creches mais procuradas
        $rankingCreches = $creches->map(function ($creche) {
            $criancasNaFila = Crianca::whereHas('preferenciasCreche', function ($q) use ($creche) {
                $q->where('creche_id', $creche->id);
            })->where('status', 'aguardando_vaga')->count();
            
            return [
                'nome' => $creche->nome,
                'criancas_na_fila' => $criancasNaFila
            ];
        })->sortByDesc('criancas_na_fila')->take(5);

        $taxaMediaOcupacao = $creches->avg(function ($creche) {
            $capacidade = $creche->turmas->sum('capacidade');
            $ocupadas = $creche->turmas->sum(function ($turma) {
                return $turma->criancas->where('status', 'matriculada')->count();
            });
            return $capacidade > 0 ? ($ocupadas / $capacidade) * 100 : 0;
        });

        return response()->json([
            'dashboard' => [
                'total_vagas_ofertadas' => $totalVagasOfertadas,
                'total_fila_espera' => $totalFilaEspera,
                'ranking_creches_mais_procuradas' => $rankingCreches,
                'taxa_media_ocupacao' => round($taxaMediaOcupacao, 2)
            ],
            'tabela_simplificada' => $creches->map(function ($creche) {
                $vagasOfertadas = $creche->turmas->sum('capacidade');
                $ocupadas = $creche->turmas->sum(function ($turma) {
                    return $turma->criancas->where('status', 'matriculada')->count();
                });
                $criancasNaFila = Crianca::whereHas('preferenciasCreche', function ($q) use ($creche) {
                    $q->where('creche_id', $creche->id);
                })->where('status', 'aguardando_vaga')->count();
                
                return [
                    'creche' => $creche->nome,
                    'vagas_ofertadas' => $vagasOfertadas,
                    'criancas_na_fila' => $criancasNaFila,
                    'ocupacao_percentual' => $vagasOfertadas > 0 ? round(($ocupadas / $vagasOfertadas) * 100, 2) : 0
                ];
            }),
            'dados_completos' => $creches
        ]);
    }

    /**
     * Relatório de Transferências e Movimentações
     */
    public function relatorioTransferencias(Request $request)
    {
        $anoLetivo = $request->input('ano_letivo', date('Y'));
        $tipoMovimentacao = $request->input('tipo_movimentacao');
        $crecheOrigemId = $request->input('creche_origem_id');
        $crecheDestinoId = $request->input('creche_destino_id');

        $query = Transferencia::with(['crianca', 'crecheOrigem', 'crecheDestino'])
            ->where('ano_letivo', $anoLetivo);

        if ($tipoMovimentacao) {
            $query->where('tipo_movimentacao', $tipoMovimentacao);
        }

        if ($crecheOrigemId) {
            $query->where('creche_origem_id', $crecheOrigemId);
        }

        if ($crecheDestinoId) {
            $query->where('creche_destino_id', $crecheDestinoId);
        }

        $transferencias = $query->get();

        // Estatísticas
        $totalTransferencias = $transferencias->count();
        $distribuicaoStatus = $transferencias->groupBy('status')->map(function ($group) {
            return $group->count();
        });
        $desistencias = Crianca::where('status', 'desistiu')->where('ano_letivo', $anoLetivo)->count();

        return response()->json([
            'dashboard' => [
                'total_transferencias_solicitadas' => $totalTransferencias,
                'distribuicao_status' => $distribuicaoStatus,
                'desistencias_no_ano' => $desistencias
            ],
            'tabela_simplificada' => $transferencias->map(function ($transferencia) {
                return [
                    'nome_crianca' => $transferencia->crianca->nome,
                    'origem' => optional($transferencia->crecheOrigem)->nome ?? 'N/A',
                    'destino' => optional($transferencia->crecheDestino)->nome ?? 'N/A',
                    'status' => $transferencia->status
                ];
            }),
            'dados_completos' => $transferencias
        ]);
    }

    /**
     * Relatório Estatístico/Gerencial
     */
    public function relatorioEstatistico(Request $request)
    {
        $anoLetivo = $request->input('ano_letivo', date('Y'));
        $faixaEtaria = $request->input('faixa_etaria');
        $bairro = $request->input('bairro');

        // Estatísticas gerais
        $totalCriancasCadastradas = Crianca::where('ano_letivo', $anoLetivo)->count();
        $totalMatriculasEfetivas = Crianca::where('status', 'matriculada')
            ->where('ano_letivo', $anoLetivo)->count();
        $totalAguardandoVaga = Crianca::where('status', 'aguardando_vaga')
            ->where('ano_letivo', $anoLetivo)->count();

        // Ranking das creches mais procuradas
        $rankingCreches = Creche::withCount(['preferenciasCreche as procura' => function ($query) use ($anoLetivo) {
            $query->whereHas('crianca', function ($q) use ($anoLetivo) {
                $q->where('ano_letivo', $anoLetivo)->where('status', 'aguardando_vaga');
            });
        }])->orderBy('procura', 'desc')->take(5)->get();

        // Demanda por faixa etária
        $demandaPorIdade = Crianca::select('idade', DB::raw('count(*) as total'))
            ->where('ano_letivo', $anoLetivo)
            ->where('status', 'aguardando_vaga')
            ->groupBy('idade')
            ->orderBy('idade')
            ->get();

        return response()->json([
            'dashboard' => [
                'total_criancas_cadastradas' => $totalCriancasCadastradas,
                'total_matriculas_efetivas' => $totalMatriculasEfetivas,
                'total_aguardando_vaga' => $totalAguardandoVaga,
                'ranking_creches_mais_procuradas' => $rankingCreches,
                'demanda_por_faixa_etaria' => $demandaPorIdade
            ],
            'indicadores' => [
                'taxa_atendimento' => $totalCriancasCadastradas > 0 ? 
                    round(($totalMatriculasEfetivas / $totalCriancasCadastradas) * 100, 2) : 0,
                'lista_espera_percentual' => $totalCriancasCadastradas > 0 ? 
                    round(($totalAguardandoVaga / $totalCriancasCadastradas) * 100, 2) : 0
            ]
        ]);
    }

    /**
     * Dashboard Principal
     */
    public function dashboardPrincipal()
    {
        $anoLetivo = date('Y');

        // Cards principais
        $totalCriancas = Crianca::where('ano_letivo', $anoLetivo)->count();
        $totalCreches = Creche::where('ativa', true)->count();
        $totalResponsaveis = Responsavel::count();
        
        // Gráfico de pizza - vagas ofertadas vs disponíveis
        $totalVagasOfertadas = Turma::where('ativa', true)->sum('capacidade');
        $totalOcupadas = Crianca::where('status', 'matriculada')->count();
        $vagasDisponiveis = $totalVagasOfertadas - $totalOcupadas;

        // Gráfico de crianças por idade
        $criancasPorIdade = Crianca::select('idade', DB::raw('count(*) as total'))
            ->where('ano_letivo', $anoLetivo)
            ->groupBy('idade')
            ->orderBy('idade')
            ->get()
            ->map(function ($item) {
                return [
                    'idade' => $item->idade,
                    'total' => $item->total,
                    'faixa_etaria' => $item->idade . ' anos'
                ];
            });

        // Gráfico de crianças por status
        $criancasPorStatus = Crianca::select('status', DB::raw('count(*) as total'))
            ->where('ano_letivo', $anoLetivo)
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                return [
                    'status' => ucfirst($item->status),
                    'total' => $item->total
                ];
            });

        // Gráfico de creches por região (baseado no bairro)
        $crechesPorRegiao = Creche::select('bairro', DB::raw('count(*) as total'))
            ->where('ativa', true)
            ->groupBy('bairro')
            ->get()
            ->map(function ($item) {
                return [
                    'regiao' => $item->bairro,
                    'total' => $item->total
                ];
            });

        // Lista de creches para o filtro
        $creches = Creche::select('id', 'nome')
            ->where('ativa', true)
            ->orderBy('nome')
            ->get();

        return response()->json([
            'totalCriancas' => $totalCriancas,
            'totalCreches' => $totalCreches,
            'totalResponsaveis' => $totalResponsaveis,
            'totalVagasDisponiveis' => $vagasDisponiveis,
            'criancasPorIdade' => $criancasPorIdade,
            'criancasPorStatus' => $criancasPorStatus,
            'crechesPorRegiao' => $crechesPorRegiao,
            'creches' => $creches,
            'vagas_pie_chart' => [
                'total_vagas_ofertadas' => $totalVagasOfertadas,
                'vagas_ocupadas' => $totalOcupadas,
                'vagas_disponiveis' => $vagasDisponiveis,
                'percentual_disponivel' => $totalVagasOfertadas > 0 ? 
                    round(($vagasDisponiveis / $totalVagasOfertadas) * 100, 2) : 0
            ],
            'criancas_por_idade_chart' => $criancasPorIdade
        ]);
    }

    /**
     * Lista de creches para filtros
     */
    public function listarCreches()
    {
        $creches = Creche::select('id', 'nome')
            ->where('ativa', true)
            ->orderBy('nome')
            ->get();

        return response()->json($creches);
    }
}
