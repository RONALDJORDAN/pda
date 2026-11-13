# Histórico de Alterações

Registro do que foi feito no projeto, em ordem cronológica.

---

## 10/11/2026 — Reestruturação do front-end

### 1. Padronização de nomenclatura (LOA → Logística)

O módulo de logística usava a sigla "LOA" em arquivos e classes CSS. Tudo foi renomeado:

| Antes | Depois |
|---|---|
| `assets/css/loa.css` | `assets/css/logistica.css` |
| `assets/js/loa.js` | `assets/js/logistica.js` |
| classes `.loa-*` | `.logistica-*` |

Também foram removidas as pastas vazias `assets/css/loa/` e `assets/js/loa/`.

### 2. Correção de bugs fatais

**`assets/js/app.js`**
- Referências a `turmasContainer` e `detalheContainer` (variáveis inexistentes) trocadas por `container`.
- Sem isso, as seções de turmas e detalhamento quebravam na renderização.

**`assets/js/logistica.js`**
- Variável `dia` usada sem definição trocada por `data`. O erro interrompia o script inteiro.

### 3. Menu superior padronizado

Aplicado o mesmo markup em `index.html` e `logistica.html`:

```
[ logo_pda.png ]      [ Dashboard ] [ Logística ]      [ Logística Pão de Açúcar ]
    esquerda                   centro                          direita
```

Detalhes da implementação:
- Container em grid de 3 colunas (`grid-cols-[1fr_auto_1fr]`) para centralizar os botões de verdade, independente do peso da tag à direita.
- Logo `assets/img/logo_pda.png` (548×536, fundo branco) dentro de um selo branco arredondado de 44×44 px.
- Botões Dashboard/Logística com destaque no item da página atual (`aria-current="page"`).
- Tag à direita com o texto completo no desktop e "Logística PDA" no mobile.
- Removidos os controles sem função (menu sanduíche, botão de conta) e o `target="_blank"` do link de logística.
- Mobile: os botões mantêm apenas os ícones.

### 4. Módulo de logística reconstruído

Todo o conteúdo antigo de `logistica.html` foi apagado, mantendo apenas o menu superior. No lugar foram criadas duas seções em abas:

**Seção 1 — Calendário das Aplicações**
- Grade com 7 cards, de domingo 06/12/2026 a sábado 12/12/2026.
- Cada card mostra sigla do dia, data, nome do dia e os turnos.
- Dias 06 a 11: Manhã e Tarde. Dia 12: Logística única.

**Seção 2 — Definições das Aplicações**
- 7 cards, um por dia, com um slot por turno e o marcador "A definir" para preenchimento futuro.
- Cards de dias com 2 turnos exibem o selo "2 turnos"; o sábado exibe "1 turno".

**Navegação entre seções**
- Abas com `role="tab"` / `role="tabpanel"`, `aria-selected` e `tabindex` sincronizados.
- Troca por clique e por teclado (setas ← e →, com foco acompanhando).

### 5. Estilos das abas

Adicionados em `assets/css/logistica.css`:
- Estado normal, hover, ativo (`aria-selected="true"`) e foco visível.
- Correção do selo "7 dias", que esticava na largura toda no mobile (`self-start`).

---

## Validações executadas

Todas via Chrome headless + CDP, contra servidor local (`python -m http.server`).

| Verificação | Resultado |
|---|---|
| Logo carregado | 548×536, HTTP 200 |
| Centralização do menu | desktop 716 px vs centro 720 px; mobile 195 px vs 195 px |
| Overflow do menu | nenhum (1287/1287 desktop, 357/357 mobile) |
| Links e estado ativo | corretos em cada página |
| Cards no calendário / nas definições | 7 / 7 |
| Dias da semana vs. datas reais | conferem |
| Slots por dia | 2, 2, 2, 2, 2, 2, 1 (13 no total) |
| Troca de abas por clique | calendário ↔ definições |
| Teclado ← → | painel e foco alternam corretamente |
| Overflow horizontal no mobile (390 px) | inexistente |
| Estrutura HTML | sem tags abertas, IDs duplicados ou assets faltando |
| Console | sem erros; apenas `favicon.ico` 404 (arquivo inexistente) |

---

## Backups

Criados em `%TEMP%` antes da reconstrução do módulo, com o sufixo `20261110-160213`:

- `logistica-20261110-160213.html.bak`
- `logistica-20261110-160213.js.bak`
- `logistica-20261110-160213.css.bak`

---

## Estado atual dos arquivos

```
Logistica-pda/
├── index.html                  # Dashboard (menu + 5 seções)
├── logistica.html              # Calendário e Definições das Aplicações
├── dados.json                  # Dados agregados
├── README.md                   # Documentação (desatualizada)
├── AGENTS.md                   # Diretrizes do projeto
├── assets/
│   ├── css/
│   │   ├── styles.css          # Tema escuro compartilhado
│   │   └── logistica.css       # Estilos do módulo de logística
│   ├── js/
│   │   ├── app.js              # Lógica do dashboard
│   │   └── logistica.js        # Calendário, definições e abas
│   └── img/
│       └── logo_pda.png        # Brasão PDA
├── Dados_base/
│   └── alunos.csv              # Base de origem
└── scripts/
    └── processar_dados.py      # Gera dados.json a partir do CSV
```

### Dados em `dados.json`

| Métrica | Valor |
|---|---|
| Alunos | 3.137 |
| Escolas | 19 |
| Turmas | 58 |
| Séries | 18 |
| Cursos | 4 |
| Turnos | 3 |

---

## Decisões pendentes

1. **Dia 12/12** — foi tratado como logística única (um slot). Confirmar se deve ter turnos.
2. **Conteúdo dos turnos** — definir quais campos substituem o "A definir" (escola, local, horário, fiscal, malote etc.).
3. **README.md desatualizado** — os caminhos citados (`processar_dados.py`, `alunos.csv`, `styles.css`, `app.js` na raiz) não correspondem mais à estrutura atual, e o `logistica.html` não está documentado.

---

## Gaps conhecidos no dashboard

Itens identificados mas ainda não aprovados para alteração:

- 4 seções existem no HTML mas estão inacessíveis pela interface (`escolas`, `turmas`, `detalhe`, `distribuicao`).
- O botão "Exportar CSV" não está conectado à função `exportarCSV()`.
- A busca textual não filtra por turno nem por série.
- A normalização dos dados gera 358 alunos duplicados.
- Não há persistência de filtros entre recarregamentos.

---

## Como validar

```powershell
# Servidor local
python -m http.server 8765 --bind 127.0.0.1

# Páginas
# http://127.0.0.1:8765/index.html
# http://127.0.0.1:8765/logistica.html
```
