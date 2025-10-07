// ============================================
// models/LoteMovimientoModel.js
// Sistema de Estados Múltiples - Adaptado a tu estructura BD
// ============================================

import db from './db.js';

/**
 * Mapeo de nombres de estado a columnas de BD
 */
const ESTADO_A_COLUMNA = {
  'disponible': 'cantidad_disponible',
  'alquilada': 'cantidad_alquilada',
  'limpieza': 'cantidad_en_limpieza',
  'mantenimiento': 'cantidad_en_mantenimiento',
  'danada': 'cantidad_danada'
};

const LoteMovimientoModel = {
  
  /**
   * Cambiar estado de cantidades específicas de un elemento
   * Mueve cantidades entre diferentes estados del MISMO elemento
   * 
   * @param {Object} datos
   * @param {number} datos.elemento_id - ID del elemento
   * @param {number} datos.cantidad - Cantidad a mover
   * @param {string} datos.estado_desde - Estado origen: 'disponible', 'alquilada', etc.
   * @param {string} datos.estado_hacia - Estado destino
   * @param {string} datos.motivo - Código del motivo (ej: 'RENTED_OUT')
   * @param {string} datos.descripcion - Descripción opcional
   * @param {number} datos.rental_id - ID del alquiler (opcional)
   * @param {number} datos.usuario_id - ID del usuario (opcional)
   * @param {number} datos.costo_reparacion - Costo si aplica (opcional)
   */
  async cambiarEstado(datos) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const {
        elemento_id,
        cantidad,
        estado_desde,
        estado_hacia,
        motivo,
        descripcion = null,
        rental_id = null,
        usuario_id = null,
        costo_reparacion = null
      } = datos;
      
      // Validar estados
      if (!ESTADO_A_COLUMNA[estado_desde]) {
        throw new Error(`Estado origen inválido: ${estado_desde}`);
      }
      if (!ESTADO_A_COLUMNA[estado_hacia]) {
        throw new Error(`Estado destino inválido: ${estado_hacia}`);
      }
      
      const columnaDesde = ESTADO_A_COLUMNA[estado_desde];
      const columnaHacia = ESTADO_A_COLUMNA[estado_hacia];
      
      // 1. Obtener elemento y validar
      const [elementos] = await connection.query(
        `SELECT id, nombre, requiere_series, ${columnaDesde} as cantidad_actual 
         FROM elementos WHERE id = ?`,
        [elemento_id]
      );
      
      if (elementos.length === 0) {
        throw new Error(`Elemento ${elemento_id} no encontrado`);
      }
      
      const elemento = elementos[0];
      
      if (elemento.requiere_series) {
        throw new Error('Este método es solo para elementos sin series. Usa cambiarEstadoSerie() en su lugar.');
      }
      
      // 2. Validar cantidad disponible en estado origen
      if (elemento.cantidad_actual < cantidad) {
        throw new Error(
          `Cantidad insuficiente en estado "${estado_desde}". ` +
          `Disponible: ${elemento.cantidad_actual}, Solicitado: ${cantidad}`
        );
      }
      
      // 3. Restar del estado origen
      await connection.query(
        `UPDATE elementos SET ${columnaDesde} = ${columnaDesde} - ? WHERE id = ?`,
        [cantidad, elemento_id]
      );
      
      // 4. Sumar al estado destino
      await connection.query(
        `UPDATE elementos SET ${columnaHacia} = ${columnaHacia} + ? WHERE id = ?`,
        [cantidad, elemento_id]
      );
      
      // 5. Actualizar cantidad total (trigger lo hace automáticamente, pero por si acaso)
      await connection.query(
        `UPDATE elementos 
         SET cantidad = cantidad_disponible + cantidad_alquilada + 
                       cantidad_en_limpieza + cantidad_en_mantenimiento + cantidad_danada
         WHERE id = ?`,
        [elemento_id]
      );
      
      // 6. Registrar en historial
      await connection.query(
        `INSERT INTO elementos_movimientos (
          lote_origen_id, lote_destino_id, cantidad,
          motivo, descripcion, 
          rental_id, usuario_id, costo_reparacion,
          fecha_movimiento
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          elemento_id,      // lote_origen_id (mismo elemento)
          elemento_id,      // lote_destino_id (mismo elemento)
          cantidad,
          motivo,
          descripcion,
          rental_id,
          usuario_id,
          costo_reparacion
        ]
      );
      
      await connection.commit();
      
      // 7. Retornar resultado
      const [elementoActualizado] = await connection.query(
        `SELECT * FROM v_elementos_agrupados WHERE elemento_id = ?`,
        [elemento_id]
      );
      
      return {
        success: true,
        elemento: elementoActualizado[0],
        movimiento: {
          elemento_id,
          cantidad,
          desde: estado_desde,
          hacia: estado_hacia,
          motivo
        }
      };
      
    } catch (error) {
      await connection.rollback();
      console.error('Error al cambiar estado:', error);
      throw error;
    } finally {
      connection.release();
    }
  },
  
  /**
   * MÉTODO DE CONVENIENCIA: Alquilar unidades
   * Mueve de DISPONIBLE → ALQUILADA
   */
  async alquilar(datos) {
    return await this.cambiarEstado({
      elemento_id: datos.elemento_id,
      cantidad: datos.cantidad,
      estado_desde: 'disponible',
      estado_hacia: 'alquilada',
      motivo: 'RENTED_OUT',
      descripcion: datos.descripcion || `Alquiler para evento`,
      rental_id: datos.rental_id,
      usuario_id: datos.usuario_id
    });
  },
  
  /**
   * MÉTODO DE CONVENIENCIA: Devolver unidades
   * Mueve de ALQUILADA → DISPONIBLE/LIMPIEZA/MANTENIMIENTO según condición
   */
  async devolver(datos) {
    const {
      elemento_id,
      cantidad,
      condicion, // 'limpio', 'sucio', 'muy_sucio', 'danado'
      descripcion = null,
      rental_id = null,
      usuario_id = null,
      costo_reparacion = null
    } = datos;
    
    // Determinar estado destino según condición
    let estadoHacia, motivo;
    
    switch(condicion) {
      case 'limpio':
        estadoHacia = 'disponible';
        motivo = 'RETURNED_CLEAN';
        break;
      case 'sucio':
      case 'muy_sucio':
        estadoHacia = 'limpieza';
        motivo = 'RETURNED_DIRTY';
        break;
      case 'danado':
        estadoHacia = 'mantenimiento';
        motivo = 'RETURNED_DAMAGED';
        break;
      default:
        throw new Error(`Condición inválida: ${condicion}`);
    }
    
    return await this.cambiarEstado({
      elemento_id,
      cantidad,
      estado_desde: 'alquilada',
      estado_hacia: estadoHacia,
      motivo,
      descripcion: descripcion || `Devolución en condición: ${condicion}`,
      rental_id,
      usuario_id,
      costo_reparacion
    });
  },
  
  /**
   * MÉTODO DE CONVENIENCIA: Completar limpieza
   * Mueve de LIMPIEZA → DISPONIBLE
   */
  async completarLimpieza(datos) {
    return await this.cambiarEstado({
      elemento_id: datos.elemento_id,
      cantidad: datos.cantidad,
      estado_desde: 'limpieza',
      estado_hacia: 'disponible',
      motivo: 'CLEANING_COMPLETED',
      descripcion: datos.descripcion || 'Limpieza completada',
      usuario_id: datos.usuario_id
    });
  },
  
  /**
   * MÉTODO DE CONVENIENCIA: Completar mantenimiento
   * Mueve de MANTENIMIENTO → DISPONIBLE o DANADA
   */
  async completarMantenimiento(datos) {
    const estadoHacia = datos.reparado ? 'disponible' : 'danada';
    const motivo = datos.reparado ? 'REPARADO' : 'DANADO_IRREPARABLE';
    
    return await this.cambiarEstado({
      elemento_id: datos.elemento_id,
      cantidad: datos.cantidad,
      estado_desde: 'mantenimiento',
      estado_hacia: estadoHacia,
      motivo,
      descripcion: datos.descripcion,
      usuario_id: datos.usuario_id,
      costo_reparacion: datos.costo_reparacion
    });
  },
  
  /**
   * Obtener resumen de estados de un elemento
   */
  async obtenerResumenEstados(elementoId) {
    try {
      const [elementos] = await db.query(
        `SELECT * FROM v_elementos_agrupados WHERE elemento_id = ?`,
        [elementoId]
      );
      
      if (elementos.length === 0) {
        return null;
      }
      
      return elementos[0];
    } catch (error) {
      console.error('Error al obtener resumen:', error);
      throw error;
    }
  },
  
  /**
   * Obtener historial de movimientos de un elemento
   */
  async obtenerHistorial(elementoId) {
    try {
      const [movimientos] = await db.query(`
        SELECT 
          m.*,
          mot.nombre AS motivo_nombre,
          mot.categoria AS motivo_categoria
        FROM elementos_movimientos m
        LEFT JOIN motivos_movimiento mot ON m.motivo = mot.codigo
        WHERE m.lote_origen_id = ? OR m.lote_destino_id = ?
        ORDER BY m.fecha_movimiento DESC
        LIMIT 100
      `, [elementoId, elementoId]);
      
      return movimientos;
    } catch (error) {
      console.error('Error al obtener historial:', error);
      throw error;
    }
  },
  
  /**
   * Obtener estadísticas de un elemento
   */
  async obtenerEstadisticas(elementoId, fechaInicio = null, fechaFin = null) {
    try {
      // Fechas por defecto: últimos 30 días
      if (!fechaInicio) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - 30);
        fechaInicio = fecha.toISOString().split('T')[0];
      }
      if (!fechaFin) {
        fechaFin = new Date().toISOString().split('T')[0];
      }
      
      const [stats] = await db.query(`
        SELECT 
          m.motivo,
          mot.nombre AS motivo_nombre,
          mot.categoria,
          COUNT(*) AS total_movimientos,
          SUM(m.cantidad) AS total_unidades,
          COALESCE(SUM(m.costo_reparacion), 0) AS costo_total
        FROM elementos_movimientos m
        LEFT JOIN motivos_movimiento mot ON m.motivo = mot.codigo
        WHERE (m.lote_origen_id = ? OR m.lote_destino_id = ?)
          AND m.fecha_movimiento BETWEEN ? AND ?
        GROUP BY m.motivo, mot.nombre, mot.categoria
        ORDER BY total_unidades DESC
      `, [elementoId, elementoId, fechaInicio, fechaFin]);
      
      return stats;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  },
  
  /**
   * Obtener motivos disponibles
   */
  async obtenerMotivos() {
    try {
      const [motivos] = await db.query(
        'SELECT * FROM motivos_movimiento WHERE activo = 1 ORDER BY categoria, nombre'
      );
      return motivos;
    } catch (error) {
      console.error('Error al obtener motivos:', error);
      throw error;
    }
  }
};

export default LoteMovimientoModel;