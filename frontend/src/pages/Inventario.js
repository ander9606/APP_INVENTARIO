import { elementoService } from '../services/elementoService.js';
import { mostrarToast } from '../components/Toast.js';
import { 
    CURRENT_STATUS,
    CURRENT_STATUS_LABELS,
    CLEANING_STATUS_LABELS,
    COLORES_CURRENT_STATUS,
    COLORES_CLEANING_STATUS,
    ICONOS_CURRENT_STATUS
} from '../utils/constants.js';

/**
 * Página de Gestión de Inventario
 * Muestra elementos agrupados por estado operativo (current_status)
 * con acciones específicas para cada estado
 */

/**
 * Renderiza la vista completa del inventario
 */
export async function renderInventario() {
    try {
        const response = await elementoService.obtenerTodos();
        const elementos = response.data;

        // Agrupar elementos por current_status
        const elementosAgrupados = agruparPorEstado(elementos);

        return `
            <div class="max-w-7xl mx-auto fade-in">
                ${renderHeader(elementos.length)}
                ${renderFiltrosPorEstado(elementosAgrupados)}
                ${renderGruposDeEstado(elementosAgrupados)}
            </div>
        `;
    } catch (error) {
        mostrarToast('Error al cargar inventario: ' + error.message, 'error');
        return renderError();
    }
}

/**
 * Agrupa elementos por current_status
 */
function agruparPorEstado(elementos) {
    const grupos = {
        AVAILABLE: [],
        RENTED: [],
        CLEANING: [],
        MAINTENANCE: [],
        RETIRED: []
    };

    elementos.forEach(elemento => {
        const status = elemento.current_status || 'AVAILABLE';
        if (grupos[status]) {
            grupos[status].push(elemento);
        }
    });

    return grupos;
}

/**
 * Renderiza el encabezado
 */
function renderHeader(totalElementos) {
    return `
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
                <h2 class="text-3xl font-bold text-gray-800 mb-1">
                    📦 Inventario por Estados
                </h2>
                <p class="text-gray-600 text-sm">
                    ${totalElementos} elemento${totalElementos !== 1 ? 's' : ''} registrado${totalElementos !== 1 ? 's' : ''}
                </p>
            </div>
            
            <button 
                onclick="window.inventarioController.crearElemento()" 
                class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow-md hover:shadow-lg flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Nuevo Elemento
            </button>
        </div>
    `;
}

/**
 * Renderiza filtros rápidos por estado
 */
