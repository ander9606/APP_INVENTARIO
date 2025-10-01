// ============================================
// models/MaterialModel.js
// ============================================

import db from './db.js';

const MaterialModel = {
    async obtenerTodos() {
        const [resultados] = await db.query('SELECT * FROM materiales ORDER BY nombre');
        return resultados;
    },

    async crear(nombre) {
        const [resultado] = await db.query(
            'INSERT INTO materiales (nombre) VALUES (?)',
            [nombre]
        );
        return resultado.insertId;
    }
};

export default MaterialModel;
