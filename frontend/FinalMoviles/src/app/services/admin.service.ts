import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Users
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getAllUsers`);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteUser/${id}`);
  }

  // Countries
  createCountry(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/createCountry`, data);
  }

  getAllCountries(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getCountries`);
  }

  deleteCountry(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteCountry/${id}`);
  }

  updateCountry(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/updateCountry/${id}`, data);
  }

  // Cities
  createCity(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/createCity`, data);
  }

  getAllCities(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getCities`);
  }

  deleteCity(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteCity/${id}`);
  }

  updateCity(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/updateCity/${id}`, data);
  }

  // Famous People
  createFamoso(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/createFamoso`, data);
  }

  getAllFamosos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getFamosos`);
  }

  deleteFamoso(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteFamoso/${id}`);
  }

  updateFamoso(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/updateFamoso/${id}`, data);
  }

  // Sites
  createSite(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/createSite`, data);
  }

  getAllSites(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getSites`);
  }

  deleteSite(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteSite/${id}`);
  }

  updateSite(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/updateSite/${id}`, data);
  }

  // Dishes
  createDish(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/createDish`, data);
  }

  getAllDishes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getDishes`);
  }

  deleteDish(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteDish/${id}`);
  }

  updateDish(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/updateDish/${id}`, data);
  }

  // Special queries
  getTop10SitesByCountry(countryName: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/top10/${countryName}`);
  }

  getVisitsByUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/visitasPorUsuario`);
  }

  getMostExpensiveDishes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/platosMasCaros`);
  }

  getTagsBySite(): Observable<any> {
    return this.http.get(`${this.apiUrl}/tagsPorSitio`);
  }
}
