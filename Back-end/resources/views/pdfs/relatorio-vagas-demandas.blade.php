@extends('pdfs.layout')

@section('title', 'Relatório de Vagas e Demandas')
@section('subtitle', 'Análise de Oferta vs Demanda por Vagas')

@section('content')
    <!-- Dashboard -->
    <div class="section">
        <div class="section-title">Indicadores de Demanda</div>
        <div class="dashboard-cards">
            <div class="card">
                <div class="card-title">Total de Vagas Ofertadas</div>
                <div class="card-value">{{ $relatorio['dashboard']['total_vagas_ofertadas'] ?? 0 }}</div>
            </div>
            <div class="card">
                <div class="card-title">Crianças na Fila de Espera</div>
                <div class="card-value">{{ $relatorio['dashboard']['total_fila_espera'] ?? 0 }}</div>
            </div>
            <div class="card">
                <div class="card-title">Taxa Média de Ocupação</div>
                <div class="card-value">{{ $relatorio['dashboard']['taxa_media_ocupacao'] ?? 0 }}%</div>
            </div>
        </div>
    </div>

    <!-- Ranking Creches Mais Procuradas -->
    <div class="section">
        <div class="section-title">Creches Mais Procuradas</div>
        <table class="table">
            <thead>
                <tr>
                    <th>Posição</th>
                    <th>Nome da Creche</th>
                    <th>Crianças na Fila</th>
                </tr>
            </thead>
            <tbody>
                @if(isset($relatorio['dashboard']['ranking_creches_mais_procuradas']))
                    @foreach($relatorio['dashboard']['ranking_creches_mais_procuradas'] as $index => $creche)
                    <tr>
                        <td>{{ $index + 1 }}º</td>
                        <td>{{ $creche['nome'] ?? 'N/A' }}</td>
                        <td>{{ $creche['criancas_na_fila'] ?? 0 }}</td>
                    </tr>
                    @endforeach
                @endif
            </tbody>
        </table>
    </div>

    <!-- Tabela Detalhada por Creche -->
    <div class="section page-break">
        <div class="section-title">Situação Detalhada por Creche</div>
        <table class="table">
            <thead>
                <tr>
                    <th>Creche</th>
                    <th>Vagas Ofertadas</th>
                    <th>Crianças na Fila</th>
                    <th>Taxa de Ocupação</th>
                </tr>
            </thead>
            <tbody>
                @foreach($relatorio['tabela_simplificada'] ?? [] as $creche)
                <tr>
                    <td>{{ $creche['creche'] ?? 'N/A' }}</td>
                    <td>{{ $creche['vagas_ofertadas'] ?? 0 }}</td>
                    <td>{{ $creche['criancas_na_fila'] ?? 0 }}</td>
                    <td>
                        @php
                            $val = $creche['ocupacao_percentual'] ?? 0;
                            // Se vier como fração (0..1), converter para porcentagem
                            $pct = $val <= 1 ? round($val * 100, 2) : round($val, 2);
                        @endphp
                        {{ $pct }}%
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
@endsection