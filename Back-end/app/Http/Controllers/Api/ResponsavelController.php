<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ResponsavelResource;
use App\Models\Responsavel;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class ResponsavelController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        
        $query = Responsavel::withCount('criancas');
        
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nome', 'like', "%{$search}%")
                  ->orWhere('cpf', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        $responsaveis = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => ResponsavelResource::collection($responsaveis->items()),
            'meta' => [
                'pagination' => [
                    'total' => $responsaveis->total(),
                    'per_page' => $responsaveis->perPage(),
                    'current_page' => $responsaveis->currentPage(),
                    'last_page' => $responsaveis->lastPage(),
                    'from' => $responsaveis->firstItem(),
                    'to' => $responsaveis->lastItem(),
                ]
            ],
            'message' => 'Lista de responsáveis obtida com sucesso'
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'nome' => 'required|string|max:255',
                'cpf' => 'required|string|unique:responsaveis,cpf',
                'telefone' => 'required|string',
                'email' => 'required|email|unique:responsaveis,email',
                'endereco' => 'required|string'
            ]);

            $responsavel = Responsavel::create($validated);

            return response()->json([
                'success' => true,
                'data' => new ResponsavelResource($responsavel),
                'message' => 'Responsável criado com sucesso'
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
        $responsavel = Responsavel::with('criancas')->find($id);
        
        if (!$responsavel) {
            return response()->json([
                'success' => false,
                'message' => 'Responsável não encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new ResponsavelResource($responsavel),
            'message' => 'Responsável encontrado'
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $responsavel = Responsavel::find($id);
        
        if (!$responsavel) {
            return response()->json([
                'success' => false,
                'message' => 'Responsável não encontrado'
            ], 404);
        }

        try {
            $validated = $request->validate([
                'nome' => 'sometimes|string|max:255',
                'cpf' => 'sometimes|string|unique:responsaveis,cpf,' . $id,
                'telefone' => 'sometimes|string',
                'email' => 'sometimes|email|unique:responsaveis,email,' . $id,
                'endereco' => 'sometimes|string'
            ]);

            $responsavel->update($validated);

            return response()->json([
                'success' => true,
                'data' => new ResponsavelResource($responsavel),
                'message' => 'Responsável atualizado com sucesso'
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
        $responsavel = Responsavel::find($id);
        
        if (!$responsavel) {
            return response()->json([
                'success' => false,
                'message' => 'Responsável não encontrado'
            ], 404);
        }

        $responsavel->delete();

        return response()->json([
            'success' => true,
            'message' => 'Responsável removido com sucesso'
        ]);
    }
}
