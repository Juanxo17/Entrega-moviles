import mongoose from 'mongoose';

const personajeSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    ciudadNacimiento: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ciudad',
        required: true
    },
    famosoRelacionado: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Famoso'
    }
}, {
    timestamps: true
});

export default mongoose.model('Personaje', personajeSchema);