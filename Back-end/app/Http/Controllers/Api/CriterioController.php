<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Criterio;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class CriterioController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $ativo = $request->get('ativo');
        
        $query = Criterio::query();
        
        if (!is_null($ativo)) {
            $query->where('ativo', $ativo === 'true' || $ativo === '1');
        }
        
        $criterios = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $criterios->items(),
            'meta' => [
                'pagination' => [
                    'total' => $criterios->total(),
                    'per_page' => $criterios->perPage(),
                    'current_page' => $criterios->currentPage(),
                    'last_page' => $criterios->lastPage(),
                    'from' => $criterios->firstItem(),
                    'to' => $criterios->lastItem(),
                ]
            ],
            'message' => 'Lista de critérios obtida com sucesso'
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'nome' => 'required|string|max:255',
                'descricao' => 'required|string',
                'peso' => 'required|integer|min:1|max:100',
                'tipo' => 'required|string',
                'ativo' => 'boolean'
            ]);

            $criterio = Criterio::create($validated);

            return response()->json([
                'success' => true,
                'data' => $criterio,
                'message' => 'Critério criado com sucesso'
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Dados inválidos',
                'errors' => $e->errors()
            ], 422);
        }
    }

    public function show($id): JsonResponse
    {
        $criterio = Criterio::find($id);
        
        if (!$criterio) {
            return response()->json([
                'success' => false,
                'message' => 'Critério não encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $criterio,
            'message' => 'Critério encontrado'
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $criterio = Criterio::find($id);
        
        if (!$criterio) {
            return response()->json([
                'success' => false,
                'message' => 'Critério não encontrado'
            ], 404);
        }

        try {
            $validated = $request->validate([
                'nome' => 'sometimes|string|max:255',
                'descricao' => 'sometimes|string',
                'peso' => 'sometimes|integer|min:1|max:100',
                'tipo' => 'sometimes|string',
                'ativo' => 'sometimes|boolean'
            ]);

            $criterio->update($validated);

            return response()->json([
                'success' => true,
                'data' => $criterio,
                'message' => 'Critério atualizado com sucesso'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Dados inválidos',
                'errors' => $e->errors()
            ], 422);
        }
    }

    public function destroy($id): JsonResponse
    {
        $criterio = Criterio::find($id);
        
        if (!$criterio) {
            return response()->json([
                'success' => false,
                'message' => 'Critério não encontrado'
            ], 404);
        }

        $criterio->delete();

        return response()->json([
            'success' => true,
            'message' => 'Critério removido com sucesso'
        ]);
    }
}
