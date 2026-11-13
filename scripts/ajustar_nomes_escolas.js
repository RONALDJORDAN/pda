const fs = require('fs');

// Ler dados.json para obter nomes oficiais
const dados = JSON.parse(fs.readFileSync('dados.json', 'utf-8'));
const nomesOficiais = dados.escolas.map(e => e.nome);
console.log('Nomes oficiais no dados.json:');
nomesOficiais.forEach((n, i) => console.log(`  ${i+1}. ${n}`));

// Ler calendario.json
const calendario = JSON.parse(fs.readFileSync('Dados_base/calendario.json', 'utf-8'));

// Coletar nomes únicos do calendario.json
const nomesCalendario = new Set();
calendario.cronograma.forEach(dia => {
  for (const turno of Object.values(dia.turnos)) {
    turno.escolas.forEach(e => nomesCalendario.add(e.nome));
  }
});
console.log('\nNomes no calendario.json:');
[...nomesCalendario].forEach((n, i) => console.log(`  ${i+1}. ${n}`));

// Mapeamento baseado na similaridade
const mapeamento = {
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

console.log('\nMapeamento:');
Object.entries(mapeamento).forEach(([de, para]) => {
  console.log(`  "${de}" → "${para}"`);
});

// Aplicar substituições
let substituicoes = 0;
calendario.cronograma.forEach(dia => {
  for (const turno of Object.values(dia.turnos)) {
    turno.escolas.forEach(escola => {
      const nomeAntigo = escola.nome;
      if (mapeamento[nomeAntigo]) {
        escola.nome = mapeamento[nomeAntigo];
        substituicoes++;
      } else {
        console.log(`AVISO: Nome não mapeado: "${nomeAntigo}"`);
      }
    });
  }
});

// Salvar
fs.writeFileSync('Dados_base/calendario.json', JSON.stringify(calendario, null, 2) + '\n', 'utf-8');

console.log(`\n${substituicoes} substituições realizadas. Arquivo salvo.`);

// Verificar se todos os nomes agora estão no dados.json
const nomesAtuais = new Set();
calendario.cronograma.forEach(dia => {
  for (const turno of Object.values(dia.turnos)) {
    turno.escolas.forEach(e => nomesAtuais.add(e.nome));
  }
});
const oficiaisSet = new Set(nomesOficiais);
const nomesNaoEncontrados = [...nomesAtuais].filter(n => !oficiaisSet.has(n));
if (nomesNaoEncontrados.length > 0) {
  console.log(`\nAVISO: ${nomesNaoEncontrados.length} nome(s) não correspondem ao dados.json:`);
  nomesNaoEncontrados.forEach(n => console.log(`  "${n}"`));
} else {
  console.log('\n✓ Todos os nomes do calendario.json correspondem ao dados.json!');
}
console.log(`Total de escolas únicas no calendario.json: ${nomesAtuais.size}`);
console.log(`Total de escolas no dados.json: ${nomesOficiais.length}`);
