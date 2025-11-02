document.addEventListener('DOMContentLoaded', async () => {

    const urlParams = new URLSearchParams(window.location.search);
    const idDaMarca = urlParams.get('id');

    const urlFetch = `../../../../backend/Admin/Marcas/ListarMarcaPorID.php?id_marca=${idDaMarca}`;

    const editar_marca = await fetch(urlFetch);
    const marca = await editar_marca.json();

    console.log(marca)

    //// colocar o resultado no front

    let nome = document.getElementById("nome_marca").value = marca.nome;
    let modelo = document.getElementById("Modelo").value = marca.modelo;
    let site = document.getElementById("site_oficial").value = marca.site_oficial;
    let pais = document.getElementById("pais_origem").value = marca.pais_origem;
    let titulo = document.getElementById("titulo_marca").textContent = `Marca ID:${marca.id_marca}`
    document.getElementById("id_marca").value = marca.id_marca;

    // montar objeto para view

    let data_cadastro = marca.data_cadastro;

    const dados = {
        'nome': nome,
        'modelo': modelo,
        'site': site,
        'pais': pais,
        'titulo': titulo,
        'data_cadastro': data_cadastro
    }

    console.log(dados);

    await MarcaView(dados);
})

function MarcaView(marca) {

    const container = document.getElementById('Marca_view');
    if (!container) {
        console.error("Erro: Elemento 'Marca_view' não foi encontrado.");
        return;
    }

    if (!marca || typeof marca !== 'object') {
        console.error("Erro: Dados inválidos enviados para MarcaView.");
        container.innerHTML = "<p>Erro ao carregar dados.</p>";
        return;
    }

    const htmlDaMarca = `
       <div class="card-marca" id="marca-${marca.id_marca}">
            <h3 class="card-marca-titulo">${marca.nome}</h3>
            <p class="card-marca-info">Modelo: ${marca.modelo}</p>
            <p class="card-marca-info">Título: ${marca.titulo}</p>
            <p class="card-marca-info">País: ${marca.pais}</p>
            <p class="card-marca-info">Data: ${marca.data_cadastro}</p>
            <a href="${marca.site}" target="_blank" class="card-marca-link">Site Oficial</a>
        </div>
    `;

    container.innerHTML = htmlDaMarca;
}
