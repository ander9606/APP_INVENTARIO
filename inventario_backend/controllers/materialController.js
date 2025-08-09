const MaterialModel = require('../models/MaterialModel');

exports.obtenerMateriales = async (req, res) => {
    try {
        const materiales = await MaterialModel.obtenerTodos ();
        res.json(materiales);
        console.log(`Materiales obtenidos: ${materiales.length}`);
    } catch (error) {
        console.error('Error al obtener materiales:', error);
        res.status(500).json({error: 'Error al obtener los materiales'});
    }
};

exports.crearMaterial = async (req, res) => {
    try {
        const { nombre } = req.body;
        const id = await MaterialModel.crear(nombre);
        res.status(201).json({ id, nombre });
    } catch (error) {
        res.status (500).json({ error: 'Error al crear el material' });
    }
};

