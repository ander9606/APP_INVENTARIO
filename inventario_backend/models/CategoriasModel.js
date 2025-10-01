//============================================
// models/CategoriasModel.js
// ============================================

import db from './db.js';

const CategoriasModel = {
    async obtenerTodas() {
        const [rows] = await db.query('SELECT * FROM categorias ORDER BY nombre');
        return rows;
    },

    async obtenerPorId(id) {
        const [rows] = await db.query('SELECT * FROM categorias WHERE id = ?', [id]);
        return rows[0];
    },

    async obtenerSoloPadres() {
        const [rows] = await db.query(
            'SELECT * FROM categorias WHERE padre_id IS NULL ORDER BY nombre'
        );
        return rows;
    },

    async obtenerSubcategorias(categoriaId) {
        const [rows] = await db.query(
            'SELECT * FROM categorias WHERE padre_id = ? ORDER BY nombre',
            [categoriaId]
        );
        return rows;
    },

    async crear({ nombre, padre_id = null }) {
        const [result] = await db.query(
            'INSERT INTO categorias (nombre, padre_id) VALUES (?, ?)',
            [nombre, padre_id]
        );
        return { id: result.insertId, nombre, padre_id };
    },

    async eliminar(id) {
        const [result] = await db.query('DELETE FROM categorias WHERE id = ?', [id]);
        return result;
    }
};

export default CategoriasModel;