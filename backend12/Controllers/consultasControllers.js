import Visita from '../models/Visita.js';
import Pais from '../models/Pais.js';
import Sitio from '../models/Sitio.js';
import Tag from '../models/Tag.js';
import Usuario from '../models/Usuario.js';
import Platos from '../models/Plato.js';
import mongoose from 'mongoose';

export const topSitiosPorPais = async (req, res) => {
  try {
    const { nombrePais } = req.params;

    // Busco el país
    const pais = await Pais.findOne({ nombre: nombrePais });
    if (!pais) return res.status(404).json({ message: 'País no encontrado' });

    // Agrupo visitas por sitio solo en el país
    const topSitios = await Visita.aggregate([
      {
        $lookup: {
          from: 'sitios',
          localField: 'sitio',
          foreignField: '_id',
          as: 'sitioInfo',
        },
      },
      { $unwind: '$sitioInfo' },
      {
        $lookup: {
          from: 'ciudads',
          localField: 'sitioInfo.ciudad',
          foreignField: '_id',
          as: 'ciudadInfo',
        },
      },
      { $unwind: '$ciudadInfo' },
      { $match: { 'ciudadInfo.pais': pais._id } },
      {
        $group: {
          _id: '$sitio',
          nombreSitio: { $first: '$sitioInfo.nombre' },
          cantidadVisitas: { $sum: 1 },
        },
      },
      { $sort: { cantidadVisitas: -1 } },
      { $limit: 10 },
    ]);

    res.json(topSitios);
  } catch (error) {
    res.status(500).json({ message: 'Error en topSitiosPorPais', error: error.message });
  }
};

export const visitasPorUsuario = async (req, res) => {
  try {
    const usuarioId = req.user.id;

    const visitas = await Visita.find({ usuario: usuarioId })
      .populate('sitio', 'nombre')
      .sort({ fecha: -1 });

    res.json(visitas);
  } catch (error) {
    res.status(500).json({ message: 'Error en visitasPorUsuario', error: error.message });
  }
};

export const platosMasCarosPorPais = async (req, res) => {
  try {
    // Agrupar platos por país y sacar los más caros por país
    const platosCaros = await Platos.aggregate([
      {
        $lookup: {
          from: 'sitios',
          localField: 'sitio',
          foreignField: '_id',
          as: 'sitioInfo',
        },
      },
      { $unwind: '$sitioInfo' },
      {
        $lookup: {
          from: 'paises',
          localField: 'sitioInfo.pais',
          foreignField: '_id',
          as: 'paisInfo',
        },
      },
      { $unwind: '$paisInfo' },
      {
        $group: {
          _id: '$paisInfo.nombre',
          platoMasCaro: { $max: '$precio' },
          platoNombre: { $first: '$nombre' },
        },
      },
    ]);
    res.json(platosCaros);
  } catch (error) {
    res.status(500).json({ message: 'Error en platosMasCarosPorPais', error: error.message });
  }
};

export const tagsPorSitio = async (req, res) => {
  try {
    const tags = await Tag.find()
      .populate('sitio', 'nombre')
      .populate('personajes', 'nombre')
      .populate('usuarios', 'nombre email')
      .sort({ fecha: -1 });
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: 'Error en tagsPorSitio', error: error.message });
  }
};
