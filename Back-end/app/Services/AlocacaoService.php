<?php

namespace App\Services;

use App\Models\Crianca;
use App\Models\Creche;
use App\Models\FilaEspera;
use App\Models\Alocacao;
use App\Models\CriterioPrioridade;
use Illuminate\Support\Facades\DB;

class AlocacaoService
{
    /**
     * Executa a alocação automática de crianças em creches
     */
    public function executarAlocacaoAutomatica(): array
    {
        DB::beginTransaction();
        
        try {
            $resultados = [
                'alocacoes_realizadas' => 0,
                'criancas_sem_vaga' => 0,
                'detalhes' => []
            ];

            // Busca crianças na fila de espera ordenadas por pontuação
            $filaEspera = FilaEspera::with(['crianca.preferenciasCreche.creche'])
                ->where('status', 'aguardando')
                ->orderBy('pontuacao_total', 'desc')
                ->orderBy('data_inscricao', 'asc')
                ->get();

            foreach ($filaEspera as $itemFila) {
                $crianca = $itemFila->crianca;
                $crecheAlocada = $this->tentarAlocarCrianca($crianca);

                if ($crecheAlocada) {
                    // Criar alocação
                    Alocacao::create([
                        'crianca_id' => $crianca->id,
                        'creche_id' => $crecheAlocada->id,
                        'data_inicio' => now()->toDateString(),
                        'status' => 'ativa'
                    ]);

                    // Atualizar status na fila
                    $itemFila->update(['status' => 'alocada']);

                    // Reduzir vagas disponíveis
                    $crecheAlocada->decrement('vagas_disponiveis');

                    $resultados['alocacoes_realizadas']++;
                    $resultados['detalhes'][] = [
                        'crianca' => $crianca->nome,
                        'creche' => $crecheAlocada->nome,
                        'pontuacao' => $itemFila->pontuacao_total
                    ];
                } else {
                    $resultados['criancas_sem_vaga']++;
                }
            }

            DB::commit();
            return $resultados;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Calcula a pontuação de uma criança baseada nos critérios
     */
    public function calcularPontuacaoCrianca(Crianca $crianca): array
    {
        $criterios = CriterioPrioridade::where('ativo', true)->get();
        $pontuacaoTotal = 0;
        $criteriosAplicados = [];

        foreach ($criterios as $criterio) {
            $pontuacao = $this->aplicarCriterio($crianca, $criterio);
            if ($pontuacao > 0) {
                $pontuacaoTotal += $pontuacao;
                $criteriosAplicados[] = [
                    'criterio' => $criterio->nome,
                    'pontuacao' => $pontuacao
                ];
            }
        }

        return [
            'pontuacao_total' => $pontuacaoTotal,
            'criterios_aplicados' => $criteriosAplicados
        ];
    }

    /**
     * Tenta alocar uma criança em uma creche baseada em suas preferências
     */
    private function tentarAlocarCrianca(Crianca $crianca): ?Creche
    {
        // Busca preferências ordenadas
        $preferencias = $crianca->preferenciasCreche()
            ->with('creche')
            ->orderBy('ordem_preferencia')
            ->get();

        foreach ($preferencias as $preferencia) {
            $creche = $preferencia->creche;
            
            // Verifica se a creche está ativa e tem vagas
            if ($creche->ativa && $creche->vagas_disponiveis > 0) {
                // Verifica se a idade da criança é aceita
                if (in_array($crianca->idade, $creche->idades_aceitas)) {
                    return $creche;
                }
            }
        }

        return null;
    }

    /**
     * Aplica um critério específico para calcular pontuação
     */
    private function aplicarCriterio(Crianca $crianca, CriterioPrioridade $criterio): int
    {
        // Aqui você implementaria a lógica específica de cada critério
        // Por exemplo:
        switch ($criterio->nome) {
            case 'Renda Familiar':
                // Lógica para calcular pontuação baseada na renda
                return $criterio->peso * 2; // Exemplo
            
            case 'Distância da Residência':
                // Lógica para calcular pontuação baseada na distância
                return $criterio->peso * 1; // Exemplo
            
            case 'Necessidades Especiais':
                // Lógica para necessidades especiais
                return $criterio->peso * 3; // Exemplo
            
            default:
                return $criterio->peso;
        }
    }
}
