import Plato from "../models/Plato.js";
import Sitio from "../models/Sitio.js";
import Pais from "../models/Pais.js";

export const createDish = async (req, res) => {
    try {
        if (req.user.rol !== 'ADMIN') return res.status(403).json({ message: 'No tienes permiso para crear platos.' });

        const { nombre, precio, descripcion, sitio, pais } = req.body;
        if (!nombre || !precio) return res.status(400).json({ message: 'Faltan campos requeridos' });

        let sitioDoc = null;
        let paisDoc = null;

        // If sitio is provided, find it by name or ID
        if (sitio) {
            if (typeof sitio === 'string') {
                sitioDoc = await Sitio.findOne({ nombre: sitio }) || await Sitio.findById(sitio);
            }
            if (!sitioDoc) return res.status(404).json({ message: 'Sitio no encontrado' });
        }

        // If pais is provided, find it by name or ID
        if (pais) {
            if (typeof pais === 'string') {
                paisDoc = await Pais.findOne({ nombre: pais }) || await Pais.findById(pais);
            }
            if (!paisDoc) return res.status(404).json({ message: 'País no encontrado' });
        }

        const nuevoPlato = new Plato({ 
            nombre, 
            precio, 
            descripcion,
            sitio: sitioDoc?._id,
            pais: paisDoc?._id 
        });
        await nuevoPlato.save();
        res.status(201).json(nuevoPlato);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el plato', error: error.message });
    }
};

export const getAllDishes = async (req, res) => {
    try {
        const platos = await Plato.find().populate('sitio').populate('pais');
        res.json(platos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los platos', error: error.message });
    }
};

export const getDishById = async (req, res) => {
    try {
        const plato = await Plato.findById(req.params.id).populate('sitio').populate('pais');
        if (!plato) return res.status(404).json({ message: 'Plato no encontrado' });
        res.json(plato);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el plato', error: error.message });
    }
};

export const updateDish = async (req, res) => {
    try {
        if (req.user.rol !== 'ADMIN') return res.status(403).json({ message: 'No tienes permiso para editar platos.' });

        const { nombre, precio, descripcion } = req.body;
        const platoActualizado = await Plato.findByIdAndUpdate(
            req.params.id,
            { nombre, precio, descripcion },
            { new: true }
        ).populate('sitio').populate('pais');
        if (!platoActualizado) return res.status(404).json({ message: 'Plato no encontrado' });
        res.json(platoActualizado);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el plato', error: error.message });
    }
};

export const deleteDish = async (req, res) => {
    try {
        if (req.user.rol !== 'ADMIN') return res.status(403).json({ message: 'No tienes permiso para eliminar platos.' });

        await Plato.findByIdAndDelete(req.params.id);
        res.json({ message: 'Plato eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el plato', error: error.message });
    }
};
