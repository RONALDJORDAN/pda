// Sistema de Logística - Planejamento de Aplicações de Provas
// Dados carregados do JSON gerado pelo scripts/processar_dados.py
// Tema escuro monocromático: preto, branco e cinza

let dados = null;
let dadosFiltrados = null;

// Inicializa a aplicação
function init() {
    fetch('dados.json')
        .then(response => response.json())
        .then(data => {
            dados = data;
            dadosFiltrados = { ...data };
            renderizarDashboard();
            renderizarEscolasDashboard();
            renderizarEscolas();
            renderizarTurmas();
            renderizarDetalhe();
            renderizarDistribuicao();

            // Configura event listeners após os dados estarem prontos
            document.getElementById('busca-texto').addEventListener('input', aplicarFiltros);
        })
        .catch(err => {
            console.error('Erro ao carregar dados:', err);
            document.body.innerHTML = '<p class="text-center p-4 text-[#6366f1]">Erro ao carregar os dados. Verifique se o dados.json foi gerado.</p>';
        });
}

// Anuncia mudança de seção para leitores de tela
function anunciarSecao(sectionId) {
    const status = document.getElementById('dashboard-status');
    const nomes = {
        dashboard: 'Dashboard',
        escolas: 'Escolas',
        turmas: 'Turmas',
        detalhe: 'Detalhamento por Escola e Turma',
        distribuicao: 'Distribuição por Turno, Série e Curso'
    };
    if (status) {
        status.textContent = `Seção alterada: ${nomes[sectionId] || sectionId}. Conteúdo atualizado.`;
    }
}

