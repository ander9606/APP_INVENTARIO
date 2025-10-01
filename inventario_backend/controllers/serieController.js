// controllers/serieController.js
import SerieModel from '../models/SerieModel.js';
import ElementoModel from '../models/ElementoModel.js';

/**
 * Obtener todas las series asociadas a un elemento
 */
export const obtenerSeriesPorElemento = async (req, res, next) => {
    try {
        const { id_elemento } = req.params;

        // Verificar que el elemento existe
        const elemento = await ElementoModel.obtenerPorId(id_elemento);
        if (!elemento) {
            return res.status(404).json({
                success: false,
                error: 'Elemento no encontrado'
            });
        }

        const series = await SerieModel.obtenerPorElemento(id_elemento);
        
        res.json({
            success: true,
            data: series,
            count: series.length
        });
    } catch (error) {
        console.error('Error al obtener series:', error);
        next(error);
    }
};

/**
 * Crear una nueva serie para un elemento
 */
export const crearSerie = async (req, res, next) => {
    try {
        const { id_elemento, numero_serie, estado, fecha_ingreso, ubicacion } = req.body;

        // Validaciones
        if (!id_elemento) {
            return res.status(400).json({
                success: false,
                error: 'El ID del elemento es obligatorio'
            });
        }

        if (!numero_serie || numero_serie.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'El número de serie es obligatorio'
            });
        }

        // Verificar que el elemento existe y requiere series
        const elemento = await ElementoModel.obtenerPorId(id_elemento);
        if (!elemento) {
            return res.status(404).json({
                success: false,
                error: 'Elemento no encontrado'
            });
        }

        if (!elemento.requiere_series) {
            return res.status(400).json({
                success: false,
                error: 'Este elemento no requiere series'
            });
        }

        // Validar estados permitidos
        const estadosPermitidos = ['nuevo', 'bueno', 'mantenimiento', 'prestado', 'dañado'];
        if (estado && !estadosPermitidos.includes(estado)) {
            return res.status(400).json({
                success: false,
                error: `Estado inválido. Debe ser uno de: ${estadosPermitidos.join(', ')}`
            });
        }

        const datosSerie = {
            id_elemento,
            numero_serie: numero_serie.trim(),
            estado: estado || 'nuevo',
            fecha_ingreso: fecha_ingreso || new Date(),
            ubicacion: ubicacion || null
        };

        const resultado = await SerieModel.crear(datosSerie);

        console.log(`✅ Serie creada con ID: ${resultado.insertId}`);

        res.status(201).json({
            success: true,
            message: 'Serie creada exitosamente',
            data: {
                id: resultado.insertId,
                ...datosSerie
            }
        });
    } catch (error) {
        console.error('Error al crear serie:', error);

        // Manejo de número de serie duplicado
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                error: 'Ya existe una serie con ese número'
            });
        }

        next(error);
    }
};

/**
 * Actualizar una serie por su ID
 */
export const actualizarSerie = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { numero_serie, estado, fecha_ingreso, ubicacion } = req.body;

        // Verificar que la serie existe
        const serieExistente = await SerieModel.obtenerPorId(id);
        if (!serieExistente) {
            return res.status(404).json({
                success: false,
                error: 'Serie no encontrada'
            });
        }

        // Validar estado si se proporciona
        if (estado) {
            const estadosPermitidos = ['nuevo', 'bueno', 'mantenimiento', 'prestado', 'dañado'];
            if (!estadosPermitidos.includes(estado)) {
                return res.status(400).json({
                    success: false,
                    error: `Estado inválido. Debe ser uno de: ${estadosPermitidos.join(', ')}`
                });
            }
        }

        // Validar numero_serie si se proporciona
        if (numero_serie !== undefined && numero_serie.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'El número de serie no puede estar vacío'
            });
        }

        const datosActualizados = {
            numero_serie: numero_serie ? numero_serie.trim() : serieExistente.numero_serie,
            estado: estado || serieExistente.estado,
            fecha_ingreso: fecha_ingreso || serieExistente.fecha_ingreso,
            ubicacion: ubicacion !== undefined ? ubicacion : serieExistente.ubicacion
        };

        await SerieModel.actualizar(id, datosActualizados);

        console.log(`✅ Serie ${id} actualizada`);

        res.json({
            success: true,
            message: 'Serie actualizada exitosamente',
            data: { id, ...datosActualizados }
        });
    } catch (error) {
        console.error('Error al actualizar serie:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                error: 'Ya existe otra serie con ese número'
            });
        }

        next(error);
    }
};

/**
 * Eliminar una serie por su ID
 */
export const eliminarSerie = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Verificar que existe
        const serie = await SerieModel.obtenerPorId(id);
        if (!serie) {
            return res.status(404).json({
                success: false,
                error: 'Serie no encontrada'
            });
        }

        await SerieModel.eliminar(id);

        console.log(`🗑️ Serie ${id} eliminada`);

        res.json({
            success: true,
            message: 'Serie eliminada exitosamente',
            data: { id }
        });
    } catch (error) {
        console.error('Error al eliminar serie:', error);
        next(error);
    }
};