// Logística de Avaliações - PDA
// Processa o JSON de Dados_base e renderiza o cronograma por dia/turno/escola

let dadosAvaliacao = null;
let dadosFiltrados = null;

// Inicializa a aplicação
function init() {
    fetch('Dados_base/calendario.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar o arquivo JSON');
            }
            return response.json();
        })
        .then(data => {
            dadosAvaliacao = data;
            dadosFiltrados = { ...data };
            renderizarCabecalho();
            renderizarCronograma();
            configurarBusca();
        })
        .catch(err => {
            console.error('Erro ao carregar dados:', err);
            document.body.innerHTML = '<p class="text-center p-4 text-[#6366f1]">Erro ao carregar os dados da avaliação. Verifique se o arquivo JSON existe.</p>';
        });
}

// Renderiza o cabeçalho do evento
function renderizarCabecalho() {
    const evento = dadosAvaliacao.evento;
    const empresa = dadosAvaliacao.empresa.nome;
    const totalEscolas = dadosAvaliacao.total_escolas;
    const totalTurmas = dadosAvaliacao.total_turmas;

    document.getElementById('titulo-evento').textContent = evento;
    document.getElementById('empresa-evento').textContent = empresa;
    document.getElementById('stat-total-escolas').textContent = totalEscolas.toLocaleString('pt-BR');
    document.getElementById('stat-total-turmas').textContent = totalTurmas.toLocaleString('pt-BR');
    document.getElementById('contador-total').textContent = totalEscolas.toLocaleString('pt-BR');
}

// Renderiza o cronograma completo
function renderizarCronograma() {
    const container = document.getElementById('cronograma');
    container.innerHTML = '';

    const escolasVisiveis = obterEscolasFiltradas();

    dadosAvaliacao.cronograma.forEach((dia, indiceDia) => {
        const secaoDia = document.createElement('section');
        secaoDia.className = 'mb-8';
        secaoDia.id = `dia-${indiceDia}`;
        secaoDia.setAttribute('aria-label', `${dia.dia}, ${dia.data}`);

        let html = `
            <div class="bg-[#141414] rounded-xl border border-[#2a2a2a] shadow-sm overflow-hidden">
                <div class="p-4 bg-[#1e1e1e] border-b border-[#2a2a2a] flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-[#6366f1] text-[20px]" aria-hidden="true">calendar_today</span>
                        <div>
                            <h3 class="text-lg font-bold text-[#e0e0e0] tracking-tight">${dia.dia}</h3>
                            <p class="text-xs text-[#a0a0a0]">${dia.data}</p>
                        </div>
                    </div>
                    <span class="text-xs font-bold text-[#6366f1] bg-[#6366f1]/10 px-2 py-1 rounded border border-[#6366f1]/20">
                        ${Object.keys(dia.turnos).length} turno${Object.keys(dia.turnos).length > 1 ? 's' : ''}
                    </span>
                </div>
                <div class="p-4">
        `;

        // Renderiza cada turno do dia
        for (const [chaveTurno, turno] of Object.entries(dia.turnos)) {
            const escolasTurno = filtrarEscolasTurno(turno.escolas, escolasVisiveis);

            html += `
                <div class="mt-4">
                    <div class="flex items-center justify-between mb-3">
                        <h4 class="text-sm font-bold text-[#c9c9c9] uppercase tracking-wider flex items-center gap-2">
                            <span class="material-symbols-outlined text-[#6366f1] text-[16px]" aria-hidden="true">${chaveTurno === 'manha' ? 'wb_sunny' : 'brightness_7'}</span>
                            ${chaveTurno === 'manha' ? 'Manhã' : 'Tarde'}
                        </h4>
                        <div class="flex items-center gap-2 text-xs">
                            <span class="text-[#a0a0a0]">${turno.total_turmas} turmas</span>
                            <span class="text-[#a0a0a0]">${turno.total_alunos_tablets} alunos</span>
                            ${turno.tablets_leitura !== undefined ? `<span class="text-[#a0a0a0]">${turno.tablets_leitura} tablets leitura</span>` : ''}
                            ${turno.aplicadores !== undefined ? `<span class="text-[#a0a0a0]">${turno.aplicadores} aplicadores</span>` : ''}
                        </div>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-sm">
                            <caption class="sr-only">Escolas do turno ${chaveTurno} - ${dia.dia}</caption>
                            <thead>
                                <tr class="border-b border-[#2a2a2a]">
                                    <th scope="col" class="px-4 py-3 text-[#a0a0a0] font-semibold text-[#404040] uppercase tracking-wider">Escola</th>
                                    <th scope="col" class="px-4 py-3 text-[#a0a0a0] font-semibold text-[#404040] uppercase tracking-wider">Técnicos</th>
                                    <th scope="col" class="px-4 py-3 text-[#a0a0a0] font-semibold text-[#404040] uppercase tracking-wider text-right">Turmas</th>
                                    <th scope="col" class="px-4 py-3 text-[#a0a0a0] font-semibold text-[#404040] uppercase tracking-wider text-right">Tablets</th>
                                    <th scope="col" class="px-4 py-3 text-[#a0a0a0] font-semibold text-[#404040] uppercase tracking-wider text-right">Alunos</th>
                                </tr>
                            </thead>
                            <tbody>
            `;

            if (escolasTurno.length === 0) {
                html += `
                                <tr>
                                    <td colspan="5" class="px-4 py-6 text-center text-[#a0a0a0] text-sm">Nenhuma escola encontrada com os filtros aplicados.</td>
                                </tr>
                `;
            } else {
                escolasTurno.forEach(escola => {
                    const tecnicos = escola.tecnicos.join(', ');
                    const turmas = escola.turmas_e_tablets.map(t => t.turmas).join('; ');
                    const totalTablets = escola.turmas_e_tablets.reduce((s, t) => s + t.tablets, 0);

                    html += `
                                <tr class="border-b border-[#2a2a2a]/50 hover:bg-[#1e1e1e]/50 transition-colors group">
                                    <td class="px-4 py-3 text-[#e0e0e0] font-medium">
                                        <div class="flex items-center gap-2">
                                            <span class="material-symbols-outlined text-[14px] text-[#6366f1]" aria-hidden="true">school</span>
                                            <span>${escola.nome}</span>
                                        </div>
                                    </td>
                                    <td class="px-4 py-3 text-[#c9c9c9]">
                                        <span class="flex items-center gap-1">
                                            <span class="material-symbols-outlined text-[13px] text-[#a0a0a0]" aria-hidden="true">person</span>
                                            ${tecnicos}
                                        </span>
                                    </td>
                                    <td class="px-4 py-3 text-[#e0e0e0] font-bold text-right">${turmas}</td>
                                    <td class="px-4 py-3 text-[#e0e0e0] text-right">${totalTablets}</td>
                                    <td class="px-4 py-3 text-[#e0e0e0] font-bold text-right">${escola.total_alunos}</td>
                                </tr>
                    `;
                });
            }

            html += `
                            </tbody>
                        </table>
                    </div>
                    ${turno.observacoes ? `
                    <div class="mt-3 p-3 bg-[#1e1e1e] border border-[#2a2a2a]/50 rounded-lg">
                        <p class="text-xs text-[#a0a0a0] italic">${turno.observacoes}</p>
                    </div>
                    ` : ''}
                </div>
            `;
        }

        html += `
                </div>
            </div>
        `;

        secaoDia.innerHTML = html;
        container.appendChild(secaoDia);
    });

    atualizarContador(escolasVisiveis.length);
}

