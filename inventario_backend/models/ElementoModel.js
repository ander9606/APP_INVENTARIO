// ============================================
// models/ElementoModel.js
// ============================================

import db from './db.js';

const ElementoModel = {
    /**
     * Obtener todos los elementos con información de categorías
     */
    async obtenerTodos() {
        try {
            const [filas] = await db.query(`
                SELECT
                    e.id,
                    e.nombre,
                    e.descripcion,
                    e.cantidad,
                    e.requiere_series,
                    e.material_id,
                    e.unidad_id,
                    e.estado,
                    e.ubicacion,
                    COALESCE(sub.id, cat.id) AS subcategoria_id,
                    COALESCE(sub.nombre, cat.nombre) AS subcategoria_nombre,
                    COALESCE(sub.padre_id, NULL) AS categoria_id,
                    COALESCE(cat.nombre, '') AS categoria_nombre,
                    m.nombre AS material_nombre,
                    u.nombre AS unidad_nombre,
                    u.abreviatura AS unidad_abreviatura
                FROM elementos e
                LEFT JOIN categorias sub ON e.categoria_id = sub.id
                LEFT JOIN categorias cat ON sub.padre_id = cat.id
                LEFT JOIN materiales m ON e.material_id = m.id
                LEFT JOIN unidades u ON e.unidad_id = u.id
                ORDER BY e.nombre;
            `);
            return filas;
        } catch (error) {
            console.error('Error al obtener elementos:', error);
            throw error;
        }
    },

    /**
     * Obtener un elemento por ID
     */
    async obtenerPorId(id) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM elementos WHERE id = ?',
                [id]
            );
            return rows[0];
        } catch (error) {
            console.error(`Error al obtener elemento ${id}:`, error);
            throw error;
        }
    },

    /**
     * Obtener series asociadas a un elemento
     */
    async obtenerSeriesPorElemento(idElemento) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM series WHERE id_elemento = ? ORDER BY numero_serie',
                [idElemento]
            );
            return rows;
        } catch (error) {
            console.error(`Error al obtener series del elemento ${idElemento}:`, error);
            throw error;
        }
    },

    /**
     * Crear un nuevo elemento (con transacción para series)
     */
    async crear(datosElemento) {
        const { series, ...datosParaInsert } = datosElemento;
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // Insertar elemento
            const [resultado] = await connection.query(
                'INSERT INTO elementos SET ?',
                [datosParaInsert]
            );
            const idElemento = resultado.insertId;

            // Insertar series si existen
            if (series && series.length > 0) {
                const valoresSeries = series.map(s => [
                    idElemento,
                    s.numero_serie,
                    s.estado || 'nuevo',
                    s.fecha_ingreso || new Date(),
                    s.ubicacion || null
                ]);

                await connection.query(
                    'INSERT INTO series (id_elemento, numero_serie, estado, fecha_ingreso, ubicacion) VALUES ?',
                    [valoresSeries]
                );
            }

            await connection.commit();
            return { insertId: idElemento };
        } catch (error) {
            await connection.rollback();
            console.error('Error al crear elemento:', error);
            throw error;
        } finally {
            connection.release();
        }
    },

    /**
     * Actualizar un elemento (con manejo de series)
     */
    async actualizar(id, datosElemento) {
        const { series, ...datosParaUpdate } = datosElemento;
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // Actualizar elemento
            if (Object.keys(datosParaUpdate).length > 0) {
                const columnas = Object.keys(datosParaUpdate)
                    .map(key => `\`${key}\` = ?`)
                    .join(', ');
                const valores = Object.values(datosParaUpdate);

                await connection.query(
                    `UPDATE elementos SET ${columnas} WHERE id = ?`,
                    [...valores, id]
                );
            }

            // Si se proporcionan series, reemplazar todas
            if (series !== undefined) {
                // Eliminar series anteriores
                await connection.query(
                    'DELETE FROM series WHERE id_elemento = ?',
                    [id]
                );

                // Insertar nuevas series
                if (series.length > 0) {
                    const valoresSeries = series.map(s => [
                        id,
                        s.numero_serie,
                        s.estado || 'nuevo',
                        s.fecha_ingreso || new Date(),
                        s.ubicacion || null
                    ]);

                    await connection.query(
                        'INSERT INTO series (id_elemento, numero_serie, estado, fecha_ingreso, ubicacion) VALUES ?',
                        [valoresSeries]
                    );
                }
            }

            await connection.commit();
            return { id, ...datosElemento };
        } catch (error) {
            await connection.rollback();
            console.error(`Error al actualizar elemento ${id}:`, error);
            throw error;
        } finally {
            connection.release();
        }
    },

    /**
     * Eliminar un elemento (y sus series en cascada)
     */
    async eliminar(id) {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // Eliminar series primero
            await connection.query('DELETE FROM series WHERE id_elemento = ?', [id]);

            // Eliminar elemento
            const [resultado] = await connection.query(
                'DELETE FROM elementos WHERE id = ?',
                [id]
            );

            await connection.commit();
            return resultado;
        } catch (error) {
            await connection.rollback();
            console.error(`Error al eliminar elemento ${id}:`, error);
            throw error;
        } finally {
            connection.release();
        }
    }
};

export default ElementoModel;