function renderFiltrosPorEstado(grupos) {
    const estados = [
        { key: 'AVAILABLE', label: 'Disponibles', color: 'green' },
        { key: 'RENTED', label: 'Alquilados', color: 'purple' },
        { key: 'CLEANING', label: 'En Limpieza', color: 'yellow' },
        { key: 'MAINTENANCE', label: 'Mantenimiento', color: 'orange' },
        { key: 'RETIRED', label: 'Retirados', color: 'gray' }
    ];

    return `
        <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            ${estados.map(estado => {
                const cantidad = grupos[estado.key].length;
                return `
                    <div class="bg-white p-4 rounded-lg shadow-sm border-2 border-${estado.color}-200 hover:shadow-md transition text-center">
                        <div class="text-2xl mb-2">${ICONOS_CURRENT_STATUS[estado.key]}</div>
                        <div class="text-3xl font-bold text-gray-800">${cantidad}</div>
                        <div class="text-sm text-gray-600 mt-1">${estado.label}</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

/**
 * Renderiza los grupos de estado con sus elementos
 */
function renderGruposDeEstado(grupos) {
    return `
        <div class="space-y-8">
            ${renderGrupoDisponibles(grupos.AVAILABLE)}
            ${renderGrupoAlquilados(grupos.RENTED)}
            ${renderGrupoLimpieza(grupos.CLEANING)}
            ${renderGrupoMantenimiento(grupos.MAINTENANCE)}
            ${grupos.RETIRED.length > 0 ? renderGrupoRetirados(grupos.RETIRED) : ''}
        </div>
    `;
}

/**
 * GRUPO: DISPONIBLES
 */
function renderGrupoDisponibles(elementos) {
    if (elementos.length === 0) {
        return `
            <div class="bg-white rounded-xl p-6 border-l-4 border-green-500">
                <h3 class="text-xl font-bold text-gray-800 mb-4">
                    ${ICONOS_CURRENT_STATUS.AVAILABLE} Disponibles para Alquilar
                </h3>
                <p class="text-gray-500">No hay elementos disponibles</p>
            </div>
        `;
    }

    return `
        <div class="bg-white rounded-xl p-6 shadow-md border-l-4 border-green-500">
            <h3 class="text-xl font-bold text-gray-800 mb-4">
                ${ICONOS_CURRENT_STATUS.AVAILABLE} Disponibles para Alquilar (${elementos.length})
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${elementos.map(elemento => renderTarjetaDisponible(elemento)).join('')}
            </div>
        </div>
    `;
}

function renderTarjetaDisponible(elemento) {
    return `
        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition bg-gradient-to-br from-white to-green-50">
            <div class="flex justify-between items-start mb-3">
                <h4 class="font-bold text-gray-800">${elemento.nombre}</h4>
                <span class="px-2 py-1 text-xs rounded ${COLORES_CLEANING_STATUS[elemento.cleaning_status]}">
                    ${CLEANING_STATUS_LABELS[elemento.cleaning_status]}
                </span>
            </div>
            
            <div class="space-y-1 text-sm mb-3">
                <p><strong>Cantidad:</strong> ${elemento.cantidad}</p>
                ${elemento.lote_numero ? `<p class="text-xs text-gray-500">Lote: ${elemento.lote_numero}</p>` : ''}
            </div>

            <div class="flex gap-2">
                <button 
                    onclick="window.inventarioController.cambiarEstadoLote(${JSON.stringify(elemento).replace(/"/g, '&quot;')})"
                    class="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs font-medium">
                    ⚡ Cambiar Estado
                </button>
                <button 
                    onclick="window.inventarioController.verDetalle(${elemento.id})"
                    class="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs">
                    👁️
                </button>
            </div>
        </div>
    `;
}

/**
 * GRUPO: ALQUILADOS
 */
function renderGrupoAlquilados(elementos) {
    if (elementos.length === 0) {
        return `
            <div class="bg-white rounded-xl p-6 border-l-4 border-purple-500">
                <h3 class="text-xl font-bold text-gray-800 mb-4">
                    ${ICONOS_CURRENT_STATUS.RENTED} Actualmente Alquilados
                </h3>
                <p class="text-gray-500">No hay elementos alquilados</p>
            </div>
        `;
    }

    return `
        <div class="bg-white rounded-xl p-6 shadow-md border-l-4 border-purple-500">
            <h3 class="text-xl font-bold text-gray-800 mb-4">
                ${ICONOS_CURRENT_STATUS.RENTED} Actualmente Alquilados (${elementos.length})
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${elementos.map(elemento => renderTarjetaAlquilado(elemento)).join('')}
            </div>
        </div>
    `;
}

function renderTarjetaAlquilado(elemento) {
    return `
        <div class="border border-purple-200 rounded-lg p-4 hover:shadow-md transition bg-gradient-to-br from-white to-purple-50">
            <div class="flex justify-between items-start mb-3">
                <h4 class="font-bold text-gray-800">${elemento.nombre}</h4>
                <span class="px-2 py-1 text-xs rounded bg-purple-100 text-purple-800">
                    📤 ALQUILADO
                </span>
            </div>
            
            <div class="space-y-1 text-sm mb-3">
                <p><strong>Cantidad:</strong> ${elemento.cantidad}</p>
                ${elemento.lote_numero ? `<p class="text-xs text-gray-500">Lote: ${elemento.lote_numero}</p>` : ''}
            </div>

            <button 
                onclick="window.inventarioController.procesarDevolucion(${JSON.stringify(elemento).replace(/"/g, '&quot;')})"
                class="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm font-medium">
                📥 Procesar Devolución
            </button>
        </div>
    `;
}

/**
 * GRUPO: EN LIMPIEZA
 */
function renderGrupoLimpieza(elementos) {
    if (elementos.length === 0) {
        return `
            <div class="bg-white rounded-xl p-6 border-l-4 border-yellow-500">
                <h3 class="text-xl font-bold text-gray-800 mb-4">
                    ${ICONOS_CURRENT_STATUS.CLEANING} En Proceso de Limpieza
                </h3>
                <p class="text-gray-500">No hay elementos en limpieza</p>
            </div>
        `;
    }

    return `
        <div class="bg-white rounded-xl p-6 shadow-md border-l-4 border-yellow-500">
            <h3 class="text-xl font-bold text-gray-800 mb-4">
                ${ICONOS_CURRENT_STATUS.CLEANING} En Proceso de Limpieza (${elementos.length})
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${elementos.map(elemento => renderTarjetaLimpieza(elemento)).join('')}
            </div>
        </div>
    `;
}

function renderTarjetaLimpieza(elemento) {
    return `
        <div class="border border-yellow-200 rounded-lg p-4 hover:shadow-md transition bg-gradient-to-br from-white to-yellow-50">
            <div class="flex justify-between items-start mb-3">
                <h4 class="font-bold text-gray-800">${elemento.nombre}</h4>
                <span class="px-2 py-1 text-xs rounded ${COLORES_CLEANING_STATUS[elemento.cleaning_status]}">
                    ${CLEANING_STATUS_LABELS[elemento.cleaning_status]}
                </span>
            </div>
            
            <div class="space-y-1 text-sm mb-3">
                <p><strong>Cantidad:</strong> ${elemento.cantidad}</p>
                ${elemento.lote_numero ? `<p class="text-xs text-gray-500">Lote: ${elemento.lote_numero}</p>` : ''}
            </div>

            <button 
                onclick="window.inventarioController.completarLimpieza(${JSON.stringify(elemento).replace(/"/g, '&quot;')})"
                class="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium">
                ✅ Completar Limpieza
            </button>
        </div>
    `;
}

/**
 * GRUPO: MANTENIMIENTO
 */
function renderGrupoMantenimiento(elementos) {
    if (elementos.length === 0) {
        return `
            <div class="bg-white rounded-xl p-6 border-l-4 border-orange-500">
                <h3 class="text-xl font-bold text-gray-800 mb-4">
                    ${ICONOS_CURRENT_STATUS.MAINTENANCE} En Mantenimiento/Reparación
                </h3>
                <p class="text-gray-500">No hay elementos en mantenimiento</p>
            </div>
        `;
    }

    return `
        <div class="bg-white rounded-xl p-6 shadow-md border-l-4 border-orange-500">
            <h3 class="text-xl font-bold text-gray-800 mb-4">
                ${ICONOS_CURRENT_STATUS.MAINTENANCE} En Mantenimiento/Reparación (${elementos.length})
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${elementos.map(elemento => renderTarjetaMantenimiento(elemento)).join('')}
            </div>
        </div>
    `;
}

function renderTarjetaMantenimiento(elemento) {
    return `
        <div class="border border-orange-200 rounded-lg p-4 hover:shadow-md transition bg-gradient-to-br from-white to-orange-50">
            <div class="flex justify-between items-start mb-3">
                <h4 class="font-bold text-gray-800">${elemento.nombre}</h4>
                <span class="px-2 py-1 text-xs rounded ${COLORES_CLEANING_STATUS[elemento.cleaning_status]}">
                    ${CLEANING_STATUS_LABELS[elemento.cleaning_status]}
                </span>
            </div>
            
            <div class="space-y-1 text-sm mb-3">
                <p><strong>Cantidad:</strong> ${elemento.cantidad}</p>
                ${elemento.lote_numero ? `<p class="text-xs text-gray-500">Lote: ${elemento.lote_numero}</p>` : ''}
            </div>

            <div class="flex gap-2">
                <button 
                    onclick="window.inventarioController.cambiarEstadoLote(${JSON.stringify(elemento).replace(/"/g, '&quot;')})"
                    class="flex-1 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-xs font-medium">
                    ✅ Completar Reparación
                </button>
                <button 
                    onclick="window.inventarioController.verDetalle(${elemento.id})"
                    class="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs">
                    👁️
                </button>
            </div>
        </div>
    `;
}

/**
 * GRUPO: RETIRADOS (colapsable)
 */
function renderGrupoRetirados(elementos) {
    return `
        <details class="bg-gray-100 rounded-xl p-6 border-l-4 border-gray-400">
            <summary class="text-xl font-bold text-gray-700 cursor-pointer mb-4">
                ${ICONOS_CURRENT_STATUS.RETIRED} Retirados del Inventario (${elementos.length})
            </summary>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                ${elementos.map(elemento => renderTarjetaRetirado(elemento)).join('')}
            </div>
        </details>
    `;
}

function renderTarjetaRetirado(elemento) {
    return `
        <div class="border border-gray-300 rounded-lg p-4 hover:shadow-md transition bg-white opacity-75">
            <div class="flex justify-between items-start mb-3">
                <h4 class="font-bold text-gray-600">${elemento.nombre}</h4>
                <span class="px-2 py-1 text-xs rounded bg-gray-200 text-gray-700">
                    🚫 RETIRADO
                </span>
            </div>
            
            <div class="space-y-1 text-sm mb-3 text-gray-600">
                <p><strong>Cantidad final:</strong> ${elemento.cantidad}</p>
                ${elemento.lote_numero ? `<p class="text-xs">Lote: ${elemento.lote_numero}</p>` : ''}
            </div>

            <button 
                onclick="window.inventarioController.verHistorialMovimientos(${elemento.id})"
                class="w-full px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs font-medium">
                📜 Ver Historial
            </button>
        </div>
    `;
}

/**
 * Renderiza vista de error
 */
function renderError() {
    return `
        <div class="text-center py-12">
            <svg class="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 class="text-xl font-semibold text-gray-800 mb-2">Error al cargar inventario</h3>
            <p class="text-gray-600 mb-6">No se pudieron cargar los elementos</p>
            <button 
                onclick="window.app.navegarA('inventario')" 
                class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Reintentar
            </button>
        </div>
    `;
}