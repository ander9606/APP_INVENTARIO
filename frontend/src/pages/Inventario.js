import { elementoService } from '../services/elementoService.js';
import { mostrarToast } from '../components/Toast.js';
import { COLORES_ESTADO } from '../utils/constants.js';

/**
 * Página de Gestión de Inventario
 * Muestra todos los elementos del inventario en formato de grid
 * 
 * RESPONSABILIDAD: Renderizar la vista de inventario
 * LÓGICA DE NEGOCIO: Delegada a inventarioController.js
 */

/**
 * Renderiza la vista completa del inventario
 * @returns {Promise<string>} HTML de la página
 */
export async function renderInventario() {
    try {
        // Obtener todos los elementos
        const response = await elementoService.obtenerTodos();
        const elementos = response.data;

        return `
            <div class="max-w-7xl mx-auto fade-in">
                ${renderHeader(elementos.length)}
                ${renderContent(elementos)}
            </div>
        `;
    } catch (error) {
        mostrarToast('Error al cargar inventario: ' + error.message, 'error');
        return renderError();
    }
}

/**
 * Renderiza el encabezado de la página con contador
 * @param {number} totalElementos - Número total de elementos
 * @returns {string} HTML del header
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
                ${renderSearchButton()}
                ${renderNewElementButton()}
            </div>
        </div>
    `;
}

/**
 * Renderiza el botón de búsqueda (futuro)
 * @returns {string} HTML del botón
 */
function renderSearchButton() {
    return `
        <button 
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium flex items-center gap-2 opacity-50 cursor-not-allowed"
            disabled
            title="Próximamente">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            Buscar
        </button>
    `;
}

/**
 * Renderiza el botón de nuevo elemento
 * @returns {string} HTML del botón
 */
