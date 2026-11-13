// ============================================
// Logística - Levantamento de Escolas
// Dashboard com todas as escolas, séries, turmas e alunos
// Dados carregados de Dados_base/calendario.json
// ============================================

let dadosCalendario = null;
let escolasConsolidadas = []; // Array de escolas com séries e turmas consolidadas
let escolaAtualIndex = 0;

const TURNOS = {
  manha: { nome: 'Manhã', icone: 'wb_sunny', cor: 'text-orange-400' },
  tarde: { nome: 'Tarde', icone: 'brightness_7', cor: 'text-blue-400' },
};

// Inicializa a aplicação
function init() {
  fetch('Dados_base/calendario.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao carregar o calendário');
      }
      return response.json();
    })
    .then(data => {
      dadosCalendario = data;
      consolidarEscolas();
      renderizarDashboardKPIs();
      renderizarCardEscola();
      renderizarListaTodasEscolas();
      renderizarTabelaResumo();
      configurarNavegacaoEscolas();
    })
    .catch(err => {
      console.error('Erro ao carregar dados:', err);
      document.body.innerHTML = '<p class="text-center p-4 text-[#6366f1]">Erro ao carregar o levantamento. Verifique se o arquivo calendario.json existe.</p>';
    });
}

// Consolida escolas: agrupa todas as séries, turmas e alunos por escola
function consolidarEscolas() {
  const mapaEscolas = new Map();

  for (const dia of dadosCalendario.cronograma) {
    for (const [chaveTurno, turno] of Object.entries(dia.turnos)) {
      for (const escola of turno.escolas) {
        const nomeEscola = escola.nome;
        if (!mapaEscolas.has(nomeEscola)) {
          mapaEscolas.set(nomeEscola, {
            nome: nomeEscola,
            tecnicos: new Set(),
            series: new Map(),
            totalAlunos: 0,
            totalTurmas: 0,
          });
        }

        const escolaConsolidad = mapaEscolas.get(nomeEscola);

        // Adicionar técnicos
        for (const t of escola.tecnicos) {
          escolaConsolidad.tecnicos.add(t);
        }

        // Processar turmas
        for (const tt of escola.turmas_e_tablets) {
          const turmas = tt.turmas.split(/[,;]/).map(tm => tm.trim()).filter(t => t.length > 0);
          const alunosPorTurma = tt.tablets / turmas.length;

          for (const turmaNome of turmas) {
            const serieNome = extrairSerie(turmaNome);

            if (!escolaConsolidad.series.has(serieNome)) {
              escolaConsolidad.series.set(serieNome, {
                nome: serieNome,
                turmas: new Set(),
                alunos: 0,
              });
            }

            const serie = escolaConsolidad.series.get(serieNome);
            serie.turmas.add(turmaNome);
            serie.alunos += alunosPorTurma;
            escolaConsolidad.totalTurmas += 1;
            escolaConsolidad.totalAlunos += alunosPorTurma;
          }
        }
      }
    }
  }

  // Converter Map para Array e arredondar valores
  escolasConsolidadas = Array.from(mapaEscolas.entries()).map(([nome, escola]) => ({
    nome: escola.nome,
    tecnicos: Array.from(escola.tecnicos),
    series: Array.from(escola.series.entries()).map(([nomeSerie, serie]) => ({
      nome: nomeSerie,
      turmas: Array.from(serie.turmas).sort(),
      alunos: Math.round(serie.alunos * 100) / 100,
      totalTurmas: serie.turmas.size,
    })),
    totalAlunos: Math.round(escola.totalAlunos * 100) / 100,
    totalTurmas: escola.totalTurmas,
  }));

  // Ordenar por nome da escola
  escolasConsolidadas.sort((a, b) => a.nome.localeCompare(b.nome));
}

// Extrai a série de um nome de turma (ex: "1° ANO A" -> "1° ANO", "3º ANO B" -> "3º ANO")
function extrairSerie(nomeTurma) {
  // Remove letras sufixo (A, B, C, etc.) e espaços extras
  return nomeTurma.replace(/[A-Z]\s*$/, '').trim();
}

