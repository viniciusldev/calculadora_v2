/* calculadora */

const visor = document.getElementById('visor');
const calculadora = document.getElementById('calculadora');
const botoesCalculadora = calculadora.querySelectorAll('.btn-calculadora');

visor.value = '0';


/* easter eggs */

const areaEasterEgg = document.getElementById('easter-egg');
const videoEasterEgg = document.getElementById('easter-egg-video');
const somEasterEgg = document.getElementById('som-easter-egg');

const easterEggs = {
    13: {
        video: '../assets/gifs/lula.mp4',
        som: '../assets/audio/abobora.mp3'
    },

    10: {
        video: '../assets/gifs/ben10.mp4',
        som: '../assets/audio/b10.mp3'
    },

    67: {
        video: '../assets/gifs/67.mp4',
        som: '../assets/audio/67som.mp3'
    }
};

let timeoutEasterEgg = null;

function esconderEasterEgg() {
    clearTimeout(timeoutEasterEgg);
    timeoutEasterEgg = null;

    videoEasterEgg.pause();
    somEasterEgg.pause();

    videoEasterEgg.currentTime = 0;
    somEasterEgg.currentTime = 0;

    videoEasterEgg.removeAttribute('src');
    somEasterEgg.removeAttribute('src');

    areaEasterEgg.classList.add('d-none');
    areaEasterEgg.classList.remove('mostrar-easter-egg');
}

function mostrarEasterEgg(resultado) {
    const configuracao = easterEggs[resultado];

    if (!configuracao) {
        esconderEasterEgg();
        return;
    }

    clearTimeout(timeoutEasterEgg);

    videoEasterEgg.pause();
    somEasterEgg.pause();

    videoEasterEgg.src = configuracao.video;
    somEasterEgg.src = configuracao.som;

    videoEasterEgg.currentTime = 0;
    somEasterEgg.currentTime = 0;

    // Remove e recoloca a classe para a animação CSS reiniciar.
    areaEasterEgg.classList.remove('d-none', 'mostrar-easter-egg');
    void areaEasterEgg.offsetWidth;
    areaEasterEgg.classList.add('mostrar-easter-egg');

    videoEasterEgg.play().catch(() => {});
    somEasterEgg.play().catch(() => {});

    // O Easter egg fica visível por 5 segundos.
    timeoutEasterEgg = setTimeout(() => {
        esconderEasterEgg();
    }, 5000);
}


/* Botões da calculadora */

botoesCalculadora.forEach((botao) => {
    botao.addEventListener('click', () => {
        const valorBotao = botao.innerText.trim();

        // AC limpa tudo.
        if (valorBotao === 'AC') {
            esconderEasterEgg();
            visor.value = '0';
            return;
        }

        // Apaga somente o último caractere.
        if (valorBotao === '⌫') {
            esconderEasterEgg();

            if (visor.value === 'Erro' || visor.value.length <= 1) {
                visor.value = '0';
            } else {
                visor.value = visor.value.slice(0, -1);
            }

            return;
        }

        // Calcula o resultado.
        if (valorBotao === '=') {
            try {
                const expressao = visor.value.replace(/\s/g, '');

                // A expressão só pode conter números, ponto, parênteses e operadores matemáticos.
                const expressaoValida = /^[0-9+\-*/().]+$/.test(expressao);

                if (!expressaoValida) {
                    throw new Error('Expressão inválida');
                }

                const resultado = Function(`"use strict"; return (${expressao})`)();

                if (!Number.isFinite(resultado)) {
                    throw new Error('Resultado inválido');
                }

                visor.value = resultado;
                mostrarEasterEgg(resultado);

            } catch (erro) {
                esconderEasterEgg();
                visor.value = 'Erro';
            }

            return;
        }

        esconderEasterEgg();

        // Se estiver em erro, começa uma nova expressão.
        if (visor.value === 'Erro') {
            visor.value = valorBotao;
            return;
        }

        // Substitui o zero inicial quando o usuário digita um número.
        if (visor.value === '0' && /^[0-9]$/.test(valorBotao)) {
            visor.value = valorBotao;
            return;
        }

        visor.value += valorBotao;
    });
});


/* modo desafio */

