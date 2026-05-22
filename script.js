// Conexão com Supabase
const clienteSupabase = window.supabase.createClient(
    "https://fqgabqwyvutmocibybzd.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxZ2FicXd5dnV0bW9jaWJ5YnpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzOTkxODAsImV4cCI6MjA5NDk3NTE4MH0.MRQyIIUw7LAZFtzq6-yPS2lLB72F5a75eQtaYjujrSw"
);

let gastos = [];
const ORC = 5000;

// Formatador de Moeda
const f = v => new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(v);

function render() {
    let total = gastos.reduce((a, b) => a + Number(b.valor), 0);

    document.getElementById("gasto").innerText = f(total);
    document.getElementById("saldo").innerText = f(ORC - total);

    const list = document.getElementById("list");
    const empty = document.getElementById("empty");

    list.innerHTML = "";
    empty.style.display = gastos.length ? "none" : "block";

    gastos.forEach(g => {
        list.innerHTML += `
        <tr>
            <td>${g.data}</td>
            <td>${g.descricao}</td>
            <td>${f(g.valor)}</td>
            <td><span class="delete" onclick="del('${g.id}')">✕</span></td>
        </tr>`;
    });
}

async function load() {
    const {data} = await clienteSupabase.from("gastos").select("*").order('created_at', { ascending: false });
    gastos = data || [];
    render();
}

document.getElementById("form").addEventListener("submit", async e => {
    e.preventDefault();

    const descInput = document.getElementById("desc");
    const valInput = document.getElementById("val");
    
    const descricao = descInput.value.trim();
    const valor = parseFloat(valInput.value);

    if (!descricao || isNaN(valor)) return;

    const btn = e.target.querySelector("button");
    btn.innerText = "Salvando...";
    btn.disabled = true;

    const {data, error} = await clienteSupabase.from("gastos")
    .insert([{
        descricao: descricao, 
        valor: valor, 
        data: new Date().toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})
    }])
    .select();

    if (error) {
        console.error(error);
        alert("Erro ao salvar! Verifique se desativou o RLS no Supabase.");
    } else if (data) {
        gastos.unshift(data[0]);
        render();
        descInput.value = "";
        valInput.value = "";
        descInput.focus();
    }

    btn.innerText = "Adicionar";
    btn.disabled = false;
});

window.del = async (id) => {
    if(!confirm("Tem certeza que deseja apagar?")) return;
    
    await clienteSupabase.from("gastos").delete().eq("id", id);
    gastos = gastos.filter(g => g.id != id);
    render();
}

// Inicia puxando os dados
load();