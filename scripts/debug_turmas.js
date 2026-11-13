const fs = require('fs');

// Ler CSV e mostrar turmas para escolas problemáticas
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

const escolasProblema = [
  'UNIDADE MUNICIPAL DE ENSINO SENADOR RUI PALMEIRA',
  'UNIDADE MUNICIPAL DE ENSINO RONALCO DOS ANJOS',
  'UNIDADE MUNICIPAL DE ENS JAIME DE ALTAVILLA',
  'UNIDADE MUNICIPAL DE ENSINO MINISTRO AUGUSTO DE FREITAS MACHADO',
  'UNIDADE MUNICIPAL DE ENSINO MONSENHOR LYRA',
  'UNIDADE MUNIC DE ENS PROFª Mª CELESTE M DE ANDRADE',
];

for (const escola of escolasProblema) {
  const turmas = escolasCSV.get(escola);
  if (!turmas) {
    console.log(`\n❌ Escola não encontrada no CSV: ${escola}`);
    continue;
  }
  console.log(`\n=== ${escola} ===`);
  console.log(`Turmas no CSV (${turmas.size}):`);
  for (const t of [...turmas].sort()) {
    console.log(`  "${t}" → normalizado: "${normalizar(t)}"`);
  }
}
