import { 
    CURRENT_STATUS_LABELS, 
    CLEANING_STATUS_LABELS,
    COLORES_CURRENT_STATUS,
    COLORES_CLEANING_STATUS,
    ICONOS_CURRENT_STATUS,
    MOTIVOS_LABELS
} from '../utils/constants.js';

/**
 * Constructor de interfaces para movimientos de lotes
 * Genera formularios modales para diferentes tipos de movimientos
 */
export const loteMovimientoUI = {
    
    /**
     * Genera modal para cambio de estado genérico
     * @param {object} lote - Datos del lote
     * @returns {string} HTML del formulario
     */
    construirFormularioCambioEstado(lote) {
        return `
            <div class="p-6">
                <h3 class="text-2xl font-bold mb-4 text-gray-800">
                    Cambiar Estado del Lote
                </h3>
                
                <!-- Info del lote -->
                <div class="bg-blue-50 p-4 rounded-lg mb-4">
                    <h4 class="font-semibold mb-2">${lote.nombre}</h4>
                    <div class="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <span class="text-gray-600">Cantidad disponible:</span>
                            <span class="font-bold ml-2">${lote.cantidad}</span>
                        </div>
                        <div>
                            <span class="text-gray-600">Estado actual:</span>
                            <span class="px-2 py-1 text-xs rounded ${COLORES_CURRENT_STATUS[lote.current_status]} ml-2">
                                ${CURRENT_STATUS_LABELS[lote.current_status]}
                            </span>
                        </div>
                    </div>
                </div>

                <form id="form-cambio-estado" class="space-y-4">
                    <!-- Cantidad a mover -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Cantidad a mover *
                        </label>
                        <input 
                            type="number" 
                            id="cantidad" 
                            required 
                            min="1"
                            max="${lote.cantidad}"
                            value="1"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                    </div>

                    <!-- Estado operativo destino -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Estado operativo destino *
                        </label>
                        <select 
                            id="current_status_destino"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            ${this.construirOpcionesCurrentStatus(lote.current_status)}
                        </select>
                    </div>

                    <!-- Estado de limpieza destino -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Estado de limpieza/condición *
                        </label>
                        <select 
                            id="cleaning_status_destino"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            ${this.construirOpcionesCleaningStatus()}
                        </select>
                    </div>

                    <!-- Motivo -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Motivo del movimiento *
                        </label>
                        <select 
                            id="motivo"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            <option value="MANUAL_ADJUSTMENT">Ajuste Manual</option>
                            <option value="CLEANING_COMPLETED">Limpieza Completada</option>
                            <option value="REPAIR_COMPLETED">Reparación Completada</option>
                            <option value="DAMAGED_IN_USE">Dañado en Uso</option>
                            <option value="DISCARDED">Descartar</option>
                            <option value="LOST">Perdido</option>
                        </select>
                    </div>

                    <!-- Descripción -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Descripción / Notas
                        </label>
                        <textarea 
                            id="descripcion" 
                            rows="3"
                            placeholder="Detalles adicionales del movimiento..."
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        ></textarea>
                    </div>

                    <!-- Costo de reparación (condicional) -->
                    <div id="campo-costo" class="hidden">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Costo de reparación ($)
                        </label>
                        <input 
                            type="number" 
                            id="costo_reparacion"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                    </div>

                    <!-- Botones -->
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
                            ✓ Confirmar Movimiento
                        </button>
                    </div>
                </form>
            </div>
        `;
    },

    /**
     * Genera modal para procesar devolución de alquiler
     * @param {object} lote - Datos del lote alquilado
     * @returns {string} HTML del formulario
     */
    construirFormularioDevolucion(lote) {
        return `
            <div class="p-6">
                <h3 class="text-2xl font-bold mb-4 text-gray-800">
                    Procesar Devolución de Alquiler
                </h3>
                
                <div class="bg-purple-50 p-4 rounded-lg mb-4">
                    <h4 class="font-semibold mb-2">${lote.nombre}</h4>
                    <div class="text-sm text-gray-600">
                        <p>Cantidad alquilada: <strong>${lote.cantidad}</strong></p>
                        <p>Lote: ${lote.lote_numero || 'N/A'}</p>
                    </div>
                </div>

                <form id="form-devolucion" class="space-y-4">
                    <!-- Cantidad devuelta -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Cantidad devuelta *
                        </label>
                        <input 
                            type="number" 
                            id="cantidad_devuelta" 
                            required 
                            min="1"
                            max="${lote.cantidad}"
                            value="${lote.cantidad}"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                    </div>

                    <!-- Estado de limpieza al devolver -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            ¿En qué estado fueron devueltos? *
                        </label>
                        <div class="grid grid-cols-2 gap-3">
                            ${this.construirBotonesRadioCleaningStatus()}
                        </div>
                    </div>

                    <!-- Notas de devolución -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Notas de devolución
                        </label>
                        <textarea 
                            id="notas_devolucion" 
                            rows="3"
                            placeholder="Observaciones sobre el estado de los elementos..."
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        ></textarea>
                    </div>

                    <!-- Costo de reparación (si aplica) -->
                    <div id="campo-costo-reparacion" class="hidden">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Costo de reparación ($)
                        </label>
                        <input 
                            type="number" 
                            id="costo_reparacion"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                    </div>

                    <!-- Botones -->
                    <div class="flex gap-3 justify-end pt-4 border-t">
                        <button 
                            type="button" 
                            onclick="window.cerrarModal()" 
                            class="px-5 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium">
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            class="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium">
                            ✓ Procesar Devolución
                        </button>
                    </div>
                </form>
            </div>
        `;
    },

    /**
     * Genera modal para completar limpieza
     * @param {object} lote - Datos del lote en limpieza
     * @returns {string} HTML del formulario
     */
    construirFormularioCompletarLimpieza(lote) {
        return `
            <div class="p-6">
                <h3 class="text-2xl font-bold mb-4 text-gray-800">
                    Completar Limpieza
                </h3>
                
                <div class="bg-yellow-50 p-4 rounded-lg mb-4">
                    <h4 class="font-semibold mb-2">${lote.nombre}</h4>
                    <div class="text-sm text-gray-600">
                        <p>En limpieza: <strong>${lote.cantidad} unidades</strong></p>
                        <p>Estado: <span class="px-2 py-1 text-xs rounded ${COLORES_CLEANING_STATUS[lote.cleaning_status]}">${CLEANING_STATUS_LABELS[lote.cleaning_status]}</span></p>
                    </div>
                </div>

                <form id="form-completar-limpieza" class="space-y-4">
                    <!-- Cantidad limpiada -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Cantidad limpiada *
                        </label>
                        <input 
                            type="number" 
                            id="cantidad_limpiada" 
                            required 
                            min="1"
                            max="${lote.cantidad}"
                            value="${lote.cantidad}"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                        <p class="mt-1 text-xs text-gray-500">
                            Los elementos quedarán DISPONIBLES y LIMPIOS automáticamente
                        </p>
                    </div>

                    <!-- Notas -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Notas (opcional)
                        </label>
                        <textarea 
                            id="notas_limpieza" 
                            rows="2"
                            placeholder="Detalles del proceso de limpieza..."
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        ></textarea>
                    </div>

                    <!-- Botones -->
                    <div class="flex gap-3 justify-end pt-4 border-t">
                        <button 
                            type="button" 
                            onclick="window.cerrarModal()" 
                            class="px-5 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium">
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            class="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium">
                            ✓ Marcar como Limpio
                        </button>
                    </div>
                </form>
            </div>
        `;
    },

    /**
     * Genera modal para ver historial de movimientos
     * @param {object} elemento - Datos del elemento
     * @param {Array} historial - Array de movimientos
     * @returns {string} HTML de la vista de historial
     */
    construirVistaHistorial(elemento, historial) {
        return `
            <div class="p-6">
                <h3 class="text-2xl font-bold mb-4 text-gray-800">
                    Historial de Movimientos
                </h3>
                
                <div class="bg-gray-50 p-4 rounded-lg mb-4">
                    <h4 class="font-semibold">${elemento.nombre}</h4>
                    <p class="text-sm text-gray-600">Total de movimientos: ${historial.length}</p>
                </div>

                ${historial.length === 0 ? `
                    <div class="text-center py-8 text-gray-500">
                        <p>No hay movimientos registrados</p>
                    </div>
                ` : `
                    <div class="max-h-96 overflow-y-auto space-y-3">
                        ${historial.map(mov => this.construirItemHistorial(mov)).join('')}
                    </div>
                `}

                <div class="flex justify-end pt-4 border-t mt-4">
                    <button 
                        onclick="window.cerrarModal()" 
                        class="px-5 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium">
                        Cerrar
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Construye un item de historial
     * @param {object} movimiento - Datos del movimiento
     * @returns {string} HTML del item
     */
    construirItemHistorial(movimiento) {
        const fecha = new Date(movimiento.fecha_movimiento).toLocaleString('es-CO');
        
        return `
            <div class="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <span class="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                            ${MOTIVOS_LABELS[movimiento.motivo] || movimiento.motivo}
                        </span>
                        <p class="text-xs text-gray-500 mt-1">${fecha}</p>
                    </div>
                    <div class="text-right">
                        <p class="font-bold text-lg">${movimiento.cantidad} unidades</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-2 text-sm mb-2">
                    <div>
                        <span class="text-gray-600">Origen:</span>
                        <span class="px-2 py-1 text-xs rounded ${COLORES_CURRENT_STATUS[movimiento.current_status_origen]} ml-1">
                            ${CURRENT_STATUS_LABELS[movimiento.current_status_origen]}
                        </span>
                    </div>
                    <div>
                        <span class="text-gray-600">Destino:</span>
                        <span class="px-2 py-1 text-xs rounded ${COLORES_CURRENT_STATUS[movimiento.current_status_destino]} ml-1">
                            ${CURRENT_STATUS_LABELS[movimiento.current_status_destino]}
                        </span>
                    </div>
                </div>
                
                ${movimiento.descripcion ? `
                    <p class="text-sm text-gray-600 mt-2">${movimiento.descripcion}</p>
                ` : ''}
                
                ${movimiento.costo_reparacion ? `
                    <p class="text-sm text-red-600 mt-2">
                        💰 Costo de reparación: $${parseFloat(movimiento.costo_reparacion).toLocaleString()}
                    </p>
                ` : ''}
            </div>
        `;
    },

    /**
     * HELPERS - Construcción de opciones HTML
     */

    construirOpcionesCurrentStatus(estadoActual = null) {
        const estados = ['AVAILABLE', 'RENTED', 'CLEANING', 'MAINTENANCE', 'RETIRED'];
        return estados
            .filter(estado => estado !== estadoActual)
            .map(estado => `
                <option value="${estado}">
                    ${ICONOS_CURRENT_STATUS[estado]} ${CURRENT_STATUS_LABELS[estado]}
                </option>
            `).join('');
    },

    construirOpcionesCleaningStatus() {
        const estados = ['CLEAN', 'GOOD', 'DIRTY', 'VERY_DIRTY', 'DAMAGED'];
        return estados.map(estado => `
            <option value="${estado}">
                ${CLEANING_STATUS_LABELS[estado]}
            </option>
        `).join('');
    },

    construirBotonesRadioCleaningStatus() {
        const estados = [
            { value: 'CLEAN', label: '✨ Limpio', color: 'blue' },
            { value: 'DIRTY', label: '💧 Sucio', color: 'yellow' },
            { value: 'VERY_DIRTY', label: '⚠️ Muy Sucio', color: 'orange' },
            { value: 'DAMAGED', label: '⚡ Dañado', color: 'red' }
        ];

        return estados.map((estado, index) => `
            <label class="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-${estado.color}-50 transition">
                <input 
                    type="radio" 
                    name="cleaning_status_devolucion" 
                    value="${estado.value}"
                    ${index === 0 ? 'checked' : ''}
                    class="w-4 h-4 text-${estado.color}-600"
                    onchange="window.toggleCostoReparacion(this.value)"
                >
                <span class="ml-2 font-medium text-gray-800">${estado.label}</span>
            </label>
        `).join('');
    }
};

/**
 * Función helper global para mostrar/ocultar campo de costo
 */
window.toggleCostoReparacion = function(cleaningStatus) {
    const campoCosto = document.getElementById('campo-costo-reparacion');
    if (campoCosto) {
        if (cleaningStatus === 'DAMAGED') {
            campoCosto.classList.remove('hidden');
        } else {
            campoCosto.classList.add('hidden');
        }
    }
};