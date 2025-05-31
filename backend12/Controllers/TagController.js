import Tag from "../models/Tag.js";
import Usuario from "../models/Usuario.js";
import Sitio from "../models/Sitio.js";
import Personaje from "../models/Personaje.js";

export const createTag = async (req, res) => {
    try {
        const { nombre, personajes, sitioId, geo } = req.body;

        const sitio = await Sitio.findById(sitioId);
        if (!sitio) return res.status(404).json({ message: 'Sitio no encontrado' });

        const personajesExistentes = await Personaje.find({ _id: { $in: personajes } });
        if (personajesExistentes.length !== personajes.length) {
            return res.status(404).json({ message: 'Uno o más personajes no existen' });
        }

        const nuevoTag = new Tag({
            nombre,
            usuarios: [req.user.id],
            personajes,
            sitio: sitioId,
            geo
        });

        await nuevoTag.save();
        res.status(201).json(nuevoTag);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el tag', error: error.message });
    }
};

export const getTagsByUser = async (req, res) => {
    try {
        const tags = await Tag.find({ usuarios: req.user.id })
            .populate('usuarios', 'nombre email')
            .populate('personajes', 'nombre actividadFama')
            .populate('sitio', 'nombre tipo');
        res.json(tags);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los tags', error: error.message });
    }
};

export const getAllTags = async (req, res) => {
    try {
        if (req.user.rol !== 'ADMIN') return res.status(403).json({ message: 'No tienes permisos' });

        const tags = await Tag.find()
            .populate('usuarios', 'nombre email')
            .populate('personajes', 'nombre actividadFama')
            .populate('sitio', 'nombre tipo');
        res.json(tags);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los tags', error: error.message });
    }
};
