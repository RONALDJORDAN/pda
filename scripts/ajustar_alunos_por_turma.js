const fs = require('fs');

console.log('=== PASSO 1: Extrair contagem de alunos por Escola+Turma do CSV ===');
const escolasCSV = new Map(); // escola -> Map(turma -> quantidade de alunos)
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
    if (!escolasCSV.has(escola)) escolasCSV.set(escola, new Map());
    const mapTurmas = escolasCSV.get(escola);
    mapTurmas.set(turma, (mapTurmas.get(turma) || 0) + 1);
  }
}
console.log(`Escolas encontradas no CSV: ${escolasCSV.size}`);

function normalizar(nome) {
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

// Encontrar quantidade de alunos para uma turma específica em uma escola
function encontrarQuantidadeAlunos(escolaNome, turmaNome) {
  const mapTurmas = escolasCSV.get(escolaNome);
  if (!mapTurmas) return 0;
  
  const alvo = normalizar(turmaNome);
  for (const [turmaCSV, qtd] of mapTurmas) {
    if (normalizar(turmaCSV) === alvo) {
      return qtd;
    }
  }
  return 0;
}

// Mapeamento manual para escolas (informal -> oficial)
const MAPEAMENTO_ESCOLAS = {
  'Escola Senador Rui Palmeira': 'UNIDADE MUNICIPAL DE ENSINO SENADOR RUI PALMEIRA',
  'Escola Ronalço dos Anjos': 'UNIDADE MUNICIPAL DE ENSINO RONALCO DOS ANJOS',
  'Escola Ana Tereza': 'UNIDADE MUNICIPAL DE ENSINO ANA TEREZA DE JESUS',
  'Escola Manoel Alves': 'UNIDADE MUNICIPAL DE ENSINO PROF MANOEL ALVES',
  'Escola Mª Tavares Pinto': 'UNIDADE MUNICIPAL DE ENSINO PROFª MARIA TAVARES PINTO',
  'Escola Júlio D. Ribeiro': 'UNIDADE MUNICIPAL ENS JULIO DAMASCENO RIBEIRO',
  'Escola Lindauro Costa': 'UNIDADE MUNICIPAL DE ENSINO LINDAURO COSTA',
  'Escola São Miguel': 'UNIDADE MUNICIPAL DE ENSINO SAO MIGUEL',
  'Escola Campo Novo': 'UNIDADE MUNICIPAL DE ENSINO CAMPO NOVO',
  'Escola João Leite': 'UNIDADE MUNICIPAL DE ENSINO SITIO JOAO LEITE',
  'Escola Pedro Soares': 'UNIDADE MUNICIPAL DE ENSINO PEDRO SOARES DOS PRAZERES',
  'Escola Prof. Jaime de Altavilla': 'UNIDADE MUNICIPAL DE ENS JAIME DE ALTAVILLA',
  'Escola José Tavares de Castro': 'UNIDADE MUNICIPAL DE ENSINO JOSE TAVARES DE CASTRO',
  'Escola Vereador A. M. Guimarães': 'UNIDADE MUNICIPAL VER ANTONIO MACHADO GUIMARAES',
  'Escola Capitão Manoel Rêgo': 'UNIDADE MUNICIPAL DE ENSINO CAP MANOEL REGO',
  'Escola Ministro Augusto de F. Machado': 'UNIDADE MUNICIPAL DE ENSINO MINISTRO AUGUSTO DE FREITAS MACHADO',
  'Escola Monsenhor Lyra': 'UNIDADE MUNICIPAL DE ENSINO MONSENHOR LYRA',
  'Escola José Gonçalves de Andrade': 'UNIDADE MUNIC DE ENS JOSE GONCALVES DE ANDRADE',
  'Escola Maria Celeste': 'UNIDADE MUNIC DE ENS PROFª Mª CELESTE M DE ANDRADE',
};

// Carregar calendario.json (já tem escolas oficiais)
console.log('\n=== PASSO 2: Carregar e ajustar calendario.json ===');
const calendario = JSON.parse(fs.readFileSync('Dados_base/calendario.json', 'utf-8'));

let totalAjustadas = 0;
let totalNaoEncontradas = 0;
const naoEncontradas = [];

calendario.cronograma.forEach(dia => {
  for (const [chaveTurno, turno] of Object.entries(dia.turnos)) {
    turno.escolas.forEach(escola => {
      // Obter nome oficial da escola
      const nomeOficial = MAPEAMENTO_ESCOLAS[escola.nome] || escola.nome;
      if (nomeOficial !== escola.nome) {
        escola.nome = nomeOficial;
      }

      // Processar cada entrada de turmas_e_tablets
      escola.turmas_e_tablets.forEach(tt => {
        const turmas = dividirTurmas(tt.turmas);
        let somaAlunos = 0;
        const turmasDetalhe = [];

        turmas.forEach(t => {
          const qtd = encontrarQuantidadeAlunos(escola.nome, t);
          if (qtd > 0) {
            somaAlunos += qtd;
            totalAjustadas++;
            turmasDetalhe.push(`  "${t}" → ${qtd} alunos`);
          } else {
            totalNaoEncontradas++;
            naoEncontradas.push(`  ${escola.nome}: "${t}" não encontrada no CSV`);
          }
        });

        // Atualizar o campo tablets com a soma real de alunos
        tt.tablets = somaAlunos;
      });

      // Atualizar total_alunos da escola com a soma de todas as turmas
      let totalEscola = 0;
      escola.turmas_e_tablets.forEach(tt => {
        totalEscola += tt.tablets;
      });
      escola.total_alunos = totalEscola;
    });
  }
});

// Salvar
fs.writeFileSync('Dados_base/calendario.json', JSON.stringify(calendario, null, 2) + '\n', 'utf-8');

console.log(`\n=== RESULTADO ===\n`);
console.log(`Turmas ajustadas com quantidade de alunos: ${totalAjustadas}`);
console.log(`Turmas não encontradas no CSV: ${totalNaoEncontradas}`);
if (naoEncontradas.length > 0) {
  console.log('\nTurmas não encontradas:');
  naoEncontradas.forEach(t => console.log(t));
} else {
  console.log('\n✓ Todas as turmas foram encontradas e ajustadas!');
}

// Verificação final
console.log('\n=== VERIFICAÇÃO FINAL ===\n');
let totalEscolas = 0;
let totalAlunosCalendario = 0;
let erros = 0;

calendario.cronograma.forEach(dia => {
  for (const [chaveTurno, turno] of Object.entries(dia.turnos)) {
    turno.escolas.forEach(escola => {
      totalEscolas++;
      let somaTurmas = 0;
      escola.turmas_e_tablets.forEach(tt => {
        somaTurmas += tt.tablets;
      });
      totalAlunosCalendario += escola.total_alunos;
      
      if (somaTurmas !== escola.total_alunos) {
        erros++;
        console.log(`❌ ${escola.nome}: soma das turmas (${somaTurmas}) !== total_alunos (${escola.total_alunos})`);
      }
    });
  }
});

console.log(`Total de entradas escola/turno: ${totalEscolas}`);
console.log(`Total de alunos no calendario.json: ${totalAlunosCalendario}`);
if (erros === 0) {
  console.log('\n✓ Todos os totais estão consistentes!');
} else {
  console.log(`\n❌ ${erros} inconsistências encontradas`);
}

// Mostrar exemplo de como ficou
console.log('\n=== EXEMPLO: Primeiro dia, Manhã, Escola Senador Rui Palmeira ===');
const primeiroDia = calendario.cronograma[0];
const turnoManha = primeiroDia.turnos.manha;
const escolaExemplo = turnoManha.escolas.find(e => e.nome.includes('SENADOR RUI PALMEIRA'));
if (escolaExemplo) {
  console.log(`Escola: ${escolaExemplo.nome}`);
  console.log(`Total alunos: ${escolaExemplo.total_alunos}`);
  escolaExemplo.turmas_e_tablets.forEach(tt => {
    console.log(`  Turmas: "${tt.turmas}" → Alunos (tablets): ${tt.tablets}`);
  });
}
