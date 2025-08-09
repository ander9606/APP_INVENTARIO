/* main.js
   - Depende de las constantes definidas en config.js:
     API_URL, API_CATEGORIAS, API_MATERIALES, API_UNIDADES, API_SERIES
*/

// mapas para transformar ids -> nombres (categoría, material, unidad)
const mapas = {
  categorias: {},
  materiales: {},
  unidades: {}
};

// ------  util: check response ok  ------
async function fetchJson(url, opts = {}) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} - ${text}`);
  }
  return res.json();
}

// ------ cargar catálogo y poblar <select> ------
async function cargarCatalogo(api, selectId, mapa, label = 'Seleccione') {
  try {
    const data = await fetchJson(api);

    // poblar mapa
    data.forEach(item => {
      // si el backend devuelve { id, nombre }
      mapa[item.id] = item.nombre ?? item.nombre_completo ?? item.name ?? item.descripcion ?? item.label;
    });

    // poblar select (si existe)
    const select = document.getElementById(selectId);
    if (select) {
      select.innerHTML = `<option value="">${label}</option>`;
      data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = mapa[item.id] || item.nombre || item.name;
        select.appendChild(option);
      });
    }
  } catch (err) {
    console.error(`Error cargando catálogo ${selectId}:`, err);
    const select = document.getElementById(selectId);
    if (select) select.innerHTML = `<option value="">Error al cargar</option>`;
  }
}

// ------ cargar y renderizar lista general de elementos ------
async function cargarElementos() {
  try {
    const elementos = await fetchJson(API_URL);

    const cont = document.getElementById('contenedor-elementos');
    if (!cont) return;

    // si no hay elementos, mostrar aviso
    if (!Array.isArray(elementos) || elementos.length === 0) {
      cont.innerHTML = `<p>No se encontraron elementos.</p>`;
      return;
    }

    // crear tabla
    const table = document.createElement('table');
    table.style.width = '100%';
    table.className = 'tabla-elementos';
    table.innerHTML = `
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Descripción</th>
          <th>Categoría</th>
          <th>Material</th>
          <th>Unidad</th>
          <th>Cantidad</th>
          <th>Serie</th>
          <th>Acciones</th>
        </tr>
      </thead>
    `;
    const tbody = document.createElement('tbody');

    elementos.forEach(el => {
      const tr = document.createElement('tr');

      // Helpers para campos que pueden venir con nombres distintos
      const categoriaId = el.categoria_id ?? el.categoria ?? el.categoriaId ?? null;
      const materialId  = el.material_id ?? el.material ?? el.materialId ?? null;
      const unidadId    = el.unidad_id ?? el.unidad ?? el.unidadId ?? null;
      const cantidadVal = el.cantidad ?? el.cantidad_actual ?? el.stock ?? 0;
      const nombreVal   = el.nombre ?? el.name ?? '';
      const descripcionVal = el.descripcion ?? el.description ?? '';

      const llevaSerie = Boolean(
        el.requiere_series ?? el.lleva_serie ?? el.llevaSerie ?? el.tiene_serie ?? false
      );

      // celdas básicas
      const tdNombre = document.createElement('td'); tdNombre.textContent = nombreVal; tr.appendChild(tdNombre);
      const tdDesc   = document.createElement('td'); tdDesc.textContent = descripcionVal; tr.appendChild(tdDesc);

      const tdCat = document.createElement('td');
      tdCat.textContent = mapas.categorias[categoriaId] || 'Sin categoría';
      tr.appendChild(tdCat);

      const tdMat = document.createElement('td');
      tdMat.textContent = mapas.materiales[materialId] || 'Sin material';
      tr.appendChild(tdMat);

      const tdUni = document.createElement('td');
      tdUni.textContent = mapas.unidades[unidadId] || 'Sin unidad';
      tr.appendChild(tdUni);

      const tdCant = document.createElement('td');
      tdCant.textContent = cantidadVal;
      tr.appendChild(tdCant);

      const tdSerie = document.createElement('td');
      tdSerie.textContent = llevaSerie ? 'Sí' : 'No';
      tr.appendChild(tdSerie);

      // acciones: Ver series, Editar, Eliminar
      const tdAcc = document.createElement('td');
      tdAcc.style.display = 'flex';
      tdAcc.style.gap = '8px';

      // Ver Series
      const btnVerSeries = document.createElement('button');
      btnVerSeries.type = 'button';
      btnVerSeries.className = 'btn-ver-series';
      btnVerSeries.textContent = 'Ver series';
      btnVerSeries.addEventListener('click', () => abrirModalSeries(el.id));
      tdAcc.appendChild(btnVerSeries);

      // Editar (placeholder)
      const btnEditar = document.createElement('button');
      btnEditar.type = 'button';
      btnEditar.className = 'btn-editar';
      btnEditar.textContent = 'Editar';
      btnEditar.addEventListener('click', () => {
        // Aquí puedes abrir un formulario de edición y prellenarlo con `el`
        console.log('Editar elemento', el.id, el);
        alert('Editar aún no implementado (placeholder). id=' + el.id);
      });
      tdAcc.appendChild(btnEditar);

      // Eliminar
      const btnEliminar = document.createElement('button');
      btnEliminar.type = 'button';
      btnEliminar.className = 'btn-eliminar';
      btnEliminar.textContent = 'Eliminar';
      btnEliminar.addEventListener('click', async () => {
        if (!confirm(`¿Eliminar el elemento "${nombreVal}"?`)) return;
        try {
          await fetchJson(`${API_URL}/${el.id}`, { method: 'DELETE' });
          // refrescar lista
          cargarElementos();
        } catch (err) {
          console.error('Error eliminando elemento:', err);
          alert('No se pudo eliminar el elemento.');
        }
      });
      tdAcc.appendChild(btnEliminar);

      tr.appendChild(tdAcc);
      tbody.appendChild(tr);
    });

    // render
    table.appendChild(tbody);
    cont.innerHTML = '';
    cont.appendChild(table);

  } catch (err) {
    console.error('Error cargando elementos:', err);
    const cont = document.getElementById('contenedor-elementos');
    if (cont) cont.innerHTML = `<p>Error al cargar elementos.</p>`;
  }
}

// ------ series: cargar, abrir modal, cerrar, agregar ------
async function cargarSeries(elementoId) {
  try {
    const lista = document.getElementById('lista-series');
    lista.innerHTML = '<li>Cargando...</li>';

    // consulta por elemento
    const data = await fetchJson(`${API_SERIES}/${elementoId}`);

    lista.innerHTML = '';
    if (!Array.isArray(data) || data.length === 0) {
      lista.innerHTML = '<li>No hay series registradas para este elemento.</li>';
      return;
    }

    data.forEach(s => {
      const li = document.createElement('li');
      // posible nombres de campo: numero_serie, numero, codigo, serial
      li.textContent = s.numero_serie ?? s.numero ?? s.codigo ?? s.serial ?? JSON.stringify(s);
      lista.appendChild(li);
    });
  } catch (err) {
    console.error('Error cargando series:', err);
    const lista = document.getElementById('lista-series');
    if (lista) lista.innerHTML = '<li>Error cargando series.</li>';
  }
}

function abrirModalSeries(elementoId) {
  const modal = document.getElementById('modal-series');
  if (!modal) return;
  modal.style.display = 'flex';
  modal.dataset.elementoId = elementoId;
  cargarSeries(elementoId);
}

function cerrarModalSeries() {
  const modal = document.getElementById('modal-series');
  if (!modal) return;
  modal.style.display = 'none';
  modal.dataset.elementoId = '';
  const lista = document.getElementById('lista-series'); if (lista) lista.innerHTML = '';
}

// agregar serie desde modal (pequeño formulario)
async function agregarSerieDesdeModal(event) {
  event.preventDefault();
  const modal = document.getElementById('modal-series');
  if (!modal) return;
  const elementoId = modal.dataset.elementoId;
  const input = document.getElementById('input-nueva-serie');
  const valor = input.value.trim();
  if (!valor) return;

  try {
    // Ajusta la forma del payload según tu API: aquí envío elemento_id + numero_serie
    await fetchJson(API_SERIES, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ elemento_id: elementoId, numero_serie: valor })
    });
    input.value = '';
    cargarSeries(elementoId);
  } catch (err) {
    console.error('Error agregando serie:', err);
    alert('No se pudo agregar la serie.');
  }
}

// ------ formulario: enviar nuevo elemento ------
async function handleSubmitFormulario(e) {
  e.preventDefault();
  const nombre = document.getElementById('nombre').value.trim();
  const descripcion = document.getElementById('descripcion').value.trim();
  const cantidad = parseInt(document.getElementById('cantidad').value) || 0;
  const requiere_series = document.getElementById('lleva-serie').checked;
  const categoria_id = parseInt(document.getElementById('categoria').value) || null;
  const material_id = parseInt(document.getElementById('material').value) || null;
  const unidad_id = parseInt(document.getElementById('unidad').value) || null;

  const nuevo = {
    nombre,
    descripcion,
    cantidad,
    requiere_series,
    categoria_id,
    material_id,
    unidad_id
  };

  try {
    await fetchJson(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevo)
    });

    // reset y refrescar lista
    e.target.reset();
    // ocultar boton ver series por si estaba visible
    const btnVS = document.getElementById('btn-ver-series'); if (btnVS) btnVS.style.display = 'none';
    cargarElementos();
  } catch (err) {
    console.error('Error creando elemento:', err);
    alert('No se pudo crear el elemento.');
  }
}

// ------ inicialización ------
document.addEventListener('DOMContentLoaded', async () => {
  // cargar catálogos en paralelo
  await Promise.all([
    cargarCatalogo(API_CATEGORIAS, 'categoria', mapas.categorias, 'Seleccione categoría'),
    cargarCatalogo(API_MATERIALES, 'material', mapas.materiales, 'Seleccione material'),
    cargarCatalogo(API_UNIDADES, 'unidad', mapas.unidades, 'Seleccione unidad')
  ]);

  // cargar lista general
  cargarElementos();

  // toggle boton Ver series cuando checkbox cambia
  const chkSerie = document.getElementById('lleva-serie');
  const btnVerSeries = document.getElementById('btn-ver-series');
  if (chkSerie && btnVerSeries) {
    chkSerie.addEventListener('change', () => {
      btnVerSeries.style.display = chkSerie.checked ? 'inline-block' : 'none';
    });
  }

  // abrir modal desde el botón (si quieres que abra sin seleccionar elemento,
  // mantenemos el comportamiento anterior de abrir y listar todas las series)
  if (btnVerSeries) {
    btnVerSeries.addEventListener('click', () => {
      // si quieres abrir series generales sin elemento, usar cargarSeries() sin id
      // pero el endpoint que implementamos requiere elemento_id, así que comprobamos dataset
      const modal = document.getElementById('modal-series');
      const elementoId = modal.dataset.elementoId || null;
      if (elementoId) {
        abrirModalSeries(elementoId);
      } else {
        // Si no hay elemento seleccionado, cargamos todas las series (opcional)
        // cargarSeries(null);
        alert('Para ver series específicas, abre "Ver series" desde una fila en la lista de elementos.');
      }
    });
  }

  // cerrar modal
  const btnCerrar = document.getElementById('cerrar-modal-series');
  if (btnCerrar) btnCerrar.addEventListener('click', cerrarModalSeries);

  // submit formulario de elemento
  const form = document.getElementById('form-elemento');
  if (form) form.addEventListener('submit', handleSubmitFormulario);

  // submit para agregar serie en modal
  const formAgregarSerie = document.getElementById('form-agregar-serie');
  if (formAgregarSerie) formAgregarSerie.addEventListener('submit', agregarSerieDesdeModal);

  // click fuera del modal para cerrarlo (mejora UX)
  const modal = document.getElementById('modal-series');
  if (modal) {
    modal.addEventListener('click', (ev) => {
      if (ev.target === modal) cerrarModalSeries();
    });
  }
});
