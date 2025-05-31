import Encuentro from "../models/Encuentro.js";
import Famoso from "../models/Famoso.js";
import Usuario from "../models/Usuario.js";

export const createEncuentro = async (req, res) => {
    try {
        const { famosoId, imagen, ubicacion } = req.body;
        const famoso = await Famoso.findById(famosoId);
        if (!famoso) return res.status(404).json({ message: 'Famoso no encontrado' });

        const nuevoEncuentro = new Encuentro({
            usuario: req.user.id,
            famoso: famosoId,
            fechaEncuentro: new Date(),
            imagenes: imagen ? [imagen] : [],
            ubicacion: ubicacion || undefined
        });
        await nuevoEncuentro.save();
        res.status(201).json(nuevoEncuentro);
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar el encuentro', error: error.message });
    }
};

export const getEncuentrosByUser = async (req, res) => {
    try {
        const encuentros = await Encuentro.find({ usuario: req.user.id }).populate('famoso');
        res.json(encuentros);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los encuentros', error: error.message });
    }
};

export const getAllEncuentros = async (req, res) => {
    try {
        if (req.user.rol !== 'ADMIN') return res.status(403).json({ message: 'No tienes permiso para ver todos los encuentros' });
        const encuentros = await Encuentro.find().populate('famoso').populate('usuario');
        res.json(encuentros);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los encuentros', error: error.message });
    }
};
