/**
 * Utilidades para el Sistema de Gestión de Lotes
 * Funciones helper para trabajar con estados, transiciones y validaciones
 */

import { 
    CURRENT_STATUS,
    CLEANING_STATUS,
    CURRENT_STATUS_LABELS,
    CLEANING_STATUS_LABELS,
    COLORES_CURRENT_STATUS,
    COLORES_CLEANING_STATUS,
    ICONOS_CURRENT_STATUS
} from '../utils/constants.js';

/**
 * Validador de transiciones de estado
 * Define qué transiciones son permitidas entre estados
 */
export const transicionesPermitidas = {
    // Desde AVAILABLE puede ir a cualquier otro estado
    AVAILABLE: ['RENTED', 'CLEANING', 'MAINTENANCE', 'RETIRED'],
    
    // Desde RENTED solo puede regresar a procesamiento
    RENTED: ['AVAILABLE', 'CLEANING', 'MAINTENANCE', 'RETIRED'],
    
    // Desde CLEANING solo puede ir a AVAILABLE o MAINTENANCE si se encuentra daño
    CLEANING: ['AVAILABLE', 'MAINTENANCE'],
    
    // Desde MAINTENANCE puede volver a AVAILABLE o descartarse
    MAINTENANCE: ['AVAILABLE', 'RETIRED'],
    
    // RETIRED es un estado final, no puede cambiar
    RETIRED: []
};

/**
 * Valida si una transición de estado es permitida
 * @param {string} estadoOrigen - Estado actual
 * @param {string} estadoDestino - Estado deseado
 * @returns {boolean} - true si la transición es válida
 */
export function esTransicionValida(estadoOrigen, estadoDestino) {
    if (!transicionesPermitidas[estadoOrigen]) {
        console.warn(`Estado origen desconocido: ${estadoOrigen}`);
        return false;
    }
    
    return transicionesPermitidas[estadoOrigen].includes(estadoDestino);
}

/**
 * Obtiene el mensaje de error si una transición no es válida
 * @param {string} estadoOrigen - Estado actual
 * @param {string} estadoDestino - Estado deseado
 * @returns {string} - Mensaje de error descriptivo
 */
export function mensajeTransicionInvalida(estadoOrigen, estadoDestino) {
    const origenLabel = CURRENT_STATUS_LABELS[estadoOrigen] || estadoOrigen;
    const destinoLabel = CURRENT_STATUS_LABELS[estadoDestino] || estadoDestino;
    
    if (estadoOrigen === 'RETIRED') {
        return `No se pueden mover elementos desde estado "${origenLabel}". Los elementos retirados no pueden volver al inventario.`;
    }
    
    return `No se puede cambiar de "${origenLabel}" a "${destinoLabel}". Esta transición no está permitida.`;
}

/**
 * Recomienda el cleaning_status apropiado según el current_status
 * @param {string} currentStatus - Estado operativo
 * @returns {string} - Cleaning status recomendado
 */
export function cleaningStatusRecomendado(currentStatus) {
    const recomendaciones = {
        AVAILABLE: 'CLEAN',
        RENTED: 'GOOD',
        CLEANING: 'DIRTY',
        MAINTENANCE: 'DAMAGED',
        RETIRED: 'DAMAGED' // Usualmente se retiran elementos dañados
    };
    
    return recomendaciones[currentStatus] || 'GOOD';
}

/**
 * Recomienda el motivo apropiado según la transición
 * @param {string} estadoOrigen - Estado actual
 * @param {string} estadoDestino - Estado deseado
 * @returns {string} - Motivo recomendado
 */
export function motivoRecomendado(estadoOrigen, estadoDestino) {
    const clave = `${estadoOrigen}_TO_${estadoDestino}`;
    
    const recomendaciones = {
        'AVAILABLE_TO_RENTED': 'RENTED_OUT',
        'RENTED_TO_AVAILABLE': 'RETURNED_CLEAN',
        'RENTED_TO_CLEANING': 'RETURNED_DIRTY',
        'RENTED_TO_MAINTENANCE': 'RETURNED_DAMAGED',
        'CLEANING_TO_AVAILABLE': 'CLEANING_COMPLETED',
        'MAINTENANCE_TO_AVAILABLE': 'REPAIR_COMPLETED',
        'AVAILABLE_TO_MAINTENANCE': 'DAMAGED_IN_USE',
        'MAINTENANCE_TO_RETIRED': 'DISCARDED',
        'AVAILABLE_TO_RETIRED': 'LOST',
        'RENTED_TO_RETIRED': 'LOST'
    };
    
    return recomendaciones[clave] || 'MANUAL_ADJUSTMENT';
}

