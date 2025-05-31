import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, 
  IonSkeletonText, IonSpinner, IonButton, IonIcon, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonBackButton, IonButtons, IonFab, IonFabButton,
  IonItemSliding, IonItemOptions, IonItemOption, AlertController, ToastController } from '@ionic/angular/standalone';
import { ApiService } from '../../services/api.service';
import { AuthStateService } from '../../services/auth-state.service';
import { Ciudad } from '../../interfaces/ciudad.interface';
import { Pais } from '../../interfaces/pais.interface';
import { User } from '../../interfaces/user.interface';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { addIcons } from 'ionicons';
import { business, arrowBack, add, create, trash } from 'ionicons/icons';

@Component({
  selector: 'app-city-list',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/tab2"></ion-back-button>
        </ion-buttons>
        <ion-title>Ciudades de {{ paisNombre }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div *ngIf="loading" class="ion-padding ion-text-center">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Cargando ciudades...</p>
      </div>

      <div *ngIf="error" class="ion-padding ion-text-center">
        <ion-icon name="alert-circle-outline" size="large" color="danger"></ion-icon>
        <p>Error al cargar las ciudades. Intenta de nuevo.</p>
        <ion-button (click)="loadCiudades()">Reintentar</ion-button>
      </div>      <ion-list *ngIf="!loading && !error">
        <ion-item-sliding *ngFor="let ciudad of ciudades">
          <ion-item [routerLink]="['/tabs/ciudad', ciudad._id]">
            <ion-icon name="business" slot="start"></ion-icon>
            <ion-label>
              <h2>{{ ciudad.nombre }}</h2>
            </ion-label>
          </ion-item>
          
          <!-- Admin options for editing/deleting cities -->
          <ion-item-options side="end" *ngIf="isAdmin">
            <ion-item-option color="primary" (click)="editCity(ciudad)">
              <ion-icon name="create"></ion-icon>
              Editar
            </ion-item-option>
            <ion-item-option color="danger" (click)="confirmDeleteCity(ciudad)">
              <ion-icon name="trash"></ion-icon>
              Eliminar
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>      <div *ngIf="!loading && !error && ciudades.length === 0" class="ion-padding ion-text-center">
        <p>No hay ciudades registradas para este país.</p>
      </div>

      <!-- FAB button for adding new cities (only visible to admins) -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed" *ngIf="isAdmin">
        <ion-fab-button (click)="openCreateCityModal()">
          <ion-icon name="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  styles: [`
    ion-content {
      --padding-top: 16px;
    }
  `],  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonSkeletonText,
    IonSpinner,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonBackButton,
    IonButtons,
    IonFab,
    IonFabButton,
    IonItemSliding,
    IonItemOptions,
    IonItemOption
  ]
})
export class CityListPage implements OnInit {
  paisId: string = '';
  paisNombre: string = 'Colombia';
  ciudades: Ciudad[] = [];
  loading: boolean = true;
  error: boolean = false;
  currentUser: User | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private authStateService: AuthStateService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({ business, arrowBack, add, create, trash });
  }
  ngOnInit() {
    this.authStateService.currentUser.subscribe(user => {
      this.currentUser = user;
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.paisId = id;
        this.loadPais();
        this.loadCiudades();
      } else {
        this.router.navigate(['/tabs/tab2']);
      }
    });
  }

  loadPais() {
    this.apiService.getPaisById(this.paisId).pipe(
      catchError(error => {
        console.error('Error al cargar país:', error);
        return of(null);
      })
    ).subscribe(pais => {
      if (pais) {
        this.paisNombre = pais.nombre;
      }
    });
  }

  loadCiudades() {
    this.loading = true;
    this.error = false;

    this.apiService.getCiudades().pipe(
      catchError(error => {
        console.error('Error al cargar ciudades:', error);
        this.error = true;
        this.loading = false;
        return of([]);
      })
    ).subscribe(ciudades => {
      // Filter cities by país if the backend doesn't support query parameters
      this.ciudades = ciudades.filter(ciudad => {
        if (typeof ciudad.pais === 'string') {
          return ciudad.pais === this.paisId;
        } else {
          return ciudad.pais._id === this.paisId;
        }
      });      this.loading = false;
    });
  }

  get isAdmin(): boolean {
    return this.currentUser?.rol === 'ADMIN';
  }

  async openCreateCityModal() {
    const alert = await this.alertController.create({
      header: 'Crear Ciudad',
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
          text: 'Crear',
          handler: (data) => {
            this.createCity(data);
          }
        }
      ]
    });

    await alert.present();
  }

  async createCity(data: any) {
    if (!data.nombre) {
      const toast = await this.toastController.create({
        message: 'El nombre de la ciudad es obligatorio',
        duration: 2000,
        position: 'top',
        color: 'warning'
      });
      await toast.present();
      return;
    }

    this.apiService.createCity({
      nombre: data.nombre,
      pais: this.paisNombre
    }).pipe(
      catchError(async error => {
        console.error('Error al crear ciudad:', error);
        const toast = await this.toastController.create({
          message: 'Error al crear la ciudad',
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
          message: 'Ciudad creada correctamente',
          duration: 2000,
          position: 'top',
          color: 'success'
        });
        await toast.present();
        this.loadCiudades();
      }
    });
  }

  async editCity(ciudad: Ciudad) {
    const alert = await this.alertController.create({
      header: 'Editar Ciudad',
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          value: ciudad.nombre,
          placeholder: 'Nombre de la ciudad'
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
            this.updateCity(ciudad._id!, data);
          }
        }
      ]
    });

    await alert.present();
  }

  async updateCity(id: string, data: any) {
    if (!data.nombre) {
      const toast = await this.toastController.create({
        message: 'El nombre de la ciudad es obligatorio',
        duration: 2000,
        position: 'top',
        color: 'warning'
      });
      await toast.present();
      return;
    }

    this.apiService.updateCity(id, {
      nombre: data.nombre
    }).pipe(
      catchError(async error => {
        console.error('Error al actualizar ciudad:', error);
        const toast = await this.toastController.create({
          message: 'Error al actualizar la ciudad',
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
          message: 'Ciudad actualizada correctamente',
          duration: 2000,
          position: 'top',
          color: 'success'
        });
        await toast.present();
        this.loadCiudades();
      }
    });
  }

  async confirmDeleteCity(ciudad: Ciudad) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que quieres eliminar la ciudad ${ciudad.nombre}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.deleteCity(ciudad._id!);
          }
        }
      ]
    });

    await alert.present();
  }
  async deleteCity(id: string) {
    this.apiService.deleteCity(id).pipe(
      catchError(async error => {
        console.error('Error al eliminar ciudad:', error);
        const toast = await this.toastController.create({
          message: 'Error al eliminar la ciudad',
          duration: 2000,
          position: 'top',
          color: 'danger'
        });
        await toast.present();
        return of(null);
      })
    ).subscribe(async response => {
      if (response !== null) {
        const toast = await this.toastController.create({
          message: 'Ciudad eliminada correctamente',
          duration: 2000,
          position: 'top',
          color: 'success'
        });
        await toast.present();
        this.loadCiudades();
      }
    });
  }
}
