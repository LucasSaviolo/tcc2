# 🚀 Sistema de Creches API

Uma API REST completa para Sistema de Alocação de Creches desenvolvida em Laravel 11 com autenticação Sanctum, documentação Swagger e testes automatizados.

## 📋 Características

- **Laravel 11** - Framework PHP moderno
- **API REST** completa com JSON responses
- **Autenticação Sanctum** - Tokens de API seguros
- **Documentação Swagger/OpenAPI** - Interface interativa
- **Validação robusta** com Form Requests
- **Testes automatizados** (Feature e Unit)
- **Sistema de pontuação** para fila de espera
- **Alocação automática** de vagas
- **CORS configurado** para frontend React

## 🗃️ Estrutura do Banco de Dados

### Entidades Principais

- **Creches** - Instituições de ensino infantil
- **Responsáveis** - Pais/responsáveis pelas crianças
- **Crianças** - Crianças cadastradas no sistema
- **Critérios de Prioridade** - Regras para pontuação
- **Preferências de Creche** - Escolhas dos responsáveis
- **Fila de Espera** - Sistema de pontuação e ordenação
- **Alocações** - Vagas ocupadas pelas crianças
- **Documentos** - Arquivos anexados às crianças

## 🚀 Instalação e Configuração

### Pré-requisitos

- PHP 8.1 ou superior
- Composer
- SQLite (incluído) ou MySQL/PostgreSQL
- Node.js (opcional, para desenvolvimento)

### Passos de Instalação

1. **Execute as migrations**
```bash
php artisan migrate
```

2. **Popule o banco com dados de exemplo**
```bash
php artisan db:seed
```

3. **Gere a documentação Swagger**
```bash
php artisan l5-swagger:generate
```

4. **Inicie o servidor**
```bash
php artisan serve
```

## 📊 Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login do usuário
- `POST /api/auth/logout` - Logout do usuário
- `GET /api/auth/user` - Dados do usuário autenticado

### Dashboard
- `GET /api/dashboard/stats` - Estatísticas gerais
- `GET /api/dashboard/chart` - Dados para gráficos
- `GET /api/dashboard/recent` - Ações recentes

### Crianças
- `GET /api/criancas` - Lista paginada de crianças
- `POST /api/criancas` - Criar nova criança
- `GET /api/criancas/{id}` - Detalhes de uma criança
- `PUT /api/criancas/{id}` - Atualizar criança
- `DELETE /api/criancas/{id}` - Remover criança

### Creches
- `GET /api/creches` - Lista de creches
- `POST /api/creches` - Criar nova creche
- `GET /api/creches/{id}` - Detalhes de uma creche
- `PUT /api/creches/{id}` - Atualizar creche

### Fila de Espera
- `GET /api/fila-espera` - Lista da fila de espera
- `POST /api/fila-espera/recalcular` - Recalcular pontuações

### Alocações
- `GET /api/alocacoes` - Lista de alocações
- `POST /api/alocacoes/executar` - Executar alocação automática
- `GET /api/alocacoes/historico` - Histórico de alocações

## 🔐 Autenticação

A API usa Laravel Sanctum para autenticação via tokens Bearer.

### Login de Teste
```
Email: admin@sistema-creches.com
Password: password
```

## 📚 Documentação Swagger

Acesse a documentação interativa em:
```
http://localhost:8000/api/documentation
```

## ⚙️ Sistema de Alocação

### Como Funciona

1. **Cadastro de Criança** - Responsável cadastra criança com preferências de creche
2. **Cálculo de Pontuação** - Sistema calcula pontos baseado em critérios configuráveis
3. **Fila de Espera** - Criança é posicionada na fila por pontuação e data
4. **Alocação Automática** - Sistema aloca vagas respeitando preferências e disponibilidade

## 🧪 Testes

```bash
php artisan test
```

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

You may also try the [Laravel Bootcamp](https://bootcamp.laravel.com), where you will be guided through building a modern Laravel application from scratch.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
