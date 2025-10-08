// frontend/src/controllers/inventario/inventarioFormBuilder.js

import { categoriaService } from '../../services/categoriaService.js';
import { ESTADOS_ELEMENTO, COLORES_ESTADO } from '../../utils/constants.js';

/**
 * Constructor de formularios HTML para el módulo de inventario
 * Separa la construcción de HTML de la lógica de negocio
 */
export const inventarioFormBuilder = {
    
    /**
     * Construye el formulario completo para crear un elemento
     * @returns {Promise<string>} HTML del formulario
     */
    async construirFormularioCreacion() {
        try {
            // Obtener categorías para el select
            const respuestaCategorias = await categoriaService.obtenerJerarquia();
            const categorias = respuestaCategorias.data;
            const opcionesCategorias = this.construirOpcionesCategorias(categorias);

            return `
                <div class="p-6">
                    <h3 class="text-2xl font-bold mb-4 text-gray-800">Nuevo Elemento de Inventario</h3>
                    
                    <form id="form-elemento" class="space-y-4">
                        ${this.construirCamposBasicos()}
                        ${this.construirSelectCategorias(opcionesCategorias)}
                        ${this.construirCamposCantidadEstado()}
                        ${this.construirCheckboxSeries()}
                        ${this.construirContenedorSeries()}
                        ${this.construirCampoUbicacion()}
                        ${this.construirBotones('crear')}
                    </form>
                </div>
            `;
        } catch (error) {
            console.error('Error al construir formulario:', error);
            return `
                <div class="p-6">
                    <p class="text-red-500">Error al cargar el formulario</p>
                </div>
            `;
        }
    },

    /**
     * Construye el formulario completo para editar un elemento
     * @param {object} elemento - Elemento a editar
     * @param {Array} series - Series del elemento (si aplica)
     * @returns {Promise<string>} HTML del formulario
     */
    async construirFormularioEdicion(elemento, series = []) {
        try {
            // Obtener categorías para el select
            const respuestaCategorias = await categoriaService.obtenerJerarquia();
            const categorias = respuestaCategorias.data;
            const opcionesCategorias = this.construirOpcionesCategorias(categorias);

            return `
                <div class="p-6">
                    <h3 class="text-2xl font-bold mb-4 text-gray-800">Editar Elemento</h3>
                    
                    <form id="form-elemento-editar" class="space-y-4">
                        ${this.construirCamposBasicos(elemento)}
                        ${this.construirSelectCategorias(opcionesCategorias, elemento.categoria_id)}
                        ${this.construirCamposCantidadEstado(elemento)}
                        ${this.construirCampoUbicacion(elemento)}
                        ${this.construirBotones('editar')}
                    </form>
                    
                    ${elemento.requiere_series && series.length > 0 ? `
                        <div class="mt-6 pt-6 border-t">
                            <h4 class="font-semibold text-gray-700 mb-3">
                                Series Existentes (${series.length})
                            </h4>
                            <p class="text-sm text-gray-500 mb-3">
                                La edición de series individuales se hace desde la vista de detalle
                            </p>
                            <div class="max-h-40 overflow-y-auto space-y-1">
                                ${series.map(s => `
                                    <div class="text-sm font-mono text-gray-600 px-3 py-1 bg-gray-50 rounded">
                                        ${s.numero_serie}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        } catch (error) {
            console.error('Error al construir formulario de edición:', error);
            return `
                <div class="p-6">
                    <p class="text-red-500">Error al cargar el formulario</p>
                </div>
            `;
        }
    },

    /**
     * Construye campos básicos (nombre y descripción)
     */
    construirCamposBasicos(elemento = null) {
        return `
            <!-- Nombre -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del elemento *
                </label>
                <input 
                    type="text" 
                    id="nombre" 
                    required 
                    value="${elemento?.nombre || ''}"
                    placeholder="Ej: Carpa 10x10, Tubo galvanizado 3m..."
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
            </div>

            <!-- Descripción -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                </label>
                <textarea 
                    id="descripcion" 
                    rows="3"
                    placeholder="Descripción detallada del elemento..."
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >${elemento?.descripcion || ''}</textarea>
            </div>
        `;
    },

    /**
     * Construye el select de categorías
     */
    construirSelectCategorias(opciones, categoriaSeleccionada = null) {
        return `
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Categoría / Subcategoría
                </label>
                <select 
                    id="categoria_id"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                    <option value="">Sin categoría</option>
                    ${opciones}
                </select>
            </div>
        `;
    },

    /**
     * Construye campos de cantidad y estado
     */
    construirCamposCantidadEstado(elemento = null) {
        const opcionesEstado = ESTADOS_ELEMENTO.map(estado => 
            `<option value="${estado}" ${elemento?.estado === estado ? 'selected' : ''}>${estado}</option>`
        ).join('');

        return `
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Cantidad *
                    </label>
                    <input 
                        type="number" 
                        id="cantidad" 
                        required 
                        min="0"
                        value="${elemento?.cantidad || 1}"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Estado *
                    </label>
                    <select 
                        id="estado"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        ${opcionesEstado}
                    </select>
                </div>
            </div>
        `;
    },

    /**
     * Construye el checkbox de "Requiere series"
     */
    construirCheckboxSeries() {
        return `
            <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <label class="flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        id="requiere_series"
                        class="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        onchange="window.seriesManager.toggle()"
                    >
                    <span class="ml-3 text-sm font-medium text-gray-700">
                        ✓ Este elemento requiere números de serie individuales
                    </span>
                </label>
                <p class="mt-2 text-xs text-gray-600 ml-8">
                    Marca esta opción si cada unidad debe tener un identificador único (ej: carpas, equipos)
                </p>
            </div>
        `;
    },

    /**
     * Construye el contenedor de series
     */
    construirContenedorSeries() {
        return `
            <div id="container-series" class="hidden">
                <div class="border-t pt-4">
                    <h4 class="font-semibold text-gray-700 mb-3">Números de Serie</h4>
                    <div id="lista-series" class="space-y-2 mb-3">
                        <!-- Los campos se agregarán dinámicamente -->
                    </div>
                    <button 
                        type="button"
                        onclick="window.seriesManager.agregarCampo()"
                        class="text-sm px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium">
                        + Agregar Serie
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Construye el campo de ubicación
     */
    construirCampoUbicacion(elemento = null) {
        return `
            <div id="campo-ubicacion">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación
                </label>
                <input 
                    type="text" 
                    id="ubicacion"
                    value="${elemento?.ubicacion || ''}"
                    placeholder="Ej: Bodega A, Estante 3..."
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
            </div>
        `;
    },

    /**
     * Construye los botones del formulario
     */
    construirBotones(tipo = 'crear') {
        const textoBoton = tipo === 'crear' ? '✓ Crear Elemento' : '✓ Guardar Cambios';
        
        return `
            <div class="flex gap-3 justify-end pt-4 border-t">
                <button 
                    type="button" 
                    onclick="window.cerrarModal()" 
                    class="px-5 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium">
                    Cancelar
                </button>
                <button 
                    type="submit" 
                    class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                    ${textoBoton}
                </button>
            </div>
        `;
    },

    /**
     * Construye opciones del select de categorías con indentación
     */
    construirOpcionesCategorias(categorias, nivel = 0) {
        let opciones = '';
        const indent = '　'.repeat(nivel);

        for (const cat of categorias) {
            opciones += `<option value="${cat.id}">${indent}${cat.nombre}</option>`;
            
            if (cat.hijos && cat.hijos.length > 0) {
                opciones += this.construirOpcionesCategorias(cat.hijos, nivel + 1);
            }
        }

        return opciones;
    },

    /**
     * Construye la vista de detalle de un elemento
     */
    construirVistaDetalle(elemento, series = []) {
        return `
            <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-2xl font-bold text-gray-800">${elemento.nombre}</h3>
                    <span class="px-3 py-1 text-sm rounded ${COLORES_ESTADO[elemento.estado] || 'bg-gray-100 text-gray-800'}">
                        ${elemento.estado}
                    </span>
                </div>

                ${elemento.descripcion ? `
                    <p class="text-gray-600 mb-4 leading-relaxed">${elemento.descripcion}</p>
                ` : ''}

                <div class="bg-gray-50 p-4 rounded-lg space-y-2 mb-4">
                    <div class="flex justify-between">
                        <span class="text-gray-600">Cantidad:</span>
                        <span class="font-semibold">${elemento.cantidad}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Categoría:</span>
                        <span class="font-semibold">${elemento.categoria_nombre || elemento.subcategoria_nombre || 'Sin categoría'}</span>
                    </div>
                    ${elemento.ubicacion ? `
                        <div class="flex justify-between">
                            <span class="text-gray-600">Ubicación:</span>
                            <span class="font-semibold">${elemento.ubicacion}</span>
                        </div>
                    ` : ''}
                    <div class="flex justify-between">
                        <span class="text-gray-600">Requiere series:</span>
                        <span class="font-semibold ${elemento.requiere_series ? 'text-blue-600' : 'text-gray-500'}">
                            ${elemento.requiere_series ? 'Sí' : 'No'}
                        </span>
                    </div>
                </div>

                ${elemento.requiere_series && series.length > 0 ? `
                    <div class="border-t pt-4">
                        <h4 class="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <span>Números de Serie</span>
                            <span class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">${series.length}</span>
                        </h4>
                        <div class="max-h-60 overflow-y-auto space-y-2">
                            ${series.map(s => `
                                <div class="flex justify-between items-center bg-white p-3 rounded-lg border hover:shadow-md transition">
                                    <span class="font-mono text-sm font-medium">${s.numero_serie}</span>
                                    <span class="px-2 py-1 text-xs rounded ${COLORES_ESTADO[s.estado] || 'bg-gray-100 text-gray-800'}">
                                        ${s.estado}
                                    </span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <div class="flex gap-3 justify-end pt-4 border-t mt-4">
                    <button 
                        onclick="window.cerrarModal()" 
                        class="px-5 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium">
                        Cerrar
                    </button>
                </div>
            </div>
        `;
    }
};

export default inventarioFormBuilder;