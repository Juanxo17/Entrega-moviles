import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {  // nuevo campo para autenticación
        type: String,
        required: true
    },
    rol: {
        type: String,
        enum: ['ADMIN', 'USUARIO'],
        default: 'USUARIO'
    },
    tags: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag'
    }],
    visitas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Visita'
    }]
}, {
    timestamps: true
});

export default mongoose.model('Usuario', usuarioSchema);
