// ============================================
// models/UnidadModel.js
// ============================================

import db from './db.js';

const UnidadModel = {
    async obtenerTodos() {
        const [resultados] = await db.query('SELECT * FROM unidades ORDER BY nombre');
        return resultados;
    },

    async crear({ nombre, abreviatura, tipo }) {
        const [resultado] = await db.query(
            'INSERT INTO unidades (nombre, abreviatura, tipo) VALUES (?, ?, ?)',
            [nombre, abreviatura, tipo]
        );
        return resultado.insertId;
    }
};

export default UnidadModel;