    /********************************************
     * main.js - Gestión de inventario frontend
     ********************************************/

    /* ==========
    CONSTANTES Y CONFIGURACIÓN
    ========== */
    const elementosDOM = {
        listaElementos: document.getElementById('lista-elementos'),
        listaSeries: document.getElementById('lista-series'),
        selectCategoria: document.getElementById('categoria'),
        selectSubcategoria: document.getElementById('subcategoria'),
        selectMaterial: document.getElementById('material'),
        selectUnidad: document.getElementById('unidad'),
        formElemento: document.getElementById('form-elemento'),
        btnAgregar: document.getElementById('btn-agregar'),
        formularioNuevo: document.getElementById('formulario-nuevo'),
        modalSeries: document.getElementById('modal-series'),
        cerrarModalSeries: document.getElementById('cerrar-modal-series'),
        seriesContainer: document.getElementById('series-container')
        
    };

    const mapas = {
        categorias: {},
        subcategorias: {},
        materiales: {},
        unidades: {}
    };

    const requiereSeriesCheckbox = elementosDOM.formElemento.requiere_series;
    const cantidadInput = elementosDOM.formElemento.cantidad;
    const seriesContainer = elementosDOM.seriesContainer; // Falta esta constante

    /* ==========
    FUNCIONES AUXILIARES PARA LA API
    ========== */
    async function manejarPeticionAPI(url, metodo = 'GET', data = null) {
        const opciones = {
            method: metodo,
            headers: { 'Content-Type': 'application/json' }
        };
        if (data) {
            opciones.body = JSON.stringify(data);
        }

        try {
            const res = await fetch(url, opciones);
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: res.statusText }));
                throw new Error(`HTTP ${res.status}: ${errorData.message || 'Error desconocido'}`);
            }
            return res.status === 204 ? {} : await res.json();
        } catch (error) {
            console.error(`❌ Error en la petición a ${url} (${metodo}):`, error);
            alert(`Error de comunicación con la API: ${error.message}`);
            throw error;
        }
    }

    /* ==========
    LÓGICA DE LA APLICACIÓN
    ========== */

    function crearInputSerie(index) {
        const div = document.createElement('div');
        div.className = 'serie-input';

        div.innerHTML = `
        <label>Serie ${index + 1}: </label>
        <input name="numero_serie_${index}" placeholder="Número de serie" required>
        <select name="estado_${index}" required>
            <option value="">Seleccione estado</option>
            <option value="nuevo">Nuevo</option>
            <option value="usado">Usado</option>
            <option value="dañado">Dañado</option>
        </select>
        <input name="ubicacion_${index}" placeholder="Ubicación individual" required>`;

        return div;
    }

    function actualizarInputSeries() {
        if (requiereSeriesCheckbox.checked) {
            seriesContainer.style.display = 'block';
            seriesContainer.innerHTML = ''; // Limpiar contenido previo

            const cantidad = parseInt(cantidadInput.value) || 0;

            for (let i = 0; i < cantidad; i++) {
                seriesContainer.appendChild(crearInputSerie(i));
            } 
        } else {
            seriesContainer.style.display = 'none';
            seriesContainer.innerHTML = ''; // Limpiar contenido previo
        }
    }

    // actualiza inputs cuando cambian cantidad o checkbox
    cantidadInput.addEventListener('input', () => {
        if (requiereSeriesCheckbox.checked) actualizarInputSeries();
    });

    requiereSeriesCheckbox.addEventListener('change', () => {
        actualizarInputSeries();
    });

    // capturar datos de series al enviar el formulario
    elementosDOM.formElemento.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(elementosDOM.formElemento);

        const nombre = formData.get('nombre').trim();
        const descripcion = formData.get('descripcion').trim();
        const subcategoria_id = formData.get('subcategoria') || null; // Usar subcategoría si existe
        const categoria_id = formData.get('categoria');
        const material_id = formData.get('material');
        const unidad_id = formData.get('unidad');
        const cantidad = parseInt(formData.get('cantidad'), 10);
        const lleva_serie = formData.get('requiere_series') === 'on';

        let ubicacionGeneral = formData.get('ubicacion') || '';

        // Armar array de series
        const series = [];
        if (lleva_serie) {
            for (let i = 0; i < cantidad; i++) {
                const numero_serie = formData.get(`numero_serie_${i}`).trim();
                const estado = formData.get(`estado_${i}`);
                const ubicacion = formData.get(`ubicacion_${i}`).trim();

                if (!numero_serie || !ubicacion || !estado) {
                    alert(`Complete todos los campos para la serie #${i + 1}`);
                    return;
                }

                series.push({ numero_serie, estado, ubicacion });
            }
            ubicacionGeneral = null; // porque cada serie tiene su propia ubicación
        }

        const data = {
            nombre,
            descripcion,
            categoria_id,
            subcategoria_id,
            material_id,
            unidad_id,
            cantidad,
            lleva_serie,
            ubicacion: ubicacionGeneral,
            series
        };

        try {
            await manejarPeticionAPI(API_URL, 'POST', data);
            alert('Elemento guardado con éxito');
            elementosDOM.formElemento.reset();
            seriesContainer.innerHTML = '';
            elementosDOM.formularioNuevo.classList.add('oculto');
            cargarElementos();
        } catch (error) {
            console.error('Error guardando elemento:', error);
            alert('Error guardando elemento');
        }
    });

    async function cargarCatalogo(selectElemento, url, mapa, textoDefault) {
        selectElemento.innerHTML = `<option value="">${textoDefault}</option>`;
        try {
            const datos = await manejarPeticionAPI(url);
            datos.forEach(item => {
                const opt = document.createElement('option');
                opt.value = item.id;
                mapa[item.id] = item.nombre;
                opt.textContent = item.nombre;
                selectElemento.appendChild(opt);
            });
        } catch (err) {
            console.error(`❌ Error cargando catálogo desde ${url}`, err);
            selectElemento.innerHTML = `<option value="">Error al cargar</option>`;
        }
    }

    async function cargarSubcategorias(categoriaId) {
        elementosDOM.selectSubcategoria.innerHTML = `<option value="">Seleccione una subcategoría</option>`;
        mapas.subcategorias = {}; // Limpiar mapa de subcategorías

        if (!categoriaId){
            elementosDOM.selectSubcategoria.disabled = true;
            return;
        }

        try {
            const subcategorias = await manejarPeticionAPI(`${API_CATEGORIAS}/${categoriaId}/subcategorias`);
            subcategorias.forEach(subcat => {
                const option = document.createElement(`option`);
                option.value = subcat.id;
                option.textContent = subcat.nombre;
                elementosDOM.selectSubcategoria.appendChild(option);

                // Guardar en el mapa para uso posterior
                mapas.subcategorias[subcat.id] = subcat.nombre;
            });
            elementosDOM.selectSubcategoria.disabled= false;

        } catch (err){
            console.error(`❌ Error cargando subcategorías: ${err}`);
            elementosDOM.selectSubcategoria.innerHTML = `<option value="">Error al cargar</option>`;
            elementosDOM.selectSubcategoria.disabled = true;
        }
        
    }

    async function cargarElementos() {
        const contenedor = elementosDOM.listaElementos;
        contenedor.innerHTML = `<p>Cargando elementos...</p>`;

        try {
            const lista = await manejarPeticionAPI(API_URL);

            if (!Array.isArray(lista) || lista.length === 0) {
                contenedor.innerHTML = `<p>No hay elementos registrados.</p>`;
                return;
            }

            const tabla = document.createElement('table');
            tabla.classList.add('tabla-elementos');
            tabla.innerHTML = `
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Categoría</th>
                        <th>Subcategoria</th>
                        <th>Material</th>
                        <th>Cantidad</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;

            const tbody = tabla.querySelector('tbody');

            lista.forEach(elem => {
                const tr = document.createElement('tr');
                
                tr.innerHTML = `
                    <td data-label="Nombre">${elem.nombre}</td>
                    <td data-label="Categoría">${mapas.categorias[elem.categoria_id] || 'N/A'}</td>
                    <td data-label="Subcategoría">${mapas.subcategorias[elem.subcategoria_id] || 'N/A'}</td>
                    <td data-label="Material">${mapas.materiales[elem.material_id] || 'N/A'}</td>
                    <td data-label="Cantidad">${elem.cantidad}</td>
                    <td data-label="Acciones">
                        ${elem.requiere_series ? `<button data-id="${elem.id}" class="btn-series">Ver series</button>` : ''}
                        <button data-id="${elem.id}" class="btn-eliminar">Eliminar</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            contenedor.innerHTML = '';
            contenedor.appendChild(tabla);
        } catch (err) {
            console.error('❌ Error cargando elementos', err);
            contenedor.innerHTML = `<p>Error al cargar elementos. Revisa la consola y asegúrate que el backend está funcionando.</p>`;
        }
    }

    async function mostrarSeries(id_elemento) {
        const contenedor = elementosDOM.listaSeries;
        contenedor.innerHTML = `<p>Cargando series...</p>`;
        elementosDOM.modalSeries.classList.add('activo');

        try {
            const series = await manejarPeticionAPI(`${API_SERIES}/${id_elemento}`);

            if (!Array.isArray(series) || series.length === 0) {
                contenedor.innerHTML = `<p>No hay series registradas para este elemento.</p>`;
                return;
            }

            contenedor.innerHTML = '';
            series.forEach(s => {
                const li = document.createElement('li');
                li.textContent = `Serie: ${s.numero_serie} - Estado: ${s.estado} - Ubicación: ${s.ubicacion || 'N/A'}`;
                contenedor.appendChild(li);
            });

        } catch (err) {
            console.error('❌ Error mostrando series', err);
            contenedor.innerHTML = `<p>Error al cargar series.</p>`;
        }
    }

    async function eliminarElemento(id) {
        if (!confirm('¿Seguro que quieres eliminar este elemento?')) return;

        try {
            await manejarPeticionAPI(`${API_URL}/${id}`, 'DELETE');
            alert('Elemento eliminado correctamente');
            cargarElementos();
        } catch (err) {
            console.error('❌ Error eliminando elemento', err);
            alert(`Error al eliminar: ${err.message}`);
        }
    }

    /* ==========
    INICIALIZACIÓN
    ========== */
    function inicializarEventos() {
        elementosDOM.btnAgregar.addEventListener('click', () => {
            elementosDOM.formularioNuevo.classList.toggle('oculto');
        });

        elementosDOM.listaElementos.addEventListener('click', e => {
            const id = e.target.dataset.id;
            if (!id) return;

            if (e.target.classList.contains('btn-series')) {
                mostrarSeries(id);
            }
            if (e.target.classList.contains('btn-eliminar')) {
                eliminarElemento(id);
            }
        });

        elementosDOM.cerrarModalSeries.addEventListener('click', () => {
            elementosDOM.modalSeries.classList.remove('activo');
        });

        elementosDOM.modalSeries.addEventListener('click', e => {
            if (e.target === elementosDOM.modalSeries) {
                elementosDOM.modalSeries.classList.remove('activo');
            }
        });

        document.addEventListener('keydown', e => {
            if (e.key === "Escape" && elementosDOM.modalSeries.classList.contains('activo')) {
                elementosDOM.modalSeries.classList.remove('activo');
            }
        });

        // Eventos para inputs dinámicos
        cantidadInput.addEventListener('input', () => {
            if (requiereSeriesCheckbox.checked) actualizarInputSeries();
        });
        requiereSeriesCheckbox.addEventListener('change', () => {
            actualizarInputSeries();
        });
        // Cargar categorías y subcategorías al iniciar
        elementosDOM.selectCategoria.addEventListener(`change`, (e)=>{
            const categoriaId = e.target.value;
            cargarSubcategorias(categoriaId);
        })
    }

    document.addEventListener('DOMContentLoaded', async () => {
        await Promise.all([
            cargarCatalogo(elementosDOM.selectCategoria, API_CATEGORIAS, mapas.categorias, 'Seleccione categoría'),
            cargarCatalogo(elementosDOM.selectMaterial, API_MATERIALES, mapas.materiales, 'Seleccione material'),
            cargarCatalogo(elementosDOM.selectUnidad, API_UNIDADES, mapas.unidades, 'Seleccione unidad')
        ]);
        elementosDOM.selectSubcategoria.disabled = true; // Deshabilitar hasta seleccionar categoría

        cargarElementos();
        inicializarEventos();
    });
