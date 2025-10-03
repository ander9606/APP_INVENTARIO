import { mostrarToast } from '../../components/Toast.js';

/**
 * Módulo de validaciones para elementos del inventario
 * Centraliza toda la lógica de validación
 */
export const inventarioValidator = {
    
    /**
     * Valida los datos básicos de un elemento
     * @param {object} datos - Objeto con los datos del elemento
     * @returns {boolean} - true si es válido, false si no
     */
    validarDatosBasicos(datos) {
        // Validar nombre
        if (!datos.nombre || datos.nombre.trim().length === 0) {
            mostrarToast('El nombre del elemento es obligatorio', 'error');
            return false;
        }

        // Validar que el nombre tenga al menos 3 caracteres
        if (datos.nombre.trim().length < 3) {
            mostrarToast('El nombre debe tener al menos 3 caracteres', 'error');
            return false;
        }

        // Validar cantidad
        if (datos.cantidad === undefined || datos.cantidad === null) {
            mostrarToast('La cantidad es obligatoria', 'error');
            return false;
        }

        if (datos.cantidad < 0) {
            mostrarToast('La cantidad no puede ser negativa', 'error');
            return false;
        }

        // Validar estado
        const estadosValidos = ['nuevo', 'bueno', 'mantenimiento', 'prestado', 'dañado', 'agotado'];
        if (!estadosValidos.includes(datos.estado)) {
            mostrarToast('Estado inválido', 'error');
            return false;
        }

        return true;
    },

    /**
     * Valida el array de series
     * @param {Array} series - Array de objetos con información de series
     * @param {number} cantidad - Cantidad esperada de series
     * @returns {boolean} - true si es válido, false si no
     */
    validarSeries(series, cantidad) {
        // Debe haber al menos una serie
        if (!series || series.length === 0) {
            mostrarToast('Debes agregar al menos un número de serie', 'error');
            return false;
        }

        // Validar que cada serie tenga número_serie
        for (let i = 0; i < series.length; i++) {
            const serie = series[i];
            
            if (!serie.numero_serie || serie.numero_serie.trim().length === 0) {
                mostrarToast(`La serie #${i + 1} no tiene número de serie`, 'error');
                return false;
            }

            // Validar que el número de serie tenga formato válido (al menos 3 caracteres)
            if (serie.numero_serie.trim().length < 3) {
                mostrarToast(`La serie "${serie.numero_serie}" es muy corta (mínimo 3 caracteres)`, 'error');
                return false;
            }
        }

        // Validar que no haya números de serie duplicados
        const numerosUnicos = new Set(series.map(s => s.numero_serie.trim().toUpperCase()));
        if (numerosUnicos.size !== series.length) {
            mostrarToast('Hay números de serie duplicados', 'error');
            return false;
        }

        // Validar que la cantidad coincida con el número de series
        if (cantidad !== undefined && series.length !== cantidad) {
            mostrarToast(
                `La cantidad (${cantidad}) no coincide con el número de series (${series.length})`,
                'error'
            );
            return false;
        }

        return true;
    },

    /**
     * Valida que un número de serie tenga formato correcto
     * @param {string} numeroSerie - Número de serie a validar
     * @returns {boolean} - true si es válido
     */
    validarFormatoSerie(numeroSerie) {
        if (!numeroSerie || numeroSerie.trim().length === 0) {
            return false;
        }

        // Validar longitud mínima
        if (numeroSerie.trim().length < 3) {
            return false;
        }

        // Validar que no tenga caracteres especiales peligrosos
        const caracteresProhibidos = /[<>\"']/;
        if (caracteresProhibidos.test(numeroSerie)) {
            mostrarToast('El número de serie contiene caracteres no permitidos', 'error');
            return false;
        }

        return true;
    },

    /**
     * Valida campos opcionales antes de enviar
     * @param {object} datos - Objeto con datos del elemento
     * @returns {object} - Objeto con datos validados y normalizados
     */
    normalizarDatos(datos) {
        return {
            ...datos,
            nombre: datos.nombre.trim(),
            descripcion: datos.descripcion ? datos.descripcion.trim() : null,
            categoria_id: datos.categoria_id || null,
            material_id: datos.material_id || null,
            unidad_id: datos.unidad_id || null,
            ubicacion: datos.ubicacion ? datos.ubicacion.trim() : null,
            cantidad: parseInt(datos.cantidad, 10),
            requiere_series: Boolean(datos.requiere_series)
        };
    }
};