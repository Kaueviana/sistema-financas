const tbody = document.querySelector("tbody");
const descricao = document.querySelector("#desc");
const valo = document.querySelector("#valo");
const type = document.querySelector("#type");
const data = document.querySelector("#data");
const botaoN = document.querySelector("#botaoN");
const entradas = document.querySelector(".entradas");
const saidas = document.querySelector(".saidas");
const total = document.querySelector(".total");
const resumoDetalhado = document.querySelector("#resumoDetalhado");
const modalResumo = document.querySelector("#modalResumo");
const closeModal = document.querySelector(".close");
const detalhesEntradas = document.querySelector("#detalhesEntradas");
const detalhesSaidas = document.querySelector("#detalhesSaidas");
// Seletores para transações recentes
const transacoesRecentes = document.createElement("div");
transacoesRecentes.innerHTML = `
    <h3>Transações Recentes</h3>
    <ul id="listaTransacoesRecentes"></ul>
`;
modalResumo.querySelector(".modal-content").appendChild(transacoesRecentes);

document.getElementById("exportarTexto").addEventListener("click", () => {
    const entradas = Array.from(document.querySelectorAll("#detalhesEntradas li")).map(li => li.textContent);
    const saidas = Array.from(document.querySelectorAll("#detalhesSaidas li")).map(li => li.textContent);

    let texto = "Resumo Detalhado\n\n";
    texto += "Entradas:\n";
    entradas.forEach(entrada => {
        texto += `- ${entrada}\n`;
    });

    texto += "\nSaídas:\n";
    saidas.forEach(saida => {
        texto += `- ${saida}\n`;
    });

    // Criar um arquivo de texto e iniciar o download
    const blob = new Blob([texto], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "resumo_financeiro.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});





const dataInicio = document.querySelector("#dataInicio");
const dataFim = document.querySelector("#dataFim");
const botaoFiltrar = document.querySelector("#botaoFiltrar");

let items = [];
let chartInstance; // Variável global para armazenar a instância do gráfico

// Função para salvar os itens no LocalStorage
const getItensBD = () => JSON.parse(localStorage.getItem("db_items")) ?? [];
const setItensBD = () => localStorage.setItem("db_items", JSON.stringify(items));

// Função para carregar os itens na tabela
function loadItens() {
    items = getItensBD();
    renderItems(items);
    getTotals(items);
    renderizarGrafico(items); // Atualizar o gráfico sempre que os itens mudarem
}

// Função para renderizar os itens na tabela
function renderItems(itemsToRender) {
    tbody.innerHTML = "";
    itemsToRender.forEach((item, index) => {
        insertItem(item, index);
    });
}

// Função para inserir item na tabela
function insertItem(item, index) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td>${item.desc}</td>
        <td>R$ ${item.valo}</td>
        <td class="columnType">
            ${
                item.type === "Entrada"
                    ? '<i class="bx bxs-chevron-up-circle" style="color:green;"></i>'
                    : '<i class="bx bxs-chevron-down-circle" style="color:red;"></i>'
            }
        </td>
        <td>${item.data}</td>
        <td class="columnAction">
            <button onclick="deleteItem(${index})">
                <i class='bx bx-trash'></i>
            </button>
        </td>
    `;
    tbody.appendChild(tr);
}

// Função para calcular os totais
function getTotals(itemsToCalculate) {
    const totalEntradas = itemsToCalculate
        .filter((item) => item.type === "Entrada")
        .reduce((acc, cur) => acc + Number(cur.valo), 0)
        .toFixed(2);
    const totalSaidas = itemsToCalculate
        .filter((item) => item.type === "Saída")
        .reduce((acc, cur) => acc + Number(cur.valo), 0)
        .toFixed(2);

    entradas.textContent = totalEntradas;
    saidas.textContent = totalSaidas;
    total.textContent = (totalEntradas - totalSaidas).toFixed(2);
}

// Função para deletar um item
function deleteItem(index) {
    items.splice(index, 1);
    setItensBD();
    loadItens();
}

// Função para abrir o modal e exibir o resumo detalhado
resumoDetalhado.addEventListener("click", () => {
    detalhesEntradas.innerHTML = "";
    detalhesSaidas.innerHTML = "";
    const listaTransacoesRecentes = document.querySelector("#listaTransacoesRecentes");
    listaTransacoesRecentes.innerHTML = "";

    // Preencher entradas e saídas
    items
        .filter((item) => item.type === "Entrada")
        .forEach((item) => {
            const li = document.createElement("li");
            li.textContent = `${item.desc}: R$ ${item.valo}`;
            detalhesEntradas.appendChild(li);
        });

    items
        .filter((item) => item.type === "Saída")
        .forEach((item) => {
            const li = document.createElement("li");
            li.textContent = `${item.desc}: R$ ${item.valo}`;
            detalhesSaidas.appendChild(li);
        });

    // Adicionar transações recentes (últimos 5 itens)
    const ultimasTransacoes = items.slice(-5).reverse();
    ultimasTransacoes.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = `${item.data} - ${item.type} - ${item.desc}: R$ ${item.valo}`;
        listaTransacoesRecentes.appendChild(li);
    });

    modalResumo.style.display = "block";
});


// Fechar o modal
closeModal.addEventListener("click", () => {
    modalResumo.style.display = "none";
});

// Adicionar novo item
botaoN.addEventListener("click", () => {
    if (descricao.value === "" || valo.value === "" || type.value === "" || data.value === "") {
        alert("Preencha todos os campos!");
        return;
    }

    items.push({
        desc: descricao.value,
        valo: parseFloat(valo.value).toFixed(2),
        type: type.value,
        data: data.value,
    });

    setItensBD();
    loadItens();

    descricao.value = "";
    valo.value = "";
    data.value = "";
});

// Função para renderizar o gráfico
function renderizarGrafico(itemsToRender) {
    const ctx = document.getElementById('graficoResumo').getContext('2d');

    // Destruir gráfico existente, se houver
    if (chartInstance) {
        chartInstance.destroy();
    }

    const data = {
        labels: ['Entradas', 'Saídas', 'Total'],
        datasets: [{
            label: 'Resumo Financeiro',
            data: [
                itemsToRender.reduce((acc, cur) => cur.type === 'Entrada' ? acc + Number(cur.valo) : acc, 0),
                itemsToRender.reduce((acc, cur) => cur.type === 'Saída' ? acc + Number(cur.valo) : acc, 0),
                itemsToRender.reduce((acc, cur) => cur.type === 'Entrada' ? acc + Number(cur.valo) : acc, 0) -
                itemsToRender.reduce((acc, cur) => cur.type === 'Saída' ? acc + Number(cur.valo) : acc, 0),
            ],
            backgroundColor: [
                'rgb(0, 255, 38)',
                'rgb(255, 0, 55)',
                'rgb(0, 153, 255)'
            ],
            borderColor: [
                'rgb(255, 255, 255)',
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)'
            ],
            borderWidth: 1
        }]
    };

    const config = {
        type: 'bar',
        data: data,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    };

    chartInstance = new Chart(ctx, config);
}

// Função para filtrar itens por data
botaoFiltrar.addEventListener("click", () => {
    const inicio = new Date(dataInicio.value);
    const fim = new Date(dataFim.value);

    const filteredItems = items.filter((item) => {
        const itemDate = new Date(item.data);
        return itemDate >= inicio && itemDate <= fim;
    });

    renderItems(filteredItems);
    getTotals(filteredItems);
    renderizarGrafico(filteredItems);
});


document.getElementById("exportarCSV").addEventListener("click", () => {
    const entradas = Array.from(document.querySelectorAll("#detalhesEntradas li")).map(li => li.textContent);
    const saidas = Array.from(document.querySelectorAll("#detalhesSaidas li")).map(li => li.textContent);

    let csvContent = "data:text/csv;charset=utf-8,";

    // Cabeçalhos do CSV
    csvContent += "Tipo,Descrição,Valor\n";

    // Adiciona as entradas ao CSV
    entradas.forEach(entrada => {
        csvContent += `Entrada,${entrada.replace(": R$", ",")}\n`;
    });

    // Adiciona as saídas ao CSV
    saidas.forEach(saida => {
        csvContent += `Saída,${saida.replace(": R$", ",")}\n`;
    });

    // Criar e iniciar o download do arquivo CSV
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = "resumo_financeiro.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});




document.getElementById("exportarTexto").addEventListener("click", () => {
    const entradas = Array.from(document.querySelectorAll("#detalhesEntradas li")).map(li => li.textContent);
    const saidas = Array.from(document.querySelectorAll("#detalhesSaidas li")).map(li => li.textContent);

    let texto = "Resumo Detalhado\n\n";
    texto += "Entradas:\n";
    entradas.forEach(entrada => {
        texto += `- ${entrada}\n`;
    });

    texto += "\nSaídas:\n";
    saidas.forEach(saida => {
        texto += `- ${saida}\n`;
    });

    // Criar um arquivo de texto e iniciar o download
    const blob = new Blob([texto], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "resumo_financeiro.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});



// Inicializar
loadItens();
