// frontend/src/components/inventario/GestionEstadosModal.js

import { CURRENT_STATUS_INFO, CLEANING_STATUS_INFO } from '../../utils/inventarioHelpers.js';
import { EstadoBar } from './EstadoBar.js';

/**
 * Componente: Modal para gestionar estados de lotes
 * Permite mover unidades entre diferentes estados (AVAILABLE, RENTED, CLEANING, etc.)
 * 
 * RESPONSABILIDAD: Renderizar interfaz para cambios de estado en lotes
 */
export const GestionEstadosModal = {
    
    /**
     * Renderiza el modal completo de gestión de estados
     * @param {object} elemento - Elemento con lotes
     * @returns {string} HTML del modal
     */
    render(elemento) {
        return `
            <div class="p-6 max-w-4xl">
                ${this.renderHeader(elemento)}
                ${this.renderDistribucionActual(elemento)}
                ${this.renderFormularioMovimiento(elemento)}
                ${this.renderBotones()}
            </div>
        `;
    },

    /**
     * Renderiza el header del modal
     */
    renderHeader(elemento) {
        return `
            <div class="mb-6">
                <h3 class="text-2xl font-bold text-gray-800 mb-2">
                    Gestionar Estados
                </h3>
                <p class="text-gray-600">
                    <strong>${elemento.nombre}</strong> - ${elemento.total_unidades} unidades totales
                </p>
            </div>
        `;
    },

    /**
     * Renderiza la distribución actual de estados
     */
    renderDistribucionActual(elemento) {
        return `
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 class="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                    Distribución Actual
                </h4>
                ${EstadoBar.render({
                    distribucion: elemento.distribucion_estados,
                    total: elemento.total_unidades,
                    mostrarLeyenda: true,
                    tamano: 'large'
                })}
            </div>
        `;
    },

    /**
     * Renderiza el formulario para mover unidades
     */
    renderFormularioMovimiento(elemento) {
        return `
            <form id="form-mover-estado" class="space-y-4">
                ${this.renderSelectorLoteOrigen(elemento)}
                ${this.renderCampoCantidad()}
                ${this.renderSelectorEstadoDestino()}
                ${this.renderSelectorEstadoLimpieza()}
                ${this.renderSelectorMotivo()}
                ${this.renderCampoDescripcion()}
                ${this.renderCampoCostoReparacion()}
            </form>
        `;
    },

    /**
     * Renderiza selector de lote origen
     */
    renderSelectorLoteOrigen(elemento) {
        if (!elemento.lotes || elemento.lotes.length === 0) {
            return `
                <div class="text-red-500 text-sm">
                    No hay lotes disponibles para mover
                </div>
            `;
        }

        const opciones = elemento.lotes
            .map(lote => {
                const info = CURRENT_STATUS_INFO[lote.current_status];
                return `
                    <option value="${lote.id}" data-cantidad="${lote.cantidad}">
                        ${info?.label || lote.current_status} - ${lote.cantidad} unidades 
                        ${lote.lote_numero ? `(${lote.lote_numero})` : ''}
                    </option>
                `;
            })
            .join('');

        return `
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Desde lote: *
                </label>
                <select 
                    id="lote_origen"
                    required
                    onchange="window.GestionEstadosModal.actualizarCantidadMaxima()"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    <option value="">Selecciona un lote</option>
                    ${opciones}
                </select>
            </div>
        `;
    },

    /**
     * Renderiza campo de cantidad
     */
    renderCampoCantidad() {
        return `
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad a mover: *
                </label>
                <input 
                    type="number" 
                    id="cantidad"
                    required
                    min="1"
                    placeholder="Ej: 5"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <p class="mt-1 text-xs text-gray-500" id="info-cantidad">
                    Selecciona primero el lote origen
                </p>
            </div>
        `;
    },

    /**
     * Renderiza selector de estado destino
     */
    renderSelectorEstadoDestino() {
        const opciones = Object.entries(CURRENT_STATUS_INFO)
            .map(([key, info]) => `
                <option value="${key}">${info.icon} ${info.label}</option>
            `)
            .join('');

        return `
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Estado destino: *
                </label>
                <select 
                    id="estado_destino"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    <option value="">Selecciona un estado</option>
                    ${opciones}
                </select>
            </div>
        `;
    },

    /**
     * Renderiza selector de estado de limpieza
     */
    renderSelectorEstadoLimpieza() {
        const opciones = Object.entries(CLEANING_STATUS_INFO)
            .map(([key, info]) => `
                <option value="${key}">${info.icon} ${info.label}</option>
            `)
            .join('');

        return `
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Estado de limpieza: *
                </label>
                <select 
                    id="estado_limpieza"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    <option value="">Selecciona un estado</option>
                    ${opciones}
                </select>
            </div>
        `;
    },

    /**
     * Renderiza selector de motivo
     */
    renderSelectorMotivo() {
        // Motivos comunes
        const motivos = [
            { value: 'RENTED_OUT', label: 'Alquilado' },
            { value: 'RETURNED_CLEAN', label: 'Devuelto limpio' },
            { value: 'RETURNED_DIRTY', label: 'Devuelto sucio' },
            { value: 'RETURNED_DAMAGED', label: 'Devuelto dañado' },
            { value: 'CLEANING_COMPLETED', label: 'Limpieza completada' },
            { value: 'SENT_TO_MAINTENANCE', label: 'Enviado a mantenimiento' },
            { value: 'MAINTENANCE_COMPLETED', label: 'Mantenimiento completado' },
            { value: 'DAMAGED', label: 'Dañado' },
            { value: 'LOST', label: 'Perdido' },
            { value: 'RETIRED', label: 'Retirado del servicio' }
        ];

        const opciones = motivos
            .map(m => `<option value="${m.value}">${m.label}</option>`)
            .join('');

        return `
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Motivo: *
                </label>
                <select 
                    id="motivo"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    <option value="">Selecciona un motivo</option>
                    ${opciones}
                </select>
            </div>
        `;
    },

    /**
     * Renderiza campo de descripción
     */
    renderCampoDescripcion() {
        return `
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Descripción / Notas:
                </label>
                <textarea 
                    id="descripcion"
                    rows="3"
                    placeholder="Detalles adicionales sobre el movimiento..."
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
            </div>
        `;
    },

    /**
     * Renderiza campo de costo de reparación (opcional)
     */
    renderCampoCostoReparacion() {
        return `
            <div id="campo-costo" style="display: none;">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Costo de reparación:
                </label>
                <div class="relative">
                    <span class="absolute left-3 top-2 text-gray-500">$</span>
                    <input 
                        type="number" 
                        id="costo_reparacion"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        class="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>
            </div>
        `;
    },

    /**
     * Renderiza los botones del formulario
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
                    form="form-mover-estado"
                    class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                    ✓ Mover Unidades
                </button>
            </div>
        `;
    },

    /**
     * Actualiza la cantidad máxima permitida según el lote seleccionado
     */
    actualizarCantidadMaxima() {
        const select = document.getElementById('lote_origen');
        const inputCantidad = document.getElementById('cantidad');
        const info = document.getElementById('info-cantidad');

        if (!select || !inputCantidad || !info) return;

        const option = select.options[select.selectedIndex];
        const cantidadMax = option.dataset.cantidad;

        if (cantidadMax) {
            inputCantidad.max = cantidadMax;
            inputCantidad.value = cantidadMax; // Auto-completar con el máximo
            info.textContent = `Máximo: ${cantidadMax} unidades disponibles`;
            info.classList.remove('text-gray-500');
            info.classList.add('text-blue-600');
        } else {
            inputCantidad.max = '';
            inputCantidad.value = '';
            info.textContent = 'Selecciona primero el lote origen';
            info.classList.remove('text-blue-600');
            info.classList.add('text-gray-500');
        }
    }
};

// Exponer globalmente
window.GestionEstadosModal = GestionEstadosModal;

export default GestionEstadosModal;