import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, 
  IonSpinner, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, 
  IonCardContent, IonBackButton, IonButtons, AlertController, 
  ToastController, IonInput, IonFab, IonFabButton, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Ciudad } from '../../interfaces/ciudad.interface';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { addIcons } from 'ionicons';
import { add, arrowBack, business, create, trash } from 'ionicons/icons';

@Component({
  selector: 'app-admin-cities',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/tab4"></ion-back-button>
        </ion-buttons>
        <ion-title>Gestión de Ciudades</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div *ngIf="loading" class="ion-text-center">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Cargando ciudades...</p>
      </div>

      <div *ngIf="error" class="ion-padding ion-text-center">
        <ion-icon name="alert-circle-outline" size="large" color="danger"></ion-icon>
        <p>Error al cargar las ciudades. Intenta de nuevo.</p>
        <ion-button (click)="loadCities()">Reintentar</ion-button>
      </div>

      <ion-card *ngIf="!loading && !error">
        <ion-card-header>
          <ion-card-title>
            <ion-icon name="business"></ion-icon>
            Lista de Ciudades
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list *ngIf="cities.length > 0">
            <ion-item *ngFor="let city of cities">              <ion-label>
                <h2>{{ city.nombre }}</h2>
                <p>País: {{ getPaisName(city.pais) }}</p>
              </ion-label>
              <ion-button slot="end" (click)="editCity(city)">
                <ion-icon name="create"></ion-icon>
              </ion-button>              <ion-button slot="end" color="danger" (click)="deleteCity(city._id!)">
                <ion-icon name="trash"></ion-icon>
              </ion-button>
            </ion-item>
          </ion-list>
          
          <div *ngIf="cities.length === 0" class="ion-text-center">
            <p>No hay ciudades registradas</p>
          </div>
        </ion-card-content>
      </ion-card>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button (click)="addCity()">
          <ion-icon name="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel,
    IonSpinner, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonBackButton, IonButtons, IonInput, IonFab, IonFabButton,
    IonSelect, IonSelectOption
  ]
})
export class AdminCitiesPage implements OnInit {
  cities: Ciudad[] = [];
  loading = true;
  error = false;

  constructor(
    private apiService: ApiService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({ add, arrowBack, business, create, trash });
  }

  ngOnInit() {
    this.loadCities();
  }
  loadCities() {
    this.loading = true;
    this.error = false;
    
    this.apiService.getCiudades().pipe(
      catchError(error => {
        console.error('Error loading cities:', error);
        this.error = true;
        return of([]);
      })
    ).subscribe(cities => {
      this.cities = cities;
      this.loading = false;
    });
  }

  async addCity() {
    const alert = await this.alertController.create({
      header: 'Nueva Ciudad',
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          placeholder: 'Nombre de la ciudad'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: (data) => {
            if (data.nombre) {
              this.apiService.createCity({ nombre: data.nombre }).subscribe({
                next: () => {
                  this.loadCities();
                  this.showToast('Ciudad creada exitosamente');
                },
                error: (error) => {
                  console.error('Error creating city:', error);
                  this.showToast('Error al crear la ciudad');
                }
              });
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async editCity(city: any) {
    const alert = await this.alertController.create({
      header: 'Editar Ciudad',
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          value: city.nombre,
          placeholder: 'Nombre de la ciudad'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: (data) => {
            if (data.nombre) {
              this.apiService.updateCity(city._id, { nombre: data.nombre }).subscribe({
                next: () => {
                  this.loadCities();
                  this.showToast('Ciudad actualizada exitosamente');
                },
                error: (error) => {
                  console.error('Error updating city:', error);
                  this.showToast('Error al actualizar la ciudad');
                }
              });
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteCity(cityId: string) {
    const alert = await this.alertController.create({
      header: '¿Eliminar ciudad?',
      message: '¿Estás seguro de que deseas eliminar esta ciudad?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.apiService.deleteCity(cityId).subscribe({
              next: () => {
                this.loadCities();
                this.showToast('Ciudad eliminada exitosamente');
              },
              error: (error) => {
                console.error('Error deleting city:', error);
                this.showToast('Error al eliminar la ciudad');
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

  getPaisName(pais: string | any): string {
    if (typeof pais === 'string') {
      return pais;
    } else if (pais && pais.nombre) {
      return pais.nombre;
    }
    return '';
  }
}
