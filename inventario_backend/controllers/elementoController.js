// controllers/elementoController.js
import ElementoModel from '../models/ElementoModel.js';

/**
 * Obtener todos los elementos del inventario
 */
export const obtenerElementos = async (req, res, next) => {
    try {
        const elementos = await ElementoModel.obtenerTodos();
        
        res.json({
            success: true,
            data: elementos,
            count: elementos.length
        });
    } catch (error) {
        console.error('Error al obtener elementos:', error);
        next(error); // Pasar al middleware de errores
    }
};

/**
 * Crear un nuevo elemento con validaciones robustas
 */
export const crearElemento = async (req, res, next) => {
    const {
        nombre,
        descripcion,
        categoria_id,
        material_id,
        unidad_id,
        cantidad,
        requiere_series,
        estado = 'bueno',
        ubicacion,
        series = []
    } = req.body;

    try {
        // Validaciones de negocio
        if (!nombre || nombre.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'El nombre es obligatorio'
            });
        }

        if (!cantidad || cantidad < 0) {
            return res.status(400).json({
                success: false,
                error: 'La cantidad debe ser un número mayor o igual a 0'
            });
        }

        // Validar estados permitidos
        const estadosPermitidos = ['nuevo', 'bueno', 'mantenimiento', 'prestado', 'dañado', 'agotado'];
        if (!estadosPermitidos.includes(estado)) {
            return res.status(400).json({
                success: false,
                error: `Estado inválido. Debe ser uno de: ${estadosPermitidos.join(', ')}`
            });
        }

        // Si requiere series, validar coherencia
        if (requiere_series) {
            if (series.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Si el elemento requiere series, debe proporcionar al menos una'
                });
            }

            if (series.length !== cantidad) {
                return res.status(400).json({
                    success: false,
                    error: `La cantidad (${cantidad}) debe coincidir con el número de series proporcionadas (${series.length})`
                });
            }

            // Validar que todas las series tengan numero_serie
            for (let i = 0; i < series.length; i++) {
                if (!series[i].numero_serie || series[i].numero_serie.trim().length === 0) {
                    return res.status(400).json({
                        success: false,
                        error: `La serie en posición ${i + 1} requiere un número de serie válido`
                    });
                }
            }

            // Validar números de serie únicos
            const numerosSerieSet = new Set(series.map(s => s.numero_serie.trim().toLowerCase()));
            if (numerosSerieSet.size !== series.length) {
                return res.status(400).json({
                    success: false,
                    error: 'Los números de serie deben ser únicos dentro del elemento'
                });
            }
        }

        // Si no requiere series pero se pasa ubicación vacía, usar null
        const ubicacionFinal = requiere_series ? null : (ubicacion || null);

        const resultado = await ElementoModel.crear({
            nombre: nombre.trim(),
            descripcion: descripcion ? descripcion.trim() : null,
            cantidad: parseInt(cantidad, 10),
            requiere_series: requiere_series ? 1 : 0,
            categoria_id: categoria_id || null,
            material_id: material_id || null,
            unidad_id: unidad_id || null,
            estado,
            ubicacion: ubicacionFinal,
            series: requiere_series ? series : []
        });

        console.log(`✅ Elemento creado con ID: ${resultado.insertId}`);

        res.status(201).json({
            success: true,
            message: 'Elemento creado exitosamente',
            data: {
                id: resultado.insertId,
                nombre: nombre.trim(),
                cantidad: parseInt(cantidad, 10),
                requiere_series: !!requiere_series
            }
        });
    } catch (error) {
        console.error('Error al crear elemento:', error);
        
        // Si es un error de constraint de BD (ej. FK inválida)
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({
                success: false,
                error: 'Uno o más IDs de referencia (categoría, material, unidad) no son válidos'
            });
        }

        next(error);
    }
};

/**
 * Actualizar un elemento existente
 */
