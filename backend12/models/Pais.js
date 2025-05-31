import mongoose from 'mongoose';

const paisSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        unique: true
    },
    // Relación: un país está compuesto de ciudades
    // Esta relación se implementa en el modelo Ciudad
}, {
    timestamps: true
});

export default mongoose.model('Pais', paisSchema);