<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class PdfController extends Controller
{
    /**
     * Exportar Relatório Geral de Crianças para PDF
     */
    public function exportarGeralCriancas(Request $request)
    {
        $relatorioController = new RelatorioController();
        $dados = $relatorioController->relatorioGeralCriancas($request);
        $relatorio = $dados->getData(true);

        $pdf = Pdf::loadView('pdfs.relatorio-geral-criancas', [
            'relatorio' => $relatorio,
            'filtros' => $request->all(),
            'data_geracao' => now()->format('d/m/Y H:i:s')
        ]);

        return $pdf->download('relatorio-geral-criancas-' . date('Y-m-d') . '.pdf');
    }

    /**
     * Exportar Relatório por Creche para PDF
     */
    public function exportarPorCreche(Request $request)
    {
        $relatorioController = new RelatorioController();
        $dados = $relatorioController->relatorioPorCreche($request);
        $relatorio = $dados->getData(true);

        $pdf = Pdf::loadView('pdfs.relatorio-por-creche', [
            'relatorio' => $relatorio,
            'filtros' => $request->all(),
            'data_geracao' => now()->format('d/m/Y H:i:s')
        ]);

        return $pdf->download('relatorio-por-creche-' . date('Y-m-d') . '.pdf');
    }

    /**
     * Exportar Relatório de Responsáveis para PDF
     */
    public function exportarResponsaveis(Request $request)
    {
        $relatorioController = new RelatorioController();
        $dados = $relatorioController->relatorioResponsaveis($request);
        $relatorio = $dados->getData(true);

        $pdf = Pdf::loadView('pdfs.relatorio-responsaveis', [
            'relatorio' => $relatorio,
            'filtros' => $request->all(),
            'data_geracao' => now()->format('d/m/Y H:i:s')
        ]);

        return $pdf->download('relatorio-responsaveis-' . date('Y-m-d') . '.pdf');
    }

    /**
     * Exportar Relatório de Vagas e Demandas para PDF
     */
    public function exportarVagasDemandas(Request $request)
    {
        $relatorioController = new RelatorioController();
        $dados = $relatorioController->relatorioVagasDemandas($request);
        $relatorio = $dados->getData(true);

        $pdf = Pdf::loadView('pdfs.relatorio-vagas-demandas', [
            'relatorio' => $relatorio,
            'filtros' => $request->all(),
            'data_geracao' => now()->format('d/m/Y H:i:s')
        ]);

        return $pdf->download('relatorio-vagas-demandas-' . date('Y-m-d') . '.pdf');
    }

    /**
     * Exportar Relatório de Transferências para PDF
     */
    public function exportarTransferencias(Request $request)
    {
        $relatorioController = new RelatorioController();
        $dados = $relatorioController->relatorioTransferencias($request);
        $relatorio = $dados->getData(true);

        $pdf = Pdf::loadView('pdfs.relatorio-transferencias', [
            'relatorio' => $relatorio,
            'filtros' => $request->all(),
            'data_geracao' => now()->format('d/m/Y H:i:s')
        ]);

        return $pdf->download('relatorio-transferencias-' . date('Y-m-d') . '.pdf');
    }

    /**
     * Exportar Relatório Estatístico para PDF
     */
    public function exportarEstatistico(Request $request)
    {
        $relatorioController = new RelatorioController();
        $dados = $relatorioController->relatorioEstatistico($request);
        $relatorio = $dados->getData(true);

        $pdf = Pdf::loadView('pdfs.relatorio-estatistico', [
            'relatorio' => $relatorio,
            'filtros' => $request->all(),
            'data_geracao' => now()->format('d/m/Y H:i:s')
        ]);

        return $pdf->download('relatorio-estatistico-' . date('Y-m-d') . '.pdf');
    }
}
