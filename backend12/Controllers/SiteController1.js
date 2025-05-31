import Sitio from "../models/Sitio.js";
import Ciudad from "../models/Ciudad.js";

export const createSite = async (req, res) => {
    try {
        if (req.user.rol !== 'ADMIN') return res.status(403).json({ message: 'No tienes permiso para crear sitios.' });

        const { nombre, tipo, ciudad } = req.body;
        if (!nombre || !tipo || !ciudad) return res.status(400).json({ message: 'Faltan campos requeridos' });

        const ciudadDoc = await Ciudad.findOne({ nombre: ciudad });
        if (!ciudadDoc) return res.status(404).json({ message: 'Ciudad no encontrada' });

        const sitioExistente = await Sitio.findOne({ nombre, ciudad: ciudadDoc._id });
        if (sitioExistente) return res.status(400).json({ message: 'El sitio ya existe' });

        const nuevoSitio = new Sitio({ nombre, tipo, ciudad: ciudadDoc._id });
        await nuevoSitio.save();
        res.status(201).json(nuevoSitio);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear sitio', error: error.message });
    }
};

export const getAllSites = async (req, res) => {
    try {
        const sitios = await Sitio.find().populate('ciudad');
        res.json(sitios);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los sitios', error: error.message });
    }
};

export const getSiteById = async (req, res) => {
    try {
        const sitio = await Sitio.findById(req.params.id).populate('ciudad');
        if (!sitio) return res.status(404).json({ message: 'Sitio no encontrado' });
        res.json(sitio);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el sitio', error: error.message });
    }
};

export const updateSite = async (req, res) => {
    try {
        if (req.user.rol !== 'ADMIN') return res.status(403).json({ message: 'No tienes permiso para editar sitios.' });

        const { nombre, tipo } = req.body;
        const sitioActualizado = await Sitio.findByIdAndUpdate(
            req.params.id,
            { nombre, tipo },
            { new: true }
        );
        if (!sitioActualizado) return res.status(404).json({ message: 'Sitio no encontrado' });
        res.json(sitioActualizado);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el sitio', error: error.message });
    }
};

export const deleteSite = async (req, res) => {
    try {
        if (req.user.rol !== 'ADMIN') return res.status(403).json({ message: 'No tienes permiso para eliminar sitios.' });

        await Sitio.findByIdAndDelete(req.params.id);
        res.json({ message: 'Sitio eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el sitio', error: error.message });
    }
};
