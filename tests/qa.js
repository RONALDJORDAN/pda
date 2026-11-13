// Testes de QA - Sistema de Logística PDA
// Valida acessibilidade, renderização e integridade dos dados

const assert = require('assert');

// Teste 1: Verifica se o HTML possui lang definido
function testeIdioma(html) {
    assert.ok(html.includes('lang="pt-BR"'), 'HTML deve definir lang="pt-BR"');
    console.log('✓ Teste 1: Idioma da página definido');
}

// Teste 2: Verifica se imagens possuem alt
function testeImagensComAlt(html) {
    const imgs = html.match(/<img[^>]*>/g) || [];
    imgs.forEach((img, i) => {
        assert.ok(img.includes('alt='), `Imagem ${i} deve ter atributo alt`);
    });
    console.log('✓ Teste 2: Imagens com texto alternativo');
}

// Teste 3: Verifica se ícones decorativos possuem aria-hidden
function testeIconesAcessiveis(html) {
    const icones = html.match(/material-symbols-outlined/g) || [];
    icones.forEach((_, i) => {
        const contexto = html.substring(Math.max(0, html.indexOf('material-symbols-outlined', i * 50) - 100), html.indexOf('material-symbols-outlined', i * 50) + 100);
        assert.ok(contexto.includes('aria-hidden'), 'Ícones decorativos devem ter aria-hidden="true"');
    });
    console.log('✓ Teste 3: Ícones decorativos com aria-hidden');
}

// Teste 4: Verifica se input de busca possui label associado
function testeCampoBuscaComLabel(html) {
    assert.ok(html.includes('for="busca-texto"') || html.includes('aria-label="Buscar escola ou turma"'),
        'Campo de busca deve ter label associado ou aria-label');
    console.log('✓ Teste 4: Campo de busca acessível');
}

// Teste 5: Verifica se tabelas possuem caption e scope (HTML estático + JS gerado)
function testeTabelasAcessiveis(html, js) {
    const htmlCaptions = (html.match(/<caption/g) || []).length;
    const htmlScopes = (html.match(/scope="col"/g) || []).length;
    const jsCaptions = (js.match(/<caption/g) || []).length;
    const jsScopes = (js.match(/scope="col"/g) || []).length;
    const totalCaptions = htmlCaptions + jsCaptions;
    const totalScopes = htmlScopes + jsScopes;
    assert.ok(totalCaptions > 0, 'Tabelas devem ter <caption>');
    assert.ok(totalScopes > 0, 'Cabeçalhos de tabela devem ter scope="col"');
    console.log(`✓ Teste 5: ${totalCaptions} caption(s) e ${totalScopes} scope(s) encontrados`);
}

// Teste 6: Verifica se há feedback de exportação
function testeExportacaoComFeedback(js) {
    assert.ok(js.includes('mostrarToast'), 'Exportação deve ter feedback visual (toast)');
    console.log('✓ Teste 6: Exportação CSV com feedback');
}

// Teste 7: Verifica se existe dados.json
function testeDadosJsonExiste() {
    const fs = require('fs');
    assert.ok(fs.existsSync('dados.json'), 'Arquivo dados.json deve existir');
    console.log('✓ Teste 7: dados.json presente');
}

// Teste 8: Verifica se existe o JSON de avaliações (calendario.json)
function testeCalendarioJsonExiste() {
    const fs = require('fs');
    assert.ok(fs.existsSync('Dados_base/calendario.json'), 'Arquivo Dados_base/calendario.json deve existir');
    console.log('✓ Teste 8: Dados_base/calendario.json presente');
}