// Navega para uma seção via menu superior
function navegarPara(sectionId) {
    // Ativa link no menu
    document.querySelectorAll('.nav-link').forEach(link => {
        const isActive = link.getAttribute('data-section') === sectionId;
        link.classList.toggle('active', isActive);
        link.classList.toggle('bg-dark-surface-variant', !isActive);
        link.classList.toggle('text-dark-on-surface-variant', !isActive);
        if (isActive) {
            link.classList.remove('bg-dark-surface-variant', 'text-dark-on-surface-variant');
            link.classList.add('bg-dark-accent', 'text-white');
        }
    });

    // Mostra/esconde seções
    document.querySelectorAll('.section-content').forEach(section => {
        if (section.id === sectionId) {
            section.classList.remove('hidden');
            section.classList.add('active');
            section.setAttribute('tabindex', '-1');
            section.focus();
        } else {
            section.classList.add('hidden');
            section.classList.remove('active');
            section.removeAttribute('tabindex');
        }
    });

    // Anuncia mudança para leitores de tela
    anunciarSecao(sectionId);

    // Scroll para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Atualiza os números do dashboard
function renderizarDashboard() {
    document.getElementById('stat-total-alunos').textContent = dados.total_alunos.toLocaleString('pt-BR');
    document.getElementById('stat-escolas').textContent = dados.total_escolas;
    document.getElementById('stat-turmas').textContent = dados.total_turmas;
    document.getElementById('stat-series').textContent = dados.series.length;
    document.getElementById('stat-cursos').textContent = dados.cursos.length;
}

// Função para extrair o número da série do nome da turma (ex: "3 ANO A" -> 3, "9 ANO - INTEGRAL" -> 9)
function extrairNumeroSerie(nomeTurma) {
    const nomeUpper = nomeTurma.toUpperCase().trim();
    const base = nomeUpper.replace(/-?\s*INTEGRAL\s*$/i, '').trim();
    const match = base.match(/^(\d+)\s*ANO/i);
    if (match) {
        return parseInt(match[1], 10);
    }
    return 999;
}

// Ordena turmas por série (1º ANO primeiro, depois 2º, etc., integrais por último)
function ordenarTurmasPorSerie(turmas) {
    return [...turmas].sort((a, b) => {
        const serieA = extrairNumeroSerie(a.nome);
        const serieB = extrairNumeroSerie(b.nome);
        if (serieA !== serieB) return serieA - serieB;
        return a.nome.localeCompare(b.nome);
    });
}

// Renderiza cards individuais por escola com turmas dentro (cards HORIZONTAIS, 2 por linha)
function renderizarEscolasDashboard() {
    const container = document.getElementById('dashboard-escolas-grid');
    container.innerHTML = '';
    const buscaTexto = document.getElementById('busca-texto').value.toLowerCase().trim();

    const listaEscolas = (dados.turmas_por_escola || []).filter(item =>
        !buscaTexto || item.nome.toLowerCase().includes(buscaTexto)
    );

    if (listaEscolas.length === 0) {
        container.innerHTML = '<div class="col-span-full p-6 text-[#a0a0a0] text-sm text-center">Nenhuma escola encontrada.</div>';
        return;
    }

    listaEscolas.forEach(item => {
        const escolaInfo = dados.escolas.find(e => e.nome === item.nome);
        const totalAlunos = escolaInfo ? escolaInfo.quantidade : 0;
        const totalTurmas = item.quantidade;

        let turmasEscola = dados.escolas_turmas[item.nome] || [];
        turmasEscola = ordenarTurmasPorSerie(turmasEscola);

        const turmasFiltradas = buscaTexto
            ? turmasEscola.filter(t => t.nome.toLowerCase().includes(buscaTexto))
            : turmasEscola;

        let turmasHtml = '';
        turmasFiltradas.forEach(t => {
            turmasHtml += `
                <div class="flex items-center gap-2 px-2 py-1 rounded-lg bg-[#1e1e1e] border border-[#2a2a2a]/50">
                    <span class="text-[10px] font-medium text-[#e0e0e0]">${t.nome}</span>
                    <span class="text-[10px] font-bold text-[#059669]">${t.quantidade}</span>
                </div>
            `;
        });

        const card = document.createElement('div');
        card.className = 'bg-[#141414] rounded-xl border border-[#2a2a2a] shadow-xl shadow-black/50 overflow-hidden transition-all hover:shadow-[#6366f1]/20 cursor-default group';
        card.innerHTML = `
            <div class="p-3.5 flex items-center justify-between bg-[#1e1e1e]/30 border-b border-[#2a2a2a]/50">
                <div class="flex items-center gap-2 min-w-0">
                    <span class="material-symbols-outlined text-[16px] text-[#6366f1] shrink-0">school</span>
                    <div class="marquee-wrapper truncate">
                        <span class="marquee-text text-sm font-bold text-[#e0e0e0]">${item.nome}</span>
                    </div>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                    <span class="text-[10px] font-bold text-[#6366f1] bg-[#6366f1]/10 px-2 py-1 rounded">${totalTurmas} turmas</span>
                    <span class="text-xs font-bold text-[#e0e0e0] ml-1">${totalAlunos.toLocaleString('pt-BR')} alunos</span>
                </div>
            </div>

            <div class="p-2.5 flex flex-wrap items-center gap-1.5">
                ${turmasHtml || '<span class="text-[#a0a0a0] text-[10px]">Sem turmas</span>'}
            </div>

            ${turmasEscola.length > turmasFiltradas.length ? `
            <div class="p-2.5 border-t border-[#2a2a2a]/50 flex items-center justify-between text-[9px]">
                <span class="text-[#404040]">⚠ ${Math.max(0, turmasEscola.length - turmasFiltradas.length)} turma(s) oculta(s)</span>
                <span class="text-[#6366f1] font-bold hover:underline cursor-pointer">Ver todas</span>
            </div>
            ` : ''}
        `;
        container.appendChild(card);
    });
}

// Renderiza a lista de escolas (seção Escolas)
function renderizarEscolas() {
    const container = document.getElementById('escolas-list');
    container.innerHTML = '';
    const lista = dadosFiltrados.escolas || dados.escolas;
    lista.forEach(escola => {
        const div = document.createElement('div');
        div.className = 'item bg-[#141414] rounded-lg border border-[#2a2a2a] p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all cursor-default';
        div.innerHTML = `
            <strong class="text-[#e0e0e0] font-semibold">${escola.nome}</strong>
            <span class="text-[#6366f1] font-bold">${escola.quantidade} alunos</span>
        `;
        container.appendChild(div);
    });
}

// Renderiza a lista de turmas
function renderizarTurmas() {
    const container = document.getElementById('turmas-list');
    container.innerHTML = '';
    const lista = (dadosFiltrados.turmas || dados.turmas).slice(0, 20);
    const maxQtd = (dadosFiltrados.turmas || dados.turmas)[0]?.quantidade || 1;
    lista.forEach(turma => {
        const pct = (turma.quantidade / maxQtd) * 100;
        const div = document.createElement('div');
        div.className = 'item bg-[#141414] rounded-lg border border-[#2a2a2a] p-4 flex items-center justify-between shadow-sm transition-all';
        div.innerHTML = `
            <strong class="text-[#e0e0e0] font-semibold">${turma.nome}</strong>
            <div class="flex items-center gap-3 w-full max-w-xs">
                <div class="h-2 w-full rounded-full bg-[#1e1e1e] overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-[#6366f1] to-[#a0a0a0]" style="width: ${pct}%"></div>
                </div>
                <span class="text-[#6366f1] font-bold text-sm">${turma.quantidade} alunos</span>
            </div>
        `;
        container.appendChild(div);
    });
}

// Renderiza o detalhamento por escola e turma
function renderizarDetalhe() {
    const container = document.getElementById('detalhe-list');
    container.innerHTML = '';
    const escolasParaMostrar = dados.escolas_turmas;

    for (const [escola, turmas] of Object.entries(escolasParaMostrar)) {
        const card = document.createElement('div');
        card.className = 'escola-card bg-[#141414] rounded-xl border border-[#2a2a2a] shadow-sm overflow-hidden transition-all hover:shadow-md';
        let turmasHtml = '';
        turmas.forEach(t => {
            turmasHtml += `
                <div class="turma-item border-b border-[#2a2a2a]/50 last:border-0 py-2 px-4 flex items-center justify-between">
                    <span class="text-[#a0a0a0] text-sm">${t.nome}</span>
                    <strong class="text-[#e0e0e0] font-bold">${t.quantidade}</strong>
                </div>
            `;
        });
        card.innerHTML = `
            <div class="p-4 bg-[#1e1e1e] border-b border-[#2a2a2a]">
                <h3 class="text-sm font-bold text-[#6366f1] uppercase tracking-wider">${escola}</h3>
            </div>
            <div class="p-0">
                ${turmasHtml}
            </div>
        `;
        container.appendChild(card);
    }
}

// Renderiza a distribuição por turno, série e curso
function renderizarDistribuicao() {
    const container = document.getElementById('distribuicao-list');
    container.innerHTML = '';

    // Tabela de turnos
    let html = `
        <div class="bg-[#141414] rounded-xl border border-[#2a2a2a] shadow-sm overflow-hidden">
            <div class="p-4 bg-[#1e1e1e] border-b border-[#2a2a2a]">
                <h3 class="text-sm font-bold text-[#e0e0e0] flex items-center gap-2">
                    <span class="material-symbols-outlined text-[16px] text-[#6366f1]" aria-hidden="true">access_time</span> Por Turno
                </h3>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <caption class="sr-only">Distribuição de alunos por turno</caption>
                    <thead>
                        <tr class="border-b border-[#2a2a2a]">
                            <th scope="col" class="px-4 py-3 text-[#a0a0a0] font-semibold text-[#404040] uppercase tracking-wider">Turno</th>
                            <th scope="col" class="px-4 py-3 text-[#a0a0a0] font-semibold text-[#404040] uppercase tracking-wider text-right">Quantidade</th>
                            <th scope="col" class="px-4 py-3 text-[#a0a0a0] font-semibold text-[#404040] uppercase tracking-wider text-right">Porcentagem</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    dados.turnos.forEach(turno => {
        const pct = ((turno.quantidade / dados.total_alunos) * 100).toFixed(1);
        html += `
                        <tr class="border-b border-[#2a2a2a]/50 hover:bg-[#1e1e1e]/50 transition-colors">
                            <td class="px-4 py-3 text-[#e0e0e0] font-medium">${turno.nome}</td>
                            <td class="px-4 py-3 text-[#e0e0e0] font-bold text-right">${turno.quantidade}</td>
                            <td class="px-4 py-3 text-[#a0a0a0] text-right">${pct}%</td>
                        </tr>
        `;
    });
    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // Tabela de Séries
    html += `
        <div class="bg-[#141414] rounded-xl border border-[#2a2a2a] shadow-sm overflow-hidden mt-6">
            <div class="p-4 bg-[#1e1e1e] border-b border-[#2a2a2a]">
                <h3 class="text-sm font-bold text-[#e0e0e0] flex items-center gap-2">
                    <span class="material-symbols-outlined text-[16px] text-[#6366f1]" aria-hidden="true">stairs</span> Por Série (Ano Escolar)
                </h3>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <caption class="sr-only">Distribuição de alunos por série (ano escolar)</caption>
                    <thead>
                        <tr class="border-b border-[#2a2a2a]">
                            <th scope="col" class="px-4 py-3 text-[#a0a0a0] font-semibold text-[#404040] uppercase tracking-wider">Série</th>
                            <th scope="col" class="px-4 py-3 text-[#a0a0a0] font-semibold text-[#404040] uppercase tracking-wider text-right">Quantidade</th>
                            <th scope="col" class="px-4 py-3 text-[#a0a0a0] font-semibold text-[#404040] uppercase tracking-wider text-right">Porcentagem</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    dados.series.forEach(serie => {
        const pct = ((serie.quantidade / dados.total_alunos) * 100).toFixed(1);
        html += `
                        <tr class="border-b border-[#2a2a2a]/50 hover:bg-[#1e1e1e]/50 transition-colors">
                            <td class="px-4 py-3 text-[#e0e0e0] font-medium">${serie.nome}</td>
                            <td class="px-4 py-3 text-[#e0e0e0] font-bold text-right">${serie.quantidade}</td>
                            <td class="px-4 py-3 text-[#a0a0a0] text-right">${pct}%</td>
                        </tr>
        `;
    });
    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // Separar cursos em regulares e integrais
    const cursosRegulares = dados.cursos.filter(c => !c.nome.toUpperCase().includes('INTEGRAL'));
    const cursosIntegrais = dados.cursos.filter(c => c.nome.toUpperCase().includes('INTEGRAL'));

    if (cursosRegulares.length > 0) {
        html += `
        <div class="bg-[#141414] rounded-xl border border-[#2a2a2a] shadow-sm overflow-hidden mt-6">
            <div class="p-4 bg-[#6366f1]/20 border-b border-[#6366f1]/30">
                <h3 class="text-sm font-bold text-[#6366f1] flex items-center gap-2">
                    <span class="material-symbols-outlined text-[16px]" aria-hidden="true">menu_book</span> Cursos Regulares
                </h3>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <caption class="sr-only">Cursos regulares - quantidade de alunos</caption>
                    <thead>
                        <tr class="border-b border-[#2a2a2a]">
                            <th scope="col" class="px-4 py-3 text-[#a0a0a0] font-semibold text-[#404040] uppercase tracking-wider">Curso</th>
                            <th class="px-4 py-3 text-[#a0a0a0] font-semibold text-[#404040] uppercase tracking-wider text-right">Quantidade</th>
                            <th class="px-4 py-3 text-[#a0a0a0] font-semibold text-[#404040] uppercase tracking-wider text-right">Porcentagem</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        cursosRegulares.forEach(curso => {
            const pct = ((curso.quantidade / dados.total_alunos) * 100).toFixed(1);
            html += `
                            <tr class="border-b border-[#2a2a2a]/50 hover:bg-[#1e1e1e]/50 transition-colors">
                                <td class="px-4 py-3 text-[#e0e0e0] font-medium">${curso.nome}</td>
                                <td class="px-4 py-3 text-[#e0e0e0] font-bold text-right">${curso.quantidade}</td>
                                <td class="px-4 py-3 text-[#a0a0a0] text-right">${pct}%</td>
                            </tr>
        `;
        });
        html += `
                    </tbody>
                </table>
            </div>
        </div>
        `;
    }

    if (cursosIntegrais.length > 0) {
        html += `
        <div class="bg-[#141414] rounded-xl border border-[#2a2a2a] shadow-sm overflow-hidden mt-6">
            <div class="p-4 bg-[#6366f1]/20 border-b border-[#6366f1]/30">
                <h3 class="text-sm font-bold text-[#6366f1] flex items-center gap-2">
                    <span class="material-symbols-outlined text-[16px]" aria-hidden="true">event_busy</span> Cursos em Tempo Integral
                </h3>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <caption class="sr-only">Cursos em tempo integral - quantidade de alunos</caption>
                    <thead>
                        <tr class="border-b border-[#2a2a2a]">
                            <th scope="col" class="px-4 py-3 text-[#a0a0a0] font-semibold text-[#404040] uppercase tracking-wider">Curso</th>
                            <th class="px-4 py-3 text-[#a0a0a0] font-semibold text-[#404040] uppercase tracking-wider text-right">Quantidade</th>
                            <th class="px-4 py-3 text-[#a0a0a0] font-semibold text-[#404040] uppercase tracking-wider text-right">Porcentagem</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        cursosIntegrais.forEach(curso => {
            const pct = ((curso.quantidade / dados.total_alunos) * 100).toFixed(1);
            html += `
                            <tr class="border-b border-[#2a2a2a]/50 hover:bg-[#1e1e1e]/50 transition-colors">
                                <td class="px-4 py-3 text-[#e0e0e0] font-medium">${curso.nome}</td>
                                <td class="px-4 py-3 text-[#e0e0e0] font-bold text-right">${curso.quantidade}</td>
                                <td class="px-4 py-3 text-[#a0a0a0] text-right">${pct}%</td>
                            </tr>
        `;
        });
        html += `
                    </tbody>
                </table>
            </div>
        </div>
        `;
    }

    container.innerHTML = html;
}

// Aplica filtros (apenas busca por texto)
function aplicarFiltros() {
    const buscaTexto = document.getElementById('busca-texto').value.toLowerCase().trim();

    // Escolas
    const escolasContainer = document.getElementById('escolas-list');
    escolasContainer.innerHTML = '';
    const escolasFiltradas = dados.escolas.filter(e =>
        !buscaTexto || e.nome.toLowerCase().includes(buscaTexto)
    );
    if (escolasFiltradas.length === 0) {
        escolasContainer.innerHTML = '<div class="p-4 text-[#a0a0a0] text-sm text-center">Nenhuma escola encontrada.</div>';
    } else {
        escolasFiltradas.forEach(escola => {
            const div = document.createElement('div');
            div.className = 'item bg-[#141414] rounded-lg border border-[#2a2a2a] p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all cursor-default';
            div.innerHTML = `
                <strong class="text-[#e0e0e0] font-semibold">${escola.nome}</strong>
                <span class="text-[#6366f1] font-bold">${escola.quantidade} alunos</span>
            `;
            escolasContainer.appendChild(div);
        });
    }

    // Turmas
    const turmasContainer = document.getElementById('turmas-list');
    turmasContainer.innerHTML = '';
    const turmasFiltradas = (dados.turmas || []).filter(t =>
        !buscaTexto || t.nome.toLowerCase().includes(buscaTexto)
    ).slice(0, 20);
    const maxQtd = dados.turmas[0]?.quantidade || 1;
    if (turmasFiltradas.length === 0) {
        turmasContainer.innerHTML = '<div class="p-4 text-[#a0a0a0] text-sm text-center">Nenhuma turma encontrada.</div>';
    } else {
        turmasFiltradas.forEach(turma => {
            const pct = (turma.quantidade / maxQtd) * 100;
            const div = document.createElement('div');
            div.className = 'item bg-[#141414] rounded-lg border border-[#2a2a2a] p-4 flex items-center justify-between shadow-sm transition-all';
            div.innerHTML = `
                <strong class="text-[#e0e0e0] font-semibold">${turma.nome}</strong>
                <div class="flex items-center gap-3 w-full max-w-xs">
                    <div class="h-2 w-full rounded-full bg-[#1e1e1e] overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-[#6366f1] to-[#a0a0a0]" style="width: ${pct}%"></div>
                    </div>
                    <span class="text-[#6366f1] font-bold text-sm">${turma.quantidade} alunos</span>
                </div>
            `;
            turmasContainer.appendChild(div);
        });
    }

    // Detalhe por escola
    const detalheContainer = document.getElementById('detalhe-list');
    detalheContainer.innerHTML = '';
    const escolasParaMostrar = dados.escolas_turmas;
    let detalheVazio = true;
    for (const [escola, turmas] of Object.entries(escolasParaMostrar)) {
        let turmasFiltradasTurma = turmas;
        if (buscaTexto) {
            turmasFiltradasTurma = turmas.filter(t => t.nome.toLowerCase().includes(buscaTexto));
        }
        if (turmasFiltradasTurma.length === 0) continue;

        detalheVazio = false;
        const card = document.createElement('div');
        card.className = 'escola-card bg-[#141414] rounded-xl border border-[#2a2a2a] shadow-sm overflow-hidden transition-all hover:shadow-md';
        let turmasHtml = '';
        turmasFiltradasTurma.forEach(t => {
            turmasHtml += `
                <div class="turma-item border-b border-[#2a2a2a]/50 last:border-0 py-2 px-4 flex items-center justify-between">
                    <span class="text-[#a0a0a0] text-sm">${t.nome}</span>
                    <strong class="text-[#e0e0e0] font-bold">${t.quantidade}</strong>
                </div>
            `;
        });
        card.innerHTML = `
            <div class="p-4 bg-[#1e1e1e] border-b border-[#2a2a2a]">
                <h3 class="text-sm font-bold text-[#6366f1] uppercase tracking-wider">${escola}</h3>
            </div>
            <div class="p-0">
                ${turmasHtml}
            </div>
        `;
        detalheContainer.appendChild(card);
    }

    if (detalheVazio) {
        detalheContainer.innerHTML = '<div class="p-6 text-[#a0a0a0] text-sm text-center">Nenhum detalhamento encontrado com os filtros aplicados.</div>';
    }

    renderizarEscolasDashboard();

    // Devolve o foco ao campo de busca após re-renderizar (usuários de teclado)
    const buscaInput = document.getElementById('busca-texto');
    if (buscaInput) buscaInput.focus();
}

// Mostra feedback visual temporário (toast) após ações
function mostrarToast(mensagem) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-[#6366f1] text-white px-6 py-3 rounded-xl shadow-lg shadow-[#6366f1]/40 border border-[#6366f1]/30 animate-pulse';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = mensagem;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.transition = 'opacity 0.4s ease';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
    }, 2500);
}

