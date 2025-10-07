// ============================================
// models/LoteMovimientoModel.js
// Gestión de movimientos entre lotes de elementos
// ============================================

import db from './db.js';

const LoteMovimientoModel = {
    /**
     * Registrar un movimiento entre lotes
     * Automáticamente actualiza cantidades y crea lotes si es necesario
     */
    async registrarMovimiento(datos) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // 1. Validar lote origen
            const [loteOrigen] = await connection.query(
                'SELECT * FROM elementos WHERE id = ? AND requiere_series = 0',
                [datos.lote_origen_id]
            );
            
            if (loteOrigen.length === 0) {
                throw new Error('Lote de origen no encontrado');
            }
            
            if (loteOrigen[0].cantidad < datos.cantidad) {
                throw new Error(
                    `Cantidad insuficiente. Disponible: ${loteOrigen[0].cantidad}, Solicitado: ${datos.cantidad}`
                );
            }
            
            // 2. Restar del origen
            await connection.query(
                'UPDATE elementos SET cantidad = cantidad - ? WHERE id = ?',
                [datos.cantidad, datos.lote_origen_id]
            );
            
            let loteDestinoId = datos.lote_destino_id;
            
            // 3. Si no existe destino, buscar o crear
            if (!loteDestinoId) {
                const [lotesExistentes] = await connection.query(`
                    SELECT id FROM elementos 
                    WHERE elemento_base_id = ? 
                    AND current_status = ?
                    AND cleaning_status = ?
                    AND requiere_series = 0
                    LIMIT 1
                `, [
                    loteOrigen[0].elemento_base_id || loteOrigen[0].id,
                    datos.current_status_destino,
                    datos.cleaning_status_destino
                ]);
                
                if (lotesExistentes.length > 0) {
                    // Sumar a lote existente
                    loteDestinoId = lotesExistentes[0].id;
                    await connection.query(
                        'UPDATE elementos SET cantidad = cantidad + ? WHERE id = ?',
                        [datos.cantidad, loteDestinoId]
                    );
                } else {
                    // Crear nuevo lote
                    const nuevoLote = {
                        nombre: loteOrigen[0].nombre,
                        descripcion: loteOrigen[0].descripcion,
                        cantidad: datos.cantidad,
                        requiere_series: 0,
                        categoria_id: loteOrigen[0].categoria_id,
                        material_id: loteOrigen[0].material_id,
                        unidad_id: loteOrigen[0].unidad_id,
                        estado: datos.cleaning_status_destino === 'DAMAGED' ? 'dañado' : 'bueno',
                        current_status: datos.current_status_destino,
                        cleaning_status: datos.cleaning_status_destino,
                        ubicacion: loteOrigen[0].ubicacion,
                        elemento_base_id: loteOrigen[0].elemento_base_id || loteOrigen[0].id,
                        lote_numero: `${datos.current_status_destino}-${Date.now()}`,
                        fecha_ingreso: new Date()
                    };
                    
                    const [resultado] = await connection.query(
                        'INSERT INTO elementos SET ?',
                        [nuevoLote]
                    );
                    
                    loteDestinoId = resultado.insertId;
                }
            } else {
                // Sumar a lote destino especificado
                await connection.query(
                    'UPDATE elementos SET cantidad = cantidad + ? WHERE id = ?',
                    [datos.cantidad, loteDestinoId]
                );
            }
            
            // 4. Registrar movimiento en historial
            const [resultado] = await connection.query(
                `INSERT INTO elementos_movimientos 
                (lote_origen_id, lote_destino_id, cantidad, 
                 current_status_origen, current_status_destino,
                 cleaning_status_origen, cleaning_status_destino,
                 estado_origen, estado_destino,
                 motivo, descripcion, rental_id, usuario_id, costo_reparacion, fecha_movimiento)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                [
                    datos.lote_origen_id,
                    loteDestinoId,
                    datos.cantidad,
                    loteOrigen[0].current_status,
                    datos.current_status_destino,
                    loteOrigen[0].cleaning_status,
                    datos.cleaning_status_destino,
                    loteOrigen[0].estado,
                    datos.cleaning_status_destino === 'DAMAGED' ? 'dañado' : 'bueno',
                    datos.motivo,
                    datos.descripcion || null,
                    datos.rental_id || null,
                    datos.usuario_id || null,
                    datos.costo_reparacion || null
                ]
            );
            
            // 5. Si origen quedó en 0, marcarlo como retirado
            const [loteActualizado] = await connection.query(
                'SELECT cantidad FROM elementos WHERE id = ?',
                [datos.lote_origen_id]
            );
            
            if (loteActualizado[0].cantidad === 0) {
                await connection.query(
                    'UPDATE elementos SET current_status = "RETIRED" WHERE id = ?',
                    [datos.lote_origen_id]
                );
            }
            
            await connection.commit();
            
            return {
                movimiento_id: resultado.insertId,
                lote_destino_id: loteDestinoId
            };
            
        } catch (error) {
            await connection.rollback();
            console.error('Error al registrar movimiento:', error);
            throw error;
        } finally {
            connection.release();
        }
    },
    
    /**
     * Marcar elementos como alquilados
     */
    async marcarComoAlquilado(datos) {
        return await this.registrarMovimiento({
            lote_origen_id: datos.lote_id,
            cantidad: datos.cantidad,
            current_status_destino: 'RENTED',
            cleaning_status_destino: 'GOOD',
            motivo: 'RENTED_OUT',
            descripcion: datos.descripcion,
            rental_id: datos.rental_id,
            usuario_id: datos.usuario_id
        });
    },
    
    /**
     * Procesar devolución de alquiler
     */
    async procesarDevolucion(datos) {
        let current_status_destino;
        let motivo;
        
        switch(datos.cleaning_status_devolucion) {
            case 'CLEAN':
                current_status_destino = 'AVAILABLE';
                motivo = 'RETURNED_CLEAN';
                break;
            case 'DIRTY':
            case 'VERY_DIRTY':
                current_status_destino = 'CLEANING';
                motivo = 'RETURNED_DIRTY';
                break;
            case 'DAMAGED':
                current_status_destino = 'MAINTENANCE';
                motivo = 'RETURNED_DAMAGED';
                break;
            default:
                current_status_destino = 'CLEANING';
                motivo = 'RETURNED_DIRTY';
        }
        
        return await this.registrarMovimiento({
            lote_origen_id: datos.lote_alquilado_id,
            cantidad: datos.cantidad,
            current_status_destino: current_status_destino,
            cleaning_status_destino: datos.cleaning_status_devolucion,
            motivo: motivo,
            descripcion: datos.notas,
            rental_id: datos.rental_id,
            usuario_id: datos.usuario_id,
            costo_reparacion: datos.costo_reparacion
        });
    },
    
    /**
     * Completar limpieza
     */
    async completarLimpieza(datos) {
        return await this.registrarMovimiento({
            lote_origen_id: datos.lote_limpieza_id,
            cantidad: datos.cantidad,
            current_status_destino: 'AVAILABLE',
            cleaning_status_destino: 'CLEAN',
            motivo: 'CLEANING_COMPLETED',
            descripcion: datos.notas,
            usuario_id: datos.usuario_id
        });
    },
    
    /**
     * Obtener historial de movimientos de un elemento
     */
    async obtenerHistorial(elementoBaseId) {
        try {
            const [movimientos] = await db.query(`
                SELECT 
                    m.*,
                    origen.nombre AS lote_origen_nombre,
                    origen.lote_numero AS lote_origen_numero,
                    destino.nombre AS lote_destino_nombre,
                    destino.lote_numero AS lote_destino_numero,
                    mot.nombre AS motivo_nombre,
                    mot.categoria AS motivo_categoria
                FROM elementos_movimientos m
                INNER JOIN elementos origen ON m.lote_origen_id = origen.id
                INNER JOIN elementos destino ON m.lote_destino_id = destino.id
                LEFT JOIN motivos_movimiento mot ON m.motivo = mot.codigo
                WHERE origen.elemento_base_id = ? 
                   OR origen.id = ?
                   OR destino.elemento_base_id = ?
                   OR destino.id = ?
                ORDER BY m.fecha_movimiento DESC
            `, [elementoBaseId, elementoBaseId, elementoBaseId, elementoBaseId]);
            
            return movimientos;
        } catch (error) {
            console.error('Error al obtener historial:', error);
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
    },
    
    /**
     * Obtener estadísticas de movimientos
     */
    async obtenerEstadisticas(elementoBaseId, fechaInicio, fechaFin) {
        try {
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
                INNER JOIN elementos e ON m.lote_origen_id = e.id
                WHERE (e.elemento_base_id = ? OR e.id = ?)
                  AND m.fecha_movimiento BETWEEN ? AND ?
                GROUP BY m.motivo, mot.nombre, mot.categoria
                ORDER BY total_unidades DESC
            `, [elementoBaseId, elementoBaseId, fechaInicio, fechaFin]);
            
            return stats;
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            throw error;
        }
    }
};

export default LoteMovimientoModel;