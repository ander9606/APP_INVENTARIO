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

    async obtenerSoloPadres(){
        const [rows] = await pool.query(`SELECT * FROM categorias WHERE padre_id IS NULL`);
        return rows;
    },

    async obtenerSubcategorias(categoriaId) {
        // ✅ CAMBIO: Usamos 'padre_id' en lugar de 'categoria_padre_id'
        const [rows] = await pool.query(
            "SELECT * FROM categorias WHERE padre_id = ?",
            [categoriaId]
        );
        return rows;
    },

    async crear({ nombre, padre_id = null }) {
        // ✅ CAMBIO: Usamos 'padre_id' en la consulta y en el objeto
        const [result] = await pool.query(
            "INSERT INTO categorias (nombre, padre_id) VALUES (?, ?)",
            [nombre, padre_id]
        );
        return { id: result.insertId, nombre, padre_id };
    },

    async eliminar(id) {
        await pool.query("DELETE FROM categorias WHERE id = ?", [id]);
    }
};

module.exports = CategoriasModel;