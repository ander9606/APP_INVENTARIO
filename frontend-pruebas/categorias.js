//cargar categorias padre en el formulario- para que el usuario pueda seleccionar
async function cargarCategoriasEnSelect(){
    try {
        const res = await fetch(API_CATEGORIAS);
        const categorias = await res.json();

        const select = document.getElementById(`categoria_padre_id`);
        select.innerHTML = `<option value="">Ninguna (Categoria RAIZ)</option>`;

        categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.id;
            option.textContent = categoria.nombre;
            select.appendChild(option);
        });
    } catch (error) {
        console.error (`Error al cargar las categorias: ${error}`)
    }
}

// crear categorias nuevas
document.getElementById(`form-nueva-categoria`).addEventListener("submit",async (e)=>{
    e.preventDefault();

    const nombre = document.getElementById(`nombre`).value.trim()
    const categoriaPadreId = document.getElementById(`categoria_padre_id`).value|| null;

    if (!nombre) return;

    try {
        const res = await fetch(API_CATEGORIAS, {       
            method: `POST`,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre,
                categoria_padre_id: categoriaPadreId
            })
            
        });

        if (res.ok){
            document.getElementById(`msg-categoria`).textContent = `✅ Categoria creada correctamente`;
            document.getElementById(`form-nueva-categoria`).reset();
            cargarCategoriasEnSelect(); // Recargar las categorias en el select
            cargarCategoriasJerarquia(); // Recargar la jerarquía de categorías
        } else {
            const errorData = await res.json();
            document.getElementById(`msg-categoria`).textContent = `❌ Error al crear la categoria: ${errorData.message}`;
        }
    } catch (error) {
        console.error(`Error al crear la categoria: ${error}`);
        document.getElementById(`msg-categoria`).textContent = `❌ Error al crear la categoria: ${error.message}`;
    }
});

// renderizar categorias en un arbol jerarquico
async function cargarCategoriasJerarquia() {
    try {
        const res = await fetch(`${API_CATEGORIAS}/jerarquia`);
        const categorias = await res.json();

        const contenedor = document.getElementById(`lista-categorias-jerarquicas`);
        contenedor.innerHTML = ''; // Limpiar el contenedor

        categorias.forEach(categoria => {
            contenedor.appendChild(crearnodoCategoria(categoria))
        })
    }catch (error) {
        console.error(`Error al cargar las categorias jerarquicas: ${error}`);
    }
}

// Crear un nodo de categoria para el arbol jerarquico
function crearnodoCategoria(categoria) {
    const li = document.createElement('li');
    li.textContent = categoria.nombre;

    //boton para eliminar categoria
    const btn = document.createElement(`button`);
    btn.textContent =`Eliminar`;
    btn.dataset.id = categoria.id;
    btn.style.marginLeft = '10px';
    btn.addEventListener('click', () => eliminarCategoria(categoria.id));
    li.appendChild(btn);

    // Si tiene subcategorías, crear un sublista// hijos
    if (categoria.hijos && categoria.hijos.length >0){
        const ul = document.createElement("ul");
        categoria.hijos.forEach(hijo => ul.appendChild(crearnodoCategoria(hijo)));
        li.appendChild(ul);
    }
    return li;
}

// Eliminar una categoria
async function eliminarCategoria(id) {
    const confirmacion = confirm(`¿Estás seguro de que quieres eliminar esta categoría? Esta acción no se puede deshacer.`);
    if (!confirmacion) return;

    try {const res = await fetch(`${API_CATEGORIAS}/${id}`, { method: 'DELETE' });
        if (res.ok){
            alert(`❎ Categoria eliminada correctamente`);
            cargarCategoriasJerarquia(); // Recargar la jerarquía de categorías
            cargarCategoriasEnSelect(); // Recargar las categorias en el select
        } else {
            const errorData = await res.json();
            alert(`❌ Error al eliminar la categoria: ${errorData.message}`);
        }
        
    } catch (error) {
        console.error(`Error al eliminar la categoria: ${error}`);
        alert(`❌ Error al eliminar la categoria: ${error.message}`);
    }
}

// inicializar categorias al cargar la pagina
document.addEventListener('DOMContentLoaded', () => {
    cargarCategoriasEnSelect();
    cargarCategoriasJerarquia();
});