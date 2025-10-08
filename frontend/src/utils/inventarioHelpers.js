// frontend/src/utils/inventarioHelpers.js
// VERSIÓN ADAPTADA PARA SISTEMA DE COLUMNAS DE CANTIDAD

/**
 * Mapeo de estados usando las columnas de cantidad
 */
export const ESTADO_COLUMNAS = {
    AVAILABLE: 'cantidad_disponible',
    RENTED: 'cantidad_alquilada',
    CLEANING: 'cantidad_en_limpieza',
    MAINTENANCE: 'cantidad_en_mantenimiento',
    DAMAGED: 'cantidad_danada'
};

export const CURRENT_STATUS_INFO = {
    AVAILABLE: {
        label: 'Disponible',
        color: 'bg-green-100 text-green-800',
        icon: '✓',
        columna: 'cantidad_disponible'
    },
    RENTED: {
        label: 'Alquilado',
        color: 'bg-blue-100 text-blue-800',
        icon: '📤',
        columna: 'cantidad_alquilada'
    },
    CLEANING: {
        label: 'En Limpieza',
        color: 'bg-yellow-100 text-yellow-800',
        icon: '🧹',
        columna: 'cantidad_en_limpieza'
    },
    MAINTENANCE: {
        label: 'Mantenimiento',
        color: 'bg-orange-100 text-orange-800',
        icon: '🔧',
        columna: 'cantidad_en_mantenimiento'
    },
    DAMAGED: {
        label: 'Dañado',
        color: 'bg-red-100 text-red-800',
        icon: '⚠️',
        columna: 'cantidad_danada'
    }
};

export const COLORES_ESTADO_CLASICO = {
    nuevo: 'bg-blue-100 text-blue-800',
    bueno: 'bg-green-100 text-green-800',
    mantenimiento: 'bg-yellow-100 text-yellow-800',
    prestado: 'bg-purple-100 text-purple-800',
    dañado: 'bg-red-100 text-red-800',
    agotado: 'bg-gray-100 text-gray-800'
};

/**
 * Construye distribución de estados desde las columnas de cantidad
 */
export function construirDistribucionEstados(elemento) {
    return {
        AVAILABLE: elemento.cantidad_disponible || 0,
        RENTED: elemento.cantidad_alquilada || 0,
        CLEANING: elemento.cantidad_en_limpieza || 0,
        MAINTENANCE: elemento.cantidad_en_mantenimiento || 0,
        DAMAGED: elemento.cantidad_danada || 0
    };
}

/**
 * Procesa elementos para la vista
 * NO agrupa lotes, solo añade información de distribución
 */
export function procesarElementosParaVista(elementos) {
    return elementos.map(elem => {
        if (elem.requiere_series) {
            // Elementos con series no necesitan procesamiento adicional
            return {
                ...elem,
                es_grupo: false,
                total_unidades: elem.cantidad
            };
        }

        // Elementos sin series: construir distribución
        const distribucion = construirDistribucionEstados(elem);
        
        return {
            ...elem,
            es_grupo: false, // No hay agrupación de lotes
            total_unidades: elem.cantidad,
            distribucion_estados: distribucion,
            cantidad_disponible: distribucion.AVAILABLE
        };
    });
}

/**
 * Calcula porcentaje
 */
export function calcularPorcentaje(cantidad, total) {
    if (!total || total === 0) return 0;
    return Math.round((cantidad / total) * 100);
}

/**
 * Obtiene el estado con mayor cantidad
 */
export function obtenerEstadoDominante(distribucion) {
    if (!distribucion) return 'AVAILABLE';

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

/**
 * Trunca texto
 */
export function truncateText(text, maxLength = 50) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Formatea número
 */
export function formatNumber(num) {
    return new Intl.NumberFormat('es-CO').format(num);
}

/**
 * Cantidad disponible para alquilar
 */
export function cantidadDisponible(elemento) {
    if (elemento.requiere_series) {
        return elemento.cantidad;
    }
    return elemento.cantidad_disponible || 0;
}

/**
 * Filtra por texto
 */
export function filtrarPorTexto(elementos, searchText) {
    if (!searchText || searchText.trim() === '') return elementos;

    const query = searchText.toLowerCase().trim();

    return elementos.filter(elem => {
        const nombre = (elem.nombre || '').toLowerCase();
        const descripcion = (elem.descripcion || '').toLowerCase();
        
        return nombre.includes(query) || descripcion.includes(query);
    });
}

/**
 * Ordena por nombre
 */
export function ordenarPorNombre(elementos, orden = 'asc') {
    return [...elementos].sort((a, b) => {
        const nombreA = (a.nombre || '').toLowerCase();
        const nombreB = (b.nombre || '').toLowerCase();
        
        return orden === 'asc' 
            ? nombreA.localeCompare(nombreB)
            : nombreB.localeCompare(nombreA);
    });
}

export default {
    CURRENT_STATUS_INFO,
    COLORES_ESTADO_CLASICO,
    construirDistribucionEstados,
    procesarElementosParaVista,
    calcularPorcentaje,
    obtenerEstadoDominante,
    truncateText,
    formatNumber,
    cantidadDisponible,
    filtrarPorTexto,
    ordenarPorNombre
};