import mongoose from 'mongoose';

const platoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    descripcion: {
        type: String
    },
    precio: {
        type: Number,
        required: true
    },
    imagen: {
        type: String
    },
    // Relación con Sitio
    sitio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sitio'
    },
    // Relación con País
    pais: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pais'
    },
    // Relación con MenuSitio - un plato puede estar disponible en varios sitios
    menuSitios: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuSitio'
    }]
}, {
    timestamps: true
});

export default mongoose.model('Plato', platoSchema);