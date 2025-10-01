import { API_BASE_URL } from '../utils/constants.js';

/**
 * Función base para hacer peticiones HTTP al backend
 * @param {string} endpoint - Ruta del endpoint (ej: '/categorias')
 * @param {object} options - Opciones de fetch (method, body, headers)
 * @returns {Promise<object>} - Respuesta del servidor
 */
export async function request(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        const data = await response.json();

        // Si la respuesta no es exitosa, lanzar error
        if (!response.ok) {
            throw new Error(data.error || 'Error en la petición');
        }

        return data;
    } catch (error) {
        console.error('Error en API:', error);
        throw error;
    }
}

/**
 * Helpers para métodos HTTP comunes
 */
export const http = {
    get: (endpoint) => request(endpoint),
    
    post: (endpoint, body) => request(endpoint, {
        method: 'POST',
        body: JSON.stringify(body)
    }),
    
    put: (endpoint, body) => request(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body)
    }),
    
    delete: (endpoint) => request(endpoint, {
        method: 'DELETE'
    })
};