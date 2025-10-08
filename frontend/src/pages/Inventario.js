// frontend/src/pages/Inventario.js
// VERSIÓN ADAPTADA PARA SISTEMA DE COLUMNAS

import { elementoService } from '../services/elementoService.js';
import { mostrarToast } from '../components/Toast.js';
import { procesarElementosParaVista } from '../utils/inventarioHelpers.js';
import { ElementoCard } from '../components/inventario/ElementoCard.js';
import { InventarioEmpty } from '../components/inventario/InventarioEmpty.js';

/**
 * Renderiza la vista completa del inventario
 */
export async function renderInventario() {
    try {
        // 1. Obtener todos los elementos
        const response = await elementoService.obtenerTodos();
        const elementosRaw = response.data;

        // 2. Procesar elementos para agregar distribución de estados
        const elementos = procesarElementosParaVista(elementosRaw);

        // 3. Renderizar vista
        return `
            <div class="max-w-7xl mx-auto fade-in">
                ${renderHeader(elementos.length)}
                ${renderContent(elementos)}
            </div>
        `;
    } catch (error) {
        console.error('Error al cargar inventario:', error);
        mostrarToast('Error al cargar inventario: ' + error.message, 'error');
        return renderError();
    }
}

/**
 * Renderiza el encabezado
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
                ${renderBotonNuevo()}
            </div>
        </div>
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
    `;x
}

export default renderInventario;