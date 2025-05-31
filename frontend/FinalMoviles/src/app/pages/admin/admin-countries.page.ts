import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, 
  IonSpinner, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, 
  IonCardContent, IonBackButton, IonButtons, IonAlert, AlertController, 
  ToastController, IonInput, IonFab, IonFabButton } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Pais } from 'src/app/interfaces/pais.interface';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { addIcons } from 'ionicons';
import { add, arrowBack, globe, create, trash } from 'ionicons/icons';

@Component({
  selector: 'app-admin-countries',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/tab4"></ion-back-button>
        </ion-buttons>
        <ion-title>Gestión de Países</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div *ngIf="loading" class="ion-text-center">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Cargando países...</p>
      </div>

      <div *ngIf="error" class="ion-padding ion-text-center">
        <ion-icon name="alert-circle-outline" size="large" color="danger"></ion-icon>
        <p>Error al cargar los países. Intenta de nuevo.</p>
        <ion-button (click)="loadCountries()">Reintentar</ion-button>
      </div>

      <ion-card *ngIf="!loading && !error">
        <ion-card-header>
          <ion-card-title>
            <ion-icon name="globe"></ion-icon>
            Lista de Países
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list *ngIf="paises.length > 0">
            <ion-item *ngFor="let pais of paises">
              <ion-label>
                <h2>{{ pais.nombre }}</h2>
              </ion-label>
              <ion-button slot="end" fill="clear" color="primary" (click)="editCountry(pais)">
                <ion-icon name="create"></ion-icon>
              </ion-button>
              <ion-button slot="end" fill="clear" color="danger" (click)="confirmDelete(pais)">
                <ion-icon name="trash"></ion-icon>
              </ion-button>
            </ion-item>
          </ion-list>
          <div *ngIf="paises.length === 0" class="ion-text-center">
            <p>No hay países registrados.</p>
          </div>
        </ion-card-content>
      </ion-card>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button (click)="openCreateCountryModal()">
          <ion-icon name="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  styles: [`
    ion-content {
      --padding: 16px;
    }
    ion-item {
      --padding-start: 0;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonSpinner,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonBackButton,
    IonButtons,
    IonAlert,
    IonInput,
    IonFab,
    IonFabButton
  ]
})
export class AdminCountriesPage implements OnInit {
  paises: Pais[] = [];
  loading: boolean = true;
  error: boolean = false;

  constructor(
    private apiService: ApiService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({ add, arrowBack, globe, create, trash });
  }

  ngOnInit() {
    this.loadCountries();
  }

  loadCountries() {
    this.loading = true;
    this.error = false;
    
    this.apiService.getPaises().pipe(
      catchError(error => {
        console.error('Error al cargar países:', error);
        this.error = true;
        this.loading = false;
        return of([]);
      })
    ).subscribe(paises => {
      this.paises = paises;
      this.loading = false;
    });
  }

  async openCreateCountryModal() {
    const alert = await this.alertController.create({
      header: 'Crear País',
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          placeholder: 'Nombre del país'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Crear',
          handler: (data) => {
            this.createCountry(data);
          }
        }
      ]
    });

    await alert.present();
  }
  async createCountry(data: any) {
    if (!data.nombre) {
      const toast = await this.toastController.create({
        message: 'El nombre del país es obligatorio',
        duration: 2000,
        position: 'top',
        color: 'warning'
      });
      await toast.present();
      return;
    }

    this.apiService.createPais(data.nombre).pipe(
      catchError(async error => {
        console.error('Error al crear país:', error);
        const toast = await this.toastController.create({
          message: 'Error al crear el país',
          duration: 2000,
          position: 'top',
          color: 'danger'
        });
        await toast.present();
        return of(null);
      })
    ).subscribe(async response => {
      if (response) {
        const toast = await this.toastController.create({
          message: 'País creado correctamente',
          duration: 2000,
          position: 'top',
          color: 'success'
        });
        await toast.present();
        this.loadCountries();
      }
    });
  }

  async editCountry(pais: Pais) {
    const alert = await this.alertController.create({
      header: 'Editar País',
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          value: pais.nombre,
          placeholder: 'Nombre del país'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Actualizar',
          handler: (data) => {
            this.updateCountry(pais._id, data);
          }
        }
      ]
    });

    await alert.present();
  }
  async updateCountry(id: string, data: any) {
    if (!data.nombre) {
      const toast = await this.toastController.create({
        message: 'El nombre del país es obligatorio',
        duration: 2000,
        position: 'top',
        color: 'warning'
      });
      await toast.present();
      return;
    }

    this.apiService.updatePais(id, data.nombre).pipe(
      catchError(async error => {
        console.error('Error al actualizar país:', error);
        const toast = await this.toastController.create({
          message: 'Error al actualizar el país',
          duration: 2000,
          position: 'top',
          color: 'danger'
        });
        await toast.present();
        return of(null);
      })
    ).subscribe(async response => {
      if (response) {
        const toast = await this.toastController.create({
          message: 'País actualizado correctamente',
          duration: 2000,
          position: 'top',
          color: 'success'
        });
        await toast.present();
        this.loadCountries();
      }
    });
  }

  async confirmDelete(pais: Pais) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que quieres eliminar el país ${pais.nombre}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.deleteCountry(pais._id);
          }
        }
      ]
    });

    await alert.present();
  }
  async deleteCountry(id: string) {
    this.apiService.deletePais(id).pipe(
      catchError(async error => {
        console.error('Error al eliminar país:', error);
        const toast = await this.toastController.create({
          message: 'Error al eliminar el país',
          duration: 2000,
          position: 'top',
          color: 'danger'
        });
        await toast.present();
        return of(null);
      })
    ).subscribe(async response => {
      if (response) {
        const toast = await this.toastController.create({
          message: 'País eliminado correctamente',
          duration: 2000,
          position: 'top',
          color: 'success'
        });
        await toast.present();
        this.loadCountries();
      }
    });
  }
}
