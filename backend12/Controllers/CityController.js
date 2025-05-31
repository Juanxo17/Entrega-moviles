import Ciudad from "../models/Ciudad.js";
import Pais from "../models/Pais.js";

export const createCity = async (req,res) =>{
    try{
        if(req.user.rol !== 'ADMIN'){
            return res.status(400).json({
                message: 'No tienes permiso para crear una ciudad.'
            })
        }
        const {nombre, pais} = req.body;
        if (!nombre || !pais){
            return res.status(400).json({message: 'Faltan campos requeridos'})
        }
        
 
        const paisDoc = await Pais.findOne({ nombre: pais });
        if (!paisDoc) {
            return res.status(400).json({
                message: 'El país especificado no existe'
            });
        }
        
     
        const ciudadExistente = await Ciudad.findOne({nombre, pais: paisDoc._id});
        if (ciudadExistente){
            return res.status(400).json({
                message: 'La ciudad ya existe'
            });
        }
        
        
        const nuevaCiudad = new Ciudad({
            nombre, 
            pais: paisDoc._id        });
        await nuevaCiudad.save();
        
        return res.status(201).json({
            message: 'Ciudad creada exitosamente',
            ciudad: nuevaCiudad
        });
    }catch(error){
        console.log(error.message);
        return res.status(500).json({
            message: 'Error al crear la ciudad', 
            error: error.message
        });
    }
}

export const getAllCities = async(req,res) =>{
    try{
        const ciudades = await Ciudad.find().populate('pais', 'nombre');
        res.json(ciudades)
    }catch(error){
        res.status(500).json({
            message: 'error al obtener ciudades', error: error.message
        })
    }
}
export const getCityById = async (req, res) => {
  try {
    const ciudad = await Ciudad.findById(req.params.id).populate('pais', 'nombre');
    if (!ciudad) {
      return res.status(404).json({ message: 'Ciudad no encontrada' });
    }
    res.json(ciudad);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la ciudad', error: error.message });
  }
};


export const updateCity = async (req, res) => {
  try {
    if (req.user.rol !== 'ADMIN') {
      return res.status(403).json({ message: 'No tienes permiso para actualizar una ciudad' });
    }

    const { nombre, pais } = req.body;
    const ciudadId = req.params.id;

    const updateFields = {};
    if (nombre) updateFields.nombre = nombre;
    if (pais) {
      const paisDoc = await Pais.findOne({ nombre: pais });
      if (!paisDoc) {
        return res.status(400).json({ message: 'El país especificado no existe' });
      }
      updateFields.pais = paisDoc._id;
    }

    const ciudadActualizada = await Ciudad.findByIdAndUpdate(ciudadId, updateFields, { new: true }).populate('pais', 'nombre');

    if (!ciudadActualizada) {
      return res.status(404).json({ message: 'Ciudad no encontrada' });
    }

    res.json({ message: 'Ciudad actualizada correctamente', ciudad: ciudadActualizada });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la ciudad', error: error.message });
  }
};

export const deleteCity = async (req, res) => {
  try {
    if (req.user.rol !== 'ADMIN') {
      return res.status(403).json({ message: 'No tienes permiso para eliminar una ciudad' });
    }

    const ciudad = await Ciudad.findByIdAndDelete(req.params.id);
    if (!ciudad) {
      return res.status(404).json({ message: 'Ciudad no encontrada' });
    }

    res.json({ message: 'Ciudad eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la ciudad', error: error.message });
  }
};

