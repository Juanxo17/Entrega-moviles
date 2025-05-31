import mongoose from 'mongoose';

const visitaSchema = new mongoose.Schema({
    fechaVisita: {
        type: Date,
        required: true
    },
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    sitio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sitio',
        required: true
    },
    imagenes: [{
        type: String,
        required: false
    }],
    ubicacion: {
        type: {
            type: String,
            enum: ['Point'], // 'Point' para GeoJSON
            required: false
        },
        coordinates: {
            type: [Number], // [longitud, latitud]
            required: false
        }
    }
}, {
    timestamps: true
});

export default  mongoose.model('Visita', visitaSchema);