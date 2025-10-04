// controllers/categoriasController.js
import CategoriasModel from '../models/CategoriasModel.js';
import { construirJerarquia } from '../utils/construirArbol.js';

/**
 * Obtener todas las categorías padre (sin anidamiento)
 */
export const obtenerCategorias = async (req, res, next) => {
    try {
        const categorias = await CategoriasModel.obtenerSoloPadres();
        res.json({
            success: true,
            data: categorias,
            count: categorias.length
        });
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        next(error);
    }
};

/**
 * Obtener todas las categorías en forma jerárquica (árbol)
 */
export const obtenerCategoriasJerarquicas = async (req, res, next) => {
    try {
        const categorias = await CategoriasModel.obtenerTodas();
        const jerarquia = construirJerarquia(categorias);
        
        res.json({
            success: true,
            data: jerarquia,
            count: categorias.length
        });
    } catch (error) {
        console.error('Error al obtener jerarquía de categorías:', error);
        next(error);
    }
};

/**
 * Crear nueva categoría o subcategoría
 */
export const crearCategoria = async (req, res, next) => {
    try {
        const { nombre, padre_id } = req.body;

        // Validación de nombre
        if (!nombre || nombre.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'El nombre de la categoría es obligatorio'
            });
        }

        // Si tiene padre, verificar que existe
        if (padre_id) {
            const padre = await CategoriasModel.obtenerPorId(padre_id);
            if (!padre) {
                return res.status(400).json({
                    success: false,
                    error: 'La categoría padre especificada no existe'
                });
            }
        }

        const nuevaCategoria = await CategoriasModel.crear({
            nombre: nombre.trim(),
            padre_id: padre_id || null
        });

        console.log(`✅ Categoría creada: ${nuevaCategoria.nombre} (ID: ${nuevaCategoria.id})`);

        res.status(201).json({
            success: true,
            message: 'Categoría creada exitosamente',
            data: nuevaCategoria
        });
    } catch (error) {
        console.error('Error al crear categoría:', error);
        next(error);
    }
};

/**
 * Eliminar categoría y sus hijos recursivamente
 */
export const eliminarCategoria = async (req, res, next) => {
    const { id } = req.params;

    try {
        // Verificar que existe
        const categoria = await CategoriasModel.obtenerPorId(id);
        if (!categoria) {
            return res.status(404).json({
                success: false,
                error: 'Categoría no encontrada'
            });
        }

        // Función recursiva para eliminar hijos
        async function eliminarHijos(categoriaId) {
            const hijos = await CategoriasModel.obtenerSubcategorias(categoriaId);

            for (const hijo of hijos) {
                await eliminarHijos(hijo.id);
                await CategoriasModel.eliminar(hijo.id);
            }
        }

        await eliminarHijos(id);
        await CategoriasModel.eliminar(id);

        console.log(`🗑️ Categoría ${id} y sus hijos eliminados`);

        res.json({
            success: true,
            message: 'Categoría y sus subcategorías eliminadas correctamente',
            data: { id }
        });
    } catch (error) {
        console.error('Error eliminando categoría:', error);
        
        // Error específico si hay elementos usando esta categoría
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({
                success: false,
                error: 'No se puede eliminar: hay elementos usando esta categoría'
            });
        }
        
        next(error);
    }
};

/**
 * Obtener subcategorías de una categoría específica
 */
export const obtenerSubcategorias = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Verificar que la categoría padre existe
        const categoria = await CategoriasModel.obtenerPorId(id);
        if (!categoria) {
            return res.status(404).json({
                success: false,
                error: 'Categoría no encontrada'
            });
        }

        const subcategorias = await CategoriasModel.obtenerSubcategorias(id);
        
        res.json({
            success: true,
            data: subcategorias,
            count: subcategorias.length
        });
    } catch (error) {
        console.error('Error al obtener subcategorías:', error);
        next(error);
    }
};


/**
 * Obtener todos los elementos de una categoría (incluye subcategorías)
 */
export const obtenerElementosPorCategoria = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Verificar que la categoría existe
        const categoria = await CategoriasModel.obtenerPorId(id);
        if (!categoria) {
            return res.status(404).json({
                success: false,
                error: 'Categoría no encontrada'
            });
        }

        // Obtener elementos de esta categoría
        const elementos = await obtenerElementosRecursivo(id);

        res.json({
            success: true,
            data: {
                categoria: {
                    id: categoria.id,
                    nombre: categoria.nombre,
                    padre_id: categoria.padre_id
                },
                elementos: elementos
            },
            count: elementos.length
        });
    } catch (error) {
        console.error('Error al obtener elementos por categoría:', error);
        next(error);
    }
};

/**
 * Helper: Obtiene elementos de una categoría y sus subcategorías recursivamente
 */
async function obtenerElementosRecursivo(categoriaId) {
    const db = (await import('../models/db.js')).default;
    
    // Obtener todos los IDs de categorías (esta + subcategorías)
    const idsCategoria = await obtenerIdsCategoriaConHijos(categoriaId);
    
    // Construir placeholders para SQL
    const placeholders = idsCategoria.map(() => '?').join(',');
    
    // Obtener elementos
    const [elementos] = await db.query(`
        SELECT 
            e.id,
            e.nombre,
            e.descripcion,
            e.cantidad,
            e.requiere_series,
            e.estado,
            e.ubicacion,
            e.current_status,
            e.cleaning_status,
            cat.nombre AS categoria_nombre,
            cat.id AS categoria_id
        FROM elementos e
        LEFT JOIN categorias cat ON e.categoria_id = cat.id
        WHERE e.categoria_id IN (${placeholders})
        ORDER BY e.nombre
    `, idsCategoria);
    
    return elementos;
}

/**
 * Helper: Obtiene IDs de una categoría y todas sus subcategorías
 */
async function obtenerIdsCategoriaConHijos(categoriaId) {
    const CategoriasModel = (await import('../models/CategoriasModel.js')).default;
    const ids = [categoriaId];

    async function obtenerHijosRecursivo(padreId) {
        const hijos = await CategoriasModel.obtenerSubcategorias(padreId);
        
        for (const hijo of hijos) {
            ids.push(hijo.id);
            await obtenerHijosRecursivo(hijo.id);
        }
    }

    await obtenerHijosRecursivo(categoriaId);
    return ids;
}