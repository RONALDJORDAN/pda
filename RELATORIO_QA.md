# Relatório de QA / Acessibilidade — Sistema Logística PDA

## Resumo Executivo

Foram aplicadas correções de acessibilidade (WCAG 2.1) e melhorias de QA em todo o sistema,
abrangendo HTML, CSS e JavaScript das páginas `index.html` e `logistica.html`.

## Melhorias no Menu de Logística (Módulo)

### Navbar superior (`logistica.html`)
- `aria-hidden="true"` em ícones decorativos do Material Symbols
- `aria-label` descritivo nos links de navegação (Dashboard, Logística)
- `aria-current="page"` na aba ativa (Logística)

### Menu de abas / tablist (`logistica.html`, `logistica.css`, `logistica.js`)
- Apenas uma aba disponível: "Definições das Aplicações" (aba "Calendário das Aplicações" removida)
- `aria-label` descritivo na aba
- `aria-pressed="true"` e `aria-selected="true"` (aba única e ativa)
- `tabindex="0"` na aba única
- Estilos CSS: contraste melhorado, borda transparente → preenchida, box-shadow na aba ativa
- Indicador visual de linha inferior (`::after`) na aba ativa
- `:focus-visible` com outline azul (#6366f1)
- Container `[role="tablist"]` com fundo, borda e border-radius próprios

### Navegação por teclado (`logistica.js`)
- Com apenas uma aba, a navegação por teclado entre múltiplas abas não é necessária
- Foco é movido para a seção ao ativá-la

### Remoção do Módulo Calendário
- A seção "Calendário das Aplicações" foi removida do `logistica.html`
- A função `renderizarCalendario()` não é mais chamada em `logistica.js`
- O container `#calendario-semana` não existe mais no DOM
- Apenas a seção "Definições das Aplicações" permanece ativa por padrão

### Dados do Calendário (`calendario.json`)
O `logistica.js` agora carrega dados de `Dados_base/calendario.json` via `fetch()` em vez de dados hardcoded:
- **Cabecalho do evento**: título, empresa, período (primeiro a último dia)
- **Calendário**: 4 dias (Terça 21/07 a Sexta 24/07) com turnos Manhã/Tarde, total de turmas por dia
- **Definições**: cada dia com resumo de turmas/alunos, detalhes por turno e lista de escolas com técnicos e quantidade de alunos
- Tooltip/título de escolas no card de definições
- Informações extras: aplicadores, tablets leitura, observações quando presentes

## Skills Aplicadas (Conceitos)

| Skill | O que foi aplicado | Arquivos |
|-------|-------------------|----------|
| **code-reviewer** | Revisão de código, correção de contraste, ARIA, foco, semântica | `index.html`, `logistica.html`, `styles.css`, `app.js`, `logistica.js` |
| **data-table-designer** | `<caption>`, `scope="col"`, cabeçalhos de tabela acessíveis | `app.js` |
| **dashboard-designer** | Região `aria-live`, anúncio de mudança de seção, badge de métrica | `index.html`, `app.js`, `styles.css` |
| **csv-data-processor** | Validação de integridade dos dados antes da exportação CSV | `app.js` |
| **web-form-designer** | Label associado, `aria-label`, campo de busca acessível | `index.html`, `app.js` |
| **test-writer** | Suite de testes automatizados de QA | `tests/qa.js` |
| **opencode** | Configuração e diretrizes do projeto | `AGENTS.md` |
| **report** | Este relatório consolidado | `RELATORIO_QA.md` |

## Correções por Prioridade

### Alta (Acessibilidade Crítica)

1. **Ícones decorativos** — Adicionado `aria_hidden="true"` a todos os `<span class="material-symbols-outlined">` que não carregam informação.

2. **Campo de busca** — Adicionado `<label for="busca-texto">` e `aria-label="Buscar escola ou turma"` ao input.

3. **Contraste de cor** — Texto secundário alterado de `#a0a0a0` para `#c9c9c9` e outline de `#404040` para `#888888`.

4. **Redução de movimento** — Animação `.marquee-text` respeita `prefers-reduced-motion: reduce`.

5. **Tabelas** — Adicionado `<caption class="sr-only">` descritivo e `scope="col"` em todos os `<th>` das 4 tabelas de distribuição.

6. **Gerenciamento de foco** — Após re-renderização dinâmica (`innerHTML`), o foco retorna ao campo de busca. Mudança de seção anuncia via `aria-live="polite"`.

7. **Exportação CSV** — Feedback visual via toast (`role="status"`, `aria-live="polite"`). Validação de integridade dos dados antes de exportar.

### Média (Melhorias de UX)

8. **Navegação por teclado** — Seções recebem `tabindex="-1"` e foco ao serem ativadas. Suporte a Home/End nas abas.

9. **Dashboard** — Região `aria-live` para anuncio de status e badge `.metrica-badge` para métricas visuais.

10. **Testes automatizados** — Arquivo `tests/qa.js` validando idioma, alt de imagens, ARIA, labels, tabelas e feedback de exportação.

## Arquivos Modificados

- `index.html` — ARIA, label de busca, região aria-live
- `logistica.html` — ARIA em ícones, labels em abas, aria-pressed, aria-label
- `assets/css/styles.css` — `.sr-only`, contraste, `prefers-reduced-motion`, `.metrica-badge`, `.animate-pulse`
- `assets/css/logistica.css` — Estilos do menu de abas, contraste, foco, responsividade, indicador visual
- `assets/js/app.js` — ARIA em ícones dinâmicos, caption/scope em tabelas, foco, toast, validação CSV, anúncio de seção
- `assets/js/logistica.js` — Carrega `Dados_base/calendario.json`, renderiza apenas Definições com dados reais (módulo Calendário removido), ARIA em ícones dinâmicos, aria-pressed
- `tests/qa.js` — Novo: suite de testes de QA

## Arquivos Criados — Módulo de Avaliações

- `logistica-avaliacao.html` — Nova página: cronograma de avaliações por dia/turno/escola
- `assets/js/logistica-avaliacao.js` — Lógica: carrega `Dados_base/calendario.json`, renderiza cronograma, busca, exportação CSV
- `RELATORIO_QA.md` — Este relatório

## Novo Formato dos Cards de Logística (`logistica.js`, `logistica.css`)

Os cards de Calendário e Definições foram reformatados para exibir as informações no formato de relatório por dia, baseado na imagem anexada:

### Estrutura por dia
1. **Cabeçalho do dia**: Nome do dia e data (ex: "TERÇA-FEIRA 21/07") em fundo roxo
2. **Duas colunas**: MANHÃ e TARDE lado a lado
3. **Cada coluna (turno)**:
   - Título do turno com contagem de turmas
   - Lista de escolas com:
     - Nome da escola
     - Técnicos (em vermelho)
     - Turmas com quantidade de tablets (ex: "1° ANO A, 1° ANO B, 1° ANO C - 51 TAB")
     - Total de alunos da escola (em verde)
   - Total de alunos do turno
4. **Rodapé do dia**: Totais de Manhã, Tarde e Tablets de Leitura

### Cores utilizadas
- Título do dia: fundo roxo (#6366f1 → #4f46e5)
- Técnicos: vermelho (#ef4444)
- Tablets: amarelo/ouro (#fbbf24)
- Totais: verde (#22c55e)
- Títulos de turno: amarelo (Manhã) / azul (Tarde)

### Arquivos modificados
- `assets/js/logistica.js` — Funções `renderizarCalendario()` e `renderizarDefinicoes()` reescritas para o novo formato
- `assets/css/logistica.css` — Novos estilos: `.dia-header`, `.dia-card`, `.turnos-grid`, `.escola-logistica`, `.turma-item`, `.escola-total`, `.turno-total`, `.dia-totais`

## Módulo de Avaliações (Novo)

Baseado no arquivo `Dados_base/calendario.json` (mesmo conteúdo de `gemini-code-1794315408227.json`), o novo módulo exibe:

- **Cabeçalho do evento**: nome do evento, empresa, total de escolas e turmas
- **Cronograma por dia**: Terça a Sexta-feira (21 a 24/07)
- **Turnos**: Manhã e Tarde com totais de turmas, alunos, tablets e aplicadores
- **Escolas por turno**: nome, técnicos, turmas, quantidade de tablets, total de alunos
- **Observações**: quando presentes no turno
- **Busca**: filtra escolas por nome ou técnico
- **Exportação CSV**: gera `logistica_avaliacoes.csv` com todos os dados

## Acessibilidade do Módulo de Avaliações

- `aria-label` no campo de busca
- `<caption class="sr-only">` e `scope="col"` nas tabelas de escolas
- Ícones decorativos com `aria_hidden="true"`
- Títulos de seção com `aria-label` no `<section>`
- Feedback de exportação via toast (`role="status"`, `aria-live="polite"`)
- Foco devolvido ao campo de busca após re-renderização

## Correção de Nomes de Escolas

Os nomes das escolas em `Dados_base/calendario.json` foram atualizados para corresponder exatamente aos nomes oficiais registrados em `dados.json`:

- **Antes**: Nomes informais (ex: "Escola Senador Rui Palmeira", "Escola Ana Tereza")
- **Depois**: Nomes oficiais completos (ex: "UNIDADE MUNICIPAL DE ENSINO SENADOR RUI PALMEIRA", "UNIDADE MUNICIPAL DE ENSINO ANA TEREZA DE JESUS")

32 substituições realizadas em 19 escolas únicas, abrangendo todos os 4 dias do cronograma e todos os turnos (Manhã/Tarde).

Script de correção: `scripts/ajustar_nomes_escolas.js`

## Visualização em Fila Vertical (todos os dias em uma página)

O painel de Definições das Aplicações agora exibe **todos os dias em uma única página**, um abaixo do outro (em fila vertical):

### Estrutura da página
- Todos os 4 dias (Terça a Sexta-feira) são exibidos em sequência vertical
- Cada dia possui seu próprio card com cabeçalho roxo
- Se um dia não tiver aplicações, o card aparece vazio
- Navegação por teclado entre abas (Calendário/Definições) mantida

### Estrutura de cada card de dia
1. **Cabeçalho do dia**: Nome do dia e data (ex: "TERÇA-FEIRA 21/07") em fundo roxo
2. **Duas colunas**: MANHÃ e TARDE lado a lado
3. **Cada coluna (turno)**:
   - Título do turno com contagem de turmas
   - Lista de escolas com técnicos, turmas, tablets e total de alunos
   - Total de alunos do turno
4. **Rodapé do dia**: Totais de Manhã, Tarde e Tablets de Leitura

### Arquivos modificados
- `logistica.html` — Substituído container de card único por container `#lista-dias` que exibe todos os dias em sequência
- `assets/js/logistica.js` — Função `renderizarDefinicoes()` reescrita para renderizar todos os dias em fila vertical; removida navegação Anterior/Próximo

## Novo Módulo: Levantamento de Escolas

Criado novo módulo dentro do sistema de Logística para levantamento completo de todas as escolas avaliadas:

### `logistica-levantamento.html`
- Dashboard superior com 4 KPIs: Escolas Avaliadas, Séries Avaliadas, Turmas, Total de Alunos
- Navegação entre escolas (um card por vez) com botões Anterior/Próximo
- Indicador "Escola X de Y"
- Card detalhado por escola com todas as séries, turmas e quantidades de alunos
- Lista resumida colapsável de todas as escolas

### `assets/js/logistica-levantamento.js`
- Carrega `Dados_base/calendario.json` e consolida dados por escola
- Agrupa todas as séries, turmas e alunos por escola (consolida dados de múltiplos dias/turnos)
- Extrai automaticamente o nome da série de cada turma (ex: "1° ANO A" → "1° ANO")
- Distribui alunos igualmente entre turmas da mesma entrada de `turmas_e_tablets`
- Navegação entre escolas com controle de botões (habilitado/desabilitado conforme posição)

### `assets/css/logistica.css`
- Estilos para KPIs do dashboard (`kpi-card-levantamento`, `kpi-icon-levantamento`)
- Estilos para card da escola (`card-escola-levantamento`, `card-escola-header`, `card-escola-total`)
- Estilos para série (`serie-card`, `serie-header`, `serie-contagem`)
- Estilos para turma (`turma-item-levantamento`, `turma-nome`, `turma-alunos`)
- Estilos para lista de escolas (`lista-escola-item`, `lista-escola-numero`)

## Novo Módulo: Informações das Avaliações

Criado novo módulo dentro do sistema de Logística para informativo completo de todas as escolas avaliadas:

### `logistica-informacoes.html`
- Dashboard superior com 4 KPIs: Escolas Avaliadas, Séries Avaliadas, Turmas Avaliadas, Total de Alunos
- Navegação entre escolas (um card por vez) com botões Anterior/Próximo
- Indicador "Escola X de Y"
- Card detalhado por escola com todas as séries, turmas e quantidades de alunos
- Tabela resumo com todas as escolas (Escola, Técnicos, Séries, Turmas, Alunos)

### `assets/js/logistica-informacoes.js`
- Carrega `Dados_base/calendario.json` e consolida dados por escola
- Agrupa todas as séries, turmas e alunos por escola (consolida dados de múltiplos dias/turnos)
- Extrai automaticamente o nome da série de cada turma (ex: "1° ANO A" → "1° ANO")
- Distribui alunos igualmente entre turmas da mesma entrada de `turmas_e_tablets`
- Navegação entre escolas com controle de botões (habilitado/desabilitado conforme posição)
- Tabela resumo completa com todas as escolas e seus quantitativos

### Estrutura do card por escola
```
┌─────────────────────────────────────────────────────┐
│  [ ← Anterior ]  Escola 1 de 19  [ Próximo → ]     │
│  19 escolas cadastradas                             │
├─────────────────────────────────────────────────────┤
│  UNIDADE MUNICIPAL DE ENSINO SENADOR RUI PALMEIRA   │
│  Jordan, Alicia | 24 turmas | 5 séries              │
│                                                     │
│  Total Alunos: 580                                  │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  1° ANO  (3 turmas)  │  [102 alunos]        │   │
│  │  ┌─────────────┐                     │   │   │
│  │  │ 1° ANO A    │  [34 alunos]        │   │   │
│  │  │ 1° ANO B    │  [33 alunos]        │   │   │
│  │  │ 1° ANO C    │  [35 alunos]        │   │   │
│  │  └─────────────┘                     │   │   │
│  │  Total Série: 102 alunos             │   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                     │
│  [Total da Escola: 580 alunos]  [24 turmas ao todo] │
└─────────────────────────────────────────────────────┘
```

## Ajuste de Nomes de Turmas (baseado em alunos.csv)

Os nomes das turmas em `Dados_base/calendario.json` foram ajustados para corresponder exatamente aos nomes registrados no arquivo `alunos.csv`:

- **Antes**: Nomes abreviados/inconsistentes (ex: "1°A", "2º", "3°A e 3°B", "6°A e 6°B")
- **Depois**: Nomes oficiais completos (ex: "1º ANO A", "2º ANO", "3º ANO A, 3º ANO B", "6º ANO A, 6º ANO B")

### Estatísticas do ajuste:
- **147 turmas** totais no calendario.json
- **145 turmas** ajustadas automaticamente via normalização de strings
- **2 turmas** ajustadas via mapeamento manual (PROFª Mª CELESTE: "1º ANO A" → "1º ANO POÇO DO SAL", "1º ANO B" → "1º ANO POÇÃO")
- **0 turmas** não encontradas (100% de correspondência)

### Scripts utilizados:
- `scripts/ajustar_turmas.js` - Primeira tentativa de mapeamento
- `scripts/ajustar_escolas_turmas_completo.js` - Ajuste integrado escolas + turmas
- `scripts/ajuste_final_turmas.js` - Ajuste final com normalização
- `scripts/ajuste_final_turmas_v2.js` - Correção de normalização de graus (º vs °)
- `scripts/ajuste_ultimos_casos.js` - Ajuste dos últimos casos específicos
- `scripts/ajuste_definitivo.js` - Ajuste definitivo com mapeamento manual
- `scripts/debug_turmas.js` - Debug de comparação CSV vs calendario.json
- `scripts/verificar_turmas_detalhado.js` - Verificação detalhada de correspondência

### Resultados finais:
- **19 de 19 escolas** correspondem ao CSV (100%)
- **147 de 147 turmas** correspondem ao CSV (100%)

## Ajuste de Quantidade de Alunos por Turma

O campo `tablets` em cada entrada de `turmas_e_tablets` no `calendario.json` foi ajustado para refletir a **soma real de alunos** nas turmas listadas, baseado no arquivo `alunos.csv`:

### O que foi feito:
- Cada entrada em `turmas_e_tablets` agora tem `tablets` = quantidade real de alunos daquelas turmas (não o número de dispositivos físicos)
- O campo `total_alunos` de cada escola foi recalculado como a soma de todas as suas turmas
- **Total de alunos no calendario.json: 3.137** (corresponde exatamente ao `dados.json`)

### Estatísticas:
- **147 turmas** processadas e ajustadas
- **0 turmas** não encontradas no CSV
- **32 entradas** (escola × turno) verificadas
- **0 inconsistências** de totais

### Exemplo (Escola Senador Rui Palmeira, Terça-feira Manhã):
```
Turmas: "1° ANO A, 1° ANO B, 1° ANO C" → 49 alunos
Turmas: "2° ANO A, 2° ANO B, 2° ANO C" → 66 alunos
Turmas: "3° ANO A, 3° ANO B" → 61 alunos
Turmas: "4° ANO A, 4° ANO B" → 66 alunos
Turmas: "5° ANO A, 5° ANO B" → 64 alunos
TOTAL: 306 alunos
```

### Script utilizado:
- `scripts/ajustar_alunos_por_turma.js` — Ajuste de quantidade de alunos por turma baseado no CSV

## Como Executar os Testes

```bash
node tests/qa.js
```

## Próximos Passos Recomendados

1. Rodar auditoria com axe-core ou Lighthouse no navegador
2. Testar navegação exclusivamente por teclado (Tab, Enter, Arrow keys)
3. Validar com leitor de tela (NVDA, JAWS, VoiceOver)
4. Verificar contraste com ferramenta como WebAIM Contrast Checker
