import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, 
  IonSkeletonText, IonSpinner, IonButton, IonIcon, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonBackButton, IonButtons, IonFab, IonFabButton,
  IonItemSliding, IonItemOptions, IonItemOption, AlertController, ToastController } from '@ionic/angular/standalone';
import { ApiService, Sitio} from '../../services/api.service';
import { AuthStateService } from '../../services/auth-state.service';
import { Ciudad } from 'src/app/interfaces/ciudad.interface';
import { User } from '../../interfaces/user.interface';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { addIcons } from 'ionicons';
import { location, arrowBack, add, create, trash, heart, heartOutline } from 'ionicons/icons';

@Component({
  selector: 'app-site-list',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/tab2"></ion-back-button>
        </ion-buttons>
        <ion-title>Sitios de {{ ciudadNombre || paisNombre }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div *ngIf="loading" class="ion-padding ion-text-center">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Cargando sitios...</p>
      </div>

      <div *ngIf="error" class="ion-padding ion-text-center">
        <ion-icon name="alert-circle-outline" size="large" color="danger"></ion-icon>
        <p>Error al cargar los sitios. Intenta de nuevo.</p>
        <ion-button (click)="loadSitios()">Reintentar</ion-button>
      </div>     <ion-list *ngIf="!loading && !error">
      <ion-item-sliding *ngFor="let sitio of sitios">
        <ion-item [routerLink]="['/tabs/sitio', sitio._id]">
          <ion-icon name="location" slot="start"></ion-icon>
          <ion-label>
            <h2>{{ sitio.nombre }}</h2>
            <p *ngIf="sitio.tipo">{{ sitio.tipo }}</p>
          </ion-label>
          <ion-button fill="clear" slot="end" (click)="toggleFavorite(sitio, $event)">
            <ion-icon 
              [name]="isFavorite(sitio) ? 'heart' : 'heart-outline'"
              [color]="isFavorite(sitio) ? 'danger' : 'medium'">
            </ion-icon>
          </ion-button>
        </ion-item>
          
          <!-- Admin options for editing/deleting sites -->
          <ion-item-options side="end" *ngIf="isAdmin">
            <ion-item-option color="primary" (click)="editSite(sitio)">
              <ion-icon name="create"></ion-icon>
              Editar
            </ion-item-option>
            <ion-item-option color="danger" (click)="confirmDeleteSite(sitio)">
              <ion-icon name="trash"></ion-icon>
              Eliminar
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>

      <div *ngIf="!loading && !error && sitios.length === 0" class="ion-padding ion-text-center">
        <p>No hay sitios registrados para este lugar.</p>
      </div>

      <!-- FAB button for adding new sites (only visible to admins) -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed" *ngIf="isAdmin">
        <ion-fab-button (click)="openCreateSiteModal()">
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
export class SiteListPage implements OnInit {
  id: string = '';
  type: 'pais' | 'ciudad' = 'pais';
  ciudadNombre: string = '';
  paisNombre: string = '';
  sitios: Sitio[] = [];
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
    addIcons({ location, arrowBack, add, create, trash, heart, heartOutline });
  }  ngOnInit() {
    this.authStateService.currentUser.subscribe(user => {
      this.currentUser = user;
      console.log('SiteListPage - Usuario actual:', user);
      console.log('SiteListPage - Es admin:', this.isAdmin);
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.id = id;
        this.loadSitios();
      } else {
        this.router.navigate(['/tabs/tab2']);
      }
    });
  }

  get isAdmin(): boolean {
    return this.currentUser?.rol === 'ADMIN';
  }

  loadSitios() {
    this.loading = true;
    this.error = false;
    
    // Try to get as a country first
    this.apiService.getPaisById(this.id).subscribe(pais => {
      if (pais) {
        this.type = 'pais';
        this.paisNombre = pais.nombre;
        
        // Get all cities of this country to filter sites
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
          
          // Get all sites
          this.apiService.getSitios().pipe(
            catchError(error => {
              console.error('Error al cargar sitios:', error);
              this.error = true;
              this.loading = false;
              return of([]);
            })
          ).subscribe(sitios => {
            const ciudadIds = ciudadesDelPais.map(c => c._id);
            
            // Filter sites by cities of this country
            this.sitios = sitios.filter(sitio => {
              if (typeof sitio.ciudad === 'string') {
                return ciudadIds.includes(sitio.ciudad);
              } else {
                return ciudadIds.includes(sitio.ciudad._id);
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
            
            this.apiService.getSitios().pipe(
              catchError(error => {
                console.error('Error al cargar sitios:', error);
                this.error = true;
                this.loading = false;
                return of([]);
              })
            ).subscribe(sitios => {
              // Filter sites by this city
              this.sitios = sitios.filter(sitio => {
                if (typeof sitio.ciudad === 'string') {
                  return sitio.ciudad === this.id;
                } else {
                  return sitio.ciudad._id === this.id;
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
      this.loading = false;    });
  }

  async openCreateSiteModal() {
    const alert = await this.alertController.create({
      header: 'Crear Sitio',
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          placeholder: 'Nombre del sitio'
        },
        {
          name: 'tipo',
          type: 'text',
          placeholder: 'Tipo de sitio'
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
            this.createSite(data);
          }
        }
      ]
    });

    await alert.present();
  }

  async createSite(data: any) {
    if (!data.nombre || !data.tipo) {
      const toast = await this.toastController.create({
        message: 'Todos los campos son obligatorios',
        duration: 2000,
        position: 'top',
        color: 'warning'
      });
      await toast.present();
      return;
    }

    // Use the city name for the ciudad field
    const ciudadName = this.type === 'ciudad' ? this.ciudadNombre : '';

    this.apiService.createSite({
      nombre: data.nombre,
      tipo: data.tipo,
      ciudad: ciudadName
    }).pipe(
      catchError(async error => {
        console.error('Error al crear sitio:', error);
        const toast = await this.toastController.create({
          message: 'Error al crear el sitio',
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
          message: 'Sitio creado correctamente',
          duration: 2000,
          position: 'top',
          color: 'success'
        });
        await toast.present();
        this.loadSitios();
      }
    });
  }

  async editSite(sitio: Sitio) {
    const alert = await this.alertController.create({
      header: 'Editar Sitio',
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          value: sitio.nombre,
          placeholder: 'Nombre del sitio'
        },
        {
          name: 'tipo',
          type: 'text',
          value: sitio.tipo,
          placeholder: 'Tipo de sitio'
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
            this.updateSite(sitio._id!, data);
          }
        }
      ]
    });

    await alert.present();
  }

  async updateSite(id: string, data: any) {
    if (!data.nombre || !data.tipo) {
      const toast = await this.toastController.create({
        message: 'Todos los campos son obligatorios',
        duration: 2000,
        position: 'top',
        color: 'warning'
      });
      await toast.present();
      return;
    }

    this.apiService.updateSite(id, {
      nombre: data.nombre,
      tipo: data.tipo
    }).pipe(
      catchError(async error => {
        console.error('Error al actualizar sitio:', error);
        const toast = await this.toastController.create({
          message: 'Error al actualizar el sitio',
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
          message: 'Sitio actualizado correctamente',
          duration: 2000,
          position: 'top',
          color: 'success'
        });
        await toast.present();
        this.loadSitios();
      }
    });
  }

  async confirmDeleteSite(sitio: Sitio) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que quieres eliminar el sitio ${sitio.nombre}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.deleteSite(sitio._id!);
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteSite(id: string) {
    this.apiService.deleteSite(id).pipe(
      catchError(async error => {
        console.error('Error al eliminar sitio:', error);
        const toast = await this.toastController.create({
          message: 'Error al eliminar el sitio',
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
          message: 'Sitio eliminado correctamente',
          duration: 2000,
          position: 'top',
          color: 'success'
        });
        await toast.present();
        this.loadSitios();
      }
    });
  }

  isFavorite(sitio: Sitio): boolean {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    return favorites.some((site: Sitio) => site._id === sitio._id);
  }

  toggleFavorite(sitio: Sitio, event: Event) {
    event.stopPropagation(); // Prevent navigation when clicking the heart
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const index = favorites.findIndex((site: Sitio) => site._id === sitio._id);
    
    if (index > -1) {
      favorites.splice(index, 1);
      this.showToast('Sitio eliminado de favoritos');
    } else {
      favorites.push(sitio);
      this.showToast('Sitio añadido a favoritos');
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'top'
    });
    toast.present();
  }
}
