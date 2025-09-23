<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FilaEsperaResource;
use App\Models\FilaEspera;
use App\Services\AlocacaoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * @OA\Tag(
 *     name="Fila de Espera",
 *     description="Endpoints para gerenciamento da fila de espera"
 * )
 */
class FilaEsperaController extends Controller
{
    public function __construct(private AlocacaoService $alocacaoService)
    {
    }

    /**
     * @OA\Get(
     *     path="/api/fila-espera",
     *     summary="Lista da fila de espera",
     *     tags={"Fila de Espera"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Lista da fila obtida com sucesso"
     *     )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 20);
        $status = $request->get('status', 'aguardando');
        
        $query = FilaEspera::with(['crianca.responsavel'])
            ->where('status', $status)
            ->orderBy('posicao_fila');
        
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->whereHas('crianca', function ($q) use ($search) {
                $q->where('nome', 'like', "%{$search}%")
                  ->orWhereHas('responsavel', function ($q) use ($search) {
                      $q->where('nome', 'like', "%{$search}%");
                  });
            });
        }
        
        $filaEspera = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => FilaEsperaResource::collection($filaEspera),
            'meta' => [
                'pagination' => [
                    'total' => $filaEspera->total(),
                    'per_page' => $filaEspera->perPage(),
                    'current_page' => $filaEspera->currentPage(),
                    'last_page' => $filaEspera->lastPage(),
                ]
            ],
            'message' => 'Lista da fila de espera obtida com sucesso'
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/fila-espera/recalcular",
     *     summary="Recalcular pontuações da fila",
     *     tags={"Fila de Espera"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Pontuações recalculadas com sucesso"
     *     )
     * )
     */
    public function recalcular(): JsonResponse
    {
        DB::beginTransaction();
        
        try {
            $filaEspera = FilaEspera::with('crianca')
                ->where('status', 'aguardando')
                ->get();
            
            $recalculadas = 0;
            
            foreach ($filaEspera as $item) {
                $pontuacao = $this->alocacaoService->calcularPontuacaoCrianca($item->crianca);
                
                $item->update([
                    'pontuacao_total' => $pontuacao['pontuacao_total'],
                    'criterios_aplicados' => $pontuacao['criterios_aplicados'],
                ]);
                
                $recalculadas++;
            }
            
            // Reordenar posições na fila
            $this->reordenarFilaEspera();
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'data' => [
                    'total_recalculadas' => $recalculadas,
                    'timestamp' => now()->toISOString(),
                ],
                'message' => "Pontuações de {$recalculadas} crianças foram recalculadas com sucesso"
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erro ao recalcular pontuações: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reordena a fila de espera baseada na pontuação
     */
    private function reordenarFilaEspera(): void
    {
        $itens = FilaEspera::where('status', 'aguardando')
            ->orderBy('pontuacao_total', 'desc')
            ->orderBy('data_inscricao', 'asc')
            ->get();
        
        $posicao = 1;
        foreach ($itens as $item) {
            $item->update(['posicao_fila' => $posicao++]);
        }
    }
}
