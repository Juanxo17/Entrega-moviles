import { Pais } from './pais.interface';

export interface Ciudad {
  _id: string;
  nombre: string;
  pais: Pais | string;  // Can be populated Pais object or just ID string
  createdAt?: Date;
  updatedAt?: Date;
}
