export interface User {
  _id?: string;
  nombre: string;
  email: string;
  password?: string;
  rol?: 'ADMIN' | 'USUARIO';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  nombre: string;
  email: string;
  password: string;
  rol?: string;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user?: User;
  id?: string; // El backend devuelve id en lugar de user completo
}
