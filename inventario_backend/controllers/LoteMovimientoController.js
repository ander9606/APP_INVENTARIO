// ============================================
// controllers/loteMovimientoController.js
// ============================================

import LoteMovimientoModel from '../models/LoteMovimientoModel.js';

/**
 * Cambiar estado de un lote (mover unidades entre estados)
 */
export const cambiarEstadoLote = async (req, res, next) => {
    try {
        const {
            lote_id,
            cantidad,
            current_status_destino,
            cleaning_status_destino,
            motivo,
            descripcion,
            costo_reparacion
        } = req.body;
        
        // Validaciones
        if (!lote_id || !cantidad || !current_status_destino || !cleaning_status_destino || !motivo) {
            return res.status(400).json({
                success: false,
                error: 'Faltan campos requeridos: lote_id, cantidad, current_status_destino, cleaning_status_destino, motivo'
            });
        }
        
        if (cantidad <= 0) {
            return res.status(400).json({
                success: false,
                error: 'La cantidad debe ser mayor a 0'
            });
        }
        
        const resultado = await LoteMovimientoModel.registrarMovimiento({
            lote_origen_id: lote_id,
            cantidad: parseInt(cantidad, 10),
            current_status_destino,
            cleaning_status_destino,
            motivo,
            descripcion: descripcion || null,
            usuario_id: req.user?.id || null,
            costo_reparacion: costo_reparacion || null
        });
        
        console.log(`✅ Movimiento registrado: ${cantidad} unidades → ${motivo}`);
        
        res.json({
            success: true,
            message: 'Estado actualizado correctamente',
            data: resultado
        });
        
    } catch (error) {
        console.error('Error al cambiar estado:', error);
        next(error);
    }
};

/**
 * Obtener historial de movimientos de un elemento
 */
export const obtenerHistorial = async (req, res, next) => {
    try {
        const { id } = req.params;
        const historial = await LoteMovimientoModel.obtenerHistorial(id);
        
        res.json({
            success: true,
            data: historial,
            count: historial.length
        });
        
    } catch (error) {
        console.error('Error al obtener historial:', error);
        next(error);
    }
};

/**
 * Obtener motivos disponibles
 */
export const obtenerMotivos = async (req, res, next) => {
    try {
        const motivos = await LoteMovimientoModel.obtenerMotivos();
        
        res.json({
            success: true,
            data: motivos
        });
        
    } catch (error) {
        console.error('Error al obtener motivos:', error);
        next(error);
    }
};

/**
 * Obtener estadísticas de movimientos
 */
export const obtenerEstadisticas = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { fecha_inicio, fecha_fin } = req.query;
        
        const stats = await LoteMovimientoModel.obtenerEstadisticas(
            id,
            fecha_inicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 días atrás por defecto
            fecha_fin || new Date()
        );
        
        res.json({
            success: true,
            data: stats
        });
        
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        next(error);
    }
};