// Teste 9: Valida estrutura do JSON de avaliações
function testeEstruturaCalendario() {
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync('Dados_base/calendario.json', 'utf-8'));
    assert.ok(data.evento, 'JSON deve ter evento');
    assert.ok(data.total_escolas, 'JSON deve ter total_escolas');
    assert.ok(data.total_turmas, 'JSON deve ter total_turmas');
    assert.ok(data.empresa, 'JSON deve ter empresa');
    assert.ok(Array.isArray(data.cronograma), 'JSON deve ter cronograma como array');
    assert.ok(data.cronograma.length > 0, 'Cronograma deve ter pelo menos um dia');
    data.cronograma.forEach(dia => {
        assert.ok(dia.dia, 'Cada dia deve ter nome');
        assert.ok(dia.data, 'Cada dia deve ter data');
        assert.ok(dia.turnos, 'Cada dia deve ter turnos');
        assert.ok(dia.turnos.manha || dia.turnos.tarde, 'Pelo menos um turno deve existir');
        // Valida estrutura de cada turno
        for (const [chave, turno] of Object.entries(dia.turnos)) {
            assert.ok(turno.total_turmas !== undefined, `Turno ${chave} deve ter total_turmas`);
            assert.ok(turno.total_alunos_tablets !== undefined, `Turno ${chave} deve ter total_alunos_tablets`);
            assert.ok(Array.isArray(turno.escolas), `Turno ${chave} deve ter array de escolas`);
            turno.escolas.forEach(escola => {
                assert.ok(escola.nome, 'Escola deve ter nome');
                assert.ok(Array.isArray(escola.tecnicos), 'Escola deve ter array de tecnicos');
                assert.ok(Array.isArray(escola.turmas_e_tablets), 'Escola deve ter array de turmas_e_tablets');
                assert.ok(escola.total_alunos !== undefined, 'Escola deve ter total_alunos');
            });
        }
    });
    console.log('✓ Teste 9: Estrutura do calendario.json válida');
}

// Teste 10: Verifica se logistica.js referencia o calendario.json
function testeLogisticaReferenciaCalendario() {
    const fs = require('fs');
    const js = fs.readFileSync('assets/js/logistica.js', 'utf-8');
    assert.ok(js.includes('calendario.json'), 'logistica.js deve carregar Dados_base/calendario.json');
    assert.ok(js.includes('fetch('), 'logistica.js deve usar fetch para carregar dados');
    console.log('✓ Teste 10: logistica.js referencia calendario.json');
}

// Teste 11: Valida que nomes de escolas no calendario.json correspondem ao dados.json
function testeNomesEscolasCorrespondem() {
    const fs = require('fs');
    const dados = JSON.parse(fs.readFileSync('dados.json', 'utf-8'));
    const calendario = JSON.parse(fs.readFileSync('Dados_base/calendario.json', 'utf-8'));
    const nomesOficiais = new Set(dados.escolas.map(e => e.nome));
    const nomesCalendario = new Set();
    calendario.cronograma.forEach(dia => {
      for (const turno of Object.values(dia.turnos)) {
        turno.escolas.forEach(e => nomesCalendario.add(e.nome));
      }
    });
    const nomesDiferentes = [...nomesCalendario].filter(n => !nomesOficiais.has(n));
    assert.ok(nomesDiferentes.length === 0, `Todos os nomes de escolas devem corresponder ao dados.json. Diferenças: ${JSON.stringify(nomesDiferentes)}`);
    console.log(`✓ Teste 11: ${nomesCalendario.size} escola(s) do calendario.json correspondem ao dados.json`);
}

// Executar testes (exemplo com arquivos lidos)
const fs = require('fs');

try {
    const htmlIndex = fs.readFileSync('index.html', 'utf-8');
    const htmlLogistica = fs.readFileSync('logistica.html', 'utf-8');
    const jsApp = fs.readFileSync('assets/js/app.js', 'utf-8');

    testeIdioma(htmlIndex);
    testeImagensComAlt(htmlIndex);
    testeIconesAcessiveis(htmlIndex);
    testeCampoBuscaComLabel(htmlIndex);
    testeTabelasAcessiveis(htmlIndex, jsApp);
    testeExportacaoComFeedback(jsApp);
    testeDadosJsonExiste();
    testeCalendarioJsonExiste();
    testeEstruturaCalendario();
    testeLogisticaReferenciaCalendario();
    testeNomesEscolasCorrespondem();

    console.log('\n✅ Todos os testes de QA passaram!');
} catch (err) {
    console.error('❌ Falha nos testes de QA:', err.message);
    process.exit(1);
}
