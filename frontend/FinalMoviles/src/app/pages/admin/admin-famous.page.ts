import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, 
  IonSpinner, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, 
  IonCardContent, IonBackButton, IonButtons, AlertController, 
  ToastController, IonInput, IonFab, IonFabButton, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Famoso } from '../../interfaces/famoso.interface';
import { Ciudad } from '../../interfaces/ciudad.interface';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { addIcons } from 'ionicons';
import { add, arrowBack, people, create, trash } from 'ionicons/icons';

@Component({
  selector: 'app-admin-famous',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/tab4"></ion-back-button>
        </ion-buttons>
        <ion-title>Gestión de Famosos</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div *ngIf="loading" class="ion-text-center">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Cargando personajes famosos...</p>
      </div>

      <div *ngIf="error" class="ion-padding ion-text-center">
        <ion-icon name="alert-circle-outline" size="large" color="danger"></ion-icon>
        <p>Error al cargar los personajes. Intenta de nuevo.</p>
        <ion-button (click)="loadFamosos()">Reintentar</ion-button>
      </div>

      <ion-card *ngIf="!loading && !error">
        <ion-card-header>
          <ion-card-title>
            <ion-icon name="people"></ion-icon>
            Lista de Personajes Famosos
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list *ngIf="famosos.length > 0">
            <ion-item *ngFor="let famoso of famosos">              <ion-label>
                <h2>{{ famoso.nombre }}</h2>
                <p>Actividad: {{ famoso.actividadFama }}</p>
                <p>Ciudad: {{ getCiudadName(famoso.ciudadNacimiento) }}</p>
              </ion-label>
              <ion-button slot="end" (click)="editFamoso(famoso)">
                <ion-icon name="create"></ion-icon>
              </ion-button>
              <ion-button slot="end" color="danger" (click)="deleteFamoso(famoso._id!)">
                <ion-icon name="trash"></ion-icon>
              </ion-button>
            </ion-item>
          </ion-list>
          
          <div *ngIf="famosos.length === 0" class="ion-text-center">
            <p>No hay personajes famosos registrados</p>
          </div>
        </ion-card-content>
      </ion-card>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button (click)="addFamoso()">
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
export class AdminFamousPage implements OnInit {
  famosos: Famoso[] = [];
  ciudades: Ciudad[] = [];
  loading = true;
  error = false;
  actividadesFama = ['Deportista', 'Actor', 'Político', 'Músico', 'Influencer', 'Otro'];

  constructor(
    private apiService: ApiService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({ add, arrowBack, people, create, trash });
  }
  ngOnInit() {
    this.loadFamosos();
    this.loadCiudades();
  }

  loadCiudades() {
    this.apiService.getCiudades().pipe(
      catchError(error => {
        console.error('Error loading cities:', error);
        return of([]);
      })
    ).subscribe(ciudades => {
      this.ciudades = ciudades;
    });
  }

  loadFamosos() {
    this.loading = true;
    this.error = false;
    
    this.apiService.getFamosos().pipe(
      catchError(error => {
        console.error('Error loading famosos:', error);
        this.error = true;
        return of([]);
      })
    ).subscribe(famosos => {
      this.famosos = famosos;
      this.loading = false;
    });
  }  async addFamoso() {
    // Show city selection first
    const selectedCity = await this.selectCity();
    if (!selectedCity) {
      return; // User cancelled city selection
    }

    const alert = await this.alertController.create({
      header: 'Nuevo Personaje Famoso',
      message: `Ciudad seleccionada: ${selectedCity}`,
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          placeholder: 'Nombre del personaje'
        },
        {
          name: 'actividadFama',
          type: 'text',
          placeholder: 'Actividad (ej: Deportista, Actor, etc.)'
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
            if (data.nombre && data.actividadFama) {
              const famosoData = {
                nombre: data.nombre,
                ciudadNacimiento: selectedCity,
                actividadFama: data.actividadFama
              };

              this.apiService.createFamoso(famosoData).subscribe({
                next: () => {
                  this.loadFamosos();
                  this.showToast('Personaje creado exitosamente');
                },
                error: (error) => {
                  console.error('Error creating famoso:', error);
                  // Show backend error message if available
                  const errorMessage = error.error?.message || 'Error al crear el personaje';
                  this.showToast(errorMessage);
                }
              });
              return true;
            } else {
              this.showToast('Todos los campos son obligatorios');
              return false;
            }
          }
        }
      ]
    });

    await alert.present();
  }
  async selectCity(): Promise<string | null> {
    return new Promise(async (resolve) => {
      const cityOptions = this.ciudades.map(ciudad => ({
        name: 'selectedCity',
        type: 'radio' as const,
        label: `${ciudad.nombre} (${this.getPaisName(ciudad.pais)})`,
        value: ciudad.nombre
      }));

      const alert = await this.alertController.create({
        header: 'Seleccionar Ciudad',
        message: 'Elige la ciudad de nacimiento del personaje famoso:',
        inputs: cityOptions,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              resolve(null);
            }
          },
          {
            text: 'Seleccionar',
            handler: (data) => {
              resolve(data);
            }
          }
        ]
      });

      await alert.present();
    });
  }  async editFamoso(famoso: Famoso) {
    // Show city selection first
    const currentCity = this.getCiudadName(famoso.ciudadNacimiento);
    const selectedCity = await this.selectCityForEdit(currentCity);
    if (selectedCity === null) {
      return; // User cancelled city selection
    }

    const alert = await this.alertController.create({
      header: 'Editar Personaje Famoso',
      message: `Ciudad seleccionada: ${selectedCity}`,
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          value: famoso.nombre,
          placeholder: 'Nombre del personaje'
        },
        {
          name: 'actividadFama',
          type: 'text',
          value: famoso.actividadFama,
          placeholder: 'Actividad'
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
            if (data.nombre && data.actividadFama) {
              const famosoData = {
                nombre: data.nombre,
                ciudadNacimiento: selectedCity,
                actividadFama: data.actividadFama
              };

              this.apiService.updateFamoso(famoso._id!, famosoData).subscribe({
                next: () => {
                  this.loadFamosos();
                  this.showToast('Personaje actualizado exitosamente');
                },
                error: (error) => {
                  console.error('Error updating famoso:', error);
                  // Show backend error message if available
                  const errorMessage = error.error?.message || 'Error al actualizar el personaje';
                  this.showToast(errorMessage);
                }
              });
              return true;
            } else {
              this.showToast('Todos los campos son obligatorios');
              return false;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async selectCityForEdit(currentCity: string): Promise<string | null> {
    return new Promise(async (resolve) => {
      const cityOptions = this.ciudades.map(ciudad => ({
        name: 'selectedCity',
        type: 'radio' as const,
        label: `${ciudad.nombre} (${this.getPaisName(ciudad.pais)})`,
        value: ciudad.nombre,
        checked: ciudad.nombre === currentCity
      }));

      const alert = await this.alertController.create({
        header: 'Seleccionar Ciudad',
        message: 'Elige la ciudad de nacimiento del personaje famoso:',
        inputs: cityOptions,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              resolve(null);
            }
          },
          {
            text: 'Seleccionar',
            handler: (data) => {
              resolve(data);
            }
          }
        ]
      });

      await alert.present();
    });
  }

  async deleteFamoso(famosoId: string) {
    const alert = await this.alertController.create({
      header: '¿Eliminar personaje?',
      message: '¿Estás seguro de que deseas eliminar este personaje?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.apiService.deleteFamoso(famosoId).subscribe({
              next: () => {
                this.loadFamosos();
                this.showToast('Personaje eliminado exitosamente');
              },
              error: (error) => {
                console.error('Error deleting famoso:', error);
                this.showToast('Error al eliminar el personaje');
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
  getCiudadName(ciudad: any): string {
    if (typeof ciudad === 'string') {
      return ciudad;
    } else if (ciudad && ciudad.nombre) {
      return ciudad.nombre;
    }
    return '';
  }

  getPaisName(pais: any): string {
    if (typeof pais === 'string') {
      return pais;
    } else if (pais && pais.nombre) {
      return pais.nombre;
    }
    return '';
  }
}
