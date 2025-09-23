<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Instruções do Copilot para Sistema de Creches API

Este é um projeto Laravel 11 para um sistema completo de alocação de creches com API REST.

## Contexto do Projeto

- **Framework**: Laravel 11
- **Autenticação**: Laravel Sanctum (tokens Bearer)
- **Documentação**: Swagger/OpenAPI com L5-Swagger
- **Banco de Dados**: SQLite (desenvolvimento)
- **Testes**: PHPUnit (Feature e Unit tests)
- **CORS**: Configurado para frontend React (localhost:3000)

## Estrutura do Sistema

### Models Principais
- `Creche`: Instituições de ensino infantil
- `Responsavel`: Pais/responsáveis pelas crianças
- `Crianca`: Crianças cadastradas no sistema
- `CriterioPrioridade`: Regras de pontuação para fila
- `PreferenciaCreche`: Preferências de creche por criança
- `FilaEspera`: Sistema de pontuação e ordenação
- `Alocacao`: Vagas ocupadas
- `Documento`: Arquivos anexados

### Controllers da API
- `AuthController`: Autenticação (login/logout/user)
- `DashboardController`: Estatísticas e dados do dashboard
- `CriancaController`: CRUD de crianças
- `CrecheController`: CRUD de creches
- `FilaEsperaController`: Gerenciamento da fila
- `AlocacaoController`: Sistema de alocação automática

### Service Classes
- `AlocacaoService`: Lógica de negócio para alocação automática e cálculo de pontuação

## Padrões de Código

### API Responses
Sempre retornar no formato:
```json
{
  "success": true,
  "data": {},
  "message": "Mensagem de sucesso",
  "meta": {
    "pagination": {}
  }
}
```

### Validação
- Usar Form Requests para validação robusta
- Mensagens em português brasileiro
- Validação específica para CPF, telefones, etc.

### Documentação Swagger
- Adicionar anotações @OA nos controllers
- Documentar todos os endpoints
- Incluir exemplos de request/response
- Agrupar por tags (Autenticação, Crianças, etc.)

### Testes
- Feature tests para endpoints
- Unit tests para services
- Usar RefreshDatabase trait
- Factories para dados de teste

## Regras de Negócio

### Sistema de Pontuação
- Critérios configuráveis com pesos de 1-10
- Pontuação total = soma dos critérios aplicados
- Fila ordenada por pontuação (desc) + data inscrição (asc)

### Alocação Automática
1. Buscar crianças na fila por pontuação
2. Verificar preferências de creche
3. Validar vagas disponíveis e idade aceita
4. Criar alocação e atualizar status

### Relacionamentos
- Criança pertence a Responsável
- Criança tem muitas PreferenciaCreche
- Criança pode ter uma FilaEspera
- Criança pode ter uma Alocacao ativa
- Creche tem muitas Alocacoes

## Comandos Úteis

```bash
php artisan migrate:fresh --seed  # Recriar banco
php artisan l5-swagger:generate   # Gerar documentação
php artisan test                  # Executar testes
php artisan serve                 # Iniciar servidor
```

## URLs Importantes

- API Base: http://localhost:8000/api
- Documentação: http://localhost:8000/api/documentation
- Login teste: admin@sistema-creches.com / password

## Ao Trabalhar com Este Projeto

1. Sempre seguir os padrões REST estabelecidos
2. Manter documentação Swagger atualizada
3. Escrever testes para novas funcionalidades
4. Usar validação robusta em Form Requests
5. Manter mensagens de erro/sucesso em português
6. Seguir convenções de nomenclatura Laravel
7. Usar relacionamentos Eloquent apropriados
8. Implementar tratamento de erros adequado
