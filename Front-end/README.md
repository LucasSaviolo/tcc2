# Sistema de Alocação de Creches - Frontend

Sistema web para gerenciar a alocação de crianças em creches municipais, desenvolvido com React 18, TypeScript e Tailwind CSS.

## Tecnologias Utilizadas

- **React 18** - Biblioteca JavaScript para construção de interfaces
- **TypeScript** - Superset do JavaScript com tipagem estática
- **Vite** - Build tool rápida e moderna
- **Tailwind CSS** - Framework CSS utilitário
- **Framer Motion** - Biblioteca de animações
- **React Router** - Roteamento para SPA
- **React Query** - Gerenciamento de estado do servidor
- **React Hook Form** - Gerenciamento de formulários
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones modernos
- **React Hot Toast** - Notificações elegantes

## 📋 Funcionalidades

### 🎯 Dashboard
- Cards animados com estatísticas em tempo real
- Gráficos de alocações e ocupação
- Lista de ações recentes
- Botões de ação rápida
- Alertas de capacidade baixa

### 👶 Gestão de Crianças
- Lista paginada e pesquisável
- Formulário completo para cadastro com:
  - **Upload de documentos de matrícula** (múltiplos arquivos PDF/imagens)
  - **Seleção de critérios de prioridade** com upload de documentos comprobatórios
  - **Vinculação a responsáveis** existentes ou cadastro de novos
  - **Seleção de 3 creches** em ordem de preferência
- Validação robusta de formulários
- Drag-and-drop para upload de arquivos
- Visualização de detalhes e histórico
- Edição completa de dados

### 🏫 Gestão de Creches
- Grid de cards com informações das creches
- Formulário para cadastro de novas creches
- Visualização de capacidade e disponibilidade
- Status ativo/inativo

### ⏰ Fila de Espera
- Tabela ordenável por pontuação
- Filtros por idade, creche e status
- Modal com detalhes de pontuação
- Recálculo automático da fila

### 📊 Alocações
- Wizard para alocação automática
- Preview das alocações antes da confirmação
- Histórico completo de alocações
- Logs detalhados de ações

### 🔐 Autenticação
- Login seguro com validação
- Context para gerenciamento de estado
- Interceptors para requisições
- Rotas protegidas

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 18 ou superior
- npm ou yarn

### Instalação
```bash
# Entre no diretório
cd frontend-creches

# Instale as dependências
npm install

# Execute em desenvolvimento
npm run dev
```

### Configuração
O frontend está configurado para consumir a API Laravel em `http://localhost:8000`. Para alterar, edite o arquivo `vite.config.ts`.

## 📁 Estrutura do Projeto

```
src/
├── components/           # Componentes reutilizáveis
│   ├── ui/              # Componentes base (Button, Card, Input, etc.)
│   ├── layout/          # Layout da aplicação (Header, Sidebar)
│   └── business/        # Componentes específicos do negócio
├── contexts/            # React Contexts (Auth, etc.)
├── hooks/               # Custom Hooks
├── pages/               # Páginas da aplicação
├── services/            # Serviços de API
├── types/               # Definições TypeScript
├── utils/               # Funções utilitárias
└── styles/              # Estilos CSS
```

## � Novas Funcionalidades Implementadas

### 📎 Sistema de Upload de Arquivos
- **Componente FileUpload** reutilizável com:
  - Interface drag-and-drop intuitiva
  - Validação de tipos de arquivo (PDF, JPG, PNG)
  - Controle de tamanho máximo (5MB-10MB)
  - Suporte a múltiplos arquivos
  - Preview de arquivos selecionados
  - Feedback visual durante upload

### 🎯 Critérios de Prioridade
- Seleção de critérios de prioridade para cada criança
- Upload obrigatório de documento comprobatório
- Validação condicional baseada na seleção

### 👨‍👩‍👧‍👦 Vinculação de Responsáveis
- Seleção de responsável existente via dropdown
- Opção para cadastrar novo responsável inline
- Validação de CPF e dados obrigatórios

### 🏫 Preferências de Creches
- Seleção de 3 creches em ordem de preferência
- Validação para evitar duplicatas
- Filtros dinâmicos nas opções

### 💾 Gerenciamento de Estado Avançado
- FormData para uploads multipart
- Estado reativo para formulários complexos
- Validação em tempo real com Yup
- Integração com TanStack Query

## �🎨 Design System

### Paleta de Cores
- **Primary**: #6366f1 (Indigo)
- **Secondary**: #8b5cf6 (Purple)
- **Success**: #10b981 (Emerald)
- **Warning**: #f59e0b (Amber)
- **Error**: #ef4444 (Red)
- **Background**: #f8fafc (Slate 50)

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview

# Linting
npm run lint
```

## 🌐 API Integration

O frontend consome uma API REST Laravel com endpoints para autenticação, dashboard, crianças, creches, fila de espera e alocações.

### 📋 Documentação da API Backend
- Alterações necessárias no banco de dados
- Novos endpoints de API
- Estrutura de armazenamento de arquivos
- Exemplos de implementação em Laravel
- Considerações de segurança

## 🔒 Segurança

- **Token JWT**: Armazenado no localStorage
- **Interceptors**: Adicionam token automaticamente
- **Rotas protegidas**: Redirecionamento automático para login
- **Validação**: Validação robusta com Yup e React Hook Form

---

Desenvolvido com ❤️ para facilitar a gestão de creches municipais.


# **Adicionar turnos às creches (as vagas devem ser por turnos e pode ter mais de uma turma por turno)** **as turmas deverão ser por faixa etária
{
    Berçário => 1 e 2 anos;
    Maternal => 3 anos;
    Jardim => 4 anos;
    Pré-escola => 5 anos;
    VERIFICAR CERTINHO ANTES DE IMPLEMENTAR PQ DPS DÁ TRABALHO PRA ARRUMAR
}

# Tirar o gráfico de distribuição por idade e substituir por um gráfico de fila de espera por faixa etária