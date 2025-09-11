document.addEventListener('DOMContentLoaded', () => {
    const entradaInput = document.getElementById('entrada');
    const pausaAlmocoInput = document.getElementById('pausaAlmoco');
    const retornoAlmocoInput = document.getElementById('retornoAlmoco');
    const saidaInput = document.getElementById('saida');
    const calcularBtn = document.getElementById('calcular');
    const zerarHorasBtn = document.getElementById('zerarHorasMesAtual');
    const resultadoDiv = document.getElementById('resultado');

    // Cria e adiciona o container para o banco de horas se ainda não existir
    let bancoDeHorasDiv = document.querySelector('.banco-de-horas');
    if (!bancoDeHorasDiv) {
        bancoDeHorasDiv = document.createElement('div');
        bancoDeHorasDiv.classList.add('banco-de-horas');
        document.querySelector('.container').appendChild(bancoDeHorasDiv);
    }

    // Estrutura para o banco de horas: { 'YYYY-MM': totalMinutos, ... }
    let bancoDeHoras = JSON.parse(localStorage.getItem('bancoDeHoras')) || {};

    // Função auxiliar para converter "HH:MM" para minutos totais desde a meia-noite
    function timeToMinutes(timeStr) {
        if (!timeStr) return null;
        const [horas, minutos] = timeStr.split(':').map(Number);
        return (horas * 60) + minutos;
    }

    // Função para renderizar o banco de horas na tela
    function renderizarBancoDeHoras() {
        if (Object.keys(bancoDeHoras).length === 0) {
            bancoDeHorasDiv.innerHTML = '<h3>Banco de Horas Acumuladas</h3><p>Nenhum dado registrado ainda.</p>';
            return;
        }

        let html = '<h3>Banco de Horas Acumuladas</h3><ul>';
        // Ordena as chaves do banco de horas em ordem decrescente (mais recente primeiro)
        const mesesOrdenados = Object.keys(bancoDeHoras).sort().reverse();

        for (const mesAno of mesesOrdenados) {
            const totalMinutos = bancoDeHoras[mesAno];
            const horas = Math.floor(totalMinutos / 60);
            const minutos = totalMinutos % 60;
            const [ano, mes] = mesAno.split('-');
            
            const data = new Date(ano, mes - 1, 1);
            const nomeDoMes = data.toLocaleString('pt-br', { month: 'long', year: 'numeric' });

            html += `<li>${nomeDoMes}: <strong>${horas}h ${minutos}min</strong></li>`;
        }
        html += '</ul>';
        bancoDeHorasDiv.innerHTML = html;
    }

    // Renderiza o banco de horas ao carregar a página
    renderizarBancoDeHoras();

    calcularBtn.addEventListener('click', () => {
        const hEntrada = timeToMinutes(entradaInput.value);
        const hPausaAlmoco = timeToMinutes(pausaAlmocoInput.value);
        const hRetornoAlmoco = timeToMinutes(retornoAlmocoInput.value);
        const hSaida = timeToMinutes(saidaInput.value);

        if (!hEntrada || !hPausaAlmoco || !hRetornoAlmoco || !hSaida) {
            resultadoDiv.textContent = 'Por favor, preencha todos os campos de horário.';
            resultadoDiv.style.color = '#dc3545';
            resultadoDiv.style.backgroundColor = '#f8d7da';
            resultadoDiv.classList.add('show');
            return;
        }

        // Validações básicas de fluxo de tempo
        if (hPausaAlmoco < hEntrada || hRetornoAlmoco < hPausaAlmoco || hSaida < hRetornoAlmoco) {
            resultadoDiv.textContent = 'Verifique a ordem dos horários (Entrada < Pausa < Retorno < Saída).';
            resultadoDiv.style.color = '#dc3545';
            resultadoDiv.style.backgroundColor = '#f8d7da';
            resultadoDiv.classList.add('show');
            return;
        }

        let periodoTrabalhadoManha = hPausaAlmoco - hEntrada;
        let periodoTrabalhadoTarde = hSaida - hRetornoAlmoco;

        let totalMinutosTrabalhados = periodoTrabalhadoManha + periodoTrabalhadoTarde;

        // Se a saída for no dia seguinte, ajuste para calcular corretamente (ex: 22:00 às 06:00)
        // Isso é uma simplificação. Para cenários mais complexos (intervalos noturnos), seria mais robusto.
        if (hSaida < hEntrada && hSaida < hPausaAlmoco) { 
             // Assumimos que o período de saída é no dia seguinte.
             // Para simplificar, adicionamos 24h apenas ao tempo total de trabalho.
             // Um tratamento mais preciso envolveria ajustar cada marcação individualmente.
             // Por enquanto, vamos considerar o cenário mais comum de 1 dia de trabalho.
        }


        const horasTrabalhadas = Math.floor(totalMinutosTrabalhados / 60);
        const minutosTrabalhados = totalMinutosTrabalhados % 60;
        
        // --- Adicionando a funcionalidade de banco de horas ---
        const dataAtual = new Date();
        const ano = dataAtual.getFullYear();
        const mes = String(dataAtual.getMonth() + 1).padStart(2, '0'); 
        const mesAnoChave = `${ano}-${mes}`;

        // Soma as horas ao banco de horas
        if (!bancoDeHoras[mesAnoChave]) {
            bancoDeHoras[mesAnoChave] = 0;
        }
        bancoDeHoras[mesAnoChave] += totalMinutosTrabalhados;

        // Salva os dados atualizados no localStorage
        localStorage.setItem('bancoDeHoras', JSON.stringify(bancoDeHoras));

        // Renderiza o banco de horas na tela
        renderizarBancoDeHoras();

        // Limpa os inputs após o cálculo e salvamento
        entradaInput.value = '';
        pausaAlmocoInput.value = '';
        retornoAlmocoInput.value = '';
        saidaInput.value = '';

        // Exibir o resultado
        resultadoDiv.style.color = '#28a745';
        resultadoDiv.style.backgroundColor = '#e2f5e8';
        resultadoDiv.textContent = `Ponto registrado! Horas trabalhadas hoje: ${horasTrabalhadas}h ${minutosTrabalhados}min`;
        resultadoDiv.classList.add('show');
    });

    zerarHorasBtn.addEventListener('click', () => {
        const confirmar = confirm('Tem certeza que deseja zerar as horas acumuladas para o mês atual?');
        if (confirmar) {
            const dataAtual = new Date();
            const ano = dataAtual.getFullYear();
            const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
            const mesAnoChave = `${ano}-${mes}`;

            if (bancoDeHoras[mesAnoChave]) {
                delete bancoDeHoras[mesAnoChave];
                localStorage.setItem('bancoDeHoras', JSON.stringify(bancoDeHoras));
                renderizarBancoDeHoras();
                resultadoDiv.textContent = `Horas do mês atual (${mesAnoChave}) foram zeradas.`;
                resultadoDiv.style.color = '#007bff';
                resultadoDiv.style.backgroundColor = '#e7f3ff';
                resultadoDiv.classList.add('show');
            } else {
                resultadoDiv.textContent = 'Não há horas registradas para o mês atual para zerar.';
                resultadoDiv.style.color = '#6c757d';
                resultadoDiv.style.backgroundColor = '#e9ecef';
                resultadoDiv.classList.add('show');
            }
        }
    });
});