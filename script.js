/* --- 1. CONFIGURAÇÕES E DADOS INICIAIS --- */
const CONFIG = { limite: 10 };

// Tenta carregar o que está no navegador
let produtosDB = JSON.parse(localStorage.getItem("produtos"));

// SE ESTIVER VAZIO (Primeiro acesso do usuário), injeta dados de exemplo
if (!produtosDB || !Array.isArray(produtosDB) || produtosDB.length === 0) {
    produtosDB = [
        { id: 1, nome: "Arroz 5kg", quantidade: 8, preco: 25.90 },
        { id: 2, nome: "Feijão Preto 1kg", quantidade: 45, preco: 8.50 },
        { id: 3, nome: "Leite Integral 1L", quantidade: 120, preco: 4.80 }
    ];
    localStorage.setItem("produtos", JSON.stringify(produtosDB));
}

let produtos = produtosDB;
let historico = JSON.parse(localStorage.getItem("historico")) || [];

window.onload = () => atualizarTela();

/* --- 2. PERSISTÊNCIA --- */
function salvar() {
    localStorage.setItem("produtos", JSON.stringify(produtos));
    localStorage.setItem("historico", JSON.stringify(historico));
    atualizarTela();
}

function atualizarTela() {
    renderLista();
    renderLog();
    renderDash();
}

/* --- 3. LÓGICA DO INVENTÁRIO --- */
function adicionarProduto() {
    const nome = document.getElementById("nome").value;
    const qtd = Number(document.getElementById("quantidade").value);
    const preco = Number(document.getElementById("preco").value);

    if (!nome || qtd < 0 || preco < 0) return alert("Por favor, insira dados válidos.");

    produtos.push({ id: Date.now(), nome, quantidade: qtd, preco });
    registrarLog(nome, "Cadastro", qtd);
    
    document.getElementById("nome").value = "";
    document.getElementById("quantidade").value = "";
    document.getElementById("preco").value = "";
    
    salvar();
}

function alterar(i, val) {
    if (produtos[i].quantidade + val < 0) return;
    produtos[i].quantidade += val;
    registrarLog(produtos[i].nome, val > 0 ? "Entrada" : "Saída", Math.abs(val));
    salvar();
}

function editar(i) {
    let novoNome = prompt("Editar nome do produto:", produtos[i].nome);
    let novoPreco = prompt("Editar preço unitário:", produtos[i].preco);
    
    if (novoNome !== null && novoPreco !== null) {
        produtos[i].nome = novoNome;
        produtos[i].preco = Number(novoPreco);
        registrarLog(produtos[i].nome, "Edição", 0);
        salvar();
    }
}

function deletar(i) {
    if (confirm(`Tem certeza que deseja excluir "${produtos[i].nome}"?`)) {
        const nomeRemovido = produtos[i].nome;
        produtos.splice(i, 1);
        registrarLog(nomeRemovido, "Exclusão", 0);
        salvar();
    }
}

/* --- 4. RENDERIZAÇÃO --- */
function renderDash() {
    let totalDinheiro = 0, totalItens = 0, criticos = 0;
    let listaCriticosHTML = "";

    produtos.forEach(p => {
        totalDinheiro += (p.preco * p.quantidade);
        totalItens += p.quantidade;
        if (p.quantidade < CONFIG.limite) {
            criticos++;
            listaCriticosHTML += `<li>⚠️ ${p.nome} (Qtd: ${p.quantidade})</li>`;
        }
    });

    document.getElementById("dashTotal").innerText = totalDinheiro.toFixed(2);
    document.getElementById("dashItens").innerText = totalItens;
    document.getElementById("dashCritico").innerText = criticos;

    const cards = document.querySelectorAll('.detalhes-dashboard ul');
    cards[0].innerHTML = `<li>Investimento em ${produtos.length} itens.</li>`;
    cards[1].innerHTML = listaCriticosHTML || `<li>✔ Estoque regularizado.</li>`;
    cards[2].innerHTML = `<li>Média de ${(totalItens / (produtos.length || 1)).toFixed(1)} un. por produto.</li>`;
}

function renderLista() {
    const lista = document.getElementById("lista");
    lista.innerHTML = "";
    produtos.forEach((p, i) => {
        const li = document.createElement("li");
        if (p.quantidade < CONFIG.limite) li.style.borderLeftColor = "var(--danger)";
        
        li.innerHTML = `
            <span><strong>${p.nome}</strong> | R$ ${p.preco.toFixed(2)} | Qtd: ${p.quantidade}</span>
            <div class="controles">
                <button class="btn-add" onclick="alterar(${i}, 1)">+</button>
                <button class="btn-sub" onclick="alterar(${i}, -1)">-</button>
                <button class="btn-edit" onclick="editar(${i})"><i class="fas fa-edit"></i></button>
                <button class="btn-del" onclick="deletar(${i})"><i class="fas fa-trash-alt"></i></button>
            </div>`;
        lista.appendChild(li);
    });
}

function registrarLog(prod, acao, q) {
    const data = new Date().toLocaleTimeString();
    historico.unshift({ msg: `[${data}] ${acao}: ${prod} (${q} un)` });
    if (historico.length > 20) historico.pop();
}

function renderLog() {
    const log = document.getElementById("listaHistorico");
    log.innerHTML = "";
    historico.forEach(h => {
        const li = document.createElement("li");
        li.innerText = h.msg;
        log.appendChild(li);
    });
}

function limparHistorico() {
    if(confirm("Deseja apagar todo o histórico?")) { historico = []; salvar(); }
}
