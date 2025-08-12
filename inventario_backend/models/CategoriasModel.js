// models/CategoriasModel.js
const db = require('./db');
const { actualizar } = require('./ElementoModel');


const CategoriasModel = {
    async obtenerTodas() {
        const query = `
            SELECT 
            c.id,
            c.nombre,
            c.descripcion,
            c.categoria_padre_id,
            cp.nombre AS categoria_padre_nombre
            FROM categorias c
            LEFT JOIN categorias cp ON c.categoria_padre_id = cp.id
            ORDER BY c.categoria_padre_id, c.nombre`;
        const [rows] = await db.query(query);
        return rows;
    },

    async obtenerPorId(id){
        const query = `SELECT * FROM categorias WHERE id = ?`;
        const [rows] = await db.execute(query, [id]);
        return rows[0];
    },

    async crear ({nombre, descripcion, categoria_padre_id=null}) {
        const query = `
        INSERT INTO categorias (nombre, descripcion, categoria_padre_id)
        VALUES (?, ?, ?)`;
        const [result] = await db.execute(query, [nombre, descripcion, categoria_padre_id]);
        return {id: result.insertId, nombre, descripcion, categoria_padre_id};
    },

    async actualizar(id, {nombre, descripcion, categoria_padre_id}) {
        const query = `
        UPDATE categorias
        SET nombre = ?, descripcion = ?, categoria_padre_id = ?
        WHERE id = ?`;
        await db.execute(query, [nombre, descripcion, categoria_padre_id, id]);
        return {id, nombre, descripcion, categoria_padre_id};
    },

    async eliminar(id) {
        const query = `DELETE FROM categorias WHERE id = ?`;
        await db.execute(query, [id]);
        return {mensaje: 'Categoría eliminada'};
    },
}; 

module.exports = CategoriasModel;