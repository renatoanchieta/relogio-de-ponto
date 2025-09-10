document.addEventListener('DOMContentLoaded', () => {
    const entradaInput = document.getElementById('entrada');
    const saidaInput = document.getElementById('saida');
    const calcularBtn = document.getElementById('calcular');
    const resultadoDiv = document.getElementById('resultado');
    const bancoDeHorasDiv = document.createElement('div');
    bancoDeHorasDiv.classList.add('banco-de-horas');
    document.querySelector('.container').appendChild(bancoDeHorasDiv);

    // Estrutura para o banco de horas: { 'YYYY-MM': totalMinutos, ... }
    let bancoDeHoras = JSON.parse(localStorage.getItem('bancoDeHoras')) || {};

    // Função para renderizar o banco de horas na tela
    function renderizarBancoDeHoras() {
        if (Object.keys(bancoDeHoras).length === 0) {
            bancoDeHorasDiv.innerHTML = '<h3>Banco de Horas</h3><p>Nenhum dado registrado ainda.</p>';
            return;
        }

        let html = '<h3>Banco de Horas Acumuladas</h3><ul>';
        for (const mesAno in bancoDeHoras) {
            const totalMinutos = bancoDeHoras[mesAno];
            const horas = Math.floor(totalMinutos / 60);
            const minutos = totalMinutos % 60;
            const [ano, mes] = mesAno.split('-');
            
            // Cria um nome de mês mais legível
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
        const horaEntrada = entradaInput.value;
        const horaSaida = saidaInput.value;

        if (!horaEntrada || !horaSaida) {
            resultadoDiv.textContent = 'Por favor, preencha ambas as horas.';
            resultadoDiv.style.color = '#dc3545';
            resultadoDiv.style.backgroundColor = '#f8d7da';
            resultadoDiv.classList.add('show');
            return;
        }

        const [horasE, minutosE] = horaEntrada.split(':').map(Number);
        const [horasS, minutosS] = horaSaida.split(':').map(Number);

        const totalMinutosEntrada = (horasE * 60) + minutosE;
        let totalMinutosSaida = (horasS * 60) + minutosS;

        if (totalMinutosSaida < totalMinutosEntrada) {
            totalMinutosSaida += (24 * 60);
        }

        const diferencaMinutos = totalMinutosSaida - totalMinutosEntrada;

        const horasTrabalhadas = Math.floor(diferencaMinutos / 60);
        const minutosTrabalhados = diferencaMinutos % 60;
        
        // --- Adicionando a funcionalidade de banco de horas ---
        const dataAtual = new Date();
        const ano = dataAtual.getFullYear();
        // O mês é 0-11, então somamos 1 e formatamos
        const mes = String(dataAtual.getMonth() + 1).padStart(2, '0'); 
        const mesAnoChave = `${ano}-${mes}`;

        // Soma as horas ao banco de horas
        if (!bancoDeHoras[mesAnoChave]) {
            bancoDeHoras[mesAnoChave] = 0;
        }
        bancoDeHoras[mesAnoChave] += diferencaMinutos;

        // Salva os dados atualizados no localStorage
        localStorage.setItem('bancoDeHoras', JSON.stringify(bancoDeHoras));

        // Renderiza o banco de horas na tela
        renderizarBancoDeHoras();

        // Limpa os inputs após o cálculo e salvamento
        entradaInput.value = '';
        saidaInput.value = '';

        // Exibir o resultado
        resultadoDiv.style.color = '#28a745';
        resultadoDiv.style.backgroundColor = '#e2f5e8';
        resultadoDiv.textContent = `Ponto registrado! Horas trabalhadas: ${horasTrabalhadas}h ${minutosTrabalhados}min`;
        resultadoDiv.classList.add('show');
    });
});