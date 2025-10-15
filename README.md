Projeto TCC - Sistema de Gestão e Alocação de Creches
===============================================

Descrição
--------

Este repositório contém um sistema completo para gerenciar creches, crianças, responsáveis, fila de espera e alocação automática. O sistema é composto por duas partes principais:

- Back-end: API em Laravel (PHP) com endpoints para relatórios, dashboard, CRUDs e geração de PDFs.
- Front-end: SPA em React + TypeScript usando Vite e Tailwind CSS.

Banco de dados
-------------

O projeto usa MySQL. Para desenvolvimento local, as configurações padrão esperadas neste repositório são:

- Nome do banco: testetcc
- Usuário: root
- Senha: (vazia)

Endpoints principais
--------------------

- API (Laravel): http://127.0.0.1:8000/api
  - /api/relatorios/dashboard  - dashboard principal
  - /api/relatorios/{tipo}     - endpoints de relatórios
  - /api/dashboard/stats       - estatísticas do dashboard
  - /api/dashboard/chart       - dados do gráfico do dashboard
  - /api/dashboard/recent      - ações recentes
# Sistema de Gestão e Alocação de Creches (TCC)

Descrição
---------

Aplicação para gerenciar creches, responsáveis, turmas, fila de espera e alocação automática de vagas. O projeto é dividido em:

- Back-end: API em Laravel (PHP) com endpoints para CRUDs, relatórios e processos de alocação.
- Front-end: SPA em React + TypeScript (Vite) com interface para dashboards, relatórios e administração.

Principais requisitos
---------------------

- PHP 8.1+ e Composer
- Node.js 16+/npm ou pnpm
- MySQL (ou outro banco configurado via .env)

Executando localmente
---------------------

1) Back-end

```powershell
cd Back-end
composer install
cp .env.example .env
# Ajuste as variáveis de ambiente (DB, MAIL, etc.) no .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --host=127.0.0.1 --port=8000
```

2) Front-end

```powershell
cd Front-end
npm install
npm run dev
# A aplicação ficará disponível em http://localhost:3000
```

Seeders e testes locais
-----------------------

- O seeder `FullDummySeeder` popula dados realistas (creches, turmas, responsáveis, crianças, preferências). Use `php artisan db:seed --class=FullDummySeeder` para popular a base de desenvolvimento.
- Há comandos auxiliares para testes de fila e alocação. Para recalcular a fila e executar alocações:

```powershell
php artisan fila:process --recalcular
php artisan fila:process --alocar
```

API — endpoints relevantes
-------------------------

- GET /api/dashboard/stats       -> Estatísticas do painel principal
- GET /api/dashboard/chart       -> Dados do gráfico do dashboard
- GET /api/relatorios/dashboard  -> Payload detalhado usado na página de relatórios
- GET /api/criancas              -> Listagem de crianças (paginada)
- POST /api/alocacoes/executar   -> Executa o algoritmo de alocação (produção)

Observações de implementação
----------------------------

- O frontend consome os dados diretamente da API; os relatórios e cards exibem os valores retornados pelo backend.
- Métricas importantes (ex.: total de crianças, total na fila) têm definições explícitas no backend — evite substituir essas fontes por cálculos client-side.
- Não mantenha scripts ad-hoc no repositório principal. Use seeders para popular dados de teste e comandos/artisan para executar processos controlados.

Contato
-------

Se precisar de ajuda para rodar localmente ou para entender a base de dados, abra uma issue descrevendo o passo a passo que você seguiu e o problema observado.

--
Versão atual: v1.1.0
