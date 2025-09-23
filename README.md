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
- [x] Exportação PDF de todos os relatórios
- [x] Interface para seleção de relatórios

## 🔄 Status do Desenvolvimento

- **Backend**: API completa com todos os endpoints funcionais
- **Frontend**: Interface funcional com todas as telas implementadas
- **Integração**: Modal de visualização de crianças integrado com API

## 🛠️ Próximos Passos

- [ ] Sistema completo de autenticação no frontend
- [ ] Validações mais robustas
- [ ] Testes automatizados
- [ ] Deploy em produção

## 📝 Notas de Desenvolvimento

Este projeto foi desenvolvido como Trabalho de Conclusão de Curso (TCC) e implementa um sistema completo de gerenciamento para creches municipais.

### Versão Atual: v1.0.0-alpha
- Sistema básico funcionando
- Todos os relatórios implementados
- Modal de visualização de crianças funcional