// Obtém lista única de escolas filtradas por busca
function obterEscolasFiltradas() {
    const busca = document.getElementById('busca-escola').value.toLowerCase().trim();
    const escolasSet = new Set();

    dadosAvaliacao.cronograma.forEach(dia => {
        for (const turno of Object.values(dia.turnos)) {
            turno.escolas.forEach(escola => {
                if (!busca ||
                    escola.nome.toLowerCase().includes(busca) ||
                    escola.tecnicos.some(t => t.toLowerCase().includes(busca))) {
                    escolasSet.add(escola.nome);
                }
            });
        }
    });

    return Array.from(escolasSet);
}

// Filtra escolas de um turno com base na busca
function filtrarEscolasTurno(escolasTurno, escolasVisiveis) {
    const busca = document.getElementById('busca-escola').value.toLowerCase().trim();
    return escolasTurno.filter(escola => {
        if (!escolasVisiveis.includes(escola.nome)) return false;
        if (!busca) return true;
        return escola.nome.toLowerCase().includes(busca) ||
            escola.tecnicos.some(t => t.toLowerCase().includes(busca));
    });
}

// Atualiza o contador de escolas visíveis
function atualizarContador(qtd) {
    document.getElementById('contador-visiveis').textContent = qtd.toLocaleString('pt-BR');
}

// Configura o campo de busca
function configurarBusca() {
    const input = document.getElementById('busca-escola');
    let timeout;

    input.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            renderizarCronograma();
            // Devolve foco ao input após re-renderizar (usuários de teclado)
            input.focus();
        }, 300);
    });
}

// Exporta os dados para CSV
function exportarCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Sistema de Logística - Avaliações PDA\n";
    csvContent += `Evento,${dadosAvaliacao.evento}\n`;
    csvContent += `Empresa,${dadosAvaliacao.empresa.nome}\n`;
    csvContent += `CNPJ,${dadosAvaliacao.empresa.cnpj}\n`;
    csvContent += `Total de Escolas,${dadosAvaliacao.total_escolas}\n`;
    csvContent += `Total de Turmas,${dadosAvaliacao.total_turmas}\n\n`;

    csvContent += "Dia,Turno,Escola,Técnicos,Turmas,Tablets,Alunos\n";
    dadosAvaliacao.cronograma.forEach(dia => {
        for (const [chaveTurno, turno] of Object.entries(dia.turnos)) {
            turno.escolas.forEach(escola => {
                const tecnicos = escola.tecnicos.join('; ');
                const turmas = escola.turmas_e_tablets.map(t => t.turmas).join('; ');
                const totalTablets = escola.turmas_e_tablets.reduce((s, t) => s + t.tablets, 0);
                csvContent += `"${dia.dia}","${chaveTurno}","${escola.nome}","${tecnicos}","${turmas}",${totalTablets},${escola.total_alunos}\n`;
            });
        }
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'logistica_avaliacoes.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    mostrarToast('CSV exportado com sucesso: logistica_avaliacoes.csv');
}

// Feedback visual (toast)
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

document.addEventListener('DOMContentLoaded', init);
