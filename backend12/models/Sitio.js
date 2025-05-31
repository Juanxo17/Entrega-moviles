import mongoose from 'mongoose';

const sitioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    tipo: {
        type: String,
        required: true
    },
    ciudad: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ciudad',
        required: true
    },
    visitas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Visita'
    }]
}, {
    timestamps: true
});

export default mongoose.model('Sitio', sitioSchema);
