import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Pais } from '../interfaces/pais.interface';
import { Ciudad } from '../interfaces/ciudad.interface';
import { Famoso } from '../interfaces/famoso.interface';

export interface Sitio {
  _id: string;
  nombre: string;
  tipo: string;
  descripcion?: string;
  direccion?: string;
  coordenadas?: {
    latitud: number;
    longitud: number;
  };
  imagenes?: string[];
  ciudad: Ciudad | string;
}

import { Plato } from '../interfaces/plato.interface';

export interface Visita {
  _id: string;
  fechaVisita: Date;
  usuario: string;
  sitio: Sitio | string;
  createdAt?: Date;
  imagenes?: string[];
  ubicacion?: {
    type: string;
    coordinates: number[];  // [longitud, latitud]
  };
  locationName?: string;  // Add this line
}

export interface Encuentro {
  _id: string;
  fechaEncuentro: Date;
  usuario: string;
  famoso: Famoso | string;
  createdAt?: Date;
  imagenes?: string[];
  ubicacion?: {
    type: string;
    coordinates: number[];  // [longitud, latitud]
  };
  locationName?: string;
}

export interface Tag {
  _id: string;
  nombre: string;
  usuarios: string[];
  personajes: Famoso[] | string[];
  sitio: Sitio | string;
  fecha: Date;
  geo?: {
    lat: number;
    lng: number;
  };
  createdAt?: Date;
}

export interface GeoLocation {
  display_name: string;
  address: {
    city?: string;
    town?: string;
    state?: string;
    country?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Países
  getPaises(): Observable<Pais[]> {
    return this.http.get<Pais[]>(`${this.apiUrl}/getCountries`);
  }

  getPaisById(id: string): Observable<Pais> {
    return this.http.get<Pais>(`${this.apiUrl}/getCountry/${id}`);
  }
  
  createPais(nombre: string): Observable<Pais> {
    return this.http.post<Pais>(`${this.apiUrl}/createCountry`, { nombre });
  }
  
  updatePais(id: string, nombre: string): Observable<Pais> {
    return this.http.put<Pais>(`${this.apiUrl}/updateCountry/${id}`, { nombre });
  }
  
  deletePais(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/deleteCountry/${id}`);
  }
  // Ciudades
  getCiudades(): Observable<Ciudad[]> {
    return this.http.get<Ciudad[]>(`${this.apiUrl}/getCities`).pipe(
      map((ciudades: any[]) => ciudades.map(ciudad => ({
        ...ciudad,
        pais: typeof ciudad.pais === 'string' 
          ? { _id: ciudad.pais, nombre: 'Cargando...' } 
          : ciudad.pais
      })))
    );
  }

  getCiudadById(id: string): Observable<Ciudad> {
    return this.http.get<Ciudad>(`${this.apiUrl}/getCity/${id}`);
  }

  getCiudadesPorPais(paisId: string): Observable<Ciudad[]> {
    return this.http.get<Ciudad[]>(`${this.apiUrl}/getCities?pais=${paisId}`);
  }

  // City methods
  createCity(data: { nombre: string; pais?: string }): Observable<Ciudad> {
    return this.http.post<Ciudad>(`${this.apiUrl}/createCity`, data);
  }

  updateCity(id: string, data: { nombre: string }): Observable<Ciudad> {
    return this.http.put<Ciudad>(`${this.apiUrl}/updateCity/${id}`, data);
  }

  deleteCity(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteCity/${id}`);
  }

  // Famosos
  getFamosos(): Observable<Famoso[]> {
    return this.http.get<Famoso[]>(`${this.apiUrl}/getFamosos`);
  }

  getFamosoById(id: string): Observable<Famoso> {
    return this.http.get<Famoso>(`${this.apiUrl}/getFamoso/${id}`);
  }

  getFamososPorCiudad(ciudadId: string): Observable<Famoso[]> {
    return this.http.get<Famoso[]>(`${this.apiUrl}/getFamosos?ciudad=${ciudadId}`);
  }

  createFamoso(data: { nombre: string;  ciudadNacimiento?: string; actividadFama: string;}): Observable<Famoso> {
    return this.http.post<Famoso>(`${this.apiUrl}/createFamoso`, data);
  }

  updateFamoso(id: string, data: { nombre: string; actividadFama: string; ciudadNacimiento?: string }): Observable<Famoso> {
    return this.http.put<Famoso>(`${this.apiUrl}/updateFamoso/${id}`, data);
  }

