import { Ciudad } from './ciudad.interface';

export interface Famoso {
    _id?: string;
    nombre: string;
    ciudadNacimiento: string | Ciudad;  // ID de Ciudad o objeto Ciudad poblado
    actividadFama: 'Deportista' | 'Actor' | 'Político' | 'Músico' | 'Influencer' | 'Otro';
    createdAt?: Date;
    updatedAt?: Date;
}
