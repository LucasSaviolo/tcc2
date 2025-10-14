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

- Frontend (Vite): http://localhost:3000/

Rodando localmente
------------------

1) Back-end

 - Instale dependências PHP/Composer: composer install
 - Configure seu .env (copie .env.example e ajuste DB_DATABASE=testetcc, DB_USERNAME=root, DB_PASSWORD=)
 - Rode migrações (se desejar): php artisan migrate
 - Inicie o servidor de desenvolvimento: php artisan serve --host=127.0.0.1 --port=8000

2) Front-end

 - Entre na pasta Front-end e instale dependências: npm install
 - Inicie o dev server: npm run dev (ou npm run build para produção)
 - Abra no navegador: http://localhost:3000/

Notas de implementação
----------------------

- O dashboard e os relatórios consomem dados diretamente do banco de dados via endpoints API. Os cards, gráficos e tabelas exibem os valores retornados pelo backend (sem dados simulados ou aleatórios).
- Exportação para CSV/XLSX/PDF está disponível na página de Relatórios.
- Seleção de colunas nos relatórios é persistida no localStorage por relatório.

Histórico de versões (resumo)
----------------------------

- v0.1.0 - Estrutura inicial do projeto (Back-end Laravel e Front-end React).
- v0.2.0 - Implementação dos modelos principais (Creche, Crianca, Responsavel, Turma) e endpoints básicos.
- v0.3.0 - Relatórios e dashboard: endpoints e páginas iniciais.
- v0.4.0 - Exportação CSV/XLSX/PDF e seleção de colunas persistente no frontend.
- v0.5.0 - Correções: remoção de dados aleatórios no backend para usar dados reais do banco; melhorias de formatação (CPF, telefone, percentuais) e ajustes de UI.

-------

# Sistema de Gerenciamento de Creches - TCC

Sistema completo para gerenciamento de creches com funcionalidades de cadastro de crianças, responsáveis, alocação de vagas e geração de relatórios.

## 🚀 Tecnologias

### Backend
- **Laravel 11** - Framework PHP
- **SQLite** - Banco de dados
- **Sanctum** - Autenticação API
- **Swagger/OpenAPI** - Documentação da API

### Frontend
- **React 18** - Biblioteca JavaScript
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS
- **Vite** - Build tool

## 📁 Estrutura do Projeto

```
├── Back-end/          # API Laravel
├── Front-end/         # Aplicação React
└── README.md
```

## ⚡ Como executar

### Backend (Laravel)
```bash
cd Back-end
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### Frontend (React)
```bash
cd Front-end
npm install
npm run dev
```

## 📋 Funcionalidades Implementadas

### ✅ Gerenciamento
- [x] Cadastro e listagem de crianças
- [x] Visualização detalhada de crianças (modal)
- [x] Cadastro de responsáveis
- [x] Cadastro de creches
- [x] Sistema de critérios de prioridade

### ✅ Relatórios
- [x] Relatório geral de crianças
- [x] Relatório por creche
- [x] Relatório de responsáveis
- [x] Relatório de vagas e demandas
- [x] Relatório de transferências
- [x] Relatório estatístico
- [x] Dashboard principal com indicadores

### ✅ Exportações
- [] Exportação PDF de todos os relatórios
- [x] Interface para seleção de relatórios

## 🔄 Status do Desenvolvimento

- **Backend**: API completa com todos os endpoints funcionais
- **Frontend**: Interface funcional com todas as telas implementadas
- **Integração**: Modal de visualização de crianças integrado com API

## 🛠️ Próximos Passos

- [ ] Sistema completo de autenticação no frontend
- [ ] Validações mais robustas
- [ ] Testes

## 📝 Notas de Desenvolvimento

Este projeto foi desenvolvido como Trabalho de Conclusão de Curso (TCC) e implementa um sistema completo de gerenciamento para creches municipais.

### Versão Atual: v1.0.0
- Sistema básico funcionando
- Todos os relatórios implementados
- Modal de visualização de crianças funcional
