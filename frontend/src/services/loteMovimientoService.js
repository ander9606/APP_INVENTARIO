// frontend/src/services/loteMovimientoService.js

import { request } from './api.js';

/**
 * Servicio para gestionar movimientos entre lotes de elementos
 * Comunica con los endpoints del backend para cambios de estado
 */
export const loteMovimientoService = {
    
    /**
     * Cambia el estado de un lote (mueve unidades entre estados)
     * POST /api/lote-movimientos/cambiar-estado
     * @param {object} datos - Datos del movimiento
     * @param {number} datos.lote_id - ID del lote origen
     * @param {number} datos.cantidad - Cantidad a mover
     * @param {string} datos.current_status_destino - Estado destino (AVAILABLE, RENTED, CLEANING, etc.)
     * @param {string} datos.cleaning_status_destino - Estado de limpieza destino
     * @param {string} datos.motivo - Motivo del movimiento
     * @param {string} datos.descripcion - Descripción adicional (opcional)
     * @param {number} datos.costo_reparacion - Costo si aplica (opcional)
     * @returns {Promise<{success: boolean, data: object, message: string}>}
     */
    async cambiarEstado(datos) {
        return await request('/lote-movimientos/cambiar-estado', {
            method: 'POST',
            body: JSON.stringify(datos)
        });
    },

    /**
     * Obtiene el historial de movimientos de un elemento
     * GET /api/lote-movimientos/historial/:id
     * @param {number} elementoBaseId - ID del elemento base
     * @returns {Promise<{success: boolean, data: Array, count: number}>}
     */
    async obtenerHistorial(elementoBaseId) {
        return await request(`/lote-movimientos/historial/${elementoBaseId}`);
    },

    /**
     * Obtiene los motivos disponibles para movimientos
     * GET /api/lote-movimientos/motivos
     * @returns {Promise<{success: boolean, data: Array}>}
     */
    async obtenerMotivos() {
        return await request('/lote-movimientos/motivos');
    },

    /**
     * Obtiene estadísticas de movimientos de un elemento
     * GET /api/lote-movimientos/estadisticas/:id
     * @param {number} elementoBaseId - ID del elemento base
     * @param {object} opciones - Opciones de filtrado
     * @param {string} opciones.fecha_inicio - Fecha de inicio (YYYY-MM-DD)
     * @param {string} opciones.fecha_fin - Fecha de fin (YYYY-MM-DD)
     * @returns {Promise<{success: boolean, data: Array}>}
     */
    async obtenerEstadisticas(elementoBaseId, opciones = {}) {
        const query = new URLSearchParams(opciones).toString();
        const url = `/lote-movimientos/estadisticas/${elementoBaseId}${query ? `?${query}` : ''}`;
        return await request(url);
    },

    // ============================================
    // MÉTODOS DE CONVENIENCIA
    // ============================================

    /**
     * Marca unidades como alquiladas
     * @param {object} datos - Datos del alquiler
     * @param {number} datos.lote_id - ID del lote
     * @param {number} datos.cantidad - Cantidad a alquilar
     * @param {number} datos.rental_id - ID del alquiler (opcional)
     * @param {string} datos.descripcion - Notas (opcional)
     * @returns {Promise}
     */
    async marcarComoAlquilado(datos) {
        return await this.cambiarEstado({
            lote_id: datos.lote_id,
            cantidad: datos.cantidad,
            current_status_destino: 'RENTED',
            cleaning_status_destino: 'GOOD',
            motivo: 'RENTED_OUT',
            descripcion: datos.descripcion,
            rental_id: datos.rental_id
        });
    },

    /**
     * Procesa devolución de alquiler
     * @param {object} datos - Datos de la devolución
     * @param {number} datos.lote_alquilado_id - ID del lote alquilado
     * @param {number} datos.cantidad - Cantidad devuelta
     * @param {string} datos.cleaning_status_devolucion - Estado de limpieza (CLEAN, DIRTY, VERY_DIRTY, DAMAGED)
     * @param {string} datos.notas - Notas de devolución (opcional)
     * @param {number} datos.costo_reparacion - Costo si está dañado (opcional)
     * @returns {Promise}
     */
    async procesarDevolucion(datos) {
        // Determinar estado destino según limpieza
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

        return await this.cambiarEstado({
            lote_id: datos.lote_alquilado_id,
            cantidad: datos.cantidad,
            current_status_destino,
            cleaning_status_destino: datos.cleaning_status_devolucion,
            motivo,
            descripcion: datos.notas,
            costo_reparacion: datos.costo_reparacion
        });
    },

    /**
     * Completa el proceso de limpieza
     * @param {object} datos - Datos de finalización de limpieza
     * @param {number} datos.lote_limpieza_id - ID del lote en limpieza
     * @param {number} datos.cantidad - Cantidad limpia
     * @param {string} datos.notas - Notas (opcional)
     * @returns {Promise}
     */
    async completarLimpieza(datos) {
        return await this.cambiarEstado({
            lote_id: datos.lote_limpieza_id,
            cantidad: datos.cantidad,
            current_status_destino: 'AVAILABLE',
            cleaning_status_destino: 'CLEAN',
            motivo: 'CLEANING_COMPLETED',
            descripcion: datos.notas
        });
    },

    /**
     * Envía unidades a mantenimiento
     * @param {object} datos - Datos del mantenimiento
     * @param {number} datos.lote_id - ID del lote
     * @param {number} datos.cantidad - Cantidad a enviar
     * @param {string} datos.motivo_detalle - Descripción del problema
     * @param {number} datos.costo_estimado - Costo estimado (opcional)
     * @returns {Promise}
     */
    async enviarAMantenimiento(datos) {
        return await this.cambiarEstado({
            lote_id: datos.lote_id,
            cantidad: datos.cantidad,
            current_status_destino: 'MAINTENANCE',
            cleaning_status_destino: 'DAMAGED',
            motivo: 'SENT_TO_MAINTENANCE',
            descripcion: datos.motivo_detalle,
            costo_reparacion: datos.costo_estimado
        });
    },

    /**
     * Completa mantenimiento/reparación
     * @param {object} datos - Datos de finalización
     * @param {number} datos.lote_mantenimiento_id - ID del lote en mantenimiento
     * @param {number} datos.cantidad - Cantidad reparada
     * @param {number} datos.costo_final - Costo final de reparación
     * @param {string} datos.notas - Notas (opcional)
     * @returns {Promise}
     */
    async completarMantenimiento(datos) {
        return await this.cambiarEstado({
            lote_id: datos.lote_mantenimiento_id,
            cantidad: datos.cantidad,
            current_status_destino: 'AVAILABLE',
            cleaning_status_destino: 'GOOD',
            motivo: 'MAINTENANCE_COMPLETED',
            descripcion: datos.notas,
            costo_reparacion: datos.costo_final
        });
    },

    /**
     * Retira unidades del servicio (da de baja)
     * @param {object} datos - Datos de retiro
     * @param {number} datos.lote_id - ID del lote
     * @param {number} datos.cantidad - Cantidad a retirar
     * @param {string} datos.motivo_retiro - Razón del retiro
     * @returns {Promise}
     */
    async retirarDelServicio(datos) {
        return await this.cambiarEstado({
            lote_id: datos.lote_id,
            cantidad: datos.cantidad,
            current_status_destino: 'RETIRED',
            cleaning_status_destino: 'DAMAGED',
            motivo: 'RETIRED',
            descripcion: datos.motivo_retiro
        });
    }
};

// Exportar servicio
export default loteMovimientoService;