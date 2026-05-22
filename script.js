// Configuração inicial
const ORCAMENTO_TOTAL = 5000;
let gastos = [];

// Selecionando elementos do DOM
const form = document.getElementById('form-gasto');
const inputDescricao = document.getElementById('descricao');
const inputValor = document.getElementById('valor');
const listaGastos = document.getElementById('lista-gastos');
const mensagemVazia = document.getElementById('mensagem-vazia');
const tabelaGastos = document.getElementById('tabela-gastos');

const valorGasto = document.getElementById('valor-gasto');
const valorSaldo = document.getElementById('valor-saldo');

// Formatar número para Moeda (R$)
const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
};

// Obter data atual formatada (DD/MM)
const obterDataAtual = () => {
    const data = new Date();
    return `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}`;
};

// Atualizar os cards de resumo
const atualizarResumo = () => {
    const total = gastos.reduce((acc, gasto) => acc + gasto.valor, 0);
    const saldo = ORCAMENTO_TOTAL - total;

    valorGasto.innerText = formatarMoeda(total);
    valorSaldo.innerText = formatarMoeda(saldo);

    // Mudar cor do saldo se ficar negativo
    if (saldo < 0) {
        valorSaldo.classList.remove('texto-verde');
        valorSaldo.classList.add('texto-vermelho');
    } else {
        valorSaldo.classList.remove('texto-vermelho');
        valorSaldo.classList.add('texto-verde');
    }
};

// Renderizar a tabela na tela
const renderizarTabela = () => {
    listaGastos.innerHTML = '';

    if (gastos.length === 0) {
        mensagemVazia.style.display = 'block';
        tabelaGastos.style.display = 'none';
    } else {
        mensagemVazia.style.display = 'none';
        tabelaGastos.style.display = 'table';

        gastos.forEach(gasto => {
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td style="color: var(--texto-secundario)">${gasto.data}</td>
                <td style="font-weight: 500">${gasto.descricao}</td>
                <td class="alinhar-direita texto-vermelho font-semibold">${formatarMoeda(gasto.valor)}</td>
                <td class="alinhar-centro">
                    <button class="btn-remover" onclick="removerGasto(${gasto.id})" title="Excluir">✕</button>
                </td>
            `;
            
            listaGastos.appendChild(tr);
        });
    }

    atualizarResumo();
};

// Adicionar novo gasto
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const descricao = inputDescricao.value.trim();
    const valor = parseFloat(inputValor.value);

    if (descricao === '' || isNaN(valor)) return;

    const novoGasto = {
        id: Date.now(),
        data: obterDataAtual(),
        descricao: descricao,
        valor: valor
    };

    gastos.unshift(novoGasto); // Coloca no topo da lista
    salvarNoLocalStorage();
    renderizarTabela();

    // Limpar inputs
    inputDescricao.value = '';
    inputValor.value = '';
    inputDescricao.focus();
});

// Remover gasto
window.removerGasto = (id) => {
    gastos = gastos.filter(gasto => gasto.id !== id);
    salvarNoLocalStorage();
    renderizarTabela();
};

// Persistência com LocalStorage
const salvarNoLocalStorage = () => {
    localStorage.setItem('gastosVanilla', JSON.stringify(gastos));
};

const carregarDoLocalStorage = () => {
    const dados = localStorage.getItem('gastosVanilla');
    if (dados) {
        gastos = JSON.parse(dados);
    }
    renderizarTabela();
};

// Iniciar app
carregarDoLocalStorage();