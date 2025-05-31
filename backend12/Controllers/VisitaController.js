import Visita from "../models/Visita.js";
import Sitio from "../models/Sitio.js";
import Usuario from "../models/Usuario.js";

export const createVisita = async (req, res) => {
    try {
        const { sitioId, imagen, ubicacion } = req.body;
        const sitio = await Sitio.findById(sitioId);
        if (!sitio) return res.status(404).json({ message: 'Sitio no encontrado' });

        const nuevaVisita = new Visita({
            usuario: req.user.id,
            sitio: sitioId,
            fechaVisita: new Date(),
            imagenes: imagen ? [imagen] : [],
            ubicacion: ubicacion || undefined
        });
        await nuevaVisita.save();
        res.status(201).json(nuevaVisita);
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar la visita', error: error.message });
    }
};

export const getVisitasByUser = async (req, res) => {
    try {
        const visitas = await Visita.find({ usuario: req.user.id }).populate('sitio');
        res.json(visitas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las visitas', error: error.message });
    }
};

export const getAllVisitas = async (req, res) => {
    try {
        if (req.user.rol !== 'ADMIN') return res.status(403).json({ message: 'No tienes permiso para ver todas las visitas' });
        const visitas = await Visita.find().populate('sitio').populate('usuario');
        res.json(visitas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las visitas', error: error.message });
    }
};
