@extends('pdfs.layout')

@section('title', 'Relatório Geral de Crianças')
@section('subtitle', 'Análise Completa das Crianças Cadastradas no Sistema')

@section('content')
    <!-- Dashboard Cards -->
    <div class="section">
        <div class="section-title">Indicadores Gerais</div>
        <div class="dashboard-cards">
            <div class="card">
                <div class="card-title">Total de Crianças</div>
                <div class="card-value">{{ $relatorio['dashboard']['total_criancas'] ?? 0 }}</div>
            </div>
            <div class="card">
                <div class="card-title">Faixa Etária Predominante</div>
                <div class="card-value">{{ $relatorio['dashboard']['faixa_etaria_mais_frequente'] ?? 'N/A' }} anos</div>
            </div>
        </div>
    </div>

    <!-- Distribuição por Status -->
    <div class="section">
        <div class="section-title">Distribuição por Status</div>
        @if(isset($relatorio['dashboard']['distribuicao_status']) && !empty($relatorio['dashboard']['distribuicao_status']))
            <table class="table">
                <thead>
                    <tr>
                        <th>Status</th>
                        <th>Quantidade</th>
                        <th>Percentual</th>
                    </tr>
                </thead>
                <tbody>
                    @php $total = $relatorio['dashboard']['total_criancas'] @endphp
                    @foreach($relatorio['dashboard']['distribuicao_status'] as $status => $quantidade)
                    <tr>
                        <td class="status-{{ $status }}">{{ ucfirst(str_replace('_', ' ', $status)) }}</td>
                        <td>{{ $quantidade }}</td>
                        <td>{{ $total > 0 ? round(($quantidade / $total) * 100, 2) : 0 }}%</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <p>Nenhum dado de distribuição por status disponível.</p>
        @endif
    </div>

    <!-- Tabela Resumida -->
    <div class="section page-break">
        <div class="section-title">Resumo das Crianças</div>
        @if(isset($relatorio['tabela_simplificada']) && !empty($relatorio['tabela_simplificada']))
            <table class="table">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Idade</th>
                        <th>Status</th>
                        <th>Creche de Preferência</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($relatorio['tabela_simplificada'] as $crianca)
                    <tr>
                        <td>{{ $crianca['nome'] ?? 'N/A' }}</td>
                        <td>{{ $crianca['idade'] ?? 'N/A' }}</td>
                        <td class="status-{{ $crianca['status'] ?? 'indefinido' }}">
                            {{ ucfirst(str_replace('_', ' ', $crianca['status'] ?? 'Indefinido')) }}
                        </td>
                        <td>{{ $crianca['creche_preferencia'] ?? 'Não informado' }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <p>Nenhuma criança encontrada com os filtros aplicados.</p>
        @endif
    </div>

    <!-- Dados Detalhados (apenas se houver) -->
    @if(isset($relatorio['dados_completos']) && !empty($relatorio['dados_completos']) && count($relatorio['dados_completos']) <= 50)
    <div class="section page-break">
        <div class="section-title">Informações Detalhadas</div>
        <table class="table">
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Data Nascimento</th>
                    <th>Responsável</th>
                    <th>Status</th>
                    <th>Data Solicitação</th>
                </tr>
            </thead>
            <tbody>
                @foreach($relatorio['dados_completos'] as $crianca)
                <tr>
                    <td>{{ $crianca['nome'] ?? 'N/A' }}</td>
                    <td>{{ isset($crianca['data_nascimento']) ? \Carbon\Carbon::parse($crianca['data_nascimento'])->format('d/m/Y') : 'N/A' }}</td>
                    <td>{{ $crianca['responsavel']['nome'] ?? 'N/A' }}</td>
                    <td class="status-{{ $crianca['status'] ?? 'indefinido' }}">
                        {{ ucfirst(str_replace('_', ' ', $crianca['status'] ?? 'Indefinido')) }}
                    </td>
                    <td>{{ isset($crianca['data_solicitacao']) ? \Carbon\Carbon::parse($crianca['data_solicitacao'])->format('d/m/Y') : 'N/A' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    <!-- Observações -->
    <div class="section">
        <div class="section-title">Observações</div>
        <p><strong>Legenda de Status:</strong></p>
        <ul style="margin-left: 20px; font-size: 10px;">
            <li><span class="status-matriculada">Matriculada:</span> Criança já alocada em uma creche</li>
            <li><span class="status-aguardando">Aguardando Vaga:</span> Criança na lista de espera</li>
            <li><span class="status-irregular">Irregular:</span> Documentação incompleta ou pendente</li>
            <li><span class="status-transferida">Transferida:</span> Criança transferida entre creches</li>
            <li><span class="status-desistiu">Desistiu:</span> Responsável desistiu da vaga</li>
        </ul>
        
        @if(count($relatorio['dados_completos'] ?? []) > 50)
        <p style="margin-top: 10px; font-size: 10px; color: #666;">
            <em>Nota: Dados detalhados limitados às primeiras 50 crianças para otimizar o relatório. 
            Para visualizar todos os dados, utilize filtros mais específicos.</em>
        </p>
        @endif
    </div>
@endsection