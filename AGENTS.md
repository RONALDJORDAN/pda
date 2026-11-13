# AGENTS.md - Projeto Logística PDA

## Visão Geral
Sistema de logística para planejamento de aplicações de provas, baseado no quantitativo de alunos por escola, turma, série e curso.

## Tecnologias
- HTML5, CSS vanilla, JavaScript vanilla (sem frameworks)
- Python 3.x para processamento de dados
- Dados em CSV (delimitador `;`, codificação UTF-8)

## Estrutura do Projeto
```
Logistica-pda/
├── processar_dados.py    # Script de processamento do CSV
├── dados.json            # Dados processados (gerado automaticamente)
├── index.html            # Interface principal
├── styles.css            # Estilos
├── app.js                # Lógica de renderização
├── README.md             # Documentação
└── .kilo/
    └── skills/           # Skills especializadas
```

## Diretrizes de Desenvolvimento

### Sempre
- Responda em português brasileiro
- Respeite a ordem das instruções
- Nunca apague ou modifique arquivos sem confirmação explícita
- Use os skills disponíveis quando a tarefa corresponder
- Teste o código antes de entregar
- Mantenha consistência com o código existente

### Código
- HTML5 semântico
- CSS Grid/Flexbox para layouts responsivos
- JavaScript vanilla (sem bibliotecas externas sem autorização)
- Python com módulos padrão
- Sem comentários desnecessários
- Nomes descritivos em português

### Dados
- Codificação UTF-8 em todos os arquivos
- Normalização de dados (trim, padronização de categorias)
- Dados sensíveis devem ser mascarados ou removidos
- Use `utf-8-sig` para remover BOM em CSVs

### Interface
- Cores: azul escuro (#2c3e50), azul (#3498db), verde (#2ecc71)
- Cards com sombras suaves
- Layout responsivo (mobile-first)
- Feedback visual para interações
- Acessibilidade básica (labels, contraste)

## Skills Disponíveis
- **web-form-designer**: Criação de formulários web
- **dashboard-designer**: Painéis de controle e métricas
- **data-table-designer**: Tabelas de dados interativas
- **csv-data-processor**: Processamento de arquivos CSV
- **code-reviewer**: Revisão de código
- **test-writer**: Criação de testes

## Comandos Úteis
```bash
# Processar dados
python processar_dados.py

# Iniciar servidor para teste
python -m http.server 8000
```

## Histórico
- v1.0: Sistema inicial com dashboard, filtros e exportação CSV