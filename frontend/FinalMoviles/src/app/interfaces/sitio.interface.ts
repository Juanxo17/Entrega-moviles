export interface Sitio {
    _id?: string;
    nombre: string;
    tipo: string;  // Tipo de sitio (Museo, Restaurante, etc.)
    ciudad: string | any;  // ID de Ciudad o objeto Ciudad populado
    visitas?: string[];  // Array de IDs de Visita
    createdAt?: Date;
    updatedAt?: Date;
}
