// frontend/src/components/inventario/GestionEstadosModal.js
// VERSIÓN SIMPLIFICADA PARA SISTEMA DE COLUMNAS

import { CURRENT_STATUS_INFO } from '../../utils/inventarioHelpers.js';
import { EstadoBar } from './EstadoBar.js';

/**
 * Modal simplificado para gestionar estados usando columnas de cantidad
 */
export const GestionEstadosModal = {
    
    /**
     * Renderiza el modal completo
     */
    render(elemento) {
        const distribucion = {
            AVAILABLE: elemento.cantidad_disponible || 0,
            RENTED: elemento.cantidad_alquilada || 0,
            CLEANING: elemento.cantidad_en_limpieza || 0,
            MAINTENANCE: elemento.cantidad_en_mantenimiento || 0,
            DAMAGED: elemento.cantidad_danada || 0
        };

        return `
            <div class="p-6 max-w-3xl">
                ${this.renderHeader(elemento)}
                ${this.renderDistribucionActual(distribucion, elemento.cantidad)}
                ${this.renderFormulario(distribucion)}
                ${this.renderBotones()}
            </div>
        `;
    },

    /**
     * Header del modal
     */
    renderHeader(elemento) {
        return `
            <div class="mb-6">
                <h3 class="text-2xl font-bold text-gray-800 mb-2">
                    Gestionar Estados
                </h3>
                <p class="text-gray-600">
                    <strong>${elemento.nombre}</strong> - ${elemento.cantidad} unidades totales
                </p>
            </div>
        `;
    },

    /**
     * Muestra distribución actual
     */
    renderDistribucionActual(distribucion, total) {
        return `
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 class="font-semibold text-gray-800 mb-3">Distribución Actual</h4>
                ${EstadoBar.render({
                    distribucion,
                    total,
                    mostrarLeyenda: true,
                    tamano: 'large'
                })}
            </div>
        `;
    },

    /**
     * Formulario para actualizar cantidades
     */
    renderFormulario(distribucion) {
        return `
            <form id="form-actualizar-estados" class="space-y-4">
                <p class="text-sm text-gray-600 mb-4">
                    Actualiza las cantidades en cada estado. La suma debe coincidir con la cantidad total.
                </p>
                
                ${this.renderCampoEstado('AVAILABLE', 'Disponible', distribucion.AVAILABLE)}
                ${this.renderCampoEstado('RENTED', 'Alquilado', distribucion.RENTED)}
                ${this.renderCampoEstado('CLEANING', 'En Limpieza', distribucion.CLEANING)}
                ${this.renderCampoEstado('MAINTENANCE', 'Mantenimiento', distribucion.MAINTENANCE)}
                ${this.renderCampoEstado('DAMAGED', 'Dañado', distribucion.DAMAGED)}
                
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p class="text-sm text-yellow-800">
                        <strong>💡 Nota:</strong> Los cambios se guardarán directamente. 
                        Asegúrate de que las cantidades sean correctas.
                    </p>
                </div>
            </form>
        `;
    },

    /**
     * Campo para un estado
     */
    renderCampoEstado(codigo, label, valorActual) {
        const info = CURRENT_STATUS_INFO[codigo];
        
        return `
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    ${info.icon} ${label}
                </label>
                <input 
                    type="number" 
                    id="cantidad_${codigo}"
                    name="cantidad_${codigo}"
                    min="0"
                    value="${valorActual}"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
            </div>
        `;
    },

    /**
     * Botones del formulario
     */
    renderBotones() {
        return `
            <div class="flex gap-3 justify-end pt-6 border-t mt-6">
                <button 
                    type="button" 
                    onclick="window.cerrarModal()" 
                    class="px-5 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium">
                    Cancelar
                </button>
                <button 
                    type="submit"
                    form="form-actualizar-estados"
                    class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                    ✓ Guardar Cambios
                </button>
            </div>
        `;
    }
};

// Exponer globalmente
window.GestionEstadosModal = GestionEstadosModal;

export default GestionEstadosModal;