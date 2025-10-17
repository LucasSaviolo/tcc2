<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Turma;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * @OA\Tag(
 *     name="Turmas",
 *     description="Endpoints para gerenciamento de turmas"
 * )
 */
class TurmaController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/turmas",
     *     summary="Lista de turmas",
     *     tags={"Turmas"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Lista de turmas obtida com sucesso"
     *     )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 50);
        $query = Turma::with(['creche']);
        
        // Filtro por creche
        if ($request->has('creche_id')) {
            $query->where('creche_id', $request->get('creche_id'));
        }
        
        // Filtro por status ativa
        if ($request->has('ativa')) {
            $query->where('ativa', $request->boolean('ativa'));
        }
        
        // Filtro por turno
        if ($request->has('turno')) {
            $query->where('turno', $request->get('turno'));
        }
        
        // Busca por nome
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('nome', 'like', "%{$search}%")
                  ->orWhereHas('creche', function ($q) use ($search) {
                      $q->where('nome', 'like', "%{$search}%");
                  });
            });
        }
        
        $turmas = $query->latest()->paginate($perPage);

        // Adiciona informações calculadas
        $turmasData = $turmas->items();
        foreach ($turmasData as $turma) {
            $turma->criancas_matriculadas = $turma->criancas_matriculadas;
            $turma->vagas_disponiveis = $turma->vagas_disponiveis;
        }

        return response()->json([
            'success' => true,
            'data' => $turmasData,
            'meta' => [
                'pagination' => [
                    'total' => $turmas->total(),
                    'per_page' => $turmas->perPage(),
                    'current_page' => $turmas->currentPage(),
                    'last_page' => $turmas->lastPage(),
                    'from' => $turmas->firstItem(),
                    'to' => $turmas->lastItem(),
                ]
            ],
            'message' => 'Lista de turmas obtida com sucesso'
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/turmas",
     *     summary="Criar nova turma",
     *     tags={"Turmas"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=201,
     *         description="Turma criada com sucesso"
     *     )
     * )
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'nome' => 'required|string|max:255',
            'creche_id' => 'required|exists:creches,id',
            'idade_minima' => 'required|integer|min:0|max:6',
            'idade_maxima' => 'required|integer|min:0|max:6|gte:idade_minima',
            'turno' => 'required|in:manha,tarde,integral',
            'capacidade' => 'required|integer|min:1|max:100',
            'ativa' => 'boolean'
        ], [
            'nome.required' => 'O nome da turma é obrigatório',
            'creche_id.required' => 'A creche é obrigatória',
            'creche_id.exists' => 'Creche não encontrada',
            'idade_minima.required' => 'A idade mínima é obrigatória',
            'idade_minima.min' => 'A idade mínima deve ser pelo menos 0',
            'idade_minima.max' => 'A idade mínima deve ser no máximo 6',
            'idade_maxima.required' => 'A idade máxima é obrigatória',
            'idade_maxima.min' => 'A idade máxima deve ser pelo menos 0',
            'idade_maxima.max' => 'A idade máxima deve ser no máximo 6',
            'idade_maxima.gte' => 'A idade máxima deve ser maior ou igual à idade mínima',
            'turno.required' => 'O turno é obrigatório',
            'turno.in' => 'Turno inválido. Use: manha, tarde ou integral',
            'capacidade.required' => 'A capacidade é obrigatória',
            'capacidade.min' => 'A capacidade deve ser pelo menos 1',
            'capacidade.max' => 'A capacidade deve ser no máximo 100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erro de validação',
                'errors' => $validator->errors()
            ], 422);
        }

        $turma = Turma::create([
            'nome' => $request->nome,
            'creche_id' => $request->creche_id,
            'idade_minima' => $request->idade_minima,
            'idade_maxima' => $request->idade_maxima,
            'turno' => $request->turno,
            'capacidade' => $request->capacidade,
            'ativa' => $request->get('ativa', true)
        ]);

        $turma->load('creche');
        $turma->criancas_matriculadas = $turma->criancas_matriculadas;
        $turma->vagas_disponiveis = $turma->vagas_disponiveis;

        return response()->json([
            'success' => true,
            'data' => $turma,
            'message' => 'Turma criada com sucesso'
        ], 201);
    }

    /**
     * @OA\Get(
     *     path="/api/turmas/{id}",
     *     summary="Detalhes de uma turma",
     *     tags={"Turmas"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Turma encontrada"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Turma não encontrada"
     *     )
     * )
     */
    public function show(int $id): JsonResponse
    {
        $turma = Turma::with(['creche'])->find($id);

        if (!$turma) {
            return response()->json([
                'success' => false,
                'message' => 'Turma não encontrada'
            ], 404);
        }

        $turma->criancas_matriculadas = $turma->criancas_matriculadas;
        $turma->vagas_disponiveis = $turma->vagas_disponiveis;

        return response()->json([
            'success' => true,
            'data' => $turma,
            'message' => 'Turma encontrada'
        ]);
    }

    /**
     * @OA\Put(
     *     path="/api/turmas/{id}",
     *     summary="Atualizar turma",
     *     tags={"Turmas"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Turma atualizada com sucesso"
     *     )
     * )
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $turma = Turma::find($id);

        if (!$turma) {
            return response()->json([
                'success' => false,
                'message' => 'Turma não encontrada'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'nome' => 'sometimes|required|string|max:255',
            'creche_id' => 'sometimes|required|exists:creches,id',
            'idade_minima' => 'sometimes|required|integer|min:0|max:6',
            'idade_maxima' => 'sometimes|required|integer|min:0|max:6|gte:idade_minima',
            'turno' => 'sometimes|required|in:manha,tarde,integral',
            'capacidade' => 'sometimes|required|integer|min:1|max:100',
            'ativa' => 'boolean'
        ], [
            'nome.required' => 'O nome da turma é obrigatório',
            'creche_id.required' => 'A creche é obrigatória',
            'creche_id.exists' => 'Creche não encontrada',
            'idade_minima.required' => 'A idade mínima é obrigatória',
            'idade_minima.min' => 'A idade mínima deve ser pelo menos 0',
            'idade_minima.max' => 'A idade mínima deve ser no máximo 6',
            'idade_maxima.required' => 'A idade máxima é obrigatória',
            'idade_maxima.min' => 'A idade máxima deve ser pelo menos 0',
            'idade_maxima.max' => 'A idade máxima deve ser no máximo 6',
            'idade_maxima.gte' => 'A idade máxima deve ser maior ou igual à idade mínima',
            'turno.required' => 'O turno é obrigatório',
            'turno.in' => 'Turno inválido. Use: manha, tarde ou integral',
            'capacidade.required' => 'A capacidade é obrigatória',
            'capacidade.min' => 'A capacidade deve ser pelo menos 1',
            'capacidade.max' => 'A capacidade deve ser no máximo 100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erro de validação',
                'errors' => $validator->errors()
            ], 422);
        }

        $turma->update($request->only([
            'nome',
            'creche_id',
            'idade_minima',
            'idade_maxima',
            'turno',
            'capacidade',
            'ativa'
        ]));

        $turma->load('creche');
        $turma->criancas_matriculadas = $turma->criancas_matriculadas;
        $turma->vagas_disponiveis = $turma->vagas_disponiveis;

        return response()->json([
            'success' => true,
            'data' => $turma,
            'message' => 'Turma atualizada com sucesso'
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/turmas/{id}",
     *     summary="Excluir turma",
     *     tags={"Turmas"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Turma excluída com sucesso"
     *     )
     * )
     */
    public function destroy(int $id): JsonResponse
    {
        $turma = Turma::find($id);

        if (!$turma) {
            return response()->json([
                'success' => false,
                'message' => 'Turma não encontrada'
            ], 404);
        }

        // Verifica se há crianças matriculadas na turma
        $criancasMatriculadas = $turma->criancas()->where('status', 'matriculada')->count();
        
        if ($criancasMatriculadas > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Não é possível excluir turma com crianças matriculadas'
            ], 422);
        }

        $turma->delete();

        return response()->json([
            'success' => true,
            'message' => 'Turma excluída com sucesso'
        ]);
    }
}
