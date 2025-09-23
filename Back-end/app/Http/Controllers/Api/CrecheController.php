<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCrecheRequest;
use App\Http\Resources\CrecheResource;
use App\Models\Creche;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Creches",
 *     description="Endpoints para gerenciamento de creches"
 * )
 */
class CrecheController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/creches",
     *     summary="Lista de creches",
     *     tags={"Creches"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Lista de creches obtida com sucesso"
     *     )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $query = Creche::query();
        
        if ($request->has('ativa')) {
            $query->where('ativa', $request->boolean('ativa'));
        }
        
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('nome', 'like', "%{$search}%")
                  ->orWhere('endereco', 'like', "%{$search}%");
            });
        }
        
        $creches = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => CrecheResource::collection($creches->items()),
            'meta' => [
                'pagination' => [
                    'total' => $creches->total(),
                    'per_page' => $creches->perPage(),
                    'current_page' => $creches->currentPage(),
                    'last_page' => $creches->lastPage(),
                    'from' => $creches->firstItem(),
                    'to' => $creches->lastItem(),
                ]
            ],
            'message' => 'Lista de creches obtida com sucesso'
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/creches",
     *     summary="Criar nova creche",
     *     tags={"Creches"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=201,
     *         description="Creche criada com sucesso"
     *     )
     * )
     */
    public function store(StoreCrecheRequest $request): JsonResponse
    {
        $creche = Creche::create($request->validated());
        
        return response()->json([
            'success' => true,
            'data' => new CrecheResource($creche),
            'message' => 'Creche criada com sucesso'
        ], 201);
    }

    /**
     * @OA\Get(
     *     path="/api/creches/{id}",
     *     summary="Detalhes de uma creche",
     *     tags={"Creches"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Detalhes da creche obtidos com sucesso"
     *     )
     * )
     */
    public function show(Creche $creche): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new CrecheResource($creche),
            'message' => 'Detalhes da creche obtidos com sucesso'
        ]);
    }

    /**
     * @OA\Put(
     *     path="/api/creches/{id}",
     *     summary="Atualizar creche",
     *     tags={"Creches"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Creche atualizada com sucesso"
     *     )
     * )
     */
    public function update(StoreCrecheRequest $request, Creche $creche): JsonResponse
    {
        $creche->update($request->validated());
        
        return response()->json([
            'success' => true,
            'data' => new CrecheResource($creche),
            'message' => 'Creche atualizada com sucesso'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Creche $creche): JsonResponse
    {
        if ($creche->alocacoes()->where('status', 'ativa')->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Não é possível remover creche com alocações ativas'
            ], 422);
        }
        
        $creche->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Creche removida com sucesso'
        ]);
    }
}