/**
 * Calcula el impacto de un movimiento en el inventario
 * @param {object} movimiento - Datos del movimiento
 * @returns {object} - Resumen del impacto
 */
export function calcularImpacto(movimiento) {
    const { current_status_destino, cantidad, costo_reparacion } = movimiento;
    
    const impacto = {
        disponibilidadAfectada: false,
        incrementoDisponibilidad: 0,
        decrementoDisponibilidad: 0,
        costoTotal: costo_reparacion || 0,
        requiereAtencion: false,
        nivelUrgencia: 'normal'
    };
    
    // Calcular cambios en disponibilidad
    if (current_status_destino === 'AVAILABLE') {
        impacto.incrementoDisponibilidad = cantidad;
        impacto.disponibilidadAfectada = true;
    } else if (movimiento.current_status_origen === 'AVAILABLE') {
        impacto.decrementoDisponibilidad = cantidad;
        impacto.disponibilidadAfectada = true;
    }
    
    // Determinar si requiere atención
    if (current_status_destino === 'MAINTENANCE') {
        impacto.requiereAtencion = true;
        impacto.nivelUrgencia = 'alta';
    } else if (current_status_destino === 'CLEANING') {
        impacto.requiereAtencion = true;
        impacto.nivelUrgencia = 'media';
    }
    
    return impacto;
}

/**
 * Genera un resumen legible de un movimiento
 * @param {object} movimiento - Datos del movimiento
 * @returns {string} - Resumen en texto
 */
export function generarResumenMovimiento(movimiento) {
    const origen = CURRENT_STATUS_LABELS[movimiento.current_status_origen];
    const destino = CURRENT_STATUS_LABELS[movimiento.current_status_destino];
    const cantidad = movimiento.cantidad;
    
    let resumen = `${cantidad} unidad${cantidad > 1 ? 'es' : ''} movida${cantidad > 1 ? 's' : ''} de "${origen}" a "${destino}"`;
    
    if (movimiento.motivo) {
        resumen += ` por: ${movimiento.motivo}`;
    }
    
    if (movimiento.costo_reparacion) {
        resumen += ` (Costo: $${movimiento.costo_reparacion})`;
    }
    
    return resumen;
}

/**
 * Agrupa elementos por estado operativo
 * @param {Array} elementos - Lista de elementos
 * @returns {object} - Elementos agrupados por estado
 */
export function agruparPorEstado(elementos) {
    const grupos = {
        AVAILABLE: [],
        RENTED: [],
        CLEANING: [],
        MAINTENANCE: [],
        RETIRED: []
    };
    
    elementos.forEach(elemento => {
        const estado = elemento.current_status || 'AVAILABLE';
        if (grupos[estado]) {
            grupos[estado].push(elemento);
        }
    });
    
    return grupos;
}

/**
 * Calcula estadísticas de un grupo de elementos
 * @param {Array} elementos - Lista de elementos
 * @returns {object} - Estadísticas calculadas
 */
