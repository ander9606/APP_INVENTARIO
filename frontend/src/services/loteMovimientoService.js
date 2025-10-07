import { request } from './api.js';

/**
 * Servicio para gestionar movimientos entre lotes de elementos
 * Integra con el backend de movimientos de lotes
 */
export const loteMovimientoService = {
    /**
     * Cambiar el estado de un lote (mover unidades entre estados)
     * POST /api/lote-movimientos/cambiar-estado
     * @param {object} datos - Datos del movimiento
     * @param {number} datos.lote_id - ID del lote origen
     * @param {number} datos.cantidad - Cantidad a mover
     * @param {string} datos.current_status_destino - Estado operativo destino
     * @param {string} datos.cleaning_status_destino - Estado de limpieza destino
     * @param {string} datos.motivo - Motivo del movimiento
     * @param {string} datos.descripcion - Descripción opcional
     * @param {number} datos.costo_reparacion - Costo de reparación (opcional)
     * @returns {Promise<{success: boolean, data: object, message: string}>}
     */
    async cambiarEstadoLote(datos) {
        return await request('/lote-movimientos/cambiar-estado', {
            method: 'POST',
            body: JSON.stringify(datos)
        });
    },

    /**
     * Obtener historial de movimientos de un elemento
     * GET /api/lote-movimientos/historial/:id
     * @param {number} elementoBaseId - ID del elemento base
     * @returns {Promise<{success: boolean, data: Array, count: number}>}
     */
    async obtenerHistorial(elementoBaseId) {
        return await request(`/lote-movimientos/historial/${elementoBaseId}`);
    },

    /**
     * Obtener motivos disponibles para movimientos
     * GET /api/lote-movimientos/motivos
     * @returns {Promise<{success: boolean, data: Array}>}
     */
    async obtenerMotivos() {
        return await request('/lote-movimientos/motivos');
    },

    /**
     * Obtener estadísticas de movimientos
     * GET /api/lote-movimientos/estadisticas/:id
     * @param {number} elementoBaseId - ID del elemento base
     * @param {string} fechaInicio - Fecha inicio (opcional)
     * @param {string} fechaFin - Fecha fin (opcional)
     * @returns {Promise<{success: boolean, data: Array}>}
     */
    async obtenerEstadisticas(elementoBaseId, fechaInicio = null, fechaFin = null) {
        let url = `/lote-movimientos/estadisticas/${elementoBaseId}`;
        
        const params = new URLSearchParams();
        if (fechaInicio) params.append('fecha_inicio', fechaInicio);
        if (fechaFin) params.append('fecha_fin', fechaFin);
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        
        return await request(url);
    },

    /**
     * OPERACIONES ESPECÍFICAS DE NEGOCIO
     */

    /**
     * Marcar elementos como alquilados
     * @param {object} datos
     * @param {number} datos.lote_id - ID del lote disponible
     * @param {number} datos.cantidad - Cantidad a alquilar
     * @param {number} datos.rental_id - ID del contrato de alquiler
     * @param {string} datos.descripcion - Descripción del alquiler
     * @returns {Promise<object>}
     */
    async marcarComoAlquilado(datos) {
        return await this.cambiarEstadoLote({
            lote_id: datos.lote_id,
            cantidad: datos.cantidad,
            current_status_destino: 'RENTED',
            cleaning_status_destino: 'GOOD',
            motivo: 'RENTED_OUT',
            descripcion: datos.descripcion || `Alquiler #${datos.rental_id}`,
            rental_id: datos.rental_id
        });
    },

    /**
     * Procesar devolución de alquiler
     * @param {object} datos
     * @param {number} datos.lote_alquilado_id - ID del lote alquilado
     * @param {number} datos.cantidad - Cantidad devuelta
     * @param {string} datos.cleaning_status_devolucion - Estado de limpieza al devolver
     * @param {number} datos.rental_id - ID del contrato de alquiler
     * @param {string} datos.notas - Notas de la devolución
     * @param {number} datos.costo_reparacion - Costo de reparación si aplica
     * @returns {Promise<object>}
     */
    async procesarDevolucion(datos) {
        // Determinar current_status y motivo según el cleaning_status
        let current_status_destino;
        let motivo;
        
        switch(datos.cleaning_status_devolucion) {
            case 'CLEAN':
                current_status_destino = 'AVAILABLE';
                motivo = 'RETURNED_CLEAN';
                break;
            case 'DIRTY':
            case 'VERY_DIRTY':
                current_status_destino = 'CLEANING';
                motivo = 'RETURNED_DIRTY';
                break;
            case 'DAMAGED':
                current_status_destino = 'MAINTENANCE';
                motivo = 'RETURNED_DAMAGED';
                break;
            default:
                current_status_destino = 'CLEANING';
                motivo = 'RETURNED_DIRTY';
        }
        
        return await this.cambiarEstadoLote({
            lote_id: datos.lote_alquilado_id,
            cantidad: datos.cantidad,
            current_status_destino: current_status_destino,
            cleaning_status_destino: datos.cleaning_status_devolucion,
            motivo: motivo,
            descripcion: datos.notas || 'Devolución de alquiler',
            rental_id: datos.rental_id,
            costo_reparacion: datos.costo_reparacion || null
        });
    },

    /**
     * Completar limpieza de elementos
     * @param {object} datos
     * @param {number} datos.lote_limpieza_id - ID del lote en limpieza
     * @param {number} datos.cantidad - Cantidad limpiada
     * @param {string} datos.notas - Notas de la limpieza
     * @returns {Promise<object>}
     */
    async completarLimpieza(datos) {
        return await this.cambiarEstadoLote({
            lote_id: datos.lote_limpieza_id,
            cantidad: datos.cantidad,
            current_status_destino: 'AVAILABLE',
            cleaning_status_destino: 'CLEAN',
            motivo: 'CLEANING_COMPLETED',
            descripcion: datos.notas || 'Limpieza completada'
        });
    },

    /**
     * Completar reparación/mantenimiento
     * @param {object} datos
     * @param {number} datos.lote_mantenimiento_id - ID del lote en mantenimiento
     * @param {number} datos.cantidad - Cantidad reparada
     * @param {number} datos.costo_reparacion - Costo de la reparación
     * @param {string} datos.notas - Notas de la reparación
     * @returns {Promise<object>}
     */
    async completarReparacion(datos) {
        return await this.cambiarEstadoLote({
            lote_id: datos.lote_mantenimiento_id,
            cantidad: datos.cantidad,
            current_status_destino: 'AVAILABLE',
            cleaning_status_destino: 'GOOD',
            motivo: 'REPAIR_COMPLETED',
            descripcion: datos.notas || 'Reparación completada',
            costo_reparacion: datos.costo_reparacion
        });
    },

    /**
     * Marcar elementos como dañados en uso
     * @param {object} datos
     * @param {number} datos.lote_id - ID del lote disponible o alquilado
     * @param {number} datos.cantidad - Cantidad dañada
     * @param {string} datos.descripcion - Descripción del daño
     * @returns {Promise<object>}
     */
    async marcarComoDanado(datos) {
        return await this.cambiarEstadoLote({
            lote_id: datos.lote_id,
            cantidad: datos.cantidad,
            current_status_destino: 'MAINTENANCE',
            cleaning_status_destino: 'DAMAGED',
            motivo: 'DAMAGED_IN_USE',
            descripcion: datos.descripcion || 'Dañado en uso'
        });
    },

    /**
     * Marcar elementos como perdidos
     * @param {object} datos
     * @param {number} datos.lote_id - ID del lote
     * @param {number} datos.cantidad - Cantidad perdida
     * @param {string} datos.descripcion - Descripción de la pérdida
     * @returns {Promise<object>}
     */
    async marcarComoPerdido(datos) {
        return await this.cambiarEstadoLote({
            lote_id: datos.lote_id,
            cantidad: datos.cantidad,
            current_status_destino: 'RETIRED',
            cleaning_status_destino: 'GOOD',
            motivo: 'LOST',
            descripcion: datos.descripcion || 'Elemento perdido'
        });
    },

    /**
     * Descartar elementos dañados irreparables
     * @param {object} datos
     * @param {number} datos.lote_id - ID del lote en mantenimiento
     * @param {number} datos.cantidad - Cantidad a descartar
     * @param {string} datos.razon - Razón del descarte
     * @returns {Promise<object>}
     */
    async descartarElementos(datos) {
        return await this.cambiarEstadoLote({
            lote_id: datos.lote_id,
            cantidad: datos.cantidad,
            current_status_destino: 'RETIRED',
            cleaning_status_destino: 'DAMAGED',
            motivo: 'DISCARDED',
            descripcion: datos.razon || 'Descartado por daño irreparable'
        });
    }
};