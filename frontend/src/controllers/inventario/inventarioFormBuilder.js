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
                        ${this.construirBotones()}
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
     * Construye campos básicos (nombre y descripción)
     * @returns {string} HTML de los campos
     */
    construirCamposBasicos() {
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
                ></textarea>
            </div>
        `;
    },

    /**
     * Construye el select de categorías
     * @param {string} opciones - HTML de las opciones del select
     * @returns {string} HTML del select
     */
    construirSelectCategorias(opciones) {
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
     * Construye campos de cantidad y estado en la misma fila
     * @returns {string} HTML de los campos
     */
    construirCamposCantidadEstado() {
        const opcionesEstado = ESTADOS_ELEMENTO.map(estado => 
            `<option value="${estado}" ${estado === 'bueno' ? 'selected' : ''}>${estado}</option>`
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
                        value="1"
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
     * @returns {string} HTML del checkbox
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
     * Construye el contenedor de series (inicialmente oculto)
     * @returns {string} HTML del contenedor
     */
    construirContenedorSeries() {
        return `
            <div id="container-series" class="hidden">
                <div class="border-t pt-4">
                    <h4 class="font-semibold text-gray-700 mb-3">Números de Serie</h4>
                    <div id="lista-series" class="space-y-2 mb-3">
                        <!-- Los campos se agregarán dinámicamente por seriesManager -->
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
     * Construye el campo de ubicación (solo visible si NO requiere series)
     * @returns {string} HTML del campo
     */
    construirCampoUbicacion() {
        return `
            <div id="campo-ubicacion">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación
                </label>
                <input 
                    type="text" 
                    id="ubicacion"
                    placeholder="Ej: Bodega A, Estante 3..."
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
            </div>
        `;
    },

    /**
     * Construye los botones del formulario
     * @returns {string} HTML de los botones
     */
    construirBotones() {
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
                    ✓ Crear Elemento
                </button>
            </div>
        `;
    },

    /**
     * Construye opciones del select de categorías con indentación jerárquica
     * @param {Array} categorias - Array de categorías jerárquicas
     * @param {number} nivel - Nivel de indentación
     * @returns {string} HTML de las opciones
     */
    construirOpcionesCategorias(categorias, nivel = 0) {
        let opciones = '';
        const indent = '　'.repeat(nivel); // Espacio de indentación japonés

        for (const cat of categorias) {
            opciones += `<option value="${cat.id}">${indent}${cat.nombre}</option>`;
            
            // Si tiene hijos, agregarlos recursivamente
            if (cat.hijos && cat.hijos.length > 0) {
                opciones += this.construirOpcionesCategorias(cat.hijos, nivel + 1);
            }
        }

        return opciones;
    },

    /**
     * Construye la vista de detalle de un elemento
     * @param {object} elemento - Objeto con datos del elemento
     * @param {Array} series - Array de series (opcional)
     * @returns {string} HTML de la vista de detalle
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