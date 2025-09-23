@extends('pdfs.layout')

@section('title', 'Relatório Estatístico/Gerencial')
@section('subtitle', 'Visão Executiva do Sistema de Gestão de Creches')

@section('content')
    <!-- Dashboard Principal -->
    <div class="section">
        <div class="section-title">Indicadores Executivos</div>
        <div class="dashboard-cards">
            <div class="card">
                <div class="card-title">Crianças Cadastradas</div>
                <div class="card-value">{{ $relatorio['dashboard']['total_criancas_cadastradas'] ?? 0 }}</div>
            </div>
            <div class="card">
                <div class="card-title">Matrículas Efetivas</div>
                <div class="card-value">{{ $relatorio['dashboard']['total_matriculas_efetivas'] ?? 0 }}</div>
            </div>
            <div class="card">
                <div class="card-title">Aguardando Vaga</div>
                <div class="card-value">{{ $relatorio['dashboard']['total_aguardando_vaga'] ?? 0 }}</div>
            </div>
        </div>
    </div>

    <!-- Indicadores de Performance -->
    <div class="section">
        <div class="section-title">Indicadores de Performance</div>
        <table class="table">
            <tr>
                <td style="width: 50%; font-weight: bold;">Taxa de Atendimento:</td>
                <td>{{ $relatorio['indicadores']['taxa_atendimento'] ?? 0 }}%</td>
            </tr>
            <tr>
                <td style="font-weight: bold;">Percentual em Lista de Espera:</td>
                <td>{{ $relatorio['indicadores']['lista_espera_percentual'] ?? 0 }}%</td>
            </tr>
        </table>
    </div>

    <!-- Ranking de Creches Mais Procuradas -->
    <div class="section">
        <div class="section-title">Ranking: Creches Mais Procuradas</div>
        <table class="table">
            <thead>
                <tr>
                    <th>Posição</th>
                    <th>Nome da Creche</th>
                    <th>Demanda (Procura)</th>
                </tr>
            </thead>
            <tbody>
                @if(isset($relatorio['dashboard']['ranking_creches_mais_procuradas']))
                    @foreach($relatorio['dashboard']['ranking_creches_mais_procuradas'] as $index => $creche)
                    <tr>
                        <td>{{ $index + 1 }}º</td>
                        <td>{{ $creche['nome'] ?? 'N/A' }}</td>
                        <td>{{ $creche['procura'] ?? 0 }}</td>
                    </tr>
                    @endforeach
                @endif
            </tbody>
        </table>
    </div>

    <!-- Demanda por Faixa Etária -->
    <div class="section">
        <div class="section-title">Demanda por Faixa Etária</div>
        <table class="table">
            <thead>
                <tr>
                    <th>Idade</th>
                    <th>Crianças Aguardando</th>
                    <th>Percentual da Demanda</th>
                </tr>
            </thead>
            <tbody>
                @if(isset($relatorio['dashboard']['demanda_por_faixa_etaria']))
                    @php $totalDemanda = collect($relatorio['dashboard']['demanda_por_faixa_etaria'])->sum('total') @endphp
                    @foreach($relatorio['dashboard']['demanda_por_faixa_etaria'] as $demanda)
                    <tr>
                        <td>{{ $demanda['idade'] ?? 'N/A' }} anos</td>
                        <td>{{ $demanda['total'] ?? 0 }}</td>
                        <td>{{ $totalDemanda > 0 ? round(($demanda['total'] / $totalDemanda) * 100, 2) : 0 }}%</td>
                    </tr>
                    @endforeach
                @endif
            </tbody>
        </table>
    </div>

    <!-- Gráficos Simulados -->
    <div class="section page-break">
        <div class="section-title">Visualizações Gráficas</div>
        
        <div class="chart-placeholder">
            Gráfico de Pizza: Distribuição de Matrículas vs Lista de Espera<br>
            (Para visualizar os gráficos interativos, acesse o sistema web)
        </div>
        
        <div class="chart-placeholder">
            Gráfico de Barras: Ranking das Creches Mais Procuradas<br>
            (Para visualizar os gráficos interativos, acesse o sistema web)
        </div>
    </div>

    <!-- Resumo Executivo -->
    <div class="section">
        <div class="section-title">Resumo Executivo</div>
        
        @php
            $totalCadastradas = $relatorio['dashboard']['total_criancas_cadastradas'] ?? 0;
            $totalMatriculadas = $relatorio['dashboard']['total_matriculas_efetivas'] ?? 0;
            $totalAguardando = $relatorio['dashboard']['total_aguardando_vaga'] ?? 0;
            $taxaAtendimento = $relatorio['indicadores']['taxa_atendimento'] ?? 0;
        @endphp
        
        <p style="margin-bottom: 15px;">
            <strong>Situação Atual do Sistema:</strong><br>
            O sistema conta com {{ $totalCadastradas }} crianças cadastradas, sendo {{ $totalMatriculadas }} 
            efetivamente matriculadas e {{ $totalAguardando }} aguardando vagas. Isso representa uma taxa de 
            atendimento de {{ $taxaAtendimento }}%.
        </p>

        @if($taxaAtendimento >= 80)
            <p style="color: #28a745; margin-bottom: 10px;">
                <strong>✓ Situação Favorável:</strong> Taxa de atendimento elevada (≥80%), indicando boa capacidade 
                de atendimento à demanda.
            </p>
        @elseif($taxaAtendimento >= 60)
            <p style="color: #ffc107; margin-bottom: 10px;">
                <strong>⚠ Situação de Atenção:</strong> Taxa de atendimento moderada (60-79%), sugere necessidade 
                de monitoramento e possíveis melhorias.
            </p>
        @else
            <p style="color: #dc3545; margin-bottom: 10px;">
                <strong>⚠ Situação Crítica:</strong> Taxa de atendimento baixa (<60%), indica necessidade urgente 
                de expansão da capacidade ou revisão dos processos.
            </p>
        @endif

        <p style="margin-bottom: 10px;">
            <strong>Principais Insights:</strong>
        </p>
        <ul style="margin-left: 20px; font-size: 10px;">
            <li>A faixa etária com maior demanda é 
                @if(isset($relatorio['dashboard']['demanda_por_faixa_etaria']) && count($relatorio['dashboard']['demanda_por_faixa_etaria']) > 0)
                    {{ collect($relatorio['dashboard']['demanda_por_faixa_etaria'])->sortByDesc('total')->first()['idade'] ?? 'N/A' }} anos
                @else
                    não determinada
                @endif
            </li>
            <li>{{ $totalAguardando > 0 ? 'Há' : 'Não há' }} lista de espera significativa que requer atenção</li>
            <li>O sistema demonstra {{ $taxaAtendimento > 70 ? 'boa' : 'limitada' }} capacidade de atendimento à demanda atual</li>
        </ul>

        <p style="margin-top: 15px; font-size: 10px; color: #666;">
            <em>Este relatório foi gerado automaticamente pelo Sistema de Gestão de Creches. 
            Para análises mais detalhadas, consulte os relatórios específicos por categoria.</em>
        </p>
    </div>
@endsection