@extends('pdfs.layout')

@section('title', 'Dashboard Principal')
@section('subtitle', 'Visão Geral do Sistema')

@section('content')
    <div class="section">
        <div class="section-title">Indicadores</div>
        <div class="dashboard-cards">
            <div class="card">
                <div class="card-title">Total de Crianças</div>
                <div class="card-value">{{ $relatorio['totalCriancas'] ?? ($relatorio['total_criancas'] ?? 0) }}</div>
            </div>
            <div class="card">
                <div class="card-title">Total de Creches</div>
                <div class="card-value">{{ $relatorio['totalCreches'] ?? ($relatorio['total_creches'] ?? 0) }}</div>
            </div>
            <div class="card">
                <div class="card-title">Total de Responsáveis</div>
                <div class="card-value">{{ $relatorio['totalResponsaveis'] ?? ($relatorio['total_responsaveis'] ?? 0) }}</div>
            </div>
            <div class="card">
                <div class="card-title">Vagas Disponíveis</div>
                <div class="card-value">{{ $relatorio['totalVagasDisponiveis'] ?? ($relatorio['total_vagas_disponiveis'] ?? 0) }}</div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Crianças por Idade</div>
        @php $idadeRows = $relatorio['criancasPorIdade'] ?? ($relatorio['criancas_por_idade_chart'] ?? []); @endphp
        @if(!empty($idadeRows))
            <table class="table">
                <thead>
                    <tr>
                        <th>Faixa Etária</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($idadeRows as $item)
                        <tr>
                            <td>{{ $item['faixa_etaria'] ?? (($item['idade'] ?? 'N/A') . ' anos') }}</td>
                            <td>{{ $item['total'] ?? 0 }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <p>Nenhum dado disponível.</p>
        @endif
    </div>

    <div class="section">
        <div class="section-title">Crianças por Status</div>
        @php $statusRows = $relatorio['criancasPorStatus'] ?? ($relatorio['criancas_por_status'] ?? []); @endphp
        @if(!empty($statusRows))
            <table class="table">
                <thead>
                    <tr>
                        <th>Status</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($statusRows as $item)
                        <tr>
                            <td>{{ $item['status'] ?? 'N/A' }}</td>
                            <td>{{ $item['total'] ?? 0 }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <p>Nenhum dado disponível.</p>
        @endif
    </div>

    <div class="section">
        <div class="section-title">Creches por Região</div>
        @php $regiaoRows = $relatorio['crechesPorRegiao'] ?? ($relatorio['creches_por_regiao'] ?? []); @endphp
        @if(!empty($regiaoRows))
            <table class="table">
                <thead>
                    <tr>
                        <th>Região</th>
                        <th>Total de Creches</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($regiaoRows as $item)
                        <tr>
                            <td>{{ $item['regiao'] ?? 'N/A' }}</td>
                            <td>{{ $item['total'] ?? 0 }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <p>Nenhum dado disponível.</p>
        @endif
    </div>
@endsection