const desafios = [
    { pergunta: 'Qual é a soma de 27 + 45?', resposta: 72 },
    { pergunta: 'Quanto é 120 - 37?', resposta: 83 },
    { pergunta: 'Quanto é 12 × 8?', resposta: 96 },
    { pergunta: 'Quanto é 144 ÷ 12?', resposta: 12 },
    { pergunta: 'Quanto é (25 × 4) - 30?', resposta: 70 }
];

const TEMPO_POR_QUESTAO = 15;

let questaoAtual = 0;
let acertos = 0;
let segundosRestantes = TEMPO_POR_QUESTAO;
let cronometro = null;
let desafioAtivo = false;


/* elementos do desafio */

const btnDesafio = document.getElementById('btn-desafio');
const btnSair = document.getElementById('btn-sair');
const btnJogarNovamente = document.getElementById('btn-jogar-novamente');

const areaDesafio = document.getElementById('area-desafio');
const telaQuestao = document.getElementById('tela-questao');
const telaFinal = document.getElementById('tela-final');

const numeroQuestao = document.getElementById('numero-questao');
const totalQuestoes = document.getElementById('total-questoes');
const pergunta = document.getElementById('pergunta');
const formDesafio = document.getElementById('form-desafio');
const campoResposta = document.getElementById('resposta');
const feedback = document.getElementById('feedback');

const tempo = document.getElementById('tempo');
const barraTempo = document.getElementById('barra-tempo');
const somTicTac = document.getElementById('som-tic-tac');

const tituloFinal = document.getElementById('titulo-final');
const mensagemFinal = document.getElementById('mensagem-final');
const finalAcertos = document.getElementById('final-acertos');

totalQuestoes.innerText = desafios.length;


/* cronometro */

function atualizarTempoNaTela() {
    tempo.innerText = `${segundosRestantes}s`;

    const porcentagem = (segundosRestantes / TEMPO_POR_QUESTAO) * 100;

    barraTempo.style.width = `${porcentagem}%`;
    barraTempo.setAttribute('aria-valuenow', segundosRestantes);

    if (segundosRestantes <= 5) {
        barraTempo.classList.add('bg-danger');
    } else {
        barraTempo.classList.remove('bg-danger');
    }
}

function tocarTicTac() {
    somTicTac.currentTime = 0;
    somTicTac.play().catch(() => {});
}

function pararTicTac() {
    somTicTac.pause();
    somTicTac.currentTime = 0;
}

function pararCronometro() {
    clearInterval(cronometro);
    cronometro = null;
}

function iniciarCronometro() {
    pararCronometro();

    segundosRestantes = TEMPO_POR_QUESTAO;
    atualizarTempoNaTela();
    tocarTicTac();

    cronometro = setInterval(() => {
        segundosRestantes--;
        atualizarTempoNaTela();

        if (segundosRestantes <= 0) {
            encerrarPorTempo();
        }
    }, 1000);
}


/* fluxo desafio */

function mostrarQuestao() {
    desafioAtivo = true;

    numeroQuestao.innerText = questaoAtual + 1;
    pergunta.innerText = desafios[questaoAtual].pergunta;

    campoResposta.value = '';
    campoResposta.disabled = false;
    campoResposta.classList.remove('is-valid', 'is-invalid');

    feedback.innerText = '';

    campoResposta.focus();
    iniciarCronometro();
}

function iniciarDesafio() {
    pararCronometro();
    pararTicTac();

    questaoAtual = 0;
    acertos = 0;
    desafioAtivo = true;

    areaDesafio.classList.remove('d-none');
    btnDesafio.classList.add('d-none');

    telaQuestao.classList.remove('d-none');
    telaFinal.classList.add('d-none');

    mostrarQuestao();
}

function proximaQuestao() {
    questaoAtual++;

    if (questaoAtual >= desafios.length) {
        finalizarDesafioComSucesso();
        return;
    }

    mostrarQuestao();
}

function finalizarDesafioComSucesso() {
    desafioAtivo = false;

    pararCronometro();
    pararTicTac();

    telaQuestao.classList.add('d-none');
    telaFinal.classList.remove('d-none');

    tituloFinal.className = 'text-success';
    tituloFinal.innerText = 'Desafio concluído!';

    mensagemFinal.innerText = 'Parabéns! Você acertou todas as questões.';
    finalAcertos.innerText = `${acertos}/${desafios.length}`;
}