  deleteFamoso(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/deleteFamoso/${id}`);
  }

  // Sitios
  getSitios(): Observable<Sitio[]> {
    return this.http.get<Sitio[]>(`${this.apiUrl}/getSites`);
  }

  getSitioById(id: string): Observable<Sitio> {
    return this.http.get<Sitio>(`${this.apiUrl}/getSite/${id}`);
  }

  getSitiosPorCiudad(ciudadId: string): Observable<Sitio[]> {
    return this.http.get<Sitio[]>(`${this.apiUrl}/getSites?ciudad=${ciudadId}`);
  }

  createSite(data: { nombre: string; tipo: string; direccion?: string; ciudad?: string }): Observable<Sitio> {
    return this.http.post<Sitio>(`${this.apiUrl}/createSite`, data);
  }

  updateSite(id: string, data: { nombre: string; tipo: string; direccion?: string; ciudad?: string }): Observable<Sitio> {
    return this.http.put<Sitio>(`${this.apiUrl}/updateSite/${id}`, data);
  }

  deleteSite(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/deleteSite/${id}`);
  }

  // Platos
  getPlatos(): Observable<Plato[]> {
    return this.http.get<Plato[]>(`${this.apiUrl}/getDishes`);
  }

  getPlatoById(id: string): Observable<Plato> {
    return this.http.get<Plato>(`${this.apiUrl}/getDish/${id}`);
  }

  getPlatosPorSitio(sitioId: string): Observable<Plato[]> {
    return this.http.get<Plato[]>(`${this.apiUrl}/getDishes?sitio=${sitioId}`);
  }

  createDish(data: { nombre: string; descripcion?: string; precio: number; sitio?: string; pais?: string }): Observable<Plato> {
    return this.http.post<Plato>(`${this.apiUrl}/createDish`, data);
  }

  updateDish(id: string, data: { nombre: string; descripcion?: string; precio: number; sitio?: string; pais?: string }): Observable<Plato> {
    return this.http.put<Plato>(`${this.apiUrl}/updateDish/${id}`, data);
  }

  deleteDish(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/deleteDish/${id}`);
  }
  // Visitas
  getVisitas(): Observable<Visita[]> {
    return this.http.get<Visita[]>(`${this.apiUrl}/myVisitas`);
  }

  createVisita(sitioId: string, imageBase64?: string, location?: { lat: number, lng: number }): Observable<Visita> {
    const data = {
      sitioId,
      imagen: imageBase64,
      ubicacion: location ? {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      } : undefined
    };
    return this.http.post<Visita>(`${this.apiUrl}/createVisita`, data);
  }

  // Encuentros
  getEncuentros(): Observable<Encuentro[]> {
    return this.http.get<Encuentro[]>(`${this.apiUrl}/myEncuentros`);
  }

  createEncuentro(famosoId: string, imageBase64?: string, location?: { lat: number, lng: number }): Observable<Encuentro> {
    const data = {
      famosoId,
      imagen: imageBase64,
      ubicacion: location ? {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      } : undefined
    };
    return this.http.post<Encuentro>(`${this.apiUrl}/createEncuentro`, data);
  }

  // Tags
  getTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.apiUrl}/myTags`);
  }

  createTag(data: { nombre: string, personajes: string[], sitioId: string, geo?: { lat: number, lng: number } }): Observable<Tag> {
    return this.http.post<Tag>(`${this.apiUrl}/createTag`, data);
  }

  // Consultas especiales
  getTop10PorPais(nombrePais: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/top10/${nombrePais}`);
  }

  getVisitasPorUsuario(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/visitasPorUsuario`);
  }

  getPlatosMasCaros(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/platosMasCaros`);
  }

  getTagsPorSitio(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/tagsPorSitio`);
  }

  getLocationInfo(lat: number, lon: number): Observable<GeoLocation> {
    if (!lat || !lon) {
      return of({ display_name: '', address: {} });
    }
    
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    return this.http.get<GeoLocation>(url, {
      headers: {
        'Accept-Language': 'es',
        'User-Agent': 'FinalMovilesApp/1.0'
      }
    }).pipe(
      catchError(error => {
        console.error('Error getting location info:', error);
        return of({ display_name: '', address: {} });
      })
    );
  }
}
