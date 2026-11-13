const fs = require('fs');

// Ler calendario.json
const calendario = JSON.parse(fs.readFileSync('Dados_base/calendario.json', 'utf-8'));

// Ler CSV
const escolasCSV = new Map();
const conteudoCSV = fs.readFileSync('Dados_base/alunos.csv', 'utf-8');
const linhas = conteudoCSV.split('\n');
let primeiraLinha = true;
for (const linha of linhas) {
  if (primeiraLinha) { primeiraLinha = false; continue; }
  const partes = linha.split(';');
  if (partes.length < 5) continue;
  const escola = partes[3].trim();
  const turma = partes[4].trim();
  if (escola && turma) {
    if (!escolasCSV.has(escola)) escolasCSV.set(escola, new Set());
    escolasCSV.get(escola).add(turma);
  }
}

function normalizarExtremo(nome) {
  // Normalização agressiva: remover TUDO exceto alfanuméricos
  return nome
    .toUpperCase()
    .replace(/[ªº°]/g, '')
    .replace(/Ã/g, 'A')
    .replace(/Ç/g, 'C')
    .replace(/É/g, 'E')
    .replace(/Í/g, 'I')
    .replace(/Ó/g, 'O')
    .replace(/Ô/g, 'O')
    .replace(/Ú/g, 'U')
    .replace(/[^A-Z0-9]/g, '')  // Remove espaços e tudo o resto
    .trim();
}

function dividirTurmas(str) {
  const partes = str.split(/[,;]/);
  const resultado = [];
  for (const parte of partes) {
    const trimada = parte.trim();
    if (trimada.length === 0) continue;
    if (trimada.includes(' e ')) {
      const subpartes = trimada.split(' e ');
      for (const sub of subpartes) {
        const subTrimada = sub.trim();
        if (subTrimada.length > 0) resultado.push(subTrimada);
      }
    } else {
      resultado.push(trimada);
    }
  }
  return resultado;
}

// Mapeamento manual para os casos restantes
const MAPEAMENTO_FINAL = {
  'UNIDADE MUNICIPAL DE ENSINO SENADOR RUI PALMEIRA': {
    '2º ANO B': '2°ANO B',
    '3º ANO B': '3°ANO B',
    '4º ANO B': '4°ANO B',
  },
  'UNIDADE MUNIC DE ENS PROFª Mª CELESTE M DE ANDRADE': {
    '1º ANO A': '1º ANO POÇO DO SAL',
    '1º ANO B': '1º ANO POÇÃO',
  },
};

// Ajustar
let ajustadas = 0;
let naoEncontradas = 0;

calendario.cronograma.forEach(dia => {
  for (const turno of Object.values(dia.turnos)) {
    turno.escolas.forEach(escola => {
      escola.turmas_e_tablets.forEach(tt => {
        const turmas = dividirTurmas(tt.turmas);
        const turmasFinais = turmas.map(t => {
          // Verificar mapeamento manual
          const mapa = MAPEAMENTO_FINAL[escola.nome];
          if (mapa && mapa[t]) {
            ajustadas++;
            return mapa[t];
          }

          // Verificar normalização extrema
          const turmasCSV = escolasCSV.get(escola.nome);
          if (turmasCSV) {
            const alvo = normalizarExtremo(t);
            for (const tc of turmasCSV) {
              if (normalizarExtremo(tc) === alvo) {
                if (tc !== t) ajustadas++;
                return tc;
              }
            }
          }

          naoEncontradas++;
          console.log(`❌ ${escola.nome}: "${t}" não encontrada`);
          return t;
        });
        tt.turmas = turmasFinais.join(', ');
      });
    });
  }
});

// Salvar
fs.writeFileSync('Dados_base/calendario.json', JSON.stringify(calendario, null, 2) + '\n', 'utf-8');

console.log(`\n=== AJUSTE FINAL ===\n`);
console.log(`Turmas ajustadas: ${ajustadas}`);
console.log(`Turmas não encontradas: ${naoEncontradas}`);

// Verificação final completa
console.log('\n=== VERIFICAÇÃO COMPLETA ===\n');
let total = 0;
let encontradas = 0;
let nao = 0;

calendario.cronograma.forEach(dia => {
  for (const turno of Object.values(dia.turnos)) {
    turno.escolas.forEach(escola => {
      const turmasCSV = escolasCSV.get(escola.nome);
      escola.turmas_e_tablets.forEach(tt => {
        const turmas = dividirTurmas(tt.turmas);
        turmas.forEach(t => {
          total++;
          let encontrada = false;
          if (turmasCSV && turmasCSV.has(t)) {
            encontrada = true;
          } else if (turmasCSV) {
            const alvo = normalizarExtremo(t);
            for (const tc of turmasCSV) {
              if (normalizarExtremo(tc) === alvo) {
                encontrada = true;
                break;
              }
            }
          }
          if (encontrada) {
            encontradas++;
          } else {
            nao++;
            console.log(`  ❌ ${escola.nome}: "${t}"`);
          }
        });
      });
    });
  }
});

console.log(`\nTotal: ${total}, Encontradas: ${encontradas}, Não encontradas: ${nao}`);
if (nao === 0) {
  console.log('\n✓✓✓ TODAS as 147 turmas do calendario.json correspondem ao CSV!');
} else {
  console.log('\nAlgumas turmas ainda não correspondem (verificar manualmente).');
}

// Verificar escolas
console.log('\n=== VERIFICAÇÃO DE ESCOLAS ===\n');
const escolasCalendario = new Set();
calendario.cronograma.forEach(dia => {
  for (const turno of Object.values(dia.turnos)) {
    turno.escolas.forEach(e => escolasCalendario.add(e.nome));
  }
});
let escolasNaoNoCSV = 0;
for (const escola of escolasCalendario) {
  if (!escolasCSV.has(escola)) {
    escolasNaoNoCSV++;
    console.log(`  ❌ Escola "${escola}" não encontrada no CSV`);
  }
}
if (escolasNaoNoCSV === 0) {
  console.log(`  ✓ Todas as ${escolasCalendario.size} escolas correspondem ao CSV!`);
}
