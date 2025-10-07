// frontend/src/utils/inventarioHelpers.js

/**
 * Utilidades para el módulo de inventario
 * Centraliza helpers, formatters y cálculos
 */

// ============================================
// ESTADOS Y COLORES
// ============================================

/**
 * Mapeo de current_status a información visual
 */
export const CURRENT_STATUS_INFO = {
    AVAILABLE: {
        label: 'Disponible',
        color: 'bg-green-100 text-green-800',
        icon: '✓',
        description: 'Listo para usar'
    },
    RENTED: {
        label: 'Alquilado',
        color: 'bg-blue-100 text-blue-800',
        icon: '📤',
        description: 'En alquiler'
    },
    CLEANING: {
        label: 'En Limpieza',
        color: 'bg-yellow-100 text-yellow-800',
        icon: '🧹',
        description: 'Requiere limpieza'
    },
    MAINTENANCE: {
        label: 'Mantenimiento',
        color: 'bg-orange-100 text-orange-800',
        icon: '🔧',
        description: 'En reparación'
    },
    RETIRED: {
        label: 'Retirado',
        color: 'bg-gray-100 text-gray-800',
        icon: '📦',
        description: 'Fuera de servicio'
    }
};

/**
 * Mapeo de cleaning_status a información visual
 */
export const CLEANING_STATUS_INFO = {
    CLEAN: {
        label: 'Limpio',
        color: 'bg-green-100 text-green-800',
        icon: '✨'
    },
    DIRTY: {
        label: 'Sucio',
        color: 'bg-yellow-100 text-yellow-800',
        icon: '🧽'
    },
    VERY_DIRTY: {
        label: 'Muy Sucio',
        color: 'bg-orange-100 text-orange-800',
        icon: '🧼'
    },
    DAMAGED: {
        label: 'Dañado',
        color: 'bg-red-100 text-red-800',
        icon: '⚠️'
    },
    GOOD: {
        label: 'Buen Estado',
        color: 'bg-green-100 text-green-800',
        icon: '✓'
    }
};

/**
 * Estados clásicos (para elementos con series)
 */
export const COLORES_ESTADO_CLASICO = {
    nuevo: 'bg-blue-100 text-blue-800',
    bueno: 'bg-green-100 text-green-800',
    mantenimiento: 'bg-yellow-100 text-yellow-800',
    prestado: 'bg-purple-100 text-purple-800',
    dañado: 'bg-red-100 text-red-800',
    agotado: 'bg-gray-100 text-gray-800'
};

// ============================================
// FORMATEO DE TEXTO
// ============================================

/**
 * Trunca un texto a una longitud máxima
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Texto truncado
 */
export function truncateText(text, maxLength = 50) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Capitaliza la primera letra de un texto
 * @param {string} text - Texto a capitalizar
 * @returns {string} Texto capitalizado
 */
