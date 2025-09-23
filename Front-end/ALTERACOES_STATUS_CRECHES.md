# Alterações nos Status das Creches

## Resumo da Mudança
Foi alterada a lógica de classificação dos status das creches para ser mais equilibrada e baseada tanto na quantidade absoluta quanto no percentual de vagas livres. Além disso, foram adicionados dados simulados de alunos matriculados para demonstrar a funcionalidade.

## Alterações Implementadas

### 🎯 **Simulação de Dados**
Para demonstrar os diferentes status, foram adicionados cenários simulados de ocupação:
- **Cenário 1**: Disponível (15+ vagas livres)
- **Cenário 2**: Quase Lotada (5 vagas livres)
- **Cenário 3**: Lotada (1 vaga livre)
- **Cenário 4**: Disponível (12 vagas livres)
- **Cenário 5**: Quase Lotada (3 vagas livres)
- **Cenário 6**: Lotada (0 vagas livres)

### Função `getStatusBadge` - Nova Lógica:

#### ✅ **Disponível** (Verde)
- **Critério**: Creche tem **mais de 10 vagas livres** OU **mais de 30% de vagas livres**
- **Badge**: Verde com texto "Disponível"

#### ⚠️ **Quase Lotada** (Amarelo)  
- **Critério**: Creche tem **entre 3 e 10 vagas livres** OU **entre 10% e 30% de vagas livres**
- **Badge**: Amarelo com texto "Quase Lotada"

#### 🔴 **Lotada** (Vermelho)
- **Critério**: Creche tem **menos de 3 vagas livres** OU **menos de 10% de vagas livres**
- **Badge**: Vermelho com texto "Lotada"

#### ⚫ **Inativa** (Cinza)
- **Critério**: Creche marcada como `ativa: false`
- **Badge**: Cinza com texto "Inativa"

### 📊 **Interface Visual**
- Adicionado campo "Alunos Matriculados" nos cards das creches
- Barra de progresso atualizada para usar a mesma lógica dos badges
- Mantida consistência visual entre todos os indicadores

### 🔧 **Implementação Técnica**
- Adicionado campo `alunos_matriculados` na interface `Creche`
- Modificado método `getCreches()` para simular diferentes ocupações
- Cálculo automático de `vagas_disponiveis` baseado em `capacidade_total - alunos_matriculados`

## Vantagens da Nova Lógica

1. **Mais Equilibrada**: Considera tanto números absolutos quanto percentuais
2. **Flexível**: Funciona bem para creches pequenas e grandes
3. **Intuitiva**: Garante que creches com poucas vagas não sejam marcadas como "disponível" só porque têm um percentual alto
4. **Consistente**: Badge e barra de progresso usam os mesmos critérios
5. **Visual**: Mostra claramente quantos alunos estão matriculados

## Arquivos Alterados
- `src/types/index.ts` - Interface `Creche` com novo campo `alunos_matriculados`
- `src/services/api.ts` - Método `getCreches()` com simulação de dados
- `src/pages/Creches.tsx` - Função `getStatusBadge`, barra de progresso e exibição de alunos matriculados

## Data da Alteração
29 de agosto de 2025
