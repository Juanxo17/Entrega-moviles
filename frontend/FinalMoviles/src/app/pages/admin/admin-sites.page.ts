import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, 
  IonSpinner, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, 
  IonCardContent, IonBackButton, IonButtons, AlertController, 
  ToastController, IonInput, IonFab, IonFabButton, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Sitio } from '../../interfaces/sitio.interface';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { addIcons } from 'ionicons';
import { add, arrowBack, location, create, trash } from 'ionicons/icons';

@Component({
  selector: 'app-admin-sites',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/tab4"></ion-back-button>
        </ion-buttons>
        <ion-title>Gestión de Sitios</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div *ngIf="loading" class="ion-text-center">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Cargando sitios...</p>
      </div>

      <div *ngIf="error" class="ion-padding ion-text-center">
        <ion-icon name="alert-circle-outline" size="large" color="danger"></ion-icon>
        <p>Error al cargar los sitios. Intenta de nuevo.</p>
        <ion-button (click)="loadSites()">Reintentar</ion-button>
      </div>

      <ion-card *ngIf="!loading && !error">
        <ion-card-header>
          <ion-card-title>
            <ion-icon name="location"></ion-icon>
            Lista de Sitios
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list *ngIf="sites.length > 0">
            <ion-item *ngFor="let site of sites">              <ion-label>
                <h2>{{ site.nombre }}</h2>
                <p>Tipo: {{ site.tipo || 'No especificado' }}</p>
                <p>Ciudad: {{ getCiudadName(site.ciudad) }}</p>
              </ion-label>
              <ion-button slot="end" (click)="editSite(site)">
                <ion-icon name="create"></ion-icon>
              </ion-button>              <ion-button slot="end" color="danger" (click)="deleteSite(site._id!)">
                <ion-icon name="trash"></ion-icon>
              </ion-button>
            </ion-item>
          </ion-list>
          
          <div *ngIf="sites.length === 0" class="ion-text-center">
            <p>No hay sitios registrados</p>
          </div>
        </ion-card-content>
      </ion-card>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button (click)="addSite()">
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
export class AdminSitesPage implements OnInit {
  sites: Sitio[] = [];
  cities: any[] = [];
  loading = true;
  error = false;

  constructor(
    private apiService: ApiService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({ add, arrowBack, location, create, trash });
  }

  ngOnInit() {
    this.loadSites();
    this.loadCities
  }

  loadCities() {
  this.apiService.getCiudades().subscribe({
    next: (cities) => {
      this.cities = cities;
    },
    error: (error) => {
      console.error('Error loading cities:', error);
      this.showToast('Error al cargar las ciudades');
    }
  });
  }

  loadSites() {
    this.loading = true;
    this.error = false;
      this.apiService.getSitios().pipe(
      catchError(error => {
        console.error('Error loading sites:', error);
        this.error = true;
        return of<Sitio[]>([]);
      })
    ).subscribe(sites => {
      this.sites = sites;
      this.loading = false;
    });
  }

  async addSite() {
    const alert = await this.alertController.create({
      header: 'Nuevo Sitio',
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          placeholder: 'Nombre del sitio'
        },
        {
          name: 'tipo',
          type: 'text',
          placeholder: 'Tipo (Museo, Restaurante, etc.)'
        },        {
          name: 'ciudad',
          type: 'text',
          placeholder: 'Ciudad'
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
            if (data.nombre && data.tipo) {
              this.apiService.createSite(data).subscribe({
                next: () => {
                  this.loadSites();
                  this.showToast('Sitio creado exitosamente');
                },
                error: (error) => {
                  console.error('Error creating site:', error);
                  this.showToast('Error al crear el sitio');
                }
              });
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async editSite(site: Sitio) {
    const alert = await this.alertController.create({
      header: 'Editar Sitio',
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          value: site.nombre,
          placeholder: 'Nombre del sitio'
        },
        {
          name: 'tipo',
          type: 'text',
          value: site.tipo,
          placeholder: 'Tipo'
        },        {
          name: 'ciudad',
          type: 'text',
          value: site.ciudad?.nombre || site.ciudad,
          placeholder: 'Ciudad'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',          handler: (data) => {
            if (data.nombre && data.tipo) {
              this.apiService.updateSite(site._id!, data).subscribe({
                next: () => {
                  this.loadSites();
                  this.showToast('Sitio actualizado exitosamente');
                },
                error: (error) => {
                  console.error('Error updating site:', error);
                  this.showToast('Error al actualizar el sitio');
                }
              });
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteSite(siteId: string) {
    const alert = await this.alertController.create({
      header: '¿Eliminar sitio?',
      message: '¿Estás seguro de que deseas eliminar este sitio?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.apiService.deleteSite(siteId).subscribe({
              next: () => {
                this.loadSites();
                this.showToast('Sitio eliminado exitosamente');
              },
              error: (error) => {
                console.error('Error deleting site:', error);
                this.showToast('Error al eliminar el sitio');
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
}