export function capitalize(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Formatea un número con separadores de miles
 * @param {number} num - Número a formatear
 * @returns {string} Número formateado
 */
export function formatNumber(num) {
    return new Intl.NumberFormat('es-CO').format(num);
}

// ============================================
// CÁLCULOS DE LOTES
// ============================================

/**
 * Agrupa lotes por elemento base y calcula totales
 * @param {Array} elementos - Array de elementos/lotes
 * @returns {Array} Array de elementos agrupados con distribución de estados
 */
export function agruparLotesPorElemento(elementos) {
    const grupos = {};

    for (const elem of elementos) {
        // Si requiere series, no agrupar
        if (elem.requiere_series) {
            grupos[elem.id] = {
                ...elem,
                es_grupo: false,
                total_unidades: elem.cantidad,
                lotes: []
            };
            continue;
        }

        // Agrupar por elemento_base_id
        const baseId = elem.elemento_base_id || elem.id;
        
        if (!grupos[baseId]) {
            grupos[baseId] = {
                id: baseId,
                nombre: elem.nombre,
                descripcion: elem.descripcion,
                categoria_nombre: elem.categoria_nombre,
                subcategoria_nombre: elem.subcategoria_nombre,
                requiere_series: false,
                es_grupo: true,
                total_unidades: 0,
                lotes: [],
                distribucion_estados: {}
            };
        }

        grupos[baseId].total_unidades += elem.cantidad;
        grupos[baseId].lotes.push(elem);

        // Calcular distribución de estados
        const status = elem.current_status;
        if (!grupos[baseId].distribucion_estados[status]) {
            grupos[baseId].distribucion_estados[status] = 0;
        }
        grupos[baseId].distribucion_estados[status] += elem.cantidad;
    }

    return Object.values(grupos);
}

/**
 * Calcula el porcentaje de un estado en la distribución
 * @param {number} cantidad - Cantidad de ese estado
 * @param {number} total - Total de unidades
 * @returns {number} Porcentaje (0-100)
 */
export function calcularPorcentaje(cantidad, total) {
    if (!total || total === 0) return 0;
    return Math.round((cantidad / total) * 100);
}

/**
 * Obtiene el estado dominante en un grupo de lotes
 * @param {object} distribucion - Objeto con distribución de estados
 * @returns {string} Estado dominante
 */
export function obtenerEstadoDominante(distribucion) {
    if (!distribucion || Object.keys(distribucion).length === 0) {
        return 'AVAILABLE';
    }

    let maxCantidad = 0;
    let estadoDominante = 'AVAILABLE';

    for (const [estado, cantidad] of Object.entries(distribucion)) {
        if (cantidad > maxCantidad) {
            maxCantidad = cantidad;
            estadoDominante = estado;
        }
    }

    return estadoDominante;
}

// ============================================
// VALIDACIONES
// ============================================

/**
 * Verifica si un elemento tiene lotes activos
 * @param {object} elemento - Elemento a verificar
 * @returns {boolean}
 */
export function tieneLotesActivos(elemento) {
    if (elemento.requiere_series) return false;
    return elemento.lotes && elemento.lotes.length > 0;
}

/**
 * Calcula cantidad disponible para alquiler
 * @param {object} elemento - Elemento/grupo
 * @returns {number} Cantidad disponible
 */
export function cantidadDisponible(elemento) {
    if (elemento.requiere_series) {
        // Para series, contar las que están en estado "bueno" o "nuevo"
        return elemento.cantidad;
    }

    // Para lotes, sumar AVAILABLE
    const disponible = elemento.distribucion_estados?.AVAILABLE || 0;
    return disponible;
}

// ============================================
// FILTROS Y BÚSQUEDA
// ============================================

/**
 * Filtra elementos por texto de búsqueda
 * @param {Array} elementos - Array de elementos
 * @param {string} searchText - Texto de búsqueda
 * @returns {Array} Elementos filtrados
 */
export function filtrarPorTexto(elementos, searchText) {
    if (!searchText || searchText.trim() === '') return elementos;

    const query = searchText.toLowerCase().trim();

    return elementos.filter(elem => {
        const nombre = (elem.nombre || '').toLowerCase();
        const descripcion = (elem.descripcion || '').toLowerCase();
        const categoria = (elem.categoria_nombre || '').toLowerCase();
        
        return nombre.includes(query) || 
               descripcion.includes(query) || 
               categoria.includes(query);
    });
}

/**
 * Filtra elementos por estado
 * @param {Array} elementos - Array de elementos
 * @param {string} estado - Estado a filtrar
 * @returns {Array} Elementos filtrados
 */
export function filtrarPorEstado(elementos, estado) {
    if (!estado || estado === 'todos') return elementos;

    return elementos.filter(elem => {
        if (elem.requiere_series) {
            return elem.estado === estado;
        } else {
            // Para lotes, verificar si tiene ese estado
            return elem.distribucion_estados && 
                   elem.distribucion_estados[estado] > 0;
        }
    });
}

// ============================================
// ORDENAMIENTO
// ============================================

/**
 * Ordena elementos por nombre
 * @param {Array} elementos - Array de elementos
 * @param {string} orden - 'asc' o 'desc'
 * @returns {Array} Elementos ordenados
 */
export function ordenarPorNombre(elementos, orden = 'asc') {
    return [...elementos].sort((a, b) => {
        const nombreA = (a.nombre || '').toLowerCase();
        const nombreB = (b.nombre || '').toLowerCase();
        
        if (orden === 'asc') {
            return nombreA.localeCompare(nombreB);
        } else {
            return nombreB.localeCompare(nombreA);
        }
    });
}

/**
 * Ordena elementos por cantidad
 * @param {Array} elementos - Array de elementos
 * @param {string} orden - 'asc' o 'desc'
 * @returns {Array} Elementos ordenados
 */
export function ordenarPorCantidad(elementos, orden = 'desc') {
    return [...elementos].sort((a, b) => {
        const cantA = a.total_unidades || a.cantidad || 0;
        const cantB = b.total_unidades || b.cantidad || 0;
        
        return orden === 'asc' ? cantA - cantB : cantB - cantA;
    });
}

// ============================================
// GENERADORES DE LOTE_NUMERO
// ============================================

/**
 * Genera un número de lote único
 * @param {string} nombreElemento - Nombre del elemento
 * @param {string} estado - Estado del lote
 * @returns {string} Número de lote generado
 */
export function generarNumeroLote(nombreElemento, estado) {
    const prefijo = nombreElemento.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    const estadoCorto = estado.substring(0, 3).toUpperCase();
    
    return `${prefijo}-${estadoCorto}-${timestamp}`;
}

// ============================================
// EXPORTS DE CONVENIENCIA
// ============================================

export default {
    CURRENT_STATUS_INFO,
    CLEANING_STATUS_INFO,
    COLORES_ESTADO_CLASICO,
    truncateText,
    capitalize,
    formatNumber,
    agruparLotesPorElemento,
    calcularPorcentaje,
    obtenerEstadoDominante,
    tieneLotesActivos,
    cantidadDisponible,
    filtrarPorTexto,
    filtrarPorEstado,
    ordenarPorNombre,
    ordenarPorCantidad,
    generarNumeroLote
};