export function calcularEstadisticas(elementos) {
    const stats = {
        total: elementos.length,
        cantidadTotal: 0,
        porEstado: {},
        porCleaningStatus: {},
        requierenAtencion: 0,
        valorEstimadoReparaciones: 0
    };
    
    // Inicializar contadores
    Object.keys(CURRENT_STATUS).forEach(estado => {
        stats.porEstado[estado] = { count: 0, cantidad: 0 };
    });
    
    Object.keys(CLEANING_STATUS).forEach(estado => {
        stats.porCleaningStatus[estado] = { count: 0, cantidad: 0 };
    });
    
    // Calcular estadísticas
    elementos.forEach(elemento => {
        const cantidad = parseInt(elemento.cantidad) || 0;
        stats.cantidadTotal += cantidad;
        
        // Por estado operativo
        const currentStatus = elemento.current_status || 'AVAILABLE';
        if (stats.porEstado[currentStatus]) {
            stats.porEstado[currentStatus].count++;
            stats.porEstado[currentStatus].cantidad += cantidad;
        }
        
        // Por estado de limpieza
        const cleaningStatus = elemento.cleaning_status || 'GOOD';
        if (stats.porCleaningStatus[cleaningStatus]) {
            stats.porCleaningStatus[cleaningStatus].count++;
            stats.porCleaningStatus[cleaningStatus].cantidad += cantidad;
        }
        
        // Elementos que requieren atención
        if (currentStatus === 'MAINTENANCE' || currentStatus === 'CLEANING') {
            stats.requierenAtencion += cantidad;
        }
    });
    
    // Calcular porcentajes
    stats.porcentajeDisponible = stats.cantidadTotal > 0 
        ? ((stats.porEstado.AVAILABLE?.cantidad || 0) / stats.cantidadTotal * 100).toFixed(1)
        : 0;
    
    stats.tasaUtilizacion = stats.cantidadTotal > 0
        ? ((stats.porEstado.RENTED?.cantidad || 0) / stats.cantidadTotal * 100).toFixed(1)
        : 0;
    
    return stats;
}

/**
 * Formatea la fecha de un movimiento
 * @param {string|Date} fecha - Fecha del movimiento
 * @param {string} formato - 'corto', 'largo', 'relativo'
 * @returns {string} - Fecha formateada
 */
export function formatearFechaMovimiento(fecha, formato = 'largo') {
    const date = new Date(fecha);
    
    if (formato === 'corto') {
        return date.toLocaleDateString('es-CO');
    } else if (formato === 'largo') {
        return date.toLocaleString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } else if (formato === 'relativo') {
        const ahora = new Date();
        const diff = ahora - date;
        const minutos = Math.floor(diff / 60000);
        const horas = Math.floor(diff / 3600000);
        const dias = Math.floor(diff / 86400000);
        
        if (minutos < 60) return `Hace ${minutos} minuto${minutos !== 1 ? 's' : ''}`;
        if (horas < 24) return `Hace ${horas} hora${horas !== 1 ? 's' : ''}`;
        if (dias < 7) return `Hace ${dias} día${dias !== 1 ? 's' : ''}`;
        return date.toLocaleDateString('es-CO');
    }
    
    return date.toLocaleString('es-CO');
}

/**
 * Genera un badge HTML para un estado
 * @param {string} currentStatus - Estado operativo
 * @param {string} cleaningStatus - Estado de limpieza (opcional)
 * @returns {string} - HTML del badge
 */
export function generarBadgeEstado(currentStatus, cleaningStatus = null) {
    const colorCurrent = COLORES_CURRENT_STATUS[currentStatus] || 'bg-gray-100 text-gray-800';
    const iconoCurrent = ICONOS_CURRENT_STATUS[currentStatus] || '📦';
    const labelCurrent = CURRENT_STATUS_LABELS[currentStatus] || currentStatus;
    
    let html = `
        <span class="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full ${colorCurrent} font-medium">
            <span>${iconoCurrent}</span>
            <span>${labelCurrent}</span>
        </span>
    `;
    
    if (cleaningStatus) {
        const colorCleaning = COLORES_CLEANING_STATUS[cleaningStatus] || 'bg-gray-100 text-gray-800';
        const labelCleaning = CLEANING_STATUS_LABELS[cleaningStatus] || cleaningStatus;
        
        html += `
            <span class="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${colorCleaning} font-medium ml-2">
                <span>${labelCleaning}</span>
            </span>
        `;
    }
    
    return html;
}

/**
 * Valida los datos antes de crear un movimiento
 * @param {object} datos - Datos del movimiento
 * @returns {object} - {valido: boolean, errores: string[]}
 */
