// Renderizar lista de categorías en árbol
function renderListaCategorias(categorias, nivel = 0) {
    let html = "";
    for (const cat of categorias) {
        html += `<li style="margin-left:${nivel * 20}px">📁 ${cat.nombre}</li>`;
        if (cat.hijos && cat.hijos.length > 0) {
            html += renderListaCategorias(cat.hijos, nivel + 1);
        }
    }
    return html;
}

// Cargar todas las categorías en listado
async function cargarCategorias() {
    const lista = document.getElementById("lista-categorias");
    try {
        const res = await fetch(API_CATEGORIAS);
        if (!res.ok) throw new Error(`Error al cargar categorias: ${res.status}`);

        const data = await res.json();
        lista.innerHTML = renderListaCategorias(data);
    } catch (error) {
        console.error(error);
        lista.innerHTML = `<li>Error al cargar categorías</li>`;
    }
}

// Cargar categorías en el select de "padre"
async function cargarCategoriasPadre() {
    const select = document.getElementById("categoria_padre_id");
    select.innerHTML = `<option value="">Ninguna (Categoría raíz)</option>`;
    try {
        const res = await fetch(API_CATEGORIAS);
        const categorias = await res.json();

        function agregarOpciones(cats, prefijo = "") {
            cats.forEach(cat => {
                const option = document.createElement("option");
                option.value = cat.id;
                option.textContent = prefijo + cat.nombre;
                select.appendChild(option);

                if (cat.hijos && cat.hijos.length > 0) {
                    agregarOpciones(cat.hijos, prefijo + "— ");
                }
            });
        }
        agregarOpciones(categorias);
    } catch (error) {
        console.error("Error cargando categorías padre:", error);
    }
}

// cargar categorias jerarquicas
async function cargarCategoriasJerarquicas() {
    try {
        const res = await fetch(`${API_CATEGORIAS}/jerarquia`);
        const categorias = await res.json();

        const lista = document.getElementById(`lista-categorias-jerarquicas`);
        lista.innerHTML = ``;
        renderJerarquia(categorias, lista);
    } catch (err) {
        console.error("Error al cargar categorías jerárquicas:", err);
    }
}

function renderJerarquia(categorias, contenedor){
    categorias.forEach(cat =>{
        const li = document.createElement(`li`);
        li.textContent= cat.nombre;

        if (cat.hijos && cat.hijos.length> 0){
            const ul = document.createElement(`ul`);
            renderJerarquia(cat.hijos, ul);
            li.appendChild(ul);
        }
        contenedor.appendChild(li)
    })
}
// Mostrar mensaje temporal
function mostrarMensaje(id, texto, tipo="info") {
    const msg = document.getElementById(id);
    msg.textContent = texto;
    msg.className = `mensaje ${tipo}`;
    setTimeout(() => msg.textContent = "", 3000);
}

// Configurar formulario para crear categoría
function configurarFormularioCategoria() {
    const form = document.getElementById("form-nueva-categoria");
    const boton = form.querySelector("button");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        boton.disabled = true;

        const nombre = document.getElementById("nombre").value.trim();
        const padre_id = document.getElementById("categoria_padre_id").value || null;

        try {
            const res = await fetch(API_CATEGORIAS, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre, padre_id })
            });

            if (!res.ok) throw new Error(`Error al crear categoría: ${res.status}`);

            mostrarMensaje("msg-categoria", "✅ Categoría creada correctamente", "ok");

            cargarCategorias();
            cargarCategoriasPadre();
            cargarCategoriasJerarquicas();
            form.reset();

        } catch (error) {
            console.error("Error al crear categoría:", error);
            mostrarMensaje("msg-categoria", "❌ Error al crear categoría", "error");
        } finally {
            boton.disabled = false;
        }
    });
}

// Inicializar página
document.addEventListener("DOMContentLoaded", () => {
    cargarCategorias();
    cargarCategoriasPadre();
    cargarCategoriasJerarquicas();
    configurarFormularioCategoria();
    mostrarMensaje()
});
