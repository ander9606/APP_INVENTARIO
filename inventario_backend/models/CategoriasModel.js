// models/CategoriasModel.js
const pool = require('./db'); // ✅ conexión centralizada

const CategoriasModel = {
    async obtenerTodas() {
        const [rows] = await pool.query("SELECT * FROM categorias");
        return rows;
    },

    async obtenerPorId(id) {
        const [rows] = await pool.query("SELECT * FROM categorias WHERE id = ?", [id]);
        return rows[0];
    },

    async obtenerSubcategorias(categoriaId) {
        const [rows] = await pool.query(
            "SELECT * FROM categorias WHERE categoria_padre_id = ?",
            [categoriaId]
        );
        return rows;
    },

    async crear({ nombre, categoria_padre_id = null }) {
        const [result] = await pool.query(
            "INSERT INTO categorias (nombre, categoria_padre_id) VALUES (?, ?)",
            [nombre, categoria_padre_id]
        );
        return { id: result.insertId, nombre, categoria_padre_id };
    },

    async eliminar(id) {
        await pool.query("DELETE FROM categorias WHERE id = ?", [id]);
    }
};

module.exports = CategoriasModel;