export function validarMovimiento(datos) {
    const errores = [];
    
    // Validar campos requeridos
    if (!datos.lote_id) {
        errores.push('El ID del lote es requerido');
    }
    
    if (!datos.cantidad || datos.cantidad <= 0) {
        errores.push('La cantidad debe ser mayor a 0');
    }
    
    if (!datos.current_status_destino) {
        errores.push('El estado destino es requerido');
    }
    
    if (!datos.cleaning_status_destino) {
        errores.push('El estado de limpieza destino es requerido');
    }
    
    if (!datos.motivo) {
        errores.push('El motivo es requerido');
    }
    
    // Validar estados válidos
    if (datos.current_status_destino && !Object.values(CURRENT_STATUS).includes(datos.current_status_destino)) {
        errores.push(`Estado destino inválido: ${datos.current_status_destino}`);
    }
    
    if (datos.cleaning_status_destino && !Object.values(CLEANING_STATUS).includes(datos.cleaning_status_destino)) {
        errores.push(`Estado de limpieza destino inválido: ${datos.cleaning_status_destino}`);
    }
    
    // Validar costo de reparación si existe
    if (datos.costo_reparacion !== undefined && datos.costo_reparacion !== null) {
        const costo = parseFloat(datos.costo_reparacion);
        if (isNaN(costo) || costo < 0) {
            errores.push('El costo de reparación debe ser un número positivo');
        }
    }
    
    return {
        valido: errores.length === 0,
        errores
    };
}

/**
 * Calcula el costo total de reparaciones en un historial
 * @param {Array} historial - Array de movimientos
 * @returns {number} - Costo total
 */
export function calcularCostoTotal(historial) {
    return historial.reduce((total, movimiento) => {
        return total + (parseFloat(movimiento.costo_reparacion) || 0);
    }, 0);
}

/**
 * Filtra movimientos por periodo de tiempo
 * @param {Array} historial - Array de movimientos
 * @param {Date} fechaInicio - Fecha de inicio
 * @param {Date} fechaFin - Fecha de fin
 * @returns {Array} - Movimientos filtrados
 */
export function filtrarPorPeriodo(historial, fechaInicio, fechaFin) {
    return historial.filter(movimiento => {
        const fecha = new Date(movimiento.fecha_movimiento);
        return fecha >= fechaInicio && fecha <= fechaFin;
    });
}

/**
 * Genera un reporte resumido de movimientos
 * @param {Array} movimientos - Array de movimientos
 * @returns {object} - Reporte con métricas
 */
export function generarReporteMovimientos(movimientos) {
    const reporte = {
        totalMovimientos: movimientos.length,
        unidadesMovidas: 0,
        porMotivo: {},
        costoTotal: 0,
        periodo: {
            inicio: null,
            fin: null
        }
    };
    
    movimientos.forEach(mov => {
        reporte.unidadesMovidas += mov.cantidad;
        reporte.costoTotal += parseFloat(mov.costo_reparacion || 0);
        
        // Agrupar por motivo
        if (!reporte.porMotivo[mov.motivo]) {
            reporte.porMotivo[mov.motivo] = {
                count: 0,
                unidades: 0,
                costo: 0
            };
        }
        reporte.porMotivo[mov.motivo].count++;
        reporte.porMotivo[mov.motivo].unidades += mov.cantidad;
        reporte.porMotivo[mov.motivo].costo += parseFloat(mov.costo_reparacion || 0);
        
        // Actualizar periodo
        const fecha = new Date(mov.fecha_movimiento);
        if (!reporte.periodo.inicio || fecha < reporte.periodo.inicio) {
            reporte.periodo.inicio = fecha;
        }
        if (!reporte.periodo.fin || fecha > reporte.periodo.fin) {
            reporte.periodo.fin = fecha;
        }
    });
    
    return reporte;
}

// Exportar todas las utilidades
export default {
    esTransicionValida,
    mensajeTransicionInvalida,
    cleaningStatusRecomendado,
    motivoRecomendado,
    calcularImpacto,
    generarResumenMovimiento,
    agruparPorEstado,
    calcularEstadisticas,
    formatearFechaMovimiento,
    generarBadgeEstado,
    validarMovimiento,
    calcularCostoTotal,
    filtrarPorPeriodo,
    generarReporteMovimientos
};