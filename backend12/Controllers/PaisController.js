import Pais from "../models/Pais.js";

export const createCountry = async (req, res) => {
  try {
    if (req.user.rol !== 'ADMIN') {
      return res.status(403).json({ message: 'No tienes permisos para crear países.' });
    }

    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ message: 'El nombre del país es obligatorio.' });
    }

    const paisExistente = await Pais.findOne({ nombre });
    if (paisExistente) {
      return res.status(400).json({ message: 'Ese país ya existe.' });
    }

    const nuevoPais = new Pais({ nombre });
    await nuevoPais.save();

    res.status(201).json({ message: 'País creado correctamente', pais: nuevoPais });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el país', error: error.message });
  }
};
export const getAllCountries = async (req, res) => {
  try {
    const paises = await Pais.find();
    res.json(paises);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener países', error: error.message });
  }
};

export const getCountryById = async (req, res) => {
  try {
    const pais = await Pais.findById(req.params.id);
    if (!pais) return res.status(404).json({ message: 'País no encontrado' });
    res.json(pais);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener país', error: error.message });
  }
};

export const updateCountry = async (req, res) => {
  try {
    if (req.user.rol !== 'ADMIN') return res.status(403).json({ message: 'Acceso denegado' });

    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ message: 'Nombre requerido' });

    const paisActualizado = await Pais.findByIdAndUpdate(req.params.id, { nombre }, { new: true });
    if (!paisActualizado) return res.status(404).json({ message: 'País no encontrado' });

    res.json({ message: 'País actualizado', pais: paisActualizado });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar país', error: error.message });
  }
};

export const deleteCountry = async (req, res) => {
  try {
    if (req.user.rol !== 'ADMIN') return res.status(403).json({ message: 'Acceso denegado' });

    const pais = await Pais.findByIdAndDelete(req.params.id);
    if (!pais) return res.status(404).json({ message: 'País no encontrado' });

    res.json({ message: 'País eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar país', error: error.message });
  }
};
