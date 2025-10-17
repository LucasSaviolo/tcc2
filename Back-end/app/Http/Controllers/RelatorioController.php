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
    $anoLetivo = $request->input('ano_letivo');
        $faixaEtaria = $request->input('faixa_etaria');
        $status = $request->input('status');
        $crecheId = $request->input('creche_id');

        $query = Crianca::with(['responsavel', 'turma.creche', 'preferenciasCreche.creche']);
        if ($anoLetivo) {
            $query->where('ano_letivo', $anoLetivo);
        }

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

        // Filtros de data (opcionais)
        $dataInicio = $request->input('data_inicio');
        $dataFim = $request->input('data_fim');
        if ($dataInicio) {
            $query->whereDate('data_solicitacao', '>=', $dataInicio);
        }
        if ($dataFim) {
            $query->whereDate('data_solicitacao', '<=', $dataFim);
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

        $total = $criancas->count();
        $meta = [
            'total' => $total,
            'per_page' => $request->input('per_page', $total),
            'page' => $request->input('page', 1),
            'last_page' => 1,
            'from' => $total > 0 ? 1 : 0,
            'to' => $total
        ];
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
            'dados_completos' => $criancas,
            'meta' => $meta
        ]);
    }

    /**
     * Relatório por Creche
     */
    public function relatorioPorCreche(Request $request)
    {
        $crecheId = $request->input('creche_id');
    $anoLetivo = $request->input('ano_letivo');
        $turmaId = $request->input('turma_id');
        $status = $request->input('status');
        
        // Caso uma creche específica seja informada, manter o comportamento atual
        if ($crecheId) {
            $dataInicio = $request->input('data_inicio');
            $dataFim = $request->input('data_fim');
            $creche = Creche::with(['turmas.criancas' => function ($query) use ($anoLetivo, $status, $dataInicio, $dataFim) {
                $query->where('ano_letivo', $anoLetivo);
                if ($status) {
                    $query->where('status', $status);
                }
                if ($dataInicio) {
                    $query->whereDate('data_solicitacao', '>=', $dataInicio);
                }
                if ($dataFim) {
                    $query->whereDate('data_solicitacao', '<=', $dataFim);
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

            $total = $turmas->count();
            $meta = [
                'total' => $total,
                'per_page' => $request->input('per_page', $total),
                'page' => $request->input('page', 1),
                'last_page' => 1,
                'from' => $total > 0 ? 1 : 0,
                'to' => $total
            ];
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
                'dados_completos' => $creche,
                'meta' => $meta
            ]);
        }

        // Sem creche_id: agregar sobre todas as creches ativas
        $dataInicio = $request->input('data_inicio');
        $dataFim = $request->input('data_fim');
        $creches = Creche::with(['turmas.criancas' => function ($query) use ($anoLetivo, $status, $dataInicio, $dataFim) {
            $query->where('ano_letivo', $anoLetivo);
            if ($status) {
                $query->where('status', $status);
            }
            if ($dataInicio) {
                $query->whereDate('data_solicitacao', '>=', $dataInicio);
            }
            if ($dataFim) {
                $query->whereDate('data_solicitacao', '<=', $dataFim);
            }
        }])->where('ativa', true)->get();

        $turmas = $creches->pluck('turmas')->flatten(1);

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
            })->values(),
            // Sem dados_completos específico quando é agregado (evita assumptions no PDF)
            'dados_completos' => null
        ]);
    }

    /**
     * Relatório de Responsáveis
     */
    public function relatorioResponsaveis(Request $request)
    {
    $anoLetivo = $request->input('ano_letivo');
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

        $total = $responsaveis->count();
        $meta = [
            'total' => $total,
            'per_page' => $request->input('per_page', $total),
            'page' => $request->input('page', 1),
            'last_page' => 1,
            'from' => $total > 0 ? 1 : 0,
            'to' => $total
        ];
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
            'dados_completos' => $responsaveis,
            'meta' => $meta
        ]);
    }

    /**
     * Relatório de Vagas e Demandas
     */
    public function relatorioVagasDemandas(Request $request)
    {
    $anoLetivo = $request->input('ano_letivo');
        $faixaEtaria = $request->input('faixa_etaria');
        $crecheId = $request->input('creche_id');

        $dataInicio = $request->input('data_inicio');
        $dataFim = $request->input('data_fim');
        $crechesQuery = Creche::with(['turmas.criancas' => function ($query) use ($anoLetivo, $dataInicio, $dataFim) {
            $query->where('ano_letivo', $anoLetivo);
            if ($dataInicio) {
                $query->whereDate('data_solicitacao', '>=', $dataInicio);
            }
            if ($dataFim) {
                $query->whereDate('data_solicitacao', '<=', $dataFim);
            }
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
        if ($dataInicio) {
            $filaEspera->whereDate('data_solicitacao', '>=', $dataInicio);
        }
        if ($dataFim) {
            $filaEspera->whereDate('data_solicitacao', '<=', $dataFim);
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

        $total = $creches->count();
        $meta = [
            'total' => $total,
            'per_page' => $request->input('per_page', $total),
            'page' => $request->input('page', 1),
            'last_page' => 1,
            'from' => $total > 0 ? 1 : 0,
            'to' => $total
        ];
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
                    'ocupacao_percentual' => $vagasOfertadas > 0 ? round(($ocupadas / $vagasOfertadas), 4) : 0
                ];
            }),
            'dados_completos' => $creches,
            'meta' => $meta
        ]);
    }

    /**
     * Relatório de Transferências e Movimentações
     */
    public function relatorioTransferencias(Request $request)
    {
    $anoLetivo = $request->input('ano_letivo');
        $tipoMovimentacao = $request->input('tipo_movimentacao');
        $crecheOrigemId = $request->input('creche_origem_id');
        $crecheDestinoId = $request->input('creche_destino_id');

        $query = Transferencia::with(['crianca', 'crecheOrigem', 'crecheDestino']);
        if ($anoLetivo) {
            $query->where('ano_letivo', $anoLetivo);
        }

        if ($tipoMovimentacao) {
            $query->where('tipo_movimentacao', $tipoMovimentacao);
        }

        if ($crecheOrigemId) {
            $query->where('creche_origem_id', $crecheOrigemId);
        }

        if ($crecheDestinoId) {
            $query->where('creche_destino_id', $crecheDestinoId);
        }

        // Filtros de data (opcionais)
        $dataInicio = $request->input('data_inicio');
        $dataFim = $request->input('data_fim');
        if ($dataInicio) {
            $query->whereDate('data_solicitacao', '>=', $dataInicio);
        }
        if ($dataFim) {
            $query->whereDate('data_solicitacao', '<=', $dataFim);
        }

        $transferencias = $query->get();

        // Estatísticas
        $totalTransferencias = $transferencias->count();
        $distribuicaoStatus = $transferencias->groupBy('status')->map(function ($group) {
            return $group->count();
        });
        $desistenciasQuery = Crianca::withTrashed()->where('status', 'desistiu');
        if ($anoLetivo) {
            $desistenciasQuery->where('ano_letivo', $anoLetivo);
        }
        $desistencias = $desistenciasQuery->count();

        $total = $transferencias->count();
        $meta = [
            'total' => $total,
            'per_page' => $request->input('per_page', $total),
            'page' => $request->input('page', 1),
            'last_page' => 1,
            'from' => $total > 0 ? 1 : 0,
            'to' => $total
        ];
        return response()->json([
            'dashboard' => [
                'total_transferencias_solicitadas' => $totalTransferencias,
                'distribuicao_status' => $distribuicaoStatus,
                'desistencias_no_ano' => $desistencias
            ],
            'tabela_simplificada' => $transferencias->map(function ($transferencia) {
                return [
                    'nome' => optional($transferencia->crianca)->nome ?? 'N/A',
                    'nome_crianca' => optional($transferencia->crianca)->nome ?? 'N/A',
                    'origem' => optional($transferencia->crecheOrigem)->nome ?? 'N/A',
                    'destino' => optional($transferencia->crecheDestino)->nome ?? 'N/A',
                    'status' => $transferencia->status,
                    'data_solicitacao' => optional($transferencia->data_solicitacao) ? $transferencia->data_solicitacao->format('Y-m-d') : null,
                    'motivo' => $transferencia->motivo
                ];
            }),
            'dados_completos' => $transferencias,
            'meta' => $meta
        ]);
    }

    /**
     * Relatório Estatístico/Gerencial
     */
    public function relatorioEstatistico(Request $request)
    {
    $anoLetivo = $request->input('ano_letivo');
        $faixaEtaria = $request->input('faixa_etaria');
        $bairro = $request->input('bairro');
        $dataInicio = $request->input('data_inicio');
        $dataFim = $request->input('data_fim');

        // Estatísticas gerais
        $criancasQuery = Crianca::query();
        if ($anoLetivo) {
            $criancasQuery->where('ano_letivo', $anoLetivo);
        }
        if ($dataInicio) {
            $criancasQuery->whereDate('data_solicitacao', '>=', $dataInicio);
        }
        if ($dataFim) {
            $criancasQuery->whereDate('data_solicitacao', '<=', $dataFim);
        }
        $totalCriancasCadastradas = $criancasQuery->count();

        $matriculasQuery = Crianca::where('status', 'matriculada');
        if ($anoLetivo) {
            $matriculasQuery->where('ano_letivo', $anoLetivo);
        }
        if ($dataInicio) {
            $matriculasQuery->whereDate('data_solicitacao', '>=', $dataInicio);
        }
        if ($dataFim) {
            $matriculasQuery->whereDate('data_solicitacao', '<=', $dataFim);
        }
        $totalMatriculasEfetivas = $matriculasQuery->count();

        $aguardandoQuery = Crianca::where('status', 'aguardando_vaga');
        if ($anoLetivo) {
            $aguardandoQuery->where('ano_letivo', $anoLetivo);
        }
        if ($dataInicio) {
            $aguardandoQuery->whereDate('data_solicitacao', '>=', $dataInicio);
        }
        if ($dataFim) {
            $aguardandoQuery->whereDate('data_solicitacao', '<=', $dataFim);
        }
        $totalAguardandoVaga = $aguardandoQuery->count();

        // Ranking das creches mais procuradas
        $rankingCreches = Creche::withCount(['preferenciasCreche as procura' => function ($query) use ($anoLetivo, $dataInicio, $dataFim) {
            $query->whereHas('crianca', function ($q) use ($anoLetivo, $dataInicio, $dataFim) {
                $q->where('ano_letivo', $anoLetivo)->where('status', 'aguardando_vaga');
                if ($dataInicio) {
                    $q->whereDate('data_solicitacao', '>=', $dataInicio);
                }
                if ($dataFim) {
                    $q->whereDate('data_solicitacao', '<=', $dataFim);
                }
            });
        }])->orderBy('procura', 'desc')->take(5)->get();

        // Demanda por faixa etária
        $demandaPorIdadeQuery = Crianca::select('idade', DB::raw('count(*) as total'))
            ->where('ano_letivo', $anoLetivo)
            ->where('status', 'aguardando_vaga');
        if ($dataInicio) {
            $demandaPorIdadeQuery->whereDate('data_solicitacao', '>=', $dataInicio);
        }
        if ($dataFim) {
            $demandaPorIdadeQuery->whereDate('data_solicitacao', '<=', $dataFim);
        }
        $demandaPorIdade = $demandaPorIdadeQuery->groupBy('idade')->orderBy('idade')->get();

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
    public function dashboardPrincipal(\Illuminate\Http\Request $request)
    {
        $anoLetivo = $request->query('ano_letivo');

        // Cards principais
        $criancasBaseQuery = Crianca::query();
        if ($anoLetivo) {
            $criancasBaseQuery->where('ano_letivo', $anoLetivo);
        }
        $totalCriancas = $criancasBaseQuery->count();
        $totalCreches = Creche::where('ativa', true)->count();
        $totalResponsaveis = Responsavel::count();
        
        // Gráfico de pizza - vagas ofertadas vs disponíveis
        $totalVagasOfertadas = Turma::where('ativa', true)->sum('capacidade');
        $ocupadasQuery = Crianca::where('status', 'matriculada');
        if ($anoLetivo) {
            $ocupadasQuery->where('ano_letivo', $anoLetivo);
        }
        $totalOcupadas = $ocupadasQuery->count();
        $vagasDisponiveis = max(0, $totalVagasOfertadas - $totalOcupadas);

        // Gráfico de crianças por idade
        $criancasPorIdadeQuery = Crianca::select('idade', DB::raw('count(*) as total'));
        if ($anoLetivo) {
            $criancasPorIdadeQuery->where('ano_letivo', $anoLetivo);
        }
        $criancasPorIdade = $criancasPorIdadeQuery
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
        $criancasPorStatusQuery = Crianca::select('status', DB::raw('count(*) as total'));
        if ($anoLetivo) {
            $criancasPorStatusQuery->where('ano_letivo', $anoLetivo);
        }
        $criancasPorStatus = $criancasPorStatusQuery
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
            'filtros' => [ 'ano_letivo' => $anoLetivo ],
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
