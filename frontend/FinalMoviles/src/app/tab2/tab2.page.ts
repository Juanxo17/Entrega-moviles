import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonSkeletonText, IonThumbnail, IonSpinner, IonRefresher, IonRefresherContent, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonChip, IonButton, IonFab, IonFabButton, IonItemSliding, IonItemOptions, IonItemOption, AlertController, ToastController } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AuthStateService } from '../services/auth-state.service';
import { Pais } from '../interfaces/pais.interface';
import { User } from '../interfaces/user.interface';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { addIcons } from 'ionicons';
import { globe, business, people, location, restaurant, home, add, create, trash } from 'ionicons/icons';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,  imports: [
    CommonModule, 
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonList, 
    IonItem, 
    IonLabel, 
    IonSkeletonText, 
    IonThumbnail, 
    IonSpinner, 
    IonRefresher, 
    IonRefresherContent,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonChip,
    IonButton,
    IonFab,
    IonFabButton,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    RouterLink
  ],
})
export class Tab2Page implements OnInit {
  paises: Pais[] = [];
  loading = true;
  error = false;
  section: 'paises' | 'ciudades' | 'famosos' | 'sitios' | 'platos' = 'paises';
  selectedPais: Pais | null = null;
  currentUser: User | null = null;

  constructor(
    private apiService: ApiService,
    private authStateService: AuthStateService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({ globe, business, people, location, restaurant, home, add, create, trash });
  }

  ngOnInit() {
    this.authStateService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
    this.loadPaises();
  }

  loadPaises() {
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

  handleRefresh(event: any) {
    setTimeout(() => {
      this.loadPaises();
      event.target.complete();
    }, 1000);
  }

  selectPais(pais: Pais) {
    this.selectedPais = pais;
    this.section = 'ciudades';
  }
  goBack() {
    if (this.section === 'ciudades') {
      this.section = 'paises';
      this.selectedPais = null;
    }
  }

  get isAdmin(): boolean {
    return this.currentUser?.rol === 'ADMIN';
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
        this.loadPaises();
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
            this.updateCountry(pais._id!, data);
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
        this.loadPaises();
      }
    });
  }

  async confirmDeleteCountry(pais: Pais) {
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
            this.deleteCountry(pais._id!);
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
      if (response !== null) {
        const toast = await this.toastController.create({
          message: 'País eliminado correctamente',
          duration: 2000,
          position: 'top',
          color: 'success'
        });
        await toast.present();
        this.loadPaises();
      }
    });
  }
}
