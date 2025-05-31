import mongoose from 'mongoose';

const ciudadSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    // Relación: una ciudad pertenece a un país
    pais: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pais',
        required: true
    },
    // Relación: una ciudad es el lugar de origen de personajes
    // Esta relación se implementa en el modelo Personaje

    // Relación: una ciudad es el lugar de ubicación de sitios
    // Esta relación se implementa en el modelo Sitio
}, {
    timestamps: true
});

export default mongoose.model('Ciudad', ciudadSchema);