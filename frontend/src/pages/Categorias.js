import { categoriaService } from '../services/categoriaService.js';
import { mostrarToast } from '../components/Toast.js';

/**
 * Página de Gestión de Categorías - MEJORADA
 * Muestra árbol jerárquico con funcionalidad de expandir/colapsar
 */

// Estado global de la vista
let categoriaSeleccionada = null;
let elementosActuales = [];

/**
 * Renderiza la vista completa de categorías
 */
export async function renderCategorias() {
    try {
        const response = await categoriaService.obtenerJerarquia();
        const categorias = response.data;

        return `
            <div class="max-w-7xl mx-auto fade-in">
                ${renderHeader()}
                
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Panel izquierdo: Árbol de categorías -->
                    <div class="lg:col-span-1">
                        ${renderPanelCategorias(categorias)}
                    </div>
                    
                    <!-- Panel derecho: Elementos de la categoría seleccionada -->
                    <div class="lg:col-span-2">
                        ${renderPanelElementos()}
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        mostrarToast('Error al cargar categorías: ' + error.message, 'error');
        return renderError();
    }
}

/**
 * Renderiza el encabezado
 */
function renderHeader() {
    return `
        <div class="flex justify-between items-center mb-6">
            <div>
                <h2 class="text-3xl font-bold text-gray-800 mb-1">
                    Gestión de Categorías
                </h2>
                <p class="text-gray-600 text-sm">
                    Organiza tu inventario en categorías y subcategorías
                </p>
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
 * Renderiza el panel de categorías (árbol)
 */
function renderPanelCategorias(categorias) {
    if (!categorias || categorias.length === 0) {
        return renderEmptyState();
    }

    return `
        <div class="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                </svg>
                Categorías
            </h3>
            <div class="space-y-1">
                ${categorias.map(categoria => renderCategoriaArbol(categoria, 0)).join('')}
            </div>
        </div>
    `;
}

/**
 * Renderiza una categoría en el árbol (recursivo)
 * @param {object} categoria - Datos de la categoría
 * @param {number} nivel - Nivel de profundidad (para indentación)
 */
function renderCategoriaArbol(categoria, nivel = 0) {
    const tieneHijos = categoria.hijos && categoria.hijos.length > 0;
    const esPadre = nivel === 0; // Categoría de nivel superior
    const marginLeft = nivel * 20;
    
    // Iconos según tipo
    const icono = esPadre ? '📁' : '📄';
    const iconoExpand = tieneHijos ? '▼' : '';
    
    return `
        <div class="categoria-item" style="margin-left: ${marginLeft}px">
            <!-- Categoría Padre -->
            ${esPadre ? renderCategoriaPadre(categoria, icono) : ''}
            
            <!-- Subcategoría -->
            ${!esPadre ? renderSubcategoria(categoria, icono) : ''}
            
            <!-- Hijos recursivos -->
            ${tieneHijos ? `
                <div class="hijos-container">
                    ${categoria.hijos.map(hijo => renderCategoriaArbol(hijo, nivel + 1)).join('')}
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Renderiza una categoría padre (nivel superior)
 */
function renderCategoriaPadre(categoria, icono) {
    const nombreEscapado = categoria.nombre.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    
    return `
        <div class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition group">
            <div class="flex items-center gap-2 flex-1">
                <span class="text-xl">${icono}</span>
                <span class="font-semibold text-gray-800">${categoria.nombre}</span>
                ${categoria.hijos && categoria.hijos.length > 0 ? `
                    <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        ${categoria.hijos.length}
                    </span>
                ` : ''}
            </div>
            
            <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <!-- Botón: Agregar Subcategoría (SOLO en padres) -->
                <button 
                    onclick="window.categoriaController.agregarSubcategoria(${categoria.id}, '${nombreEscapado}')"
                    class="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs font-medium"
                    title="Agregar subcategoría">
                    + Sub
                </button>
                
                <!-- Botón: Eliminar -->
                <button 
                    onclick="window.categoriaController.eliminar(${categoria.id}, '${nombreEscapado}')"
                    class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs font-medium"
                    title="Eliminar categoría">
                    ✕
                </button>
            </div>
        </div>
    `;
}

/**
 * Renderiza una subcategoría (clickeable para ver elementos)
 */
function renderSubcategoria(categoria, icono) {
    const nombreEscapado = categoria.nombre.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    
    return `
        <div class="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 transition group cursor-pointer"
             onclick="window.cargarElementosCategoria(${categoria.id}, '${nombreEscapado}')">
            <div class="flex items-center gap-2 flex-1">
                <span class="text-lg">${icono}</span>
                <span class="text-gray-700 hover:text-blue-600 transition">${categoria.nombre}</span>
            </div>
            
            <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <!-- Botón: Eliminar (solo eliminar, NO agregar sub) -->
                <button 
                    onclick="event.stopPropagation(); window.categoriaController.eliminar(${categoria.id}, '${nombreEscapado}')"
                    class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs font-medium"
                    title="Eliminar subcategoría">
                    ✕
                </button>
            </div>
        </div>
    `;
}

/**
 * Renderiza el panel de elementos (inicialmente vacío)
 */
function renderPanelElementos() {
    return `
        <div id="panel-elementos" class="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div class="text-center py-12 text-gray-400">
                <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                </svg>
                <p class="text-lg font-medium">Selecciona una subcategoría</p>
                <p class="text-sm mt-1">Haz clic en una subcategoría para ver sus elementos</p>
            </div>
        </div>
    `;
}

/**
 * Estado vacío cuando no hay categorías
 */
function renderEmptyState() {
    return `
        <div class="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div class="text-center py-12">
                <div class="mb-6">
                    <svg class="w-24 h-24 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold text-gray-700 mb-2">No hay categorías</h3>
                <p class="text-gray-500 mb-6">Comienza organizando tu inventario</p>
                <button 
                    onclick="window.categoriaController.crear()" 
                    class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
                    + Crear Primera Categoría
                </button>
            </div>
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
            <h3 class="text-xl font-semibold text-gray-800 mb-2">Error al cargar</h3>
            <p class="text-gray-600 mb-6">No se pudieron cargar las categorías</p>
            <button 
                onclick="window.app.navegarA('categorias')" 
                class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Reintentar
            </button>
        </div>
    `;
}

// ============================================
// FUNCIÓN GLOBAL: Cargar elementos de categoría
// ============================================

/**
 * Carga y muestra los elementos de una categoría
 * Se ejecuta al hacer clic en una subcategoría
 */
window.cargarElementosCategoria = async function(categoriaId, nombreCategoria) {
    const panel = document.getElementById('panel-elementos');
    
    if (!panel) {
        console.error('Panel de elementos no encontrado');
        return;
    }
    
    try {
        // Mostrar loading
        panel.innerHTML = `
            <div class="text-center py-12">
                <div class="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p class="text-gray-600">Cargando elementos...</p>
            </div>
        `;
        
        // Obtener elementos
        const response = await categoriaService.obtenerElementos(categoriaId);
        const elementos = response.data.elementos;
        
        // Guardar estado
        categoriaSeleccionada = { id: categoriaId, nombre: nombreCategoria };
        elementosActuales = elementos;
        
        // Renderizar elementos
        panel.innerHTML = renderElementosCategoria(nombreCategoria, elementos);
        
    } catch (error) {
        console.error('Error al cargar elementos:', error);
        mostrarToast('Error al cargar elementos: ' + error.message, 'error');
        
        panel.innerHTML = `
            <div class="text-center py-12">
                <svg class="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p class="text-gray-600">Error al cargar elementos</p>
            </div>
        `;
    }
};

/**
 * Renderiza la lista de elementos de una categoría
 */
function renderElementosCategoria(nombreCategoria, elementos) {
    if (!elementos || elementos.length === 0) {
        return `
            <div class="text-center py-12">
                <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                </svg>
                <h3 class="text-lg font-semibold text-gray-700 mb-2">Sin elementos</h3>
                <p class="text-gray-500 mb-4">
                    La categoría "<strong>${nombreCategoria}</strong>" no tiene elementos asociados
                </p>
                <button 
                    onclick="window.inventarioController.crearElemento()"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    + Agregar Primer Elemento
                </button>
            </div>
        `;
    }
    
    return `
        <!-- Header del panel -->
        <div class="flex justify-between items-center mb-6">
            <div>
                <h3 class="text-xl font-bold text-gray-800">${nombreCategoria}</h3>
                <p class="text-sm text-gray-600 mt-1">
                    ${elementos.length} elemento${elementos.length !== 1 ? 's' : ''} en esta categoría
                </p>
            </div>
            <button 
                onclick="window.inventarioController.crearElemento()"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Nuevo Elemento
            </button>
        </div>
        
        <!-- Lista de elementos -->
        <div class="space-y-2">
            ${elementos.map(elemento => renderElementoItem(elemento)).join('')}
        </div>
    `;
}

/**
 * Renderiza un elemento individual en la lista
 */
function renderElementoItem(elemento) {
    const coloresEstado = {
        nuevo: 'bg-blue-100 text-blue-800',
        bueno: 'bg-green-100 text-green-800',
        mantenimiento: 'bg-yellow-100 text-yellow-800',
        prestado: 'bg-purple-100 text-purple-800',
        dañado: 'bg-red-100 text-red-800',
        agotado: 'bg-gray-100 text-gray-800'
    };
    
    const colorEstado = coloresEstado[elemento.estado] || 'bg-gray-100 text-gray-800';
    
    return `
        <div 
            class="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition cursor-pointer bg-white"
            onclick="window.inventarioController.verDetalle(${elemento.id})">
            
            <!-- Info del elemento -->
            <div class="flex items-center gap-4 flex-1">
                <div class="flex-shrink-0">
                    ${elemento.requiere_series ? `
                        <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                            </svg>
                        </div>
                    ` : `
                        <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                            </svg>
                        </div>
                    `}
                </div>
                
                <div class="flex-1 min-w-0">
                    <h4 class="font-semibold text-gray-800 truncate">${elemento.nombre}</h4>
                    ${elemento.descripcion ? `
                        <p class="text-sm text-gray-600 truncate">${elemento.descripcion}</p>
                    ` : ''}
                    <div class="flex items-center gap-3 mt-1">
                        <span class="text-xs text-gray-500">
                            📦 Cantidad: <strong>${elemento.cantidad}</strong>
                        </span>
                        ${elemento.requiere_series ? `
                            <span class="text-xs text-blue-600">
                                🔢 Con series
                            </span>
                        ` : ''}
                    </div>
                </div>
            </div>
            
            <!-- Estado -->
            <div class="flex items-center gap-2">
                <span class="px-3 py-1 text-xs rounded-full font-medium ${colorEstado}">
                    ${elemento.estado}
                </span>
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
            </div>
        </div>
    `;
}