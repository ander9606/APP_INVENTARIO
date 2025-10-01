// ============================================
// models/SerieModel.js
// ============================================

import db from './db.js';

const SerieModel = {
    async obtenerPorElemento(idElemento) {
        const [filas] = await db.query(
            'SELECT * FROM series WHERE id_elemento = ? ORDER BY numero_serie',
            [idElemento]
        );
        return filas;
    },

    async obtenerPorId(id) {
        const [rows] = await db.query(
            'SELECT * FROM series WHERE id = ?',
            [id]
        );
        return rows[0];
    },

    async crear({ id_elemento, numero_serie, estado, fecha_ingreso, ubicacion }) {
        const [resultado] = await db.query(
            'INSERT INTO series (id_elemento, numero_serie, estado, fecha_ingreso, ubicacion) VALUES (?, ?, ?, ?, ?)',
            [id_elemento, numero_serie, estado, fecha_ingreso, ubicacion]
        );
        return resultado;
    },

    async actualizar(id, { numero_serie, estado, fecha_ingreso, ubicacion }) {
        const [resultado] = await db.query(
            'UPDATE series SET numero_serie = ?, estado = ?, fecha_ingreso = ?, ubicacion = ? WHERE id = ?',
            [numero_serie, estado, fecha_ingreso, ubicacion, id]
        );
        return resultado;
    },

    async eliminar(id) {
        const [resultado] = await db.query('DELETE FROM series WHERE id = ?', [id]);
        return resultado;
    }
};

export default SerieModel;