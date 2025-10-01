// URL base de tu API backend
export const API_BASE_URL = 'http://localhost:3001/api';

// Estados posibles de un elemento
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

// Tipos de unidades de medida
export const TIPOS_UNIDAD = [
    'longitud',
    'peso',
    'volumen',
    'unidad',
    'tiempo',
    'otro'
];

// Colores para badges según el estado (clases de Tailwind)
export const COLORES_ESTADO = {
    nuevo: 'bg-blue-100 text-blue-800',
    bueno: 'bg-green-100 text-green-800',
    mantenimiento: 'bg-yellow-100 text-yellow-800',
    prestado: 'bg-purple-100 text-purple-800',
    dañado: 'bg-red-100 text-red-800',
    agotado: 'bg-gray-100 text-gray-800'
};