const fs = require('fs');
const readline = require('readline');

// 1. Extrair escolas e turmas únicas do alunos.csv
async function extrairDoCSV() {
  const escolasCSV = new Set();
  const turmasCSV = new Map(); // escola -> Set de turmas

  const rl = readline.createInterface({
    input: fs.createReadStream('Dados_base/alunos.csv', { encoding: 'utf-8' }),
    crlfDelay: Infinity
  });

  let primeiraLinha = true;
  for await (const linha of rl) {
    if (primeiraLinha) {
      primeiraLinha = false;
      continue; // pular cabeçalho
    }
    const partes = linha.split(';');
    if (partes.length < 5) continue;

    const escola = partes[3].trim();
    const turma = partes[4].trim();

    if (escola) {
      escolasCSV.add(escola);
      if (!turmasCSV.has(escola)) turmasCSV.set(escola, new Set());
      if (turma) turmasCSV.get(escola).add(turma);
    }
  }

  return { escolasCSV, turmasCSV };
}

// 2. Ler calendario.json
function lerCalendario() {
  return JSON.parse(fs.readFileSync('Dados_base/calendario.json', 'utf-8'));
}

// 3. Ler dados.json para comparar escolas
function lerDadosJSON() {
  return JSON.parse(fs.readFileSync('dados.json', 'utf-8'));
}

// 4. Comparar e gerar relatório
async function main() {
  const { escolasCSV, turmasCSV } = await extrairDoCSV();
  const calendario = lerCalendario();
  const dadosJSON = lerDadosJSON();

  console.log('=== COMPARAÇÃO DE ESCOLAS ===\n');
  console.log(`Escolas no alunos.csv: ${escolasCSV.size}`);
  console.log(`Escolas no dados.json: ${dadosJSON.escolas.length}`);
  console.log(`Escolas no calendario.json: ${new Set(calendario.cronograma.flatMap(d => Object.values(d.turnos).flatMap(t => t.escolas.map(e => e.nome)))).size}`);

  // Escolas no CSV que não estão no calendario.json
  const escolasCalendario = new Set();
  calendario.cronograma.forEach(dia => {
    for (const turno of Object.values(dia.turnos)) {
      turno.escolas.forEach(e => escolasCalendario.add(e.nome));
    }
  });

  console.log('\n--- Escolas no CSV mas NÃO no calendario.json ---');
  let faltantesCalendario = 0;
  for (const escola of escolasCSV) {
    if (!escolasCalendario.has(escola)) {
      console.log(`  ❌ ${escola}`);
      faltantesCalendario++;
    }
  }
  if (faltantesCalendario === 0) console.log('  ✓ Todas as escolas do CSV estão no calendario.json');

  // Escolas no calendario.json que não estão no CSV
  console.log('\n--- Escolas no calendario.json mas NÃO no CSV ---');
  let extrasCalendario = 0;
  for (const escola of escolasCalendario) {
    if (!escolasCSV.has(escola)) {
      console.log(`  ❌ ${escola}`);
      extrasCalendario++;
    }
  }
  if (extrasCalendario === 0) console.log('  ✓ Todas as escolas do calendario.json estão no CSV');

  // Comparar dados.json com calendario.json
  const escolasDadosJSON = new Set(dadosJSON.escolas.map(e => e.nome));
  console.log('\n--- Escolas no dados.json mas NÃO no calendario.json ---');
  let faltantesJSON = 0;
  for (const escola of escolasDadosJSON) {
    if (!escolasCalendario.has(escola)) {
      console.log(`  ❌ ${escola}`);
      faltantesJSON++;
    }
  }
  if (faltantesJSON === 0) console.log('  ✓ Todas as escolas do dados.json estão no calendario.json');

  // 5. Comparar turmas
  console.log('\n=== COMPARAÇÃO DE TURMAS ===\n');

  // Turmas no calendario.json por escola
  const turmasCalendarioPorEscola = new Map();
  calendario.cronograma.forEach(dia => {
    for (const turno of Object.values(dia.turnos)) {
      turno.escolas.forEach(escola => {
        if (!turmasCalendarioPorEscola.has(escola.nome)) {
          turmasCalendarioPorEscola.set(escola.nome, new Set());
        }
        escola.turmas_e_tablets.forEach(tt => {
          // turmas pode conter múltiplas turmas separadas por vírgula
          tt.turmas.split(/[,;]/).forEach(t => {
            const trimada = t.trim();
            if (trimada) turmasCalendarioPorEscola.get(escola.nome).add(trimada);
          });
        });
      });
    }
  });

  // Para cada escola no calendario, verificar se suas turmas estão no CSV
  console.log('--- Turmas no calendario.json por escola vs CSV ---');
  let totalTurmasCalendario = 0;
  let totalTurmasCSV = 0;
  let turmasNaoEncontradas = 0;

  for (const [escola, turmasCal] of turmasCalendarioPorEscola) {
    totalTurmasCalendario += turmasCal.size;
    const turmasCSVdaEscola = turmasCSV.get(escola) || new Set();
    totalTurmasCSV += turmasCSVdaEscola.size;

    const naoEncontradas = [...turmasCal].filter(t => !turmasCSVdaEscola.has(t));
    if (naoEncontradas.length > 0) {
      turmasNaoEncontradas += naoEncontradas.length;
      console.log(`\n  📚 ${escola}`);
      console.log(`     Turmas no calendario.json: ${[...turmasCal].join(', ')}`);
      console.log(`     Turmas no CSV: ${[...turmasCSVdaEscola].join(', ')}`);
      console.log(`     ❌ Não encontradas no CSV: ${naoEncontradas.join(', ')}`);
    }
  }

  console.log(`\n  Total turmas únicas no calendario.json: ${totalTurmasCalendario}`);
  console.log(`  Total turmas únicas no CSV: ${totalTurmasCSV}`);
  console.log(`  Total turmas do calendario.json NÃO encontradas no CSV: ${turmasNaoEncontradas}`);

  // 6. Gerar mapeamento sugerido de ajuste de turmas
  console.log('\n=== SUGESTÃO DE MAPEAMENTO DE TURMAS ===\n');
  // Mostrar algumas turmas do CSV para entender o padrão
  const exemploEscola = [...turmasCSV.keys()][0];
  console.log(`Exemplo de turmas no CSV para "${exemploEscola}":`);
  console.log(`  ${[...turmasCSV.get(exemploEscola)].join(', ')}`);
}

main().catch(console.error);
