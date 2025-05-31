import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, 
  IonSkeletonText, IonSpinner, IonButton, IonIcon, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonBackButton, IonButtons, IonFab, IonFabButton,
  IonItemSliding, IonItemOptions, IonItemOption, AlertController, ToastController } from '@ionic/angular/standalone';
import { ApiService} from '../../services/api.service';
import { AuthStateService } from '../../services/auth-state.service';
import { Famoso } from 'src/app/interfaces/famoso.interface';
import { Ciudad } from 'src/app/interfaces/ciudad.interface';
import { User } from 'src/app/interfaces/user.interface';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { addIcons } from 'ionicons';
import { people, arrowBack, add, create, trash } from 'ionicons/icons';

@Component({
  selector: 'app-famous-list',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/tab2"></ion-back-button>
        </ion-buttons>
        <ion-title>Personajes de {{ ciudadNombre || paisNombre }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div *ngIf="loading" class="ion-padding ion-text-center">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Cargando personajes famosos...</p>
      </div>

      <div *ngIf="error" class="ion-padding ion-text-center">
        <ion-icon name="alert-circle-outline" size="large" color="danger"></ion-icon>
        <p>Error al cargar los personajes. Intenta de nuevo.</p>
        <ion-button (click)="loadFamosos()">Reintentar</ion-button>
      </div>      <ion-list *ngIf="!loading && !error">
        <ion-item-sliding *ngFor="let famoso of famosos">
          <ion-item [routerLink]="['/tabs/famoso', famoso._id]">
            <ion-icon name="people" slot="start"></ion-icon>          
            <ion-label>
              <h2>{{ famoso.nombre }}</h2>
              <p *ngIf="famoso.actividadFama">{{ famoso.actividadFama }}</p>
            </ion-label>
          </ion-item>
          
          <!-- Admin options for editing/deleting famous people -->
          <ion-item-options side="end" *ngIf="isAdmin">
            <ion-item-option color="primary" (click)="editFamoso(famoso)">
              <ion-icon name="create"></ion-icon>
              Editar
            </ion-item-option>
            <ion-item-option color="danger" (click)="confirmDeleteFamoso(famoso)">
              <ion-icon name="trash"></ion-icon>
              Eliminar
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>      <div *ngIf="!loading && !error && famosos.length === 0" class="ion-padding ion-text-center">
        <p>No hay personajes famosos registrados para este lugar.</p>
      </div>

      <!-- FAB button for adding new famous people (only visible to admins) -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed" *ngIf="isAdmin">
        <ion-fab-button (click)="openCreateFamosoModal()">
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
export class FamousListPage implements OnInit {
  id: string = '';
  type: 'pais' | 'ciudad' = 'pais';
  ciudadNombre: string = '';
  paisNombre: string = '';
  famosos: Famoso[] = [];
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
    addIcons({ people, arrowBack, add, create, trash });
  }
  ngOnInit() {
    this.authStateService.currentUser.subscribe(user => {
      this.currentUser = user;
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.id = id;
        this.loadFamosos();
      } else {
        this.router.navigate(['/tabs/tab2']);      }
    });
  }

  get isAdmin(): boolean {
    return this.currentUser?.rol === 'ADMIN';
  }

  async openCreateFamosoModal() {
    const alert = await this.alertController.create({
      header: 'Crear Personaje Famoso',
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          placeholder: 'Nombre del personaje'
        },
        {
          name: 'actividadFama',
          type: 'text',
          placeholder: 'Actividad por la que es famoso'
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
            this.createFamoso(data);
          }
        }
      ]
    });

    await alert.present();
  }

  async createFamoso(data: any) {
    if (!data.nombre) {
      const toast = await this.toastController.create({
        message: 'El nombre del personaje es obligatorio',
        duration: 2000,
        position: 'top',
        color: 'warning'
      });
      await toast.present();
      return;
    }    // Use current context to determine city
    const ciudadNombre = this.type === 'ciudad' ? this.ciudadNombre : '';
    
    this.apiService.createFamoso({
      nombre: data.nombre,
      actividadFama: data.actividadFama,
      ciudadNacimiento: ciudadNombre
    }).pipe(
      catchError(async error => {
        console.error('Error al crear personaje famoso:', error);
        const toast = await this.toastController.create({
          message: 'Error al crear el personaje famoso',
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
          message: 'Personaje famoso creado correctamente',
          duration: 2000,
          position: 'top',
          color: 'success'
        });
        await toast.present();
        this.loadFamosos();
      }
    });
  }

  async editFamoso(famoso: Famoso) {
    const alert = await this.alertController.create({
      header: 'Editar Personaje Famoso',
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
          placeholder: 'Actividad por la que es famoso'
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
            this.updateFamoso(famoso._id!, data);
          }
        }
      ]
    });

    await alert.present();
  }

  async updateFamoso(id: string, data: any) {
    if (!data.nombre) {
      const toast = await this.toastController.create({
        message: 'El nombre del personaje es obligatorio',
        duration: 2000,
        position: 'top',
        color: 'warning'
      });
      await toast.present();
      return;
    }

    this.apiService.updateFamoso(id, {
      nombre: data.nombre,
      actividadFama: data.actividadFama
    }).pipe(
      catchError(async error => {
        console.error('Error al actualizar personaje famoso:', error);
        const toast = await this.toastController.create({
          message: 'Error al actualizar el personaje famoso',
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
          message: 'Personaje famoso actualizado correctamente',
          duration: 2000,
          position: 'top',
          color: 'success'
        });
        await toast.present();
        this.loadFamosos();
      }
    });
  }

  async confirmDeleteFamoso(famoso: Famoso) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que quieres eliminar a ${famoso.nombre}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.deleteFamoso(famoso._id!);
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteFamoso(id: string) {
    this.apiService.deleteFamoso(id).pipe(
      catchError(async error => {
        console.error('Error al eliminar personaje famoso:', error);
        const toast = await this.toastController.create({
          message: 'Error al eliminar el personaje famoso',
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
          message: 'Personaje famoso eliminado correctamente',
          duration: 2000,
          position: 'top',
          color: 'success'
        });
        await toast.present();
        this.loadFamosos();
      }
    });
  }

  loadFamosos() {
    this.loading = true;
    this.error = false;
    
    // Try to get as a country first
    this.apiService.getPaisById(this.id).subscribe(pais => {
      if (pais) {
        this.type = 'pais';
        this.paisNombre = pais.nombre;
        
        // Get all cities of this country to filter famous people
        this.apiService.getCiudades().pipe(
          catchError(error => {
            console.error('Error al cargar ciudades:', error);
            return of([]);
          })
        ).subscribe(ciudades => {
          const ciudadesDelPais = ciudades.filter(ciudad => {
            if (typeof ciudad.pais === 'string') {
              return ciudad.pais === this.id;
            } else {
              return ciudad.pais._id === this.id;
            }
          });
          
          // Get all famous people
          this.apiService.getFamosos().pipe(
            catchError(error => {
              console.error('Error al cargar famosos:', error);
              this.error = true;
              this.loading = false;
              return of([]);
            })
          ).subscribe(famosos => {
            const ciudadIds = ciudadesDelPais.map(c => c._id);            // Filter famous people by cities of this country
            this.famosos = famosos.filter(famoso => {
              if (!famoso.ciudadNacimiento) return false;
              
              if (typeof famoso.ciudadNacimiento === 'string') {
                return ciudadIds.includes(famoso.ciudadNacimiento);
              } else {
                return famoso.ciudadNacimiento._id ? ciudadIds.includes(famoso.ciudadNacimiento._id) : false;
              }
            });
            
            this.loading = false;
          });
        });
      } else {
        // Try to get as a city
        this.apiService.getCiudadById(this.id).subscribe(ciudad => {
          if (ciudad) {
            this.type = 'ciudad';
            this.ciudadNombre = ciudad.nombre;
            
            this.apiService.getFamosos().pipe(
              catchError(error => {
                console.error('Error al cargar famosos:', error);
                this.error = true;
                this.loading = false;
                return of([]);
              })
            ).subscribe(famosos => {              // Filter famous people by this city
              this.famosos = famosos.filter(famoso => {
                if (!famoso.ciudadNacimiento) return false;
                
                if (typeof famoso.ciudadNacimiento === 'string') {
                  return famoso.ciudadNacimiento === this.id;
                } else {
                  return famoso.ciudadNacimiento._id ? famoso.ciudadNacimiento._id === this.id : false;
                }
              });
              
              this.loading = false;
            });
          } else {
            this.error = true;
            this.loading = false;
          }
        }, error => {
          this.error = true;
          this.loading = false;
        });
      }
    }, error => {
      this.error = true;
      this.loading = false;
    });
  }
}
