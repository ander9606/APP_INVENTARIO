const UnidadModel = require('../models/UnidadModel');

exports.obtenerUnidades = async (req, res) => {
    try {
        const unidades = await UnidadModel.obtenerTodos();
        res.json(unidades);
    }catch (error) {
        console.error('Error al obtener unidades:', error);
        res.status(500).json({ error: 'Error al obtener las unidades' });
    }
};

exports.crearUnidad = async (req, res) => {
    try {
        const { nombre, abreviatura, tipo } = req.body;
        const id = await UnidadModel.crear({nombre, abreviatura, tipo});
        res.status(201).json({ mensaje: 'Unidad creada exitosamente', id, nombre, abreviatura, tipo });
    }catch (error) {
        console.error('Error al crear unidad:', error);
        res.status(500).json({ error: 'Error al crear la unidad' });
    }
};