function renderNewElementButton() {
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
 * @param {Array} elementos - Array de elementos del inventario
 * @returns {string} HTML del contenido
 */
function renderContent(elementos) {
    if (!elementos || elementos.length === 0) {
        return renderEmptyState();
    }

    return `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            ${elementos.map((elemento, index) => renderElementoCard(elemento, index)).join('')}
        </div>
    `;
}

/**
 * Renderiza una tarjeta de elemento individual
 * @param {object} elemento - Datos del elemento
 * @param {number} index - Índice para animación escalonada
 * @returns {string} HTML de la tarjeta
 */
function renderElementoCard(elemento, index) {
    return `
        <div 
            class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-300 fade-in-up"
            style="animation-delay: ${index * 0.05}s">
            
            <!-- Header de la tarjeta con estado -->
            ${renderCardHeader(elemento)}
            
            <!-- Cuerpo de la tarjeta -->
            <div class="p-5">
                ${renderCardBody(elemento)}
                ${renderCardFooter(elemento)}
            </div>
        </div>
    `;
}

/**
 * Renderiza el header de la tarjeta con nombre y estado
 * @param {object} elemento - Datos del elemento
 * @returns {string} HTML del header
 */
function renderCardHeader(elemento) {
    const colorEstado = COLORES_ESTADO[elemento.estado] || 'bg-gray-100 text-gray-800';
    
    return `
        <div class="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
            <div class="flex justify-between items-start gap-2">
                <h3 class="font-bold text-lg text-gray-800 leading-tight flex-1" title="${elemento.nombre}">
                    ${truncateText(elemento.nombre, 30)}
                </h3>
                <span class="px-2 py-1 text-xs rounded-full font-medium ${colorEstado} whitespace-nowrap">
                    ${elemento.estado}
                </span>
            </div>
        </div>
    `;
}

/**
 * Renderiza el cuerpo de la tarjeta con información
 * @param {object} elemento - Datos del elemento
 * @returns {string} HTML del cuerpo
 */
function renderCardBody(elemento) {
    return `
        ${elemento.descripcion ? `
            <p class="text-sm text-gray-600 mb-3 line-clamp-2" title="${elemento.descripcion}">
                ${elemento.descripcion}
            </p>
        ` : ''}
        
        <div class="space-y-2 text-sm">
            ${renderInfoRow('Cantidad', elemento.cantidad, '📦')}
            ${renderInfoRow('Categoría', elemento.categoria_nombre || elemento.subcategoria_nombre || 'Sin categoría', '📁')}
            ${elemento.ubicacion ? renderInfoRow('Ubicación', elemento.ubicacion, '📍') : ''}
            ${renderSeriesIndicator(elemento)}
        </div>
    `;
}

/**
 * Renderiza una fila de información
 * @param {string} label - Etiqueta
 * @param {string|number} value - Valor
 * @param {string} icon - Emoji del icono
 * @returns {string} HTML de la fila
 */
function renderInfoRow(label, value, icon) {
    return `
        <div class="flex items-start gap-2">
            <span class="text-base">${icon}</span>
            <div class="flex-1 min-w-0">
                <span class="text-gray-500 text-xs">${label}:</span>
                <span class="text-gray-800 font-medium ml-1 truncate">${value}</span>
            </div>
        </div>
    `;
}

/**
 * Renderiza el indicador de series
 * @param {object} elemento - Datos del elemento
 * @returns {string} HTML del indicador
 */
function renderSeriesIndicator(elemento) {
    if (elemento.requiere_series) {
        return `
            <div class="flex items-center gap-2 text-blue-600 text-sm font-medium">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <span>Con series individuales</span>
            </div>
        `;
    } else {
        return `
            <div class="flex items-center gap-2 text-gray-500 text-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
                <span>Stock general</span>
            </div>
        `;
    }
}

/**
 * Renderiza el footer de la tarjeta con botones de acción
 * @param {object} elemento - Datos del elemento
 * @returns {string} HTML del footer
 */
function renderCardFooter(elemento) {
    return `
        <div class="mt-4 pt-4 border-t border-gray-200 flex gap-2">
            <button 
                onclick="window.inventarioController.verDetalle(${elemento.id})" 
                class="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium flex items-center justify-center gap-1"
                title="Ver detalles">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                Ver
            </button>
            <button 
                onclick="window.inventarioController.editarElemento(${elemento.id})" 
                class="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-medium"
                title="Editar elemento">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
            </button>
            <button 
                onclick="window.inventarioController.eliminar(${elemento.id})" 
                class="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium"
                title="Eliminar elemento">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
            </button>
        </div>
    `;
}

/**
 * Renderiza el estado vacío cuando no hay elementos
 * @returns {string} HTML del estado vacío
 */
function renderEmptyState() {
    return `
        <div class="text-center py-16">
            <div class="mb-6">
                <svg class="w-24 h-24 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-700 mb-2">No hay elementos en el inventario</h3>
            <p class="text-gray-500 mb-6">Comienza agregando tu primer elemento</p>
            <button 
                onclick="window.inventarioController.crearElemento()" 
                class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold inline-flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Crear Primer Elemento
            </button>

            <!-- Información útil sobre tipos de elementos -->
            <div class="mt-12 max-w-3xl mx-auto">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${renderEmptyStateCard(
                        '🔢',
                        'Elementos con Series',
                        'Para elementos que necesitan identificación única',
                        'Carpas, equipos de sonido, proyectores'
                    )}
                    ${renderEmptyStateCard(
                        '📊',
                        'Stock General',
                        'Para elementos que se manejan por cantidad',
                        'Tubos, lonas, tornillos, cables'
                    )}
                </div>
            </div>
        </div>
    `;
}

/**
 * Renderiza una tarjeta informativa en el estado vacío
 * @param {string} icon - Emoji del icono
 * @param {string} title - Título
 * @param {string} description - Descripción
 * @param {string} examples - Ejemplos
 * @returns {string} HTML de la tarjeta
 */
function renderEmptyStateCard(icon, title, description, examples) {
    return `
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 text-left">
            <div class="text-3xl mb-3">${icon}</div>
            <h4 class="font-semibold text-gray-800 mb-2">${title}</h4>
            <p class="text-sm text-gray-600 mb-3">${description}</p>
            <p class="text-xs text-gray-500">
                <strong>Ejemplos:</strong> ${examples}
            </p>
        </div>
    `;
}

/**
 * Renderiza vista de error
 * @returns {string} HTML del error
 */
function renderError() {
    return `
        <div class="text-center py-12">
            <div class="mb-4">
                <svg class="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-2">Error al cargar inventario</h3>
            <p class="text-gray-600 mb-6">No se pudieron cargar los elementos. Por favor, intenta de nuevo.</p>
            <button 
                onclick="window.app.navegarA('inventario')" 
                class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
                Reintentar
            </button>
        </div>
    `;
}

/**
 * Trunca un texto a un número máximo de caracteres
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Texto truncado
 */
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}