function encerrarPorErro() {
    if (!desafioAtivo) {
        return;
    }

    desafioAtivo = false;

    pararCronometro();
    pararTicTac();

    campoResposta.disabled = true;
    campoResposta.classList.remove('is-valid');
    campoResposta.classList.add('is-invalid');

    feedback.innerHTML = '<span class="text-danger fw-semibold">Resposta incorreta!</span>';

    // Dá um instante para o usuário visualizar o feedback antes da tela final.
    setTimeout(() => {
        telaQuestao.classList.add('d-none');
        telaFinal.classList.remove('d-none');

        tituloFinal.className = 'text-danger';
        tituloFinal.innerText = 'Fim de jogo!';

        mensagemFinal.innerText = `Você errou a questão ${questaoAtual + 1}. Reinicie o desafio para tentar novamente.`;
        finalAcertos.innerText = `${acertos}/${desafios.length}`;
    }, 650);
}

function encerrarPorTempo() {
    if (!desafioAtivo) {
        return;
    }

    desafioAtivo = false;

    pararCronometro();
    pararTicTac();

    segundosRestantes = 0;
    atualizarTempoNaTela();

    campoResposta.disabled = true;
    campoResposta.classList.remove('is-valid');
    campoResposta.classList.add('is-invalid');

    feedback.innerHTML = '<span class="text-danger fw-semibold">Tempo esgotado!</span>';

    setTimeout(() => {
        telaQuestao.classList.add('d-none');
        telaFinal.classList.remove('d-none');

        tituloFinal.className = 'text-danger';
        tituloFinal.innerText = 'Tempo esgotado!';

        mensagemFinal.innerText = `O tempo da questão ${questaoAtual + 1} acabou. Reinicie o desafio para tentar novamente.`;
        finalAcertos.innerText = `${acertos}/${desafios.length}`;
    }, 650);
}

function sairDoDesafio() {
    desafioAtivo = false;

    pararCronometro();
    pararTicTac();

    campoResposta.disabled = false;
    campoResposta.classList.remove('is-valid', 'is-invalid');
    feedback.innerText = '';

    areaDesafio.classList.add('d-none');
    btnDesafio.classList.remove('d-none');

    telaQuestao.classList.remove('d-none');
    telaFinal.classList.add('d-none');
}


/* ========================================
   RESPOSTA DO USUÁRIO
======================================== */

formDesafio.addEventListener('submit', (evento) => {
    evento.preventDefault();

    if (!desafioAtivo || segundosRestantes <= 0) {
        return;
    }

    const respostaUsuario = Number(campoResposta.value);
    const respostaCorreta = desafios[questaoAtual].resposta;

    if (respostaUsuario === respostaCorreta) {
        desafioAtivo = false;
        acertos++;

        pararCronometro();
        pararTicTac();

        campoResposta.disabled = true;
        campoResposta.classList.remove('is-invalid');
        campoResposta.classList.add('is-valid');

        feedback.innerHTML = '<span class="text-success fw-semibold">Resposta correta!</span>';

        // Acertou: segue automaticamente para a próxima questão.
        setTimeout(() => {
            proximaQuestao();
        }, 700);

    } else {
        // Errou: o desafio termina imediatamente.
        encerrarPorErro();
    }
});


btnDesafio.addEventListener('click', iniciarDesafio);
btnSair.addEventListener('click', sairDoDesafio);
btnJogarNovamente.addEventListener('click', iniciarDesafio);


/* ========================================
   TEMA CLARO / ESCURO
======================================== */

const btnTema = document.getElementById('btn-tema');

btnTema.addEventListener('click', () => {
    const temaAtual = document.documentElement.getAttribute('data-bs-theme');

    if (temaAtual === 'dark') {
        document.documentElement.setAttribute('data-bs-theme', 'light');
        btnTema.innerText = '🌙 Modo Escuro';
    } else {
        document.documentElement.setAttribute('data-bs-theme', 'dark');
        btnTema.innerText = '☀️ Modo Claro';
    }
});
