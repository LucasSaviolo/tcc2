@extends('pdfs.layout')

@section('title', 'Relatório de Transferências e Movimentações')
@section('subtitle', 'Análise das Movimentações de Crianças')

@section('content')
    <!-- Dashboard -->
    <div class="section">
        <div class="section-title">Indicadores de Movimentação</div>
        <div class="dashboard-cards">
            <div class="card">
                <div class="card-title">Total de Transferências</div>
                <div class="card-value">{{ $relatorio['dashboard']['total_transferencias_solicitadas'] ?? 0 }}</div>
            </div>
            <div class="card">
                <div class="card-title">Desistências no Ano</div>
                <div class="card-value">{{ $relatorio['dashboard']['desistencias_no_ano'] ?? 0 }}</div>
            </div>
        </div>
    </div>

    <!-- Status das Transferências -->
    <div class="section">
        <div class="section-title">Status das Transferências</div>
        <table class="table">
            <thead>
                <tr>
                    <th>Status</th>
                    <th>Quantidade</th>
                    <th>Percentual</th>
                </tr>
            </thead>
            <tbody>
                @if(isset($relatorio['dashboard']['distribuicao_status']))
                    @php $total = $relatorio['dashboard']['total_transferencias_solicitadas'] @endphp
                    @foreach($relatorio['dashboard']['distribuicao_status'] as $status => $quantidade)
                    <tr>
                        <td>{{ ucfirst($status) }}</td>
                        <td>{{ $quantidade }}</td>
                        <td>{{ $total > 0 ? round(($quantidade / $total) * 100, 2) : 0 }}%</td>
                    </tr>
                    @endforeach
                @endif
            </tbody>
        </table>
    </div>

    <!-- Lista de Transferências -->
    <div class="section page-break">
        <div class="section-title">Lista de Transferências</div>
        <table class="table">
            <thead>
                <tr>
                    <th>Criança</th>
                    <th>Origem</th>
                    <th>Destino</th>
                    <th>Status</th>
                    <th>Data Solicitação</th>
                </tr>
            </thead>
            <tbody>
                @foreach($relatorio['dados_completos'] ?? [] as $transferencia)
                <tr>
                    <td>{{ $transferencia['crianca']['nome'] ?? 'N/A' }}</td>
                    <td>{{ $transferencia['creche_origem']['nome'] ?? 'N/A' }}</td>
                    <td>{{ $transferencia['creche_destino']['nome'] ?? 'N/A' }}</td>
                    <td>{{ ucfirst($transferencia['status'] ?? 'N/A') }}</td>
                    <td>{{ isset($transferencia['data_solicitacao']) ? \Carbon\Carbon::parse($transferencia['data_solicitacao'])->format('d/m/Y') : 'N/A' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
@endsection