// Renderiza o dashboard superior com KPIs
function renderizarDashboardKPIs() {
  const totalEscolas = escolasConsolidadas.length;
  const totalSeries = new Set();
  let totalTurmas = 0;
  let totalAlunos = 0;

  escolasConsolidadas.forEach(escola => {
    escola.series.forEach(s => totalSeries.add(s.nome));
    totalTurmas += escola.totalTurmas;
    totalAlunos += escola.totalAlunos;
  });

  document.getElementById('kpi-total-escolas').textContent = totalEscolas.toLocaleString('pt-BR');
  document.getElementById('kpi-total-series').textContent = totalSeries.size.toLocaleString('pt-BR');
  document.getElementById('kpi-total-turmas').textContent = totalTurmas.toLocaleString('pt-BR');
  document.getElementById('kpi-total-alunos').textContent = Math.round(totalAlunos).toLocaleString('pt-BR');
}

// Renderiza o card da escola atual
function renderizarCardEscola() {
  const container = document.getElementById('card-escola-atual');
  if (!container || !escolasConsolidadas.length) return;

  const escola = escolasConsolidadas[escolaAtualIndex];
  const totalEscolas = escolasConsolidadas.length;

  // Atualiza indicador
  const indicador = document.getElementById('indicador-escola-atual');
  if (indicador) {
    indicador.textContent = `Escola ${escolaAtualIndex + 1} de ${totalEscolas}`;
  }

  // Atualiza botões de navegação
  const btnAnterior = document.getElementById('btn-escola-anterior');
  const btnProximo = document.getElementById('btn-escola-proximo');
  if (btnAnterior) btnAnterior.disabled = escolaAtualIndex === 0;
  if (btnProximo) btnProximo.disabled = escolaAtualIndex === totalEscolas - 1;

  // Ordena séries por número
  const seriesOrdenadas = [...escola.series].sort((a, b) => {
    const numA = extrairNumeroSerie(a.nome);
    const numB = extrairNumeroSerie(b.nome);
    return numA - numB;
  });

  let html = `
      <div class="bg-[#141414] rounded-xl border border-[#2a2a2a] shadow-sm overflow-hidden">
          <div class="bg-[#1e1e1e] border-b border-[#2a2a2a] p-4">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                      <h2 class="text-xl font-bold text-[#e0e0e0] tracking-tight">${escola.nome}</h2>
                      <p class="text-sm text-[#a0a0a0]">
                          ${escola.tecnicos.join(', ')} |
                          ${escola.totalTurmas} turma${escola.totalTurmas !== 1 ? 's' : ''} |
                          ${escola.series.length} série${escola.series.length !== 1 ? 's' : ''}
                      </p>
                  </div>
                  <div class="text-right">
                      <p class="text-xs font-bold text-[#a0a0a0] uppercase tracking-wider">Total Alunos</p>
                      <p class="text-2xl font-bold text-[#e0e0e0]">${Math.round(escola.totalAlunos).toLocaleString('pt-BR')}</p>
                  </div>
              </div>
          </div>
          <div class="p-4">
  `;

  // Renderiza cada série como uma seção dentro do card
  seriesOrdenadas.forEach(serie => {
    html += `
              <div class="mb-4 border border-[#2a2a2a]/50 rounded-lg overflow-hidden">
                  <div class="bg-[#1e1e1e]/50 border-b border-[#2a2a2a]/30 p-3 flex items-center justify-between">
                      <div class="flex items-center gap-2">
                          <span class="material-symbols-outlined text-[16px] text-[#6366f1]" aria-hidden="true">stairs</span>
                          <span class="text-sm font-bold text-[#e0e0e0]">${serie.nome}</span>
                      </div>
                      <span class="text-xs font-bold text-[#059669]">${serie.totalTurmas} turma${serie.totalTurmas !== 1 ? 's' : ''}</span>
                  </div>
                  <div class="p-3">
                      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
    `;

    serie.turmas.forEach(turma => {
      // Busca a quantidade de alunos desta turma específica
      const alunosTurma = Math.round((serie.alunos / serie.turmas.size) * 100) / 100;
      html += `
                          <div class="bg-[#0a0a0a] border border-[#2a2a2a]/30 rounded p-3 flex items-center justify-between">
                              <div>
                                  <p class="text-xs text-[#a0a0a0] uppercase tracking-wider">Turma</p>
                                  <p class="text-sm font-medium text-[#e0e0e0]">${turma}</p>
                              </div>
                              <div class="text-right">
                                  <p class="text-xs text-[#a0a0a0] uppercase tracking-wider">Alunos</p>
                                  <p class="text-sm font-bold text-[#e0e0e0]">${alunosTurma.toLocaleString('pt-BR')}</p>
                              </div>
                          </div>
      `;
    });

    html += `
                      </div>
                      <div class="mt-2 pt-2 border-t border-[#2a2a2a]/30 flex items-center justify-between">
                          <span class="text-xs text-[#a0a0a0] uppercase tracking-wider">Total Série</span>
                          <span class="text-xs font-bold text-[#e0e0e0]">${Math.round(serie.alunos).toLocaleString('pt-BR')} alunos</span>
                      </div>
                  </div>
              </div>
    `;
  });

  html += `
          </div>
          <div class="bg-[#0a0a0a] border-t border-[#2a2a2a] p-3 flex items-center justify-between text-xs">
              <span class="text-[#a0a0a0]">Total da Escola: ${Math.round(escola.totalAlunos).toLocaleString('pt-BR')} alunos</span>
              <span class="text-[#6366f1] font-bold">${escola.totalTurmas} turma${escola.totalTurmas !== 1 ? 's' : ''} ao todo</span>
          </div>
      </div>
  `;

  container.innerHTML = html;
}

// Renderiza a lista resumida de todas as escolas
function renderizarListaTodasEscolas() {
  const container = document.getElementById('lista-todas-escolas');
  if (!container || !escolasConsolidadas.length) return;

  let html = '';

  escolasConsolidadas.forEach((escola, index) => {
    html += `
        <div class="p-3 hover:bg-[#1e1e1e]/30 transition-colors cursor-pointer group flex items-center justify-between"
             onclick="irParaEscola(${index})">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-[#6366f1]/20 flex items-center justify-center text-[#6366f1] text-xs font-bold">
                    ${index + 1}
                </div>
                <div>
                    <p class="text-sm font-medium text-[#e0e0e0]">${escola.nome}</p>
                    <p class="text-xs text-[#a0a0a0]">${escola.totalTurmas} turmas · ${Math.round(escola.totalAlunos)} alunos</p>
                </div>
            </div>
            <div class="text-right">
                <p class="text-sm font-bold text-[#e0e0e0]">${Math.round(escola.totalAlunos).toLocaleString('pt-BR')}</p>
                <p class="text-xs text-[#a0a0a0]">${escola.series.length} séries</p>
            </div>
        </div>
    `;
  });

  container.innerHTML = html;
}

// Renderiza a tabela resumo de todas as escolas
function renderizarTabelaResumo() {
  const container = document.getElementById('tabela-resumo-corpo');
  if (!container || !escolasConsolidadas.length) return;

  let html = '';

  escolasConsolidadas.forEach(escola => {
    html += `
        <tr class="border-b border-[#2a2a2a]/50 hover:bg-[#1e1e1e]/30 transition-colors">
            <td class="px-4 py-3 text-[#e0e0e0] font-medium">${escola.nome}</td>
            <td class="px-4 py-3 text-[#c9c9c9]">${escola.tecnicos.join(', ')}</td>
            <td class="px-4 py-3 text-[#e0e0e0] text-right">${escola.series.length}</td>
            <td class="px-4 py-3 text-[#e0e0e0] text-right">${escola.totalTurmas}</td>
            <td class="px-4 py-3 text-[#e0e0e0] text-right font-bold">${Math.round(escola.totalAlunos).toLocaleString('pt-BR')}</td>
        </tr>
    `;
  });

  container.innerHTML = html;
}

// Navega para uma escola específica pelo índice
function irParaEscola(index) {
  escolaAtualIndex = index;
  renderizarCardEscola();
}

// Configura a navegação entre escolas
function configurarNavegacaoEscolas() {
  const btnAnterior = document.getElementById('btn-escola-anterior');
  const btnProximo = document.getElementById('btn-escola-proximo');

  if (btnAnterior) {
    btnAnterior.addEventListener('click', () => {
      if (escolaAtualIndex > 0) {
        escolaAtualIndex--;
        renderizarCardEscola();
      }
    });
  }

  if (btnProximo) {
    btnProximo.addEventListener('click', () => {
      if (escolaAtualIndex < escolasConsolidadas.length - 1) {
        escolaAtualIndex++;
        renderizarCardEscola();
      }
    });
  }
}

// Extrai o número da série para ordenação (ex: "1° ANO" -> 1, "9º ANO" -> 9)
function extrairNumeroSerie(nomeSerie) {
  const match = nomeSerie.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 999;
}

document.addEventListener('DOMContentLoaded', init);
