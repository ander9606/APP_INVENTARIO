// frontend/src/pages/Inventario.js

import { elementoService } from '../services/elementoService.js';
import { mostrarToast } from '../components/Toast.js';
import { agruparLotesPorElemento } from '../utils/inventarioHelpers.js';
import { ElementoCard } from '../components/inventario/ElementoCard.js';
import { InventarioEmpty } from '../components/inventario/InventarioEmpty.js';

/**
 * Página de Gestión de Inventario - VERSIÓN MODULAR
 * 
 * RESPONSABILIDAD: Orquestar componentes y manejar la vista principal
 * - Obtener datos del servicio
 * - Agrupar lotes si es necesario
 * - Delegar renderizado a componentes especializados
 * - Manejar estados de carga y error
 */

/**
 * Renderiza la vista completa del inventario
 * @returns {Promise<string>} HTML de la página
 */
export async function renderInventario() {
    try {
        // 1. Obtener todos los elementos
        const response = await elementoService.obtenerTodos();
        const elementosRaw = response.data;

        // 2. Agrupar lotes por elemento base
        const elementos = agruparLotesPorElemento(elementosRaw);

        // 3. Renderizar vista
        return `
            <div class="max-w-7xl mx-auto fade-in">
                ${renderHeader(elementos.length)}
                ${renderFiltros()}
                ${renderContent(elementos)}
            </div>
        `;
    } catch (error) {
        mostrarToast('Error al cargar inventario: ' + error.message, 'error');
        return renderError();
    }
}

/**
 * Renderiza el encabezado con contador y botones
 */
function renderHeader(totalElementos) {
    return `
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
                <h2 class="text-3xl font-bold text-gray-800 mb-1">Inventario</h2>
                <p class="text-gray-600 text-sm">
                    ${totalElementos > 0 
                        ? `${totalElementos} elemento${totalElementos !== 1 ? 's' : ''} registrado${totalElementos !== 1 ? 's' : ''}` 
                        : 'No hay elementos registrados'
                    }
                </p>
            </div>
            
            <div class="flex gap-3">
                ${renderBotonVista()}
                ${renderBotonNuevo()}
            </div>
        </div>
    `;
}

/**
 * Renderiza el botón de cambiar vista (futuro)
 */
function renderBotonVista() {
    return `
        <button 
            onclick="window.inventarioController.cambiarVista()"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium flex items-center gap-2"
            title="Cambiar vista">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
            </svg>
            <span class="hidden sm:inline">Vista</span>
        </button>
    `;
}

/**
 * Renderiza el botón de nuevo elemento
 */
function renderBotonNuevo() {
    return `
        <button 
            onclick="window.inventarioController.crearElemento()" 
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow-md hover:shadow-lg flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Nuevo Elemento
        </button>
    `;
}

/**
 * Renderiza sección de filtros (futuro)
 */
function renderFiltros() {
    return `
        <div class="mb-6 bg-white rounded-lg shadow-sm p-4 border border-gray-200" style="display: none;">
            <div class="flex flex-wrap gap-3">
                <!-- Buscador -->
                <div class="flex-1 min-w-[200px]">
                    <input 
                        type="text" 
                        id="buscar-elemento"
                        placeholder="Buscar por nombre..."
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        onkeyup="window.inventarioController.filtrar()">
                </div>
                
                <!-- Filtro por estado -->
                <select 
                    id="filtro-estado"
                    class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    onchange="window.inventarioController.filtrar()">
                    <option value="todos">Todos los estados</option>
                    <option value="AVAILABLE">Disponible</option>
                    <option value="RENTED">Alquilado</option>
                    <option value="CLEANING">En Limpieza</option>
                    <option value="MAINTENANCE">Mantenimiento</option>
                </select>
                
                <!-- Filtro por tipo -->
                <select 
                    id="filtro-tipo"
                    class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    onchange="window.inventarioController.filtrar()">
                    <option value="todos">Todos los tipos</option>
                    <option value="series">Con series</option>
                    <option value="lotes">Por lotes</option>
                </select>
            </div>
        </div>
    `;
}

/**
 * Renderiza el contenido principal
 */
function renderContent(elementos) {
    if (!elementos || elementos.length === 0) {
        return InventarioEmpty.render();
    }

    return `
        <div id="inventario-grid">
            ${ElementoCard.renderMultiples(elementos, 'grid')}
        </div>
    `;
}

/**
 * Renderiza vista de error
 */
function renderError() {
    return `
        <div class="text-center py-12 fade-in">
            <div class="mb-4">
                <svg class="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-2">
                Error al cargar inventario
            </h3>
            <p class="text-gray-600 mb-6">
                No se pudieron cargar los elementos. Por favor, intenta de nuevo.
            </p>
            <button 
                onclick="window.app.navegarA('inventario')" 
                class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
                Reintentar
            </button>
        </div>
    `;
}

/**
 * Renderiza estado de carga
 */
export function renderCargando() {
    return `
        <div class="flex items-center justify-center min-h-[400px]">
            <div class="text-center">
                <div class="animate-spin h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p class="text-gray-600 text-lg font-medium">Cargando inventario...</p>
            </div>
        </div>
    `;
}

// Exportar función principal
export default renderInventario;