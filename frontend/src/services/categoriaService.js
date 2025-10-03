import { request } from './api.js';

/**
 * Servicio para interactuar con el endpoint de categorías
 * Cada método corresponde a un endpoint de tu backend
 */
export const categoriaService = {
    /**
     * Obtiene todas las categorías padre (sin jerarquía)
     * GET /api/categorias
     * @returns {Promise<{success: boolean, data: Array, count: number}>}
     */
    async obtenerTodas() {
        return await request('/categorias');
    },

    /**
     * Obtiene categorías en estructura jerárquica (árbol)
     * GET /api/categorias/jerarquia
     * @returns {Promise<{success: boolean, data: Array, count: number}>}
     */
    async obtenerJerarquia() {
        return await request('/categorias/jerarquia');
    },

    /**
     * Obtiene subcategorías de una categoría específica
     * GET /api/categorias/:id/subcategorias
     * @param {number} id - ID de la categoría padre
     * @returns {Promise<{success: boolean, data: Array, count: number}>}
     */
    async obtenerSubcategorias(id) {
        return await request(`/categorias/${id}/subcategorias`);
    },

    /**
     * Crea una nueva categoría o subcategoría
     * POST /api/categorias
     * @param {object} datos - {nombre: string, padre_id?: number}
     * @returns {Promise<{success: boolean, data: object, message: string}>}
     */
    async crear(datos) {
        return await request('/categorias', {
            method: 'POST',
            body: JSON.stringify(datos)
        });
    },

    /**
     * Elimina una categoría y sus hijos
     * DELETE /api/categorias/:id
     * @param {number} id - ID de la categoría a eliminar
     * @returns {Promise<{success: boolean, message: string}>}
     */
    async eliminar(id) {
        return await request(`/categorias/${id}`, {
            method: 'DELETE'
        });
    }
};