// Valida integridade dos dados antes de exportar (csv-data-processor)
function validarDados(dados) {
    const erros = [];
    if (typeof dados.total_alunos !== 'number') erros.push('total_alunos inválido');
    if (!Array.isArray(dados.escolas)) erros.push('escolas não é um array');
    if (!Array.isArray(dados.turmas)) erros.push('turmas não é um array');
    if (!Array.isArray(dados.turnos)) erros.push('turnos não é um array');
    if (!Array.isArray(dados.series)) erros.push('series não é um array');
    if (!Array.isArray(dados.cursos)) erros.push('cursos não é um array');
    if (erros.length > 0) {
        console.error('Dados inválidos:', erros);
        return false;
    }
    return true;
}

// Exporta os dados para CSV
function exportarCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Sistema de Logística - Planejamento de Provas\n";
    csvContent += `Total de Alunos,${dados.total_alunos}\n`;
    csvContent += `Total de Escolas,${dados.total_escolas}\n`;
    csvContent += `Total de Turmas,${dados.total_turmas}\n\n`;

    csvContent += "Escolas\n";
    csvContent += "Escola,Quantidade\n";
    dados.escolas.forEach(e => {
        csvContent += `"${e.nome}",${e.quantidade}\n`;
    });

    csvContent += "\nTurmas\n";
    csvContent += "Turma,Quantidade\n";
    dados.turmas.forEach(t => {
        csvContent += `"${t.nome}",${t.quantidade}\n`;
    });

    csvContent += "\nEscola x Turma\n";
    csvContent += "Escola,Turma,Quantidade\n";
    for (const [escola, turmas] of Object.entries(dados.escolas_turmas)) {
        turmas.forEach(t => {
            csvContent += `"${escola}","${t.nome}",${t.quantidade}\n`;
        });
    }

    csvContent += "\nTurnos\n";
    csvContent += "Turno,Quantidade\n";
    dados.turnos.forEach(t => {
        csvContent += `"${t.nome}",${t.quantidade}\n`;
    });

    csvContent += "\nSéries (Anos Escolares)\n";
    csvContent += "Série,Quantidade\n";
    dados.series.forEach(s => {
        csvContent += `"${s.nome}",${s.quantidade}\n`;
    });

    csvContent += "\nCursos Regulares\n";
    csvContent += "Curso,Quantidade\n";
    dados.cursos.filter(c => !c.nome.toUpperCase().includes('INTEGRAL')).forEach(c => {
        csvContent += `"${c.nome}",${c.quantidade}\n`;
    });

    csvContent += "\nCursos em Tempo Integral\n";
    csvContent += "Curso,Quantidade\n";
    dados.cursos.filter(c => c.nome.toUpperCase().includes('INTEGRAL')).forEach(c => {
        csvContent += `"${c.nome}",${c.quantidade}\n`;
    });

    if (!validarDados(dados)) {
        mostrarToast('Erro: dados incompletos para exportação.');
        return;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'logistica_provas.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    mostrarToast('CSV exportado com sucesso: logistica_provas.csv');
}

document.addEventListener('DOMContentLoaded', init);