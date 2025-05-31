import mongoose from 'mongoose';

const encuentroSchema = new mongoose.Schema({
    fechaEncuentro: {
        type: Date,
        required: true
    },
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    famoso: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Famoso',
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

export default mongoose.model('Encuentro', encuentroSchema);
