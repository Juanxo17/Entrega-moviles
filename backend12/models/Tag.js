import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    usuarios: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    }],
    personajes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Personaje'
    }],
    sitio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sitio',
        required: true
    },
    fecha: {
        type: Date,
        default: Date.now
    },
    geo: {
        lat: Number,
        lng: Number
    }
}, {
    timestamps: true
});

export default mongoose.model('Tag', tagSchema);
