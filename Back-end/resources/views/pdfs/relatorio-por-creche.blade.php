@extends('pdfs.layout')

@section('title', 'Relatório por Creche')
@section('subtitle', 'Análise Detalhada de Ocupação e Turmas')

@section('content')
    <!-- Informações da Creche -->
    @if(isset($relatorio['dados_completos']))
    <div class="section">
        <div class="section-title">Informações da Creche</div>
        <table class="table">
            <tr>
                <td style="width: 25%; font-weight: bold;">Nome:</td>
                <td>{{ $relatorio['dados_completos']['nome'] ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td style="font-weight: bold;">Endereço:</td>
                <td>{{ $relatorio['dados_completos']['endereco'] ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td style="font-weight: bold;">Telefone:</td>
                <td>{{ $relatorio['dados_completos']['telefone'] ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td style="font-weight: bold;">Responsável:</td>
                <td>{{ $relatorio['dados_completos']['nome_responsavel'] ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td style="font-weight: bold;">E-mail:</td>
                <td>{{ $relatorio['dados_completos']['email_responsavel'] ?? 'N/A' }}</td>
            </tr>
        </table>
    </div>
    @endif

    <!-- Dashboard da Creche -->
    <div class="section">
        <div class="section-title">Indicadores de Ocupação</div>
        <div class="dashboard-cards">
            <div class="card">
                <div class="card-title">Capacidade Total</div>
                <div class="card-value">{{ $relatorio['dashboard']['capacidade_total'] ?? 0 }}</div>
            </div>
            <div class="card">
                <div class="card-title">Crianças Matriculadas</div>
                <div class="card-value">{{ $relatorio['dashboard']['ocupacao'] ?? 0 }}</div>
            </div>
            <div class="card">
                <div class="card-title">Taxa de Ocupação</div>
                <div class="card-value">{{ $relatorio['dashboard']['taxa_ocupacao'] ?? 0 }}%</div>
            </div>
            <div class="card">
                <div class="card-title">Vagas Disponíveis</div>
                <div class="card-value">{{ ($relatorio['dashboard']['capacidade_total'] ?? 0) - ($relatorio['dashboard']['ocupacao'] ?? 0) }}</div>
            </div>
        </div>
    </div>

    <!-- Tabela de Turmas -->
    <div class="section">
        <div class="section-title">Situação por Turma</div>
        @if(isset($relatorio['tabela_simplificada']) && !empty($relatorio['tabela_simplificada']))
            <table class="table">
                <thead>
                    <tr>
                        <th>Turma</th>
                        <th>Vagas Ofertadas</th>
                        <th>Ocupadas</th>
                        <th>Disponíveis</th>
                        <th>Taxa de Ocupação</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($relatorio['tabela_simplificada'] as $turma)
                    <tr>
                        <td>{{ $turma['turma'] ?? 'N/A' }}</td>
                        <td>{{ $turma['vagas_ofertadas'] ?? 0 }}</td>
                        <td>{{ $turma['ocupadas'] ?? 0 }}</td>
                        <td>{{ $turma['disponiveis'] ?? 0 }}</td>
                        <td>
                            @php
                                $taxa = ($turma['vagas_ofertadas'] ?? 0) > 0 ? 
                                       round((($turma['ocupadas'] ?? 0) / $turma['vagas_ofertadas']) * 100, 2) : 0;
                            @endphp
                            {{ $taxa }}%
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <p>Nenhuma turma encontrada para esta creche.</p>
        @endif
    </div>

    <!-- Informações Detalhadas das Turmas -->
    @if(isset($relatorio['dados_completos']['turmas']) && !empty($relatorio['dados_completos']['turmas']))
    <div class="section page-break">
        <div class="section-title">Detalhamento das Turmas</div>
        @foreach($relatorio['dados_completos']['turmas'] as $turma)
        <div style="margin-bottom: 20px; border: 1px solid #ddd; padding: 10px;">
            <h4 style="color: #007bff; margin-bottom: 10px;">{{ $turma['nome'] ?? 'N/A' }}</h4>
            <table class="table">
                <tr>
                    <td style="width: 25%; font-weight: bold;">Faixa Etária:</td>
                    <td>{{ $turma['idade_minima'] ?? 'N/A' }} a {{ $turma['idade_maxima'] ?? 'N/A' }} anos</td>
                </tr>
                <tr>
                    <td style="font-weight: bold;">Turno:</td>
                    <td>{{ ucfirst($turma['turno'] ?? 'N/A') }}</td>
                </tr>
                <tr>
                    <td style="font-weight: bold;">Capacidade:</td>
                    <td>{{ $turma['capacidade'] ?? 0 }} crianças</td>
                </tr>
                <tr>
                    <td style="font-weight: bold;">Status:</td>
                    <td>{{ $turma['ativa'] ? 'Ativa' : 'Inativa' }}</td>
                </tr>
            </table>

            @if(isset($turma['criancas']) && !empty($turma['criancas']))
            <h5 style="margin: 10px 0; font-size: 12px;">Crianças Matriculadas:</h5>
            <table class="table">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Idade</th>
                        <th>Responsável</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($turma['criancas'] as $crianca)
                    @if($crianca['status'] === 'matriculada')
                    <tr>
                        <td>{{ $crianca['nome'] ?? 'N/A' }}</td>
                        <td>{{ $crianca['idade'] ?? 'N/A' }}</td>
                        <td>{{ $crianca['responsavel']['nome'] ?? 'N/A' }}</td>
                        <td class="status-{{ $crianca['status'] }}">
                            {{ ucfirst(str_replace('_', ' ', $crianca['status'])) }}
                        </td>
                    </tr>
                    @endif
                    @endforeach
                </tbody>
            </table>
            @else
            <p style="font-size: 10px; color: #666;">Nenhuma criança matriculada nesta turma.</p>
            @endif
        </div>
        @endforeach
    </div>
    @endif

    <!-- Gráfico Simulado (Placeholder) -->
    <div class="section">
        <div class="section-title">Visualização Gráfica</div>
        <div class="chart-placeholder">
            Gráfico de Barras: Ocupação por Turma<br>
            (Para visualizar os gráficos interativos, acesse o sistema web)
        </div>
    </div>

    <!-- Resumo e Recomendações -->
    <div class="section">
        <div class="section-title">Resumo Executivo</div>
        @php
            $capacidadeTotal = $relatorio['dashboard']['capacidade_total'] ?? 0;
            $ocupacao = $relatorio['dashboard']['ocupacao'] ?? 0;
            $taxaOcupacao = $relatorio['dashboard']['taxa_ocupacao'] ?? 0;
        @endphp
        
        <p style="margin-bottom: 10px;">
            <strong>Situação Atual:</strong> 
            A creche possui capacidade para {{ $capacidadeTotal }} crianças, com {{ $ocupacao }} matrículas ativas, 
            resultando em uma taxa de ocupação de {{ $taxaOcupacao }}%.
        </p>

        @if($taxaOcupacao > 90)
            <p style="color: #dc3545;">
                <strong>Atenção:</strong> Taxa de ocupação elevada (>90%). Considere avaliar a necessidade de expansão ou redistribuição.
            </p>
        @elseif($taxaOcupacao < 50)
            <p style="color: #ffc107;">
                <strong>Observação:</strong> Taxa de ocupação baixa (<50%). Verifique estratégias para aumentar a procura.
            </p>
        @else
            <p style="color: #28a745;">
                <strong>Situação Adequada:</strong> Taxa de ocupação dentro dos parâmetros ideais (50-90%).
            </p>
        @endif
    </div>
@endsection