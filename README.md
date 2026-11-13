# Sistema de Logística - Planejamento de Aplicações de Provas

Sistema para visualização e análise do quantitativo de alunos por escola, turma, série e curso, com foco no planejamento de aplicações de provas.

## Visão Geral

O sistema processa um arquivo CSV (`alunos.csv`) contendo dados de alunos e gera relatórios interativos via navegador, permitindo filtrar e exportar as informações necessárias para a logística de provas.

## Estrutura do Projeto

```
Logistica-pda/
├── processar_dados.py    # Script de processamento do CSV
├── dados.json            # Dados processados (gerado automaticamente)
├── index.html            # Estrutura da aplicação
├── styles.css            # Estilos da interface
├── app.js                # Lógica de renderização e interação
└── README.md             # Este arquivo
```

## Requisitos

- Python 3.x
- Navegador web moderno (HTML5, CSS, JavaScript)

## Como Usar

### 1. Processar os dados

```bash
python processar_dados.py
```

Este script lê o `alunos.csv` e gera o `dados.json` com as estatísticas completas.

### 2. Abrir a aplicação

Abra o arquivo `index.html` em um navegador web.

## Funcionalidades

### Dashboard
- Total de Alunos
- Número de Escolas
- Número de Turmas
- Número de Séries/Cursos

### Filtros
- Filtrar por escola
- Filtrar por turno (Matutino, Vespertino, Integral)
- Filtrar por série/curso

### Seções de Dados
- **Visão Geral por Escola** - Lista completa de escolas com quantitativo de alunos
- **Visão Geral por Turma** - Turmas ordenadas com barras de progresso proporcionais
- **Detalhamento por Escola e Turma** - Grid de cards mostrando cada escola e suas respectivas turmas
- **Distribuição por Turno e Série/Curso** - Tabelas com quantidades e porcentagens

### Exportação
- Botão "Exportar CSV" gera um arquivo completo com todos os dados tabulados

## Dados de Entrada

O arquivo `alunos.csv` deve estar no formato:
- Delimitador: ponto e vírgula (`;`)
- Codificação: UTF-8
- Colunas: Nome, CPF, Data de nascimento, Escola, Turma, Série, Course, Turno

## Manutenção

Para atualizar os dados, basta substituir o arquivo `alunos.csv` e executar novamente:
```bash
python processar_dados.py
```

## Autor

Sistema desenvolvido para apoio à logística educacional.

# Relatório de QA / Acessibilidade — Sistema Logística PDA

## Resumo Executivo

Foram aplicadas correções de acessibilidade (WCAG 2.1) e melhorias de QA em todo o sistema,
abrangendo HTML, CSS e JavaScript das páginas `index.html` e `logistica.html`.

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

1. **Ícones decorativos** — Adicionado `aria-hidden="true"` a todos os `<span class="material-symbols-outlined">` que não carregam informação, evitando leitura de nomes de símbolos por leitores de tela.

2. **Campo de busca** — Adicionado `<label for="busca-texto">` e `aria-label="Buscar escola ou turma"` ao input, substituindo a dependência exclusiva do `placeholder`.

3. **Contraste de cor** — Texto secundário alterado de `#a0a0a0` para `#c9c9c9` e outline de `#404040` para `#888888`, melhorando legibilidade no tema escuro.

4. **Redução de movimento** — Animação `.marquee-text` respeita `prefers-reduced-motion: reduce`.

5. **Tabelas** — Adicionado `<caption class="sr-only">` descritivo e `scope="col"` em todos os `<th>` das 4 tabelas de distribuição.

6. **Gerenciamento de foco** — Após re-renderização dinâmica (`innerHTML`), o foco retorna ao campo de busca. Mudança de seção anuncia via `aria-live="polite"`.

7. **Exportação CSV** — Feedback visual via toast (`role="status"`, `aria-live="polite"`). Validação de integridade dos dados antes de exportar.

### Média (Melhorias de UX)

8. **Navegação por teclado** — Seções recebem `tabindex="-1"` e foco ao serem ativadas.

9. **Dashboard** — Região `aria-live` para anuncio de status e badge `.metrica-badge` para métricas visuais.

10. **Testes automatizados** — Arquivo `tests/qa.js` validando idioma, alt de imagens, ARIA, labels, tabelas e feedback de exportação.

## Arquivos Modificados

- `index.html` — ARIA, label de busca, região aria-live
- `logistica.html` — ARIA em ícones decorativos
- `assets/css/styles.css` — `.sr-only`, contraste, `prefers-reduced-motion`, `.metrica-badge`, `.animate-pulse`
- `assets/js/app.js` — ARIA em ícones dinâmicos, caption/scope em tabelas, foco, toast, validação CSV, anúncio de seção
- `assets/js/logistica.js` — ARIA em ícones dinâmicos
- `tests/qa.js` — Novo: suite de testes de QA

## Arquivos Criados

- `tests/qa.js` — Testes automatizados de QA
- `RELATORIO_QA.md` — Este relatório

## Como Executar os Testes

```bash
node tests/qa.js
```

## Próximos Passos Recomendados

1. Rodar auditoria com axe-core ou Lighthouse no navegador
2. Testar navegação exclusivamente por teclado (Tab, Enter, Arrow keys)
3. Validar com leitor de tela (NVDA, JAWS, VoiceOver)
4. Verificar contraste com ferramenta como WebAIM Contrast Checker