const fs = require('fs');

// Ler calendario.json
const calendario = JSON.parse(fs.readFileSync('Dados_base/calendario.json', 'utf-8'));

// Ler CSV para obter nomes exatos de turmas por escola
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

function normalizar(nome) {
  return nome
    .toUpperCase()
    .replace(/ª/g, 'A')     // ª → A (ordinal feminino)
    .replace(/[º°]/g, '')   // º e ° → remover (marcadores de ordinal)
    .replace(/Ã/g, 'A')
    .replace(/Ç/g, 'C')
    .replace(/É/g, 'E')
    .replace(/Í/g, 'I')
    .replace(/Ó/g, 'O')
    .replace(/Ô/g, 'O')
    .replace(/Ú/g, 'U')
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
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

// Encontrar o nome exato da turma no CSV para uma escola e turma normalizada
function encontrarTurmaNoCSV(escolaNome, turmaCalendario) {
  const turmasCSV = escolasCSV.get(escolaNome);
  if (!turmasCSV) return null;
  
  const alvo = normalizar(turmaCalendario);
  for (const t of turmasCSV) {
    if (normalizar(t) === alvo) {
      return t;
    }
  }
  return null;
}

// Ajustar turmas finais
let ajustadas = 0;
let naoEncontradas = 0;

calendario.cronograma.forEach(dia => {
  for (const turno of Object.values(dia.turnos)) {
    turno.escolas.forEach(escola => {
      escola.turmas_e_tablets.forEach(tt => {
        const turmas = dividirTurmas(tt.turmas);
        const turmasFinais = turmas.map(t => {
          const exata = encontrarTurmaNoCSV(escola.nome, t);
          if (exata) {
            if (exata !== t) {
              ajustadas++;
            }
            return exata;
          } else {
            naoEncontradas++;
            console.log(`❌ ${escola.nome}: "${t}" não encontrada no CSV`);
            return t;
          }
        });
        tt.turmas = turmasFinais.join(', ');
      });
    });
  }
});

// Salvar
fs.writeFileSync('Dados_base/calendario.json', JSON.stringify(calendario, null, 2) + '\n', 'utf-8');

console.log(`\n=== AJUSTE FINAL ===\n`);
console.log(`Turmas ajustadas para nome exato do CSV: ${ajustadas}`);
console.log(`Turmas não encontradas no CSV: ${naoEncontradas}`);

// Verificação final
console.log('\n=== VERIFICAÇÃO FINAL ===\n');
let total = 0;
let encontradas = 0;
let nao = 0;
const naoEncontradasLista = [];

calendario.cronograma.forEach(dia => {
  for (const turno of Object.values(dia.turnos)) {
    turno.escolas.forEach(escola => {
      const turmasCSV = escolasCSV.get(escola.nome);
      escola.turmas_e_tablets.forEach(tt => {
        const turmas = dividirTurmas(tt.turmas);
        turmas.forEach(t => {
          total++;
          if (turmasCSV && turmasCSV.has(t)) {
            encontradas++;
          } else {
            nao++;
            naoEncontradasLista.push(`  ❌ ${escola.nome}: "${t}"`);
          }
        });
      });
    });
  }
});

console.log(`Total: ${total}, Encontradas: ${encontradas}, Não encontradas: ${nao}`);
if (nao === 0) {
  console.log('\n✓ TODAS as turmas do calendario.json correspondem ao CSV!');
} else {
  console.log('\nTurmas ainda não encontradas:');
  naoEncontradasLista.forEach(t => console.log(t));
}
