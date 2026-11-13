const fs = require('fs');

// Mapeamento por escola: nome da escola -> { turma antiga -> turma nova }
const MAPEAMENTO_POR_ESCOLA = {
  'UNIDADE MUNICIPAL DE ENSINO SENADOR RUI PALMEIRA': {
    '1°A': '1º ANO A',
    '1°B': '1º ANO B',
    '1°C': '1º ANO C',
    '1°D': '1º ANO D',
    '1°E': '1º ANO E',
    '1°F': '1º ANO F',
    '2°A': '2º ANO A',
    '2°B': '2º ANO B',
    '2°C': '2º ANO C',
    '2°D': '2º ANO D',
    '2°E': '2º ANO E',
    '2°F': '2º ANO F',
    '3°A': '3º ANO A',
    '3°B': '3º ANO B',
    '3°C': '3º ANO C',
    '3°D': '3º ANO D',
    '4°A': '4º ANO A',
    '4°B': '4º ANO B',
    '4°C': '4º ANO C',
    '4°D': '4º ANO D',
    '5°A': '5º ANO A',
    '5°B': '5º ANO B',
    '5°C': '5º ANO C',
    '5°D': '5º ANO D',
  },
  'UNIDADE MUNICIPAL DE ENSINO RONALCO DOS ANJOS': {
    '1°A': '1º ANO A',
    '1°B': '1º ANO B',
    '2°A': '2º ANO A',
    '2°B': '2º ANO B',
    '3º': '3º ANO',
    '4°': '4º ANO',
    '5°': '5º ANO',
  },
  'UNIDADE MUNICIPAL DE ENSINO ANA TEREZA DE JESUS': {
    '1º': '1º ANO',
    '2º': '2º ANO',
    '3º': '3º ANO',
    '4º': '4º ANO',
    '5º': '5º ANO',
    '2º e 4º': '2º ANO, 4º ANO',
  },
  'UNIDADE MUNICIPAL DE ENSINO PROF MANOEL ALVES': {
    '1º': '1º ANO',
    '2º': '2º ANO',
    '3º': '3º ANO',
    '4º': '4º ANO',
    '5º': '5º ANO',
    '1º, 2º, 3º, 4º e 5º': '1º ANO, 2º ANO, 3º ANO, 4º ANO, 5º ANO',
  },
  'UNIDADE MUNICIPAL DE ENSINO PROFª MARIA TAVARES PINTO': {
    '6°A': '6º ANO A',
    '6°B': '6º ANO B',
    '6°C': '6º ANO C',
    '6°D': '6º ANO D',
    '6°E': '6º ANO E',
    '7°A': '7º ANO A',
    '7°B': '7º ANO B',
    '7°C': '7º ANO C',
    '7°D': '7º ANO D',
    '8°A': '8º ANO A',
    '8°B': '8º ANO B',
    '8°C': '8º ANO C',
    '8°D': '8º ANO D',
    '8°E': '8º ANO E',
    '9°A': '9º ANO A',
    '9°B': '9º ANO B',
    '9°C': '9º ANO C',
    '9°D': '9º ANO D',
    '9°E': '9º ANO E',
    '8°A e 8°B': '8º ANO A, 8º ANO B',
    '9°A e 9°B': '9º ANO A, 9º ANO B',
  },
  'UNIDADE MUNICIPAL ENS JULIO DAMASCENO RIBEIRO': {
    '1º': '1º ANO',
    '2º': '2º ANO',
    '3°': '3º ANO',
    '4º': '4º ANO',
    '5º': '5º ANO',
    '1º e 2º': '1º ANO, 2º ANO',
  },
  'UNIDADE MUNICIPAL DE ENSINO LINDAURO COSTA': {
    '1º': '1º ANO',
    '2º': '2º ANO',
    '3º': '3º ANO',
    '4º': '4º ANO',
    '5º': '5º ANO',
  },
  'UNIDADE MUNICIPAL DE ENSINO SAO MIGUEL': {
    '1º': '1º ANO',
    '2º': '2º ANO',
    '3º': '3º ANO',
    '4°': '4º ANO',
    '5°': '5º ANO',
    '4° e 5°': '4º ANO, 5º ANO',
  },
  'UNIDADE MUNICIPAL DE ENSINO CAMPO NOVO': {
    '6°': '6º ANO',
    '7°': '7º ANO',
    '8°': '8º ANO',
    '9°': '9º ANO',
    '6° e 7°': '6º ANO, 7º ANO',
    '8° e 9°': '8º ANO, 9º ANO',
  },
  'UNIDADE MUNICIPAL DE ENSINO SITIO JOAO LEITE': {
    '1º': '1º ANO',
    '2º': '2º ANO',
    '3º': '3º ANO',
    '4°': '4º ANO',
    '5º': '5º ANO',
    '6º': '6º ANO',
    '7°': '7º ANO',
    '8°': '8º ANO',
    '9°': '9º ANO',
  },
  'UNIDADE MUNICIPAL DE ENSINO PEDRO SOARES DOS PRAZERES': {
    '1°A': '1º ANO A',
    '1°B': '1º ANO B',
    '2º': '2º ANO',
    '3º': '3º ANO',
    '4º': '4º ANO',
    '5º': '5º ANO',
    '6º': '6º ANO',
    '7°': '7º ANO',
    '8°': '8º ANO',
    '9°': '9º ANO',
  },
  'UNIDADE MUNICIPAL DE ENS JAIME DE ALTAVILLA': {
    '6°A': '6º ANO A',
    '6°B': '6º ANO B',
    '6°C': '6º ANO C',
  },
  'UNIDADE MUNICIPAL DE ENSINO JOSE TAVARES DE CASTRO': {
    '6°': '6º ANO',
    '7°': '7º ANO',
    '8°': '8º ANO',
    '9°': '9º ANO',
  },
  'UNIDADE MUNICIPAL VER ANTONIO MACHADO GUIMARAES': {
    '1º': '1º ANO',
    '2º': '2º ANO',
    '3º': '3º ANO',
    '4º': '4º ANO',
    '5º': '5º ANO',
    '4º e 5º': '4º ANO, 5º ANO',
  },
  'UNIDADE MUNICIPAL DE ENSINO CAP MANOEL REGO': {
    '1ºA': '1º ANO A',
    '1ºB': '1º ANO B',
    '2°A': '2º ANO A',
    '2°B': '2º ANO B',
    '3ºA': '3º ANO A',
    '3°B': '3º ANO B',
    '4°A': '4º ANO A',
    '4°B': '4º ANO B',
    '5°A': '5º ANO A',
    '5°B': '5º ANO B',
  },
  'UNIDADE MUNICIPAL DE ENSINO MINISTRO AUGUSTO DE FREITAS MACHADO': {
    '7°A': '7º ANO A',
    '7°B': '7º ANO B',
    '7°C': '7º ANO C',
    '8°A': '8º ANO A',
    '8°B': '8º ANO B',
    '8°C': '8º ANO C',
    '9°A': '9º ANO A',
    '9°B': '9º ANO B',
    '9°C': '9º ANO C',
  },
  'UNIDADE MUNICIPAL DE ENSINO MONSENHOR LYRA': {
    '1º': '1º ANO',
    '2°B': '2º ANO B',
    '2ºA': '2º ANO A',
    '3º': '3º ANO',
    '4°': '4º ANO',
    '5°': '5º ANO',
    '1º e 2ºA': '1º ANO, 2º ANO A',
  },
  'UNIDADE MUNIC DE ENS JOSE GONCALVES DE ANDRADE': {
    '1º': '1º ANO',
    '2º': '2º ANO',
    '3º': '3º ANO',
    '4°': '4º ANO',
    '5º': '5º ANO',
    '6º': '6º ANO',
    '7°': '7º ANO',
    '8°': '8º ANO',
    '9°': '9º ANO',
  },
  'UNIDADE MUNIC DE ENS PROFª Mª CELESTE M DE ANDRADE': {
    '1ºA': '1º ANO POÇO DO SAL',
    '1ºB': '1º ANO POÇÃO',
    '2°': '2º ANO',
  },
};

