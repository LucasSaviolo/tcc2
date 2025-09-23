@extends('pdfs.layout')

@section('title', 'Relatório de Responsáveis')
@section('subtitle', 'Análise dos Responsáveis Cadastrados')

@section('content')
    <!-- Dashboard -->
    <div class="section">
        <div class="section-title">Indicadores Gerais</div>
        <div class="dashboard-cards">
            <div class="card">
                <div class="card-title">Total de Responsáveis</div>
                <div class="card-value">{{ $relatorio['dashboard']['total_responsaveis'] ?? 0 }}</div>
            </div>
            <div class="card">
                <div class="card-title">Média de Crianças/Responsável</div>
                <div class="card-value">{{ $relatorio['dashboard']['media_criancas_por_responsavel'] ?? 0 }}</div>
            </div>
        </div>
    </div>

    <!-- Distribuição por Situação -->
    <div class="section">
        <div class="section-title">Distribuição por Situação</div>
        <table class="table">
            <thead>
                <tr>
                    <th>Situação</th>
                    <th>Quantidade</th>
                    <th>Percentual</th>
                </tr>
            </thead>
            <tbody>
                @if(isset($relatorio['dashboard']['distribuicao_situacao']))
                    @php $total = $relatorio['dashboard']['total_responsaveis'] @endphp
                    @foreach($relatorio['dashboard']['distribuicao_situacao'] as $situacao => $quantidade)
                    <tr>
                        <td>{{ ucfirst($situacao) }}</td>
                        <td>{{ $quantidade }}</td>
                        <td>{{ $total > 0 ? round(($quantidade / $total) * 100, 2) : 0 }}%</td>
                    </tr>
                    @endforeach
                @endif
            </tbody>
        </table>
    </div>

    <!-- Tabela de Responsáveis -->
    <div class="section page-break">
        <div class="section-title">Lista de Responsáveis</div>
        <table class="table">
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>CPF</th>
                    <th>Situação</th>
                    <th>Crianças Vinculadas</th>
                    <th>Renda Familiar</th>
                    <th>Bairro</th>
                </tr>
            </thead>
            <tbody>
                @foreach($relatorio['dados_completos'] ?? [] as $responsavel)
                <tr>
                    <td>{{ $responsavel['nome'] ?? 'N/A' }}</td>
                    <td>{{ $responsavel['cpf'] ?? 'N/A' }}</td>
                    <td>{{ ucfirst($responsavel['situacao'] ?? 'N/A') }}</td>
                    <td>{{ count($responsavel['criancas'] ?? []) }}</td>
                    <td>R$ {{ number_format($responsavel['renda_familiar'] ?? 0, 2, ',', '.') }}</td>
                    <td>{{ $responsavel['bairro'] ?? 'N/A' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
@endsection