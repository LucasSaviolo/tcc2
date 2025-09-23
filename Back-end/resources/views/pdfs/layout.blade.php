<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Relatório')</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #007bff;
        }
        
        .header h1 {
            font-size: 18px;
            color: #007bff;
            margin-bottom: 10px;
        }
        
        .header .info {
            font-size: 10px;
            color: #666;
        }
        
        .section {
            margin-bottom: 25px;
        }
        
        .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #007bff;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 1px solid #ddd;
        }
        
        .dashboard-cards {
            display: flex;
            flex-wrap: wrap;
            margin-bottom: 20px;
        }
        
        .card {
            flex: 1;
            min-width: 200px;
            margin: 5px;
            padding: 15px;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 5px;
            text-align: center;
        }
        
        .card-title {
            font-size: 10px;
            color: #666;
            margin-bottom: 5px;
        }
        
        .card-value {
            font-size: 16px;
            font-weight: bold;
            color: #007bff;
        }
        
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        
        .table th,
        .table td {
            padding: 8px;
            text-align: left;
            border: 1px solid #ddd;
            font-size: 10px;
        }
        
        .table th {
            background-color: #007bff;
            color: white;
            font-weight: bold;
        }
        
        .table tr:nth-child(even) {
            background-color: #f2f2f2;
        }
        
        .filters {
            background: #e9ecef;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 20px;
            font-size: 10px;
        }
        
        .filters-title {
            font-weight: bold;
            margin-bottom: 8px;
            color: #495057;
        }
        
        .filter-item {
            margin-bottom: 3px;
        }
        
        .footer {
            position: fixed;
            bottom: 0;
            width: 100%;
            text-align: center;
            font-size: 10px;
            color: #666;
            padding: 10px 0;
            border-top: 1px solid #ddd;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        
        .status-matriculada { color: #28a745; font-weight: bold; }
        .status-aguardando { color: #ffc107; font-weight: bold; }
        .status-irregular { color: #dc3545; font-weight: bold; }
        .status-transferida { color: #17a2b8; font-weight: bold; }
        .status-desistiu { color: #6c757d; font-weight: bold; }
        
        .chart-placeholder {
            width: 100%;
            height: 200px;
            background: #f8f9fa;
            border: 2px dashed #dee2e6;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6c757d;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>@yield('title', 'Sistema de Gestão de Creches')</h1>
        <div class="info">
            <strong>@yield('subtitle', 'Relatório Gerencial')</strong><br>
            Gerado em: {{ $data_geracao }}
        </div>
    </div>

    @if(!empty($filtros) && count(array_filter($filtros)) > 1)
    <div class="filters">
        <div class="filters-title">Filtros Aplicados:</div>
        @if(isset($filtros['ano_letivo']))
            <div class="filter-item"><strong>Ano Letivo:</strong> {{ $filtros['ano_letivo'] }}</div>
        @endif
        @if(isset($filtros['faixa_etaria']))
            <div class="filter-item"><strong>Faixa Etária:</strong> {{ $filtros['faixa_etaria'] }} anos</div>
        @endif
        @if(isset($filtros['status']))
            <div class="filter-item"><strong>Status:</strong> {{ ucfirst(str_replace('_', ' ', $filtros['status'])) }}</div>
        @endif
        @if(isset($filtros['creche_id']))
            <div class="filter-item"><strong>Creche ID:</strong> {{ $filtros['creche_id'] }}</div>
        @endif
        @if(isset($filtros['bairro']))
            <div class="filter-item"><strong>Bairro:</strong> {{ $filtros['bairro'] }}</div>
        @endif
    </div>
    @endif

    @yield('content')

    <div class="footer">
        Sistema de Gestão de Creches - Página <script type="text/php">
            if (isset($pdf)) {
                echo $pdf->get_page_number() . " de " . $pdf->get_page_count();
            }
        </script>
    </div>
</body>
</html>