// utils/construirArbol.js

/**
 * Construye una estructura jerárquica (árbol) a partir de una lista plana de categorías
 * @param {Array} categorias - Lista plana de categorías con id y padre_id
 * @returns {Array} - Array de categorías raíz con sus hijos anidados
 */
export function construirArbol(categorias) {
    const mapa = {};
    const raices = [];

    // Validar entrada
    if (!Array.isArray(categorias) || categorias.length === 0) {
        return [];
    }

    // Paso 1: Crear el mapa con todas las categorías
    for (const categoria of categorias) {
        mapa[categoria.id] = { ...categoria, hijos: [] };
    }

    // Paso 2: Enganchar cada categoría a su padre (si existe)
    for (const categoria of categorias) {
        const padreId = categoria.padre_id;

        if (padreId && mapa[padreId]) {
            // Si el padre existe en el mapa, se anida
            mapa[padreId].hijos.push(mapa[categoria.id]);
        } else if (padreId) {
            // El padreId existe pero no está en el mapa (error de datos)
            console.warn(
                `⚠️ La categoría "${categoria.nombre}" (id: ${categoria.id}) ` +
                `tiene un padre con id ${padreId} que no se encontró en la lista`
            );
            // Lo agregamos como raíz para no perderlo
            raices.push(mapa[categoria.id]);
        } else {
            // Si no tiene padre, es raíz
            raices.push(mapa[categoria.id]);
        }
    }

    return raices;
}

/**
 * Alias de construirArbol para mantener compatibilidad
 */
export const construirJerarquia = construirArbol;

/**
 * Función para aplanar un árbol jerárquico de vuelta a lista plana
 * @param {Array} arbol - Array de nodos raíz con hijos anidados
 * @returns {Array} - Lista plana de todas las categorías
 */
export function aplanarArbol(arbol) {
    const resultado = [];

    function recorrer(nodos) {
        for (const nodo of nodos) {
            const { hijos, ...categoria } = nodo;
            resultado.push(categoria);
            
            if (hijos && hijos.length > 0) {
                recorrer(hijos);
            }
        }
    }

    recorrer(arbol);
    return resultado;
}

/**
 * Encuentra una categoría por ID en un árbol jerárquico
 * @param {Array} arbol - Array de nodos raíz
 * @param {number} id - ID de la categoría a buscar
 * @returns {Object|null} - La categoría encontrada o null
 */
export function buscarEnArbol(arbol, id) {
    for (const nodo of arbol) {
        if (nodo.id === id) {
            return nodo;
        }
        
        if (nodo.hijos && nodo.hijos.length > 0) {
            const encontrado = buscarEnArbol(nodo.hijos, id);
            if (encontrado) {
                return encontrado;
            }
        }
    }
    
    return null;
}