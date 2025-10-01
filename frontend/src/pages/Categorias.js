import { categoriaService } from '../services/categoriaService.js';
import { mostrarToast } from '../components/Toast.js';

/**
 * Página de Gestión de Categorías
 * Muestra árbol jerárquico de categorías y subcategorías
 * 
 * RESPONSABILIDAD: Renderizar la vista de categorías
 * LÓGICA DE NEGOCIO: Delegada a categoriaController.js
 */

/**
 * Renderiza la vista completa de categorías
 * @returns {Promise<string>} HTML de la página
 */
export async function renderCategorias() {
    try {
        // Obtener categorías en estructura jerárquica
        const response = await categoriaService.obtenerJerarquia();
        const categorias = response.data;

        return `
            <div class="max-w-4xl mx-auto fade-in">
                ${renderHeader()}
                ${renderContent(categorias)}
            </div>
        `;
    } catch (error) {
        mostrarToast('Error al cargar categorías: ' + error.message, 'error');
        return renderError();
    }
}

/**
 * Renderiza el encabezado de la página
 * @returns {string} HTML del header
 */
function renderHeader() {
    return `
        <div class="flex justify-between items-center mb-6">
            <div>
                <h2 class="text-3xl font-bold text-gray-800 mb-1">Gestión de Categorías</h2>
                <p class="text-gray-600 text-sm">Organiza tu inventario en categorías y subcategorías</p>
            </div>
            <button 
                onclick="window.categoriaController.crear()" 
                class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow-md hover:shadow-lg flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Nueva Categoría
            </button>
        </div>
    `;
}

/**
 * Renderiza el contenido principal
 * @param {Array} categorias - Array de categorías jerárquicas
 * @returns {string} HTML del contenido
 */
function renderContent(categorias) {
    if (!categorias || categorias.length === 0) {
        return renderEmptyState();
    }

    return `
        <div class="space-y-2">
            ${categorias.map(categoria => renderCategoria(categoria, 0)).join('')}
        </div>
    `;
}

/**
 * Renderiza una categoría de forma recursiva (árbol)
 * @param {object} categoria - Objeto de categoría
 * @param {number} nivel - Nivel de profundidad (para indentación)
 * @returns {string} HTML de la categoría y sus hijos
 */
function renderCategoria(categoria, nivel = 0) {
    const marginLeft = nivel * 24;
    const tieneHijos = categoria.hijos && categoria.hijos.length > 0;
    const icono = tieneHijos ? '📁' : '📄';
    
    return `
        <div class="mb-2 slide-in" style="margin-left: ${marginLeft}px; animation-delay: ${nivel * 0.05}s">
            ${renderCategoriaCard(categoria, tieneHijos, icono)}
            ${tieneHijos ? categoria.hijos.map(hijo => renderCategoria(hijo, nivel + 1)).join('') : ''}
        </div>
    `;
}

/**
 * Renderiza la tarjeta de una categoría individual
 * @param {object} categoria - Datos de la categoría
 * @param {boolean} tieneHijos - Si tiene subcategorías
 * @param {string} icono - Emoji del icono
 * @returns {string} HTML de la tarjeta
 */
function renderCategoriaCard(categoria, tieneHijos, icono) {
    return `
        <div class="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex justify-between items-center border border-gray-200 hover:border-blue-300">
            <!-- Información de la categoría -->
            <div class="flex items-center gap-3 flex-1">
                <span class="text-2xl">${icono}</span>
                <div>
                    <h3 class="font-bold text-lg text-gray-800">${categoria.nombre}</h3>
                    <p class="text-sm text-gray-500">
                        ${tieneHijos 
                            ? `${categoria.hijos.length} subcategoría${categoria.hijos.length !== 1 ? 's' : ''}` 
                            : 'Subcategoría'
                        }
                    </p>
                </div>
            </div>

            <!-- Botones de acción -->
            <div class="flex gap-2">
                ${renderActionButtons(categoria, tieneHijos)}
            </div>
        </div>
    `;
}

/**
 * Renderiza los botones de acción de una categoría
 * @param {object} categoria - Datos de la categoría
 * @param {boolean} tieneHijos - Si tiene subcategorías
 * @returns {string} HTML de los botones
 */
function renderActionButtons(categoria, tieneHijos) {
    // Escapar comillas en el nombre para onclick
    const nombreEscapado = categoria.nombre.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    
    return `
        ${!tieneHijos ? `
            <button 
                onclick="window.categoriaController.agregarSubcategoria(${categoria.id}, '${nombreEscapado}')" 
                class="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-medium flex items-center gap-1 shadow-sm"
                title="Agregar subcategoría">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Subcategoría
            </button>
        ` : ''}
        
        <button 
            onclick="window.categoriaController.eliminar(${categoria.id}, '${nombreEscapado}')" 
            class="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium flex items-center gap-1 shadow-sm"
            title="Eliminar categoría">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            Eliminar
        </button>
    `;
}

/**
 * Renderiza el estado vacío cuando no hay categorías
 * @returns {string} HTML del estado vacío
 */
function renderEmptyState() {
    return `
        <div class="text-center py-16">
            <div class="mb-6">
                <svg class="w-24 h-24 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-700 mb-2">No hay categorías creadas</h3>
            <p class="text-gray-500 mb-6">Comienza organizando tu inventario creando tu primera categoría</p>
            <button 
                onclick="window.categoriaController.crear()" 
                class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold inline-flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Crear Primera Categoría
            </button>

            <!-- Información útil -->
            <div class="mt-12 max-w-2xl mx-auto">
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
                    <h4 class="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        ¿Qué son las categorías?
                    </h4>
                    <p class="text-sm text-blue-800 mb-3">
                        Las categorías te ayudan a organizar tu inventario en grupos lógicos. Por ejemplo:
                    </p>
                    <ul class="text-sm text-blue-800 space-y-1 ml-4">
                        <li>• <strong>Carpas</strong> → Carpas grandes, Carpas medianas, Carpas pequeñas</li>
                        <li>• <strong>Tubos</strong> → Tubos 3m, Tubos 4m, Tubos 5m</li>
                        <li>• <strong>Lonas</strong> → Lonas impermeables, Lonas decorativas</li>
                    </ul>
                </div>
            </div>
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
            <h3 class="text-xl font-semibold text-gray-800 mb-2">Error al cargar categorías</h3>
            <p class="text-gray-600 mb-6">No se pudieron cargar las categorías. Por favor, intenta de nuevo.</p>
            <button 
                onclick="window.app.navegarA('categorias')" 
                class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
                Reintentar
            </button>
        </div>
    `;
}