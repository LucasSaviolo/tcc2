<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ExecutarAlocacaoRequest;
use App\Http\Resources\AlocacaoResource;
use App\Models\Alocacao;
use App\Services\AlocacaoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Alocações",
 *     description="Endpoints para gerenciamento de alocações"
 * )
 */
class AlocacaoController extends Controller
{
    public function __construct(private AlocacaoService $alocacaoService)
    {
    }

    /**
     * @OA\Get(
     *     path="/api/alocacoes",
     *     summary="Lista de alocações",
     *     tags={"Alocações"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Lista de alocações obtida com sucesso"
     *     )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $status = $request->get('status');
        
        $query = Alocacao::with(['crianca.responsavel', 'creche']);
        
        if ($status) {
            $query->where('status', $status);
        }
        
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->whereHas('crianca', function ($q) use ($search) {
                    $q->where('nome', 'like', "%{$search}%");
                })->orWhereHas('creche', function ($q) use ($search) {
                    $q->where('nome', 'like', "%{$search}%");
                });
            });
        }
        
        $alocacoes = $query->latest('data_inicio')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => AlocacaoResource::collection($alocacoes),
            'meta' => [
                'pagination' => [
                    'total' => $alocacoes->total(),
                    'per_page' => $alocacoes->perPage(),
                    'current_page' => $alocacoes->currentPage(),
                    'last_page' => $alocacoes->lastPage(),
                ]
            ],
            'message' => 'Lista de alocações obtida com sucesso'
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/alocacoes/executar",
     *     summary="Executar alocação automática",
     *     tags={"Alocações"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Alocação executada com sucesso"
     *     )
     * )
     */
    public function executar(ExecutarAlocacaoRequest $request): JsonResponse
    {
        try {
            $resultados = $this->alocacaoService->executarAlocacaoAutomatica();
            
            return response()->json([
                'success' => true,
                'data' => $resultados,
                'message' => 'Alocação automática executada com sucesso'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao executar alocação: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/alocacoes/historico",
     *     summary="Histórico de alocações",
     *     tags={"Alocações"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Histórico obtido com sucesso"
     *     )
     * )
     */
    public function historico(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 20);
        $dataInicio = $request->get('data_inicio');
        $dataFim = $request->get('data_fim');
        
        $query = Alocacao::with(['crianca.responsavel', 'creche']);
        
        if ($dataInicio) {
            $query->where('data_inicio', '>=', $dataInicio);
        }
        
        if ($dataFim) {
            $query->where('data_inicio', '<=', $dataFim);
        }
        
        $historico = $query->latest('data_inicio')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => AlocacaoResource::collection($historico),
            'meta' => [
                'pagination' => [
                    'total' => $historico->total(),
                    'per_page' => $historico->perPage(),
                    'current_page' => $historico->currentPage(),
                    'last_page' => $historico->lastPage(),
                ]
            ],
            'message' => 'Histórico de alocações obtido com sucesso'
        ]);
    }
}
