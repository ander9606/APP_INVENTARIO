// URL base de tu API backend
export const API_BASE_URL = 'http://localhost:3001/api';

// Estados posibles de un elemento (DEPRECADO - usar CURRENT_STATUS)
export const ESTADOS_ELEMENTO = [
    'nuevo',
    'bueno',
    'mantenimiento',
    'prestado',
    'dañado',
    'agotado'
];

// Estados posibles de una serie
export const ESTADOS_SERIE = [
    'nuevo',
    'bueno',
    'mantenimiento',
    'prestado',
    'dañado'
];

// ============================================
// NUEVOS ESTADOS PARA SISTEMA DE LOTES
// ============================================

/**
 * Current Status - Estado operativo del elemento/lote
 */
export const CURRENT_STATUS = {
    AVAILABLE: 'AVAILABLE',      // Disponible para alquilar
    RENTED: 'RENTED',           // Alquilado actualmente
    CLEANING: 'CLEANING',       // En proceso de limpieza
    MAINTENANCE: 'MAINTENANCE', // En mantenimiento/reparación
    RETIRED: 'RETIRED'          // Retirado del inventario (cantidad = 0)
};

/**
 * Cleaning Status - Estado de limpieza/condición
 */
export const CLEANING_STATUS = {
    CLEAN: 'CLEAN',           // Limpio y listo
    DIRTY: 'DIRTY',           // Sucio (requiere limpieza estándar)
    VERY_DIRTY: 'VERY_DIRTY', // Muy sucio (requiere limpieza profunda)
    DAMAGED: 'DAMAGED',       // Dañado (requiere reparación)
    GOOD: 'GOOD'              // En buen estado
};

/**
 * Motivos de movimiento
 */
export const MOTIVOS_MOVIMIENTO = {
    RENTED_OUT: 'RENTED_OUT',           // Alquilado
    RETURNED_CLEAN: 'RETURNED_CLEAN',   // Devuelto limpio
    RETURNED_DIRTY: 'RETURNED_DIRTY',   // Devuelto sucio
    RETURNED_DAMAGED: 'RETURNED_DAMAGED', // Devuelto dañado
    CLEANING_COMPLETED: 'CLEANING_COMPLETED', // Limpieza completada
    REPAIR_COMPLETED: 'REPAIR_COMPLETED',     // Reparación completada
    MANUAL_ADJUSTMENT: 'MANUAL_ADJUSTMENT',   // Ajuste manual
    DAMAGED_IN_USE: 'DAMAGED_IN_USE',        // Dañado en uso
    LOST: 'LOST',                            // Perdido
    DISCARDED: 'DISCARDED'                   // Descartado
};

/**
 * Traducciones legibles para Current Status
 */
export const CURRENT_STATUS_LABELS = {
    AVAILABLE: 'Disponible',
    RENTED: 'Alquilado',
    CLEANING: 'En Limpieza',
    MAINTENANCE: 'En Mantenimiento',
    RETIRED: 'Retirado'
};

/**
 * Traducciones legibles para Cleaning Status
 */
export const CLEANING_STATUS_LABELS = {
    CLEAN: 'Limpio',
    DIRTY: 'Sucio',
    VERY_DIRTY: 'Muy Sucio',
    DAMAGED: 'Dañado',
    GOOD: 'Buen Estado'
};

/**
 * Traducciones legibles para Motivos
 */
export const MOTIVOS_LABELS = {
    RENTED_OUT: 'Alquilado',
    RETURNED_CLEAN: 'Devuelto Limpio',
    RETURNED_DIRTY: 'Devuelto Sucio',
    RETURNED_DAMAGED: 'Devuelto Dañado',
    CLEANING_COMPLETED: 'Limpieza Completada',
    REPAIR_COMPLETED: 'Reparación Completada',
    MANUAL_ADJUSTMENT: 'Ajuste Manual',
    DAMAGED_IN_USE: 'Dañado en Uso',
    LOST: 'Perdido',
    DISCARDED: 'Descartado'
};

// Tipos de unidades de medida
export const TIPOS_UNIDAD = [
    'longitud',
    'peso',
    'volumen',
    'unidad',
    'tiempo',
    'otro'
];

// ============================================
// COLORES PARA BADGES
// ============================================

/**
 * Colores para Current Status (clases de Tailwind)
 */
export const COLORES_CURRENT_STATUS = {
    AVAILABLE: 'bg-green-100 text-green-800',
    RENTED: 'bg-purple-100 text-purple-800',
    CLEANING: 'bg-yellow-100 text-yellow-800',
    MAINTENANCE: 'bg-orange-100 text-orange-800',
    RETIRED: 'bg-gray-100 text-gray-800'
};

/**
 * Colores para Cleaning Status (clases de Tailwind)
 */
export const COLORES_CLEANING_STATUS = {
    CLEAN: 'bg-blue-100 text-blue-800',
    DIRTY: 'bg-yellow-100 text-yellow-800',
    VERY_DIRTY: 'bg-orange-100 text-orange-800',
    DAMAGED: 'bg-red-100 text-red-800',
    GOOD: 'bg-green-100 text-green-800'
};

/**
 * Colores para estados legacy (mantener compatibilidad)
 */
export const COLORES_ESTADO = {
    nuevo: 'bg-blue-100 text-blue-800',
    bueno: 'bg-green-100 text-green-800',
    mantenimiento: 'bg-yellow-100 text-yellow-800',
    prestado: 'bg-purple-100 text-purple-800',
    dañado: 'bg-red-100 text-red-800',
    agotado: 'bg-gray-100 text-gray-800'
};

/**
 * Iconos para Current Status
 */
export const ICONOS_CURRENT_STATUS = {
    AVAILABLE: '✅',
    RENTED: '📤',
    CLEANING: '🧹',
    MAINTENANCE: '🔧',
    RETIRED: '🚫'
};

/**
 * Iconos para Cleaning Status
 */
export const ICONOS_CLEANING_STATUS = {
    CLEAN: '✨',
    DIRTY: '💧',
    VERY_DIRTY: '⚠️',
    DAMAGED: '⚡',
    GOOD: '👍'
};