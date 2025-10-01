import { request } from './api.js';

/**
 * Servicio para gestionar elementos del inventario
 */
export const elementoService = {
    /**
     * Obtiene todos los elementos del inventario
     * GET /api/elementos
     * @returns {Promise<{success: boolean, data: Array, count: number}>}
     */
    async obtenerTodos() {
        return await request('/elementos');
    },

    /**
     * Obtiene un elemento específico por ID (con series si aplica)
     * GET /api/elementos/:id
     * @param {number} id - ID del elemento
     * @returns {Promise<{success: boolean, data: object}>}
     */
    async obtenerPorId(id) {
        return await request(`/elementos/${id}`);
    },

    /**
     * Crea un nuevo elemento
     * POST /api/elementos
     * @param {object} datos - Datos del elemento
     * @param {string} datos.nombre - Nombre del elemento
     * @param {string} datos.descripcion - Descripción
     * @param {number} datos.cantidad - Cantidad
     * @param {boolean} datos.requiere_series - Si necesita números de serie
     * @param {number} datos.categoria_id - ID de categoría/subcategoría
     * @param {number} datos.material_id - ID del material
     * @param {number} datos.unidad_id - ID de la unidad
     * @param {string} datos.estado - Estado del elemento
     * @param {string} datos.ubicacion - Ubicación física
     * @param {Array} datos.series - Array de series si requiere_series es true
     * @returns {Promise<{success: boolean, data: object, message: string}>}
     */
    async crear(datos) {
        return await request('/elementos', {
            method: 'POST',
            body: JSON.stringify(datos)
        });
    },

    /**
     * Actualiza un elemento existente
     * PUT /api/elementos/:id
     * @param {number} id - ID del elemento
     * @param {object} datos - Datos a actualizar
     * @returns {Promise<{success: boolean, message: string}>}
     */
    async actualizar(id, datos) {
        return await request(`/elementos/${id}`, {
            method: 'PUT',
            body: JSON.stringify(datos)
        });
    },

    /**
     * Elimina un elemento
     * DELETE /api/elementos/:id
     * @param {number} id - ID del elemento
     * @returns {Promise<{success: boolean, message: string}>}
     */
    async eliminar(id) {
        return await request(`/elementos/${id}`, {
            method: 'DELETE'
        });
    }
};