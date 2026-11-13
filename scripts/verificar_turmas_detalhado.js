const fs = require('fs');

function normalizar(nome) {
  return nome
    .toUpperCase()
    .replace(/ª/g, 'A')
    .replace(/°/g, 'O')
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

// Criar índice normalizado do CSV
const csvNormalizado = new Map();
for (const [escola, turmas] of escolasCSV) {
  const normEscola = normalizar(escola);
  if (!csvNormalizado.has(normEscola)) csvNormalizado.set(normEscola, new Map());
  const mapTurmas = csvNormalizado.get(normEscola);
  for (const t of turmas) {
    mapTurmas.set(normalizar(t), t);
  }
}

// Ler calendario.json
const calendario = JSON.parse(fs.readFileSync('Dados_base/calendario.json', 'utf-8'));

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

console.log('=== VERIFICAÇÃO DETALHADA DE TURMAS ===\n');
let totalCalendario = 0;
let totalEncontradas = 0;
let totalNaoEncontradas = 0;
const naoEncontradas = [];

calendario.cronograma.forEach(dia => {
  for (const turno of Object.values(dia.turnos)) {
    turno.escolas.forEach(escola => {
      const normEscola = normalizar(escola.nome);
      const mapTurmasCSV = csvNormalizado.get(normEscola);
      
      escola.turmas_e_tablets.forEach(tt => {
        const turmas = dividirTurmas(tt.turmas);
        turmas.forEach(t => {
          totalCalendario++;
          const normTurma = normalizar(t);
          if (mapTurmasCSV && mapTurmasCSV.has(normTurma)) {
            totalEncontradas++;
            const nomeOriginalCSV = mapTurmasCSV.get(normTurma);
            if (nomeOriginalCSV !== t) {
              console.log(`  ~ ${escola.nome}: "${t}" → CSV tem "${nomeOriginalCSV}"`);
            }
          } else {
            totalNaoEncontradas++;
            naoEncontradas.push(`${escola.nome}: "${t}"`);
          }
        });
      });
    });
  }
});

console.log(`Total turmas no calendario.json: ${totalCalendario}`);
console.log(`Total encontradas no CSV (após normalização): ${totalEncontradas}`);
console.log(`Total não encontradas: ${totalNaoEncontradas}`);

if (naoEncontradas.length > 0) {
  console.log('\nTurmas não encontradas:');
  naoEncontradas.forEach(t => console.log(`  ❌ ${t}`));
} else {
  console.log('\n✓ Todas as turmas foram encontradas no CSV (após normalização)!');
}
