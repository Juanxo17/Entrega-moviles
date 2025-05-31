import { Pais } from './pais.interface';
import { Sitio } from './sitio.interface';

export interface Plato {
  _id?: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  imagen?: string;
  pais?: Pais | string;
  sitio?: Sitio | string;
  createdAt?: Date;
  updatedAt?: Date;
}