export const actualizarElemento = async (req, res, next) => {
    const { id } = req.params;
    const datosActualizados = req.body;

    try {
        // Verificar que el elemento existe
        const elementoExistente = await ElementoModel.obtenerPorId(id);
        if (!elementoExistente) {
            return res.status(404).json({
                success: false,
                error: 'Elemento no encontrado'
            });
        }

        // Validar nombre si se proporciona
        if (datosActualizados.nombre !== undefined) {
            if (!datosActualizados.nombre || datosActualizados.nombre.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'El nombre no puede estar vacío'
                });
            }
            datosActualizados.nombre = datosActualizados.nombre.trim();
        }

        // Validar cantidad si se proporciona
        if (datosActualizados.cantidad !== undefined) {
            const cantidad = parseInt(datosActualizados.cantidad, 10);
            if (isNaN(cantidad) || cantidad < 0) {
                return res.status(400).json({
                    success: false,
                    error: 'La cantidad debe ser un número mayor o igual a 0'
                });
            }
            datosActualizados.cantidad = cantidad;
        }

        // Validar estado si se proporciona
        if (datosActualizados.estado) {
            const estadosPermitidos = ['nuevo', 'bueno', 'mantenimiento', 'prestado', 'dañado', 'agotado'];
            if (!estadosPermitidos.includes(datosActualizados.estado)) {
                return res.status(400).json({
                    success: false,
                    error: `Estado inválido. Debe ser uno de: ${estadosPermitidos.join(', ')}`
                });
            }
        }

        // Si cambia requiere_series y hay series, validar coherencia
        if (datosActualizados.requiere_series !== undefined) {
            datosActualizados.requiere_series = datosActualizados.requiere_series ? 1 : 0;
            
            if (datosActualizados.requiere_series && datosActualizados.series) {
                const cantidad = datosActualizados.cantidad || elementoExistente.cantidad;
                if (datosActualizados.series.length !== cantidad) {
                    return res.status(400).json({
                        success: false,
                        error: `La cantidad debe coincidir con el número de series (${datosActualizados.series.length})`
                    });
                }
            }
        }

        await ElementoModel.actualizar(id, datosActualizados);

        console.log(`✅ Elemento ${id} actualizado`);

        res.json({
            success: true,
            message: 'Elemento actualizado exitosamente',
            data: { id }
        });
    } catch (error) {
        console.error('Error al actualizar elemento:', error);

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({
                success: false,
                error: 'Uno o más IDs de referencia no son válidos'
            });
        }

        next(error);
    }
};

/**
 * Eliminar un elemento por ID
 */
export const eliminarElemento = async (req, res, next) => {
    const { id } = req.params;

    try {
        // Verificar que existe antes de eliminar
        const elemento = await ElementoModel.obtenerPorId(id);
        if (!elemento) {
            return res.status(404).json({
                success: false,
                error: 'Elemento no encontrado'
            });
        }

        await ElementoModel.eliminar(id);

        console.log(`🗑️ Elemento ${id} eliminado`);

        res.json({
            success: true,
            message: 'Elemento eliminado correctamente',
            data: { id }
        });
    } catch (error) {
        console.error('Error al eliminar elemento:', error);
        next(error);
    }
};

/**
 * Obtener detalle completo de un elemento (con series si aplica)
 */
export const detalleElemento = async (req, res, next) => {
    const { id } = req.params;

    try {
        const elemento = await ElementoModel.obtenerPorId(id);
        
        if (!elemento) {
            return res.status(404).json({
                success: false,
                error: 'Elemento no encontrado'
            });
        }

        // Si requiere series, incluirlas en la respuesta
        if (elemento.requiere_series) {
            const series = await ElementoModel.obtenerSeriesPorElemento(id);
            
            res.json({
                success: true,
                data: {
                    ...elemento,
                    series
                }
            });
        } else {
            res.json({
                success: true,
                data: elemento
            });
        }
    } catch (error) {
        console.error('Error al obtener detalle del elemento:', error);
        next(error);
    }
};