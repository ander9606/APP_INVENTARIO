// controllers/materialController.js
import MaterialModel from '../models/MaterialModel.js';

/**
 * Obtener todos los materiales
 */
export const obtenerMateriales = async (req, res, next) => {
    try {
        const materiales = await MaterialModel.obtenerTodos();
        
        res.json({
            success: true,
            data: materiales,
            count: materiales.length
        });
    } catch (error) {
        console.error('Error al obtener materiales:', error);
        next(error);
    }
};

/**
 * Crear un nuevo material
 */
export const crearMaterial = async (req, res, next) => {
    try {
        const { nombre } = req.body;

        if (!nombre || nombre.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'El nombre del material es obligatorio'
            });
        }

        const id = await MaterialModel.crear(nombre.trim());

        console.log(`✅ Material creado: ${nombre} (ID: ${id})`);

        res.status(201).json({
            success: true,
            message: 'Material creado exitosamente',
            data: { id, nombre: nombre.trim() }
        });
    } catch (error) {
        console.error('Error al crear material:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                error: 'Ya existe un material con ese nombre'
            });
        }

        next(error);
    }
};

// ============================================
// controllers/unidadController.js
// ============================================

import UnidadModel from '../models/UnidadModel.js';

/**
 * Obtener todas las unidades
 */
export const obtenerUnidades = async (req, res, next) => {
    try {
        const unidades = await UnidadModel.obtenerTodos();
        
        res.json({
            success: true,
            data: unidades,
            count: unidades.length
        });
    } catch (error) {
        console.error('Error al obtener unidades:', error);
        next(error);
    }
};

/**
 * Crear una nueva unidad
 */
export const crearUnidad = async (req, res, next) => {
    try {
        const { nombre, abreviatura, tipo } = req.body;

        // Validaciones
        if (!nombre || nombre.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'El nombre de la unidad es obligatorio'
            });
        }

        if (!abreviatura || abreviatura.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'La abreviatura es obligatoria'
            });
        }

        const tiposPermitidos = ['longitud', 'peso', 'volumen', 'unidad', 'tiempo', 'otro'];
        if (tipo && !tiposPermitidos.includes(tipo)) {
            return res.status(400).json({
                success: false,
                error: `Tipo inválido. Debe ser uno de: ${tiposPermitidos.join(', ')}`
            });
        }

        const datosUnidad = {
            nombre: nombre.trim(),
            abreviatura: abreviatura.trim(),
            tipo: tipo || 'otro'
        };

        const id = await UnidadModel.crear(datosUnidad);

        console.log(`✅ Unidad creada: ${nombre} (${abreviatura}) - ID: ${id}`);

        res.status(201).json({
            success: true,
            message: 'Unidad creada exitosamente',
            data: { id, ...datosUnidad }
        });
    } catch (error) {
        console.error('Error al crear unidad:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                error: 'Ya existe una unidad con ese nombre o abreviatura'
            });
        }

        next(error);
    }
};