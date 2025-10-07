// ============================================
// controllers/loteMovimientoController.js
// Controlador actualizado para sistema de estados múltiples
// ============================================

import LoteMovimientoModel from '../models/LoteMovimientoModel.js';

/**
 * Cambiar estado de cantidades de un elemento
 * POST /api/lote-movimientos/cambiar-estado
 * 
 * Body: {
 *   elemento_id: 31,
 *   cantidad: 5,
 *   estado_desde: "disponible",
 *   estado_hacia: "alquilada",
 *   motivo: "RENTED_OUT",
 *   descripcion: "Alquiler para evento X" (opcional)
 * }
 */
export const cambiarEstado = async (req, res, next) => {
  try {
    const {
      elemento_id,
      cantidad,
      estado_desde,
      estado_hacia,
      motivo,
      descripcion
    } = req.body;
    
    // Validaciones
    if (!elemento_id || !cantidad || !estado_desde || !estado_hacia || !motivo) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos: elemento_id, cantidad, estado_desde, estado_hacia, motivo'
      });
    }
    
    if (cantidad <= 0) {
      return res.status(400).json({
        success: false,
        error: 'La cantidad debe ser mayor a 0'
      });
    }
    
    const resultado = await LoteMovimientoModel.cambiarEstado({
      elemento_id: parseInt(elemento_id, 10),
      cantidad: parseInt(cantidad, 10),
      estado_desde,
      estado_hacia,
      motivo,
      descripcion: descripcion || null,
      usuario_id: req.user?.id || null
    });
    
    console.log(`✅ Estado cambiado: ${cantidad} unidades de "${estado_desde}" → "${estado_hacia}"`);
    
    res.json({
      success: true,
      message: `${cantidad} unidades movidas de "${estado_desde}" a "${estado_hacia}"`,
      data: resultado
    });
    
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    
    // Enviar mensaje de error claro al frontend
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Alquilar unidades
 * POST /api/lote-movimientos/alquilar
 * 
 * Body: {
 *   elemento_id: 31,
 *   cantidad: 5,
 *   rental_id: 123,
 *   descripcion: "Evento corporativo X"
 * }
 */
export const alquilar = async (req, res, next) => {
  try {
    const { elemento_id, cantidad, rental_id, descripcion } = req.body;
    
    if (!elemento_id || !cantidad) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos: elemento_id, cantidad'
      });
    }
    
    const resultado = await LoteMovimientoModel.alquilar({
      elemento_id: parseInt(elemento_id, 10),
      cantidad: parseInt(cantidad, 10),
      rental_id: rental_id ? parseInt(rental_id, 10) : null,
      descripcion,
      usuario_id: req.user?.id || null
    });
    
    console.log(`✅ ${cantidad} unidades alquiladas`);
    
    res.json({
      success: true,
      message: `${cantidad} unidades alquiladas exitosamente`,
      data: resultado
    });
    
  } catch (error) {
    console.error('Error al alquilar:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Devolver unidades
 * POST /api/lote-movimientos/devolver
 * 
 * Body: {
 *   elemento_id: 31,
 *   cantidad: 3,
 *   condicion: "limpio" | "sucio" | "muy_sucio" | "danado",
 *   rental_id: 123,
 *   descripcion: "Devolución del evento X",
 *   costo_reparacion: 50.00 (si está dañado)
 * }
 */
export const devolver = async (req, res, next) => {
  try {
    const {
      elemento_id,
      cantidad,
      condicion,
      rental_id,
      descripcion,
      costo_reparacion
    } = req.body;
    
    if (!elemento_id || !cantidad || !condicion) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos: elemento_id, cantidad, condicion'
      });
    }
    
    const condicionesValidas = ['limpio', 'sucio', 'muy_sucio', 'danado'];
    if (!condicionesValidas.includes(condicion)) {
      return res.status(400).json({
        success: false,
        error: `Condición inválida. Debe ser: ${condicionesValidas.join(', ')}`
      });
    }
    
    const resultado = await LoteMovimientoModel.devolver({
      elemento_id: parseInt(elemento_id, 10),
      cantidad: parseInt(cantidad, 10),
      condicion,
      rental_id: rental_id ? parseInt(rental_id, 10) : null,
      descripcion,
      costo_reparacion: costo_reparacion ? parseFloat(costo_reparacion) : null,
      usuario_id: req.user?.id || null
    });
    
    console.log(`✅ ${cantidad} unidades devueltas en condición: ${condicion}`);
    
    res.json({
      success: true,
      message: `${cantidad} unidades devueltas (${condicion})`,
      data: resultado
    });
    
  } catch (error) {
    console.error('Error al devolver:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Completar limpieza
 * POST /api/lote-movimientos/completar-limpieza
 */
export const completarLimpieza = async (req, res, next) => {
  try {
    const { elemento_id, cantidad, descripcion } = req.body;
    
    if (!elemento_id || !cantidad) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos: elemento_id, cantidad'
      });
    }
    
    const resultado = await LoteMovimientoModel.completarLimpieza({
      elemento_id: parseInt(elemento_id, 10),
      cantidad: parseInt(cantidad, 10),
      descripcion,
      usuario_id: req.user?.id || null
    });
    
    console.log(`✅ Limpieza completada: ${cantidad} unidades`);
    
    res.json({
      success: true,
      message: `Limpieza de ${cantidad} unidades completada`,
      data: resultado
    });
    
  } catch (error) {
    console.error('Error al completar limpieza:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Completar mantenimiento
 * POST /api/lote-movimientos/completar-mantenimiento
 */
export const completarMantenimiento = async (req, res, next) => {
  try {
    const {
      elemento_id,
      cantidad,
      reparado, // true = van a disponible, false = van a dañadas
      descripcion,
      costo_reparacion
    } = req.body;
    
    if (!elemento_id || !cantidad || reparado === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos: elemento_id, cantidad, reparado'
      });
    }
    
    const resultado = await LoteMovimientoModel.completarMantenimiento({
      elemento_id: parseInt(elemento_id, 10),
      cantidad: parseInt(cantidad, 10),
      reparado: Boolean(reparado),
      descripcion,
      costo_reparacion: costo_reparacion ? parseFloat(costo_reparacion) : null,
      usuario_id: req.user?.id || null
    });
    
    console.log(`✅ Mantenimiento completado: ${cantidad} unidades (${reparado ? 'reparadas' : 'dañadas'})`);
    
    res.json({
      success: true,
      message: `Mantenimiento de ${cantidad} unidades completado`,
      data: resultado
    });
    
  } catch (error) {
    console.error('Error al completar mantenimiento:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Obtener resumen de estados de un elemento
 * GET /api/lote-movimientos/resumen/:id
 */
export const obtenerResumen = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const resumen = await LoteMovimientoModel.obtenerResumenEstados(id);
    
    if (!resumen) {
      return res.status(404).json({
        success: false,
        error: 'Elemento no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: resumen
    });
    
  } catch (error) {
    console.error('Error al obtener resumen:', error);
    next(error);
  }
};

/**
 * Obtener historial de movimientos
 * GET /api/lote-movimientos/historial/:id
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
 * Obtener estadísticas de movimientos
 * GET /api/lote-movimientos/estadisticas/:id?fecha_inicio=2025-01-01&fecha_fin=2025-10-07
 */
export const obtenerEstadisticas = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fecha_inicio, fecha_fin } = req.query;
    
    const stats = await LoteMovimientoModel.obtenerEstadisticas(
      id,
      fecha_inicio,
      fecha_fin
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

/**
 * Obtener catálogo de motivos
 * GET /api/lote-movimientos/motivos
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