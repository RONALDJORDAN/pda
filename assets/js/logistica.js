// ============================================
// Logística Operacional de Aplicações
// Calendário e definições por dia/turno
// Dados carregados de Dados_base/calendario.json
// ============================================

let dadosCalendario = null;

const TURNOS = {
  manha: { nome: 'Manhã', icone: 'wb_sunny', cor: 'text-orange-400' },
  tarde: { nome: 'Tarde', icone: 'brightness_7', cor: 'text-blue-400' },
};

// Formata data ISO (DD/MM) para exibição
function formatarDataExibicao(data) {
  return data; // já vem no formato DD/MM
}

// Retorna a sigla do dia da semana (3 letras maiúsculas)
function siglaDia(nomeDia) {
  const siglas = {
    'Domingo': 'DOM', 'Segunda-feira': 'SEG', 'Terça-feira': 'TER',
    'Quarta-feira': 'QUA', 'Quinta-feira': 'QUI', 'Sexta-feira': 'SEX', 'Sábado': 'SÁB'
  };
  return siglas[nomeDia] || nomeDia.substring(0, 3).toUpperCase();
}

// Inicializa a aplicação carregando o JSON
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
      renderizarCabecalhoEvento();
      renderizarCalendario();
      renderizarDefinicoes();
      configurarAbas();
    })
    .catch(err => {
      console.error('Erro ao carregar dados:', err);
      document.body.innerHTML = '<p class="text-center p-4 text-[#6366f1]">Erro ao carregar as definições. Verifique se o arquivo calendario.json existe.</p>';
    });
}

// Renderiza cabeçalho do evento (título, empresa, totais)
function renderizarCabecalhoEvento() {
  const h1 = document.querySelector('h1.sr-only');
  if (h1) {
    h1.textContent = `${dadosCalendario.evento} - Logística de Aplicações`;
  }

  // Atualiza subtítulo da seção Calendário com período real
  const primeiroDia = dadosCalendario.cronograma[0];
  const ultimoDia = dadosCalendario.cronograma[dadosCalendario.cronograma.length - 1];
  const subtituloCalendario = document.querySelector('#calendario p.text-sm');
  if (subtituloCalendario) {
    subtituloCalendario.textContent = `Período de ${primeiroDia.data} a ${ultimoDia.data}`;
  }

  // Atualiza subtítulo da seção Definições
  const subtituloDefinicoes = document.querySelector('#definicoes p.text-sm');
  if (subtituloDefinicoes) {
    subtituloDefinicoes.textContent = `Logística por dia e turno — ${dadosCalendario.cronograma.length} dias de aplicação`;
  }
}

// Renderiza uma turma com seus tablets
function renderizarTurmasEscola(escola) {
  return escola.turmas_e_tablets.map(t => {
    const turmas = t.turmas.split(/[,;]/).map(tm => tm.trim()).join(', ');
    return `
      <div class="turma-item">
          <span class="turma-nome">${turmas}</span>
          <span class="turma-tablets">${t.tablets} TAB</span>
      </div>`;
  }).join('');
}

// Calcula total de tablets de uma escola
function totalTabletsEscola(escola) {
  return escola.turmas_e_tablets.reduce((s, t) => s + t.tablets, 0);
}

// Renderiza o calendário com os dias reais do cronograma (formato relatório por dia)
function renderizarCalendario() {
  const container = document.getElementById('calendario-semana');
  if (!container || !dadosCalendario) return;

  container.innerHTML = dadosCalendario.cronograma.map((dia, indice) => {
    let html = `
      <div class="dia-card">
          <div class="dia-header">
              <span>${dia.dia.toUpperCase()}</span>
              <span>${formatarDataExibicao(dia.data)}</span>
          </div>
          <div class="turnos-grid">
    `;

    // Processa cada turno (Manhã e Tarde)
    for (const [chave, turno] of Object.entries(dia.turnos)) {
      const turnoInfo = TURNOS[chave];
      const totalTurmasTurno = turno.total_turmas;
      const totalAlunosTurno = turno.total_alunos_tablets;
      const tabletsLeitura = turno.tablets_leitura || 0;

      html += `
          <div class="turno-${chave}">
              <div class="turno-header turno-${chave}">
                  <span class="turno-titulo">${turnoInfo.nome.toUpperCase()}</span>
                  <span class="turno-contagem">${totalTurmasTurno} turmas</span>
              </div>
              <div class="turmas-container">
      `;

      // Escolas do turno
      turno.escolas.forEach(escola => {
        html += `
                  <div class="escola-logistica">
                      <div class="escola-header">
                          <span class="escola-nome">${escola.nome}</span>
                          <span class="escola-tecnicos">${escola.tecnicos.join(', ')}</span>
                      </div>
                      <div class="turmas-lista">
                          ${renderizarTurmasEscola(escola)}
                      </div>
                      <div class="escola-total">
                          <span class="escola-total-label">TOTAL</span>
                          <span class="escola-total-valor">${escola.total_alunos} ALUNOS</span>
                      </div>
                  </div>
        `;
      });

      html += `
              </div>
              <div class="turno-total">
                  TOTAL = <span class="turno-total-valor">${totalAlunosTurno} ALUNOS</span>
              </div>
          </div>
      `;
    }

    html += `
          </div>
          <div class="dia-totais">
              <div class="total-turno">
                  <span class="total-turno-label">TOTAL MANHÃ</span>
                  <span class="total-turno-valor">${dia.turnos.manha.total_alunos_tablets} ALUNOS/TABS</span>
              </div>
              <div class="total-turno">
                  <span class="total-turno-label">TOTAL TARDE</span>
                  <span class="total-turno-valor">${dia.turnos.tarde.total_alunos_tablets} ALUNOS/TABS</span>
              </div>
              ${dia.turnos.manha.tablets_leitura !== undefined ? `
              <div class="total-turno">
                  <span class="total-turno-label">TABLETS LEITURA</span>
                  <span class="total-turno-valor">${dia.turnos.manha.tablets_leitura} UNIDADES</span>
              </div>
              ` : ''}
          </div>
      </div>
    `;

    return html;
  }).join('');
}

// Renderiza todos os dias em fila vertical (um abaixo do outro) na seção Definições
function renderizarDefinicoes() {
  const container = document.getElementById('lista-dias');
  if (!container || !dadosCalendario) return;

  container.innerHTML = dadosCalendario.cronograma.map((dia, indice) => {
    let html = `
      <div class="dia-card">
          <div class="dia-header">
              <span>${dia.dia.toUpperCase()}</span>
              <span>${formatarDataExibicao(dia.data)}</span>
          </div>
          <div class="turnos-grid">
    `;

    // Processa cada turno (Manhã e Tarde)
    for (const [chave, turno] of Object.entries(dia.turnos)) {
      const turnoInfo = TURNOS[chave];
      const totalTurmasTurno = turno.total_turmas;
      const totalAlunosTurno = turno.total_alunos_tablets;
      const tabletsLeitura = turno.tablets_leitura || 0;

      html += `
          <div class="turno-${chave}">
              <div class="turno-header turno-${chave}">
                  <span class="turno-titulo">${turnoInfo.nome.toUpperCase()}</span>
                  <span class="turno-contagem">${totalTurmasTurno} turmas</span>
              </div>
              <div class="turmas-container">
      `;

      // Escolas do turno
      turno.escolas.forEach(escola => {
        html += `
                  <div class="escola-logistica">
                      <div class="escola-header">
                          <span class="escola-nome">${escola.nome}</span>
                          <span class="escola-tecnicos">${escola.tecnicos.join(', ')}</span>
                      </div>
                      <div class="turmas-lista">
                          ${renderizarTurmasEscola(escola)}
                      </div>
                      <div class="escola-total">
                          <span class="escola-total-label">TOTAL</span>
                          <span class="escola-total-valor">${escola.total_alunos} ALUNOS</span>
                      </div>
                  </div>
        `;
      });

      html += `
              </div>
              <div class="turno-total">
                  TOTAL = <span class="turno-total-valor">${totalAlunosTurno} ALUNOS</span>
              </div>
          </div>
      `;
    }

    html += `
          </div>
          <div class="dia-totais">
              <div class="total-turno">
                  <span class="total-turno-label">TOTAL MANHÃ</span>
                  <span class="total-turno-valor">${dia.turnos.manha.total_alunos_tablets} ALUNOS/TABS</span>
              </div>
              <div class="total-turno">
                  <span class="total-turno-label">TOTAL TARDE</span>
                  <span class="total-turno-valor">${dia.turnos.tarde.total_alunos_tablets} ALUNOS/TABS</span>
              </div>
              ${dia.turnos.manha.tablets_leitura !== undefined ? `
              <div class="total-turno">
                  <span class="total-turno-label">TABLETS LEITURA</span>
                  <span class="total-turno-valor">${dia.turnos.manha.tablets_leitura} UNIDADES</span>
              </div>
              ` : ''}
          </div>
      </div>
    `;

    return html;
  }).join('');
}

// Alterna entre as seções do módulo
function mostrarSecao(id) {
  document.querySelectorAll('[role="tab"]').forEach(aba => {
    const ativa = aba.dataset.secao === id;
    aba.setAttribute('aria-selected', String(ativa));
    aba.setAttribute('aria-pressed', String(ativa));
    aba.tabIndex = ativa ? 0 : -1;
  });

  document.querySelectorAll('[role="tabpanel"]').forEach(secao => {
    const ativa = secao.id === id;
    secao.classList.toggle('active', ativa);
    secao.classList.toggle('hidden', !ativa);
    if (ativa) {
      secao.setAttribute('tabindex', '-1');
      secao.focus();
    } else {
      secao.removeAttribute('tabindex');
    }
  });
}

// Navegação por teclado entre as abas
function configurarAbas() {
  const abas = Array.from(document.querySelectorAll('[role="tab"]'));
  if (abas.length === 0) return;

  abas.forEach((aba, indice) => {
    aba.addEventListener('click', () => mostrarSecao(aba.dataset.secao));

    aba.addEventListener('keydown', evento => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(evento.key)) return;
      evento.preventDefault();

      let destino;
      if (evento.key === 'Home') {
        destino = abas[0];
      } else if (evento.key === 'End') {
        destino = abas[abas.length - 1];
      } else {
        const passo = evento.key === 'ArrowRight' ? 1 : -1;
        destino = abas[(indice + passo + abas.length) % abas.length];
      }

      destino.focus();
      mostrarSecao(destino.dataset.secao);
    });
  });
}

document.addEventListener('DOMContentLoaded', init);