// Função para dividir string de turmas por vírgula, "e" e ponto e vírgula
function dividirTurmas(str) {
  // Dividir por vírgula ou ponto e vírgula primeiro
  const partes = str.split(/[,;]/);
  const resultado = [];
  for (const parte of partes) {
    const trimada = parte.trim();
    if (trimada.length === 0) continue;
    // Verificar se contém " e " para dividir turmas compostas
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

// Função para ajustar um nome de turma baseado na escola
function ajustarTurma(escolaNome, turma) {
  const mapaEscola = MAPEAMENTO_POR_ESCOLA[escolaNome];
  if (mapaEscola && mapaEscola[turma]) {
    return mapaEscola[turma];
  }

  // Tentar mapeamento direto genérico (fallback)
  // Normalizar grau
  let normalizada = turma.replace(/°/g, 'º');

  // Se já contém "ANO", retornar
  if (normalizada.toUpperCase().includes('ANO')) {
    return normalizada;
  }

  // Se for apenas número (ex: "1º", "2º"), adicionar " ANO"
  if (/^\d+º\s*$/.test(normalizada)) {
    return normalizada.trim() + ' ANO';
  }

  // Se for número + letra (ex: "1ºA", "2ºB"), adicionar " ANO" entre número e letra
  const match = normalizada.match(/^(\d+º)\s*([A-Z])$/);
  if (match) {
    return match[1] + ' ANO ' + match[2];
  }

  // Não conseguiu mapear
  console.log(`AVISO: Turma não mapeada para "${escolaNome}": "${turma}"`);
  return turma;
}

// Ler calendario.json
const calendario = JSON.parse(fs.readFileSync('Dados_base/calendario.json', 'utf-8'));

// Aplicar ajustes
let totalAjustadas = 0;
let totalNaoMapeadas = 0;
const naoMapeadas = new Set();

calendario.cronograma.forEach(dia => {
  for (const turno of Object.values(dia.turnos)) {
    turno.escolas.forEach(escola => {
      escola.turmas_e_tablets.forEach(tt => {
        const turmasOriginais = dividirTurmas(tt.turmas);
        const turmasAjustadas = turmasOriginais.map(t => {
          const ajustada = ajustarTurma(escola.nome, t);
          if (ajustada === t) {
            totalNaoMapeadas++;
            naoMapeadas.add(`${escola.nome} >> "${t}"`);
          } else {
            totalAjustadas++;
          }
          return ajustada;
        });
        tt.turmas = turmasAjustadas.join(', ');
      });
    });
  }
});

// Salvar
fs.writeFileSync('Dados_base/calendario.json', JSON.stringify(calendario, null, 2) + '\n', 'utf-8');

console.log(`=== AJUSTE DE TURMAS CONCLUÍDO ===`);
console.log(`Total de turmas ajustadas: ${totalAjustadas}`);
console.log(`Total de turmas não mapeadas: ${totalNaoMapeadas}`);
if (naoMapeadas.size > 0) {
  console.log('\nTurmas não mapeadas:');
  naoMapeadas.forEach(t => console.log(`  ❌ ${t}`));
} else {
  console.log('\n✓ Todas as turmas foram mapeadas!');
}

// Verificar contra CSV
console.log('\n=== VERIFICAÇÃO CONTRA CSV ===');
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

let turmasNaoNoCSV = 0;
calendario.cronograma.forEach(dia => {
  for (const turno of Object.values(dia.turnos)) {
    turno.escolas.forEach(escola => {
      escola.turmas_e_tablets.forEach(tt => {
        const turmas = dividirTurmas(tt.turmas);
        const turmasCSVdaEscola = escolasCSV.get(escola.nome) || new Set();
        turmas.forEach(t => {
          if (!turmasCSVdaEscola.has(t)) {
            turmasNaoNoCSV++;
            console.log(`  ❌ ${escola.nome}: "${t}" não encontrada no CSV`);
          }
        });
      });
    });
  }
});
if (turmasNaoNoCSV === 0) {
  console.log('  ✓ Todas as turmas do calendario.json estão no CSV!');
} else {
  console.log(`\n  Total de turmas do calendario.json não encontradas no CSV: ${turmasNaoNoCSV}`);
}
