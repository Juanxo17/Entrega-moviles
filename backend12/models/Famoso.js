import mongoose from 'mongoose';

const famosoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    ciudadNacimiento: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ciudad',
        required: true
    },
    actividadFama: { // nuevo campo requerido por el proyecto
        type: String,
        enum: ['Deportista', 'Actor', 'Político', 'Músico', 'Influencer', 'Otro'],
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Famoso', famosoSchema);
