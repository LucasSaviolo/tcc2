<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCriancaRequest;
use App\Http\Requests\UpdateCriancaRequest;
use App\Http\Resources\CriancaResource;
use App\Models\Crianca;
use App\Models\PreferenciaCreche;
use App\Models\FilaEspera;
use App\Services\AlocacaoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * @OA\Tag(
 *     name="Crianças",
 *     description="Endpoints para gerenciamento de crianças"
 * )
 */
class CriancaController extends Controller
{
    public function __construct(private AlocacaoService $alocacaoService)
    {
    }

    /**
     * @OA\Get(
     *     path="/api/criancas",
     *     summary="Lista paginada de crianças",
     *     tags={"Crianças"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Página",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Itens por página",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de crianças obtida com sucesso"
     *     )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        
        $query = Crianca::with(['responsavel', 'preferenciasCreche.creche', 'filaEspera', 'alocacao.creche'])
            ->where('status', '!=', 'desistiu'); // Excluir crianças desativadas
        
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nome', 'like', "%{$search}%")
                  ->orWhere('cpf', 'like', "%{$search}%")
                  ->orWhereHas('responsavel', function ($q) use ($search) {
                      $q->where('nome', 'like', "%{$search}%");
                  });
            });
        }
        
        $criancas = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => CriancaResource::collection($criancas->items()),
            'meta' => [
                'pagination' => [
                    'total' => $criancas->total(),
                    'per_page' => $criancas->perPage(),
                    'current_page' => $criancas->currentPage(),
                    'last_page' => $criancas->lastPage(),
                    'from' => $criancas->firstItem(),
                    'to' => $criancas->lastItem(),
                ]
            ],
            'message' => 'Lista de crianças obtida com sucesso'
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/criancas",
     *     summary="Criar nova criança",
     *     tags={"Crianças"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"nome","data_nascimento","idade","responsavel_id","preferencias_creche"},
     *             @OA\Property(property="nome", type="string"),
     *             @OA\Property(property="data_nascimento", type="string", format="date"),
     *             @OA\Property(property="idade", type="integer"),
     *             @OA\Property(property="cpf", type="string"),
     *             @OA\Property(property="responsavel_id", type="integer"),
     *             @OA\Property(property="preferencias_creche", type="array", @OA\Items(type="object"))
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Criança criada com sucesso"
     *     )
     * )
     */
    public function store(StoreCriancaRequest $request): JsonResponse
    {
        DB::beginTransaction();
        
        try {
            $crianca = Crianca::create($request->validated());
            
            // Criar preferências de creche
            foreach ($request->preferencias_creche as $preferencia) {
                PreferenciaCreche::create([
                    'crianca_id' => $crianca->id,
                    'creche_id' => $preferencia['creche_id'],
                    'ordem_preferencia' => $preferencia['ordem_preferencia'],
                ]);
            }
            
            // Calcular pontuação e adicionar à fila de espera
            $pontuacao = $this->alocacaoService->calcularPontuacaoCrianca($crianca);

            // Criar registro sem depender de count()+1 para evitar race condition.
            // Após a inserção, reordenamos a fila dentro da mesma transação.
            FilaEspera::create([
                'crianca_id' => $crianca->id,
                'pontuacao_total' => $pontuacao['pontuacao_total'],
                'criterios_aplicados' => $pontuacao['criterios_aplicados'],
                // usar 0 para permitir que o DB/migration aplique default e evitar inserir NULL
                'posicao_fila' => 0,
                'data_inscricao' => now()->toDateString(),
                'status' => 'aguardando',
            ]);

            // Reordenar de forma determinística (centralizado no model)
            FilaEspera::reordenarFila();
            
            DB::commit();
            
            $crianca->load(['responsavel', 'preferenciasCreche.creche', 'filaEspera']);
            
            return response()->json([
                'success' => true,
                'data' => new CriancaResource($crianca),
                'message' => 'Criança criada com sucesso'
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erro ao criar criança: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/criancas/{id}",
     *     summary="Detalhes de uma criança",
     *     tags={"Crianças"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Detalhes da criança obtidos com sucesso"
     *     )
     * )
     */
    public function show(Crianca $crianca): JsonResponse
    {
        $crianca->load(['responsavel', 'preferenciasCreche.creche', 'filaEspera', 'alocacao.creche', 'documentos']);
        
        return response()->json([
            'success' => true,
            'data' => new CriancaResource($crianca),
            'message' => 'Detalhes da criança obtidos com sucesso'
        ]);
    }

    /**
     * @OA\Put(
     *     path="/api/criancas/{id}",
     *     summary="Atualizar criança",
     *     tags={"Crianças"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Criança atualizada com sucesso"
     *     )
     * )
     */
    public function update(UpdateCriancaRequest $request, Crianca $crianca): JsonResponse
    {
        DB::beginTransaction();
        
        try {
            $crianca->update($request->validated());
            
            // Atualizar preferências se fornecidas
            if ($request->has('preferencias_creche')) {
                PreferenciaCreche::where('crianca_id', $crianca->id)->delete();
                
                foreach ($request->preferencias_creche as $preferencia) {
                    PreferenciaCreche::create([
                        'crianca_id' => $crianca->id,
                        'creche_id' => $preferencia['creche_id'],
                        'ordem_preferencia' => $preferencia['ordem_preferencia'],
                    ]);
                }
                
                // Recalcular pontuação se houver mudanças
                $pontuacao = $this->alocacaoService->calcularPontuacaoCrianca($crianca);
                
                FilaEspera::where('crianca_id', $crianca->id)->update([
                    'pontuacao_total' => $pontuacao['pontuacao_total'],
                    'criterios_aplicados' => $pontuacao['criterios_aplicados'],
                ]);

                // Reordenar fila após atualização de pontuação
                FilaEspera::reordenarFila();
            }
            
            DB::commit();
            
            $crianca->load(['responsavel', 'preferenciasCreche.creche', 'filaEspera']);
            
            return response()->json([
                'success' => true,
                'data' => new CriancaResource($crianca),
                'message' => 'Criança atualizada com sucesso'
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar criança: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/criancas/{id}",
     *     summary="Remover criança",
     *     tags={"Crianças"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Criança removida com sucesso"
     *     )
     * )
     */
    public function destroy(Crianca $crianca): JsonResponse
    {
        DB::beginTransaction();
        
        try {
            // Verificar se há alocação ativa
            $alocacaoAtiva = $crianca->alocacao()->where('status', 'ativa')->first();
            if ($alocacaoAtiva) {
                return response()->json([
                    'success' => false,
                    'message' => 'Não é possível desativar criança com alocação ativa. Primeiro remova a alocação.'
                ], 422);
            }
            
            // Ao invés de deletar, alterar o status para 'desistiu'
            $crianca->update(['status' => 'desistiu']);
            
            // Remover da fila de espera se estiver aguardando
            FilaEspera::where('crianca_id', $crianca->id)->delete();

            // Reordenar fila após remoção
            FilaEspera::reordenarFila();
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Criança desativada com sucesso'
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erro ao desativar criança: ' . $e->getMessage()
            ], 500);
        }
    }
}
