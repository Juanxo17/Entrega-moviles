import mongoose from 'mongoose';

const menuSitioSchema = new mongoose.Schema({
    sitio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sitio',
        required: true
    },
    plato: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plato',
        required: true
    },
    precio: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model('MenuSitio', menuSitioSchema);
