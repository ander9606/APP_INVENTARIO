import { request } from './api.js';

/**
 * Servicio para gestionar series de elementos individuales
 */
export const serieService = {
    /**
     * Obtiene todas las series de un elemento específico
     * GET /api/series/elemento/:id_elemento
     * @param {number} idElemento - ID del elemento
     * @returns {Promise<{success: boolean, data: Array, count: number}>}
     */
    async obtenerPorElemento(idElemento) {
        return await request(`/series/elemento/${idElemento}`);
    },

    /**
     * Crea una nueva serie para un elemento
     * POST /api/series
     * @param {object} datos - Datos de la serie
     * @param {number} datos.id_elemento - ID del elemento
     * @param {string} datos.numero_serie - Número de serie único
     * @param {string} datos.estado - Estado de la serie
     * @param {string} datos.fecha_ingreso - Fecha de ingreso
     * @param {string} datos.ubicacion - Ubicación física
     * @returns {Promise<{success: boolean, data: object, message: string}>}
     */
    async crear(datos) {
        return await request('/series', {
            method: 'POST',
            body: JSON.stringify(datos)
        });
    },

    /**
     * Actualiza una serie existente
     * PUT /api/series/:id
     * @param {number} id - ID de la serie
     * @param {object} datos - Datos a actualizar
     * @returns {Promise<{success: boolean, message: string}>}
     */
    async actualizar(id, datos) {
        return await request(`/series/${id}`, {
            method: 'PUT',
            body: JSON.stringify(datos)
        });
    },

    /**
     * Elimina una serie
     * DELETE /api/series/:id
     * @param {number} id - ID de la serie
     * @returns {Promise<{success: boolean, message: string}>}
     */
    async eliminar(id) {
        return await request(`/series/${id}`, {
            method: 'DELETE'
        });
    }
};