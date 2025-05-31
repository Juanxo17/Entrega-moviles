import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, 
  IonSkeletonText, IonSpinner, IonButton, IonIcon, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonBackButton, IonButtons, IonFab, IonFabButton,
  IonItemSliding, IonItemOptions, IonItemOption, AlertController, ToastController } from '@ionic/angular/standalone';
import { ApiService,  Sitio } from '../../services/api.service';
import { AuthStateService } from '../../services/auth-state.service';
import { Plato } from 'src/app/interfaces/plato.interface';
import { User } from '../../interfaces/user.interface';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { addIcons } from 'ionicons';
import { restaurant, arrowBack, alertCircleOutline, add, create, trash } from 'ionicons/icons';

@Component({
  selector: 'app-dish-list',
  templateUrl: './dish-list.page.html',
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
export class DishListPage implements OnInit {
  paisId: string = '';
  paisNombre: string = '';
  platos: Plato[] = [];
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
    addIcons({ restaurant, arrowBack, alertCircleOutline, add, create, trash });
  }
  ngOnInit() {
    this.authStateService.currentUser.subscribe(user => {
      this.currentUser = user;
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.paisId = id;
        this.loadData();
      } else {
        this.router.navigate(['/tabs/tab2']);
      }
    });
  }

  get isAdmin(): boolean {
    return this.currentUser?.rol === 'ADMIN';
  }

  loadData() {
    this.loading = true;
    this.error = false;
    
    // Get país name
    this.apiService.getPaisById(this.paisId).subscribe(pais => {
      if (pais) {
        this.paisNombre = pais.nombre;
      }
      this.loadPlatos();
    }, error => {
      console.error('Error al cargar país:', error);
      this.loadPlatos();
    });
  }

  loadPlatos() {
    // Get all sitios to filter platos
    this.apiService.getCiudades().pipe(
      catchError(error => {
        console.error('Error al cargar ciudades:', error);
        return of([]);
      })
    ).subscribe(ciudades => {
      const ciudadesDelPais = ciudades.filter(ciudad => {
        if (typeof ciudad.pais === 'string') {
          return ciudad.pais === this.paisId;
        } else {
          return ciudad.pais._id === this.paisId;
        }
      });
      
      // Get all sitios of these cities
      this.apiService.getSitios().pipe(
        catchError(error => {
          console.error('Error al cargar sitios:', error);
          return of([]);
        })
      ).subscribe(sitios => {
        const ciudadIds = ciudadesDelPais.map(c => c._id);
        
        // Filter sitios by cities of this country
        this.sitios = sitios.filter(sitio => {
          if (typeof sitio.ciudad === 'string') {
            return ciudadIds.includes(sitio.ciudad);
          } else {
            return ciudadIds.includes(sitio.ciudad._id);
          }
        });
        
        const sitioIds = this.sitios.map(s => s._id);
        
        // Get platos
        this.apiService.getPlatos().pipe(
          catchError(error => {
            console.error('Error al cargar platos:', error);
            this.error = true;
            this.loading = false;
            return of([]);
          })        ).subscribe(platos => {
          // Filter platos by sitios
          this.platos = platos.filter(plato => {
            if (!plato.sitio) return false;
            
            if (typeof plato.sitio === 'string') {
              return sitioIds.includes(plato.sitio);
            } else {
              return plato.sitio._id ? sitioIds.includes(plato.sitio._id) : false;
            }
          });
          
          this.loading = false;        });
      });
    });
  }  async openCreateDishModal() {
    const alert = await this.alertController.create({
      header: 'Crear Plato',
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          placeholder: 'Nombre del plato'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Seleccionar Sitio',
          handler: (data) => {
            if (!data.nombre) {
              this.showToast('El nombre del plato es obligatorio');
              return false;
            }
            this.showSiteSelector(data.nombre);
            return false;
          }
        },
        {
          text: 'Crear Sin Sitio',
          handler: (data) => {
            if (!data.nombre) {
              this.showToast('El nombre del plato es obligatorio');
              return false;
            }
            this.showCreateDishWithoutSitio(data.nombre);
            return false;
          }
        }
      ]
    });

    await alert.present();
  }

  async showSiteSelector(nombrePlato: string) {
    const inputs = this.sitios.map(sitio => ({
      type: 'radio' as const,
      label: sitio.nombre,
      value: sitio._id
    }));

    const alert = await this.alertController.create({
      header: 'Seleccionar Sitio',
      inputs: inputs,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Continuar',
          handler: (sitioId) => {
            if (sitioId) {
              this.showCreateDishWithSitio(nombrePlato, sitioId);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async showCreateDishWithSitio(nombrePlato: string, sitioId: string) {
    const sitio = this.sitios.find(s => s._id === sitioId);
    const sitioName = sitio ? sitio.nombre : 'Sitio seleccionado';

    const alert = await this.alertController.create({
      header: `Crear Plato - ${sitioName}`,
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          value: nombrePlato,
          placeholder: 'Nombre del plato'
        },
        {
          name: 'descripcion',
          type: 'text',
          placeholder: 'Descripción (opcional)'
        },
        {
          name: 'precio',
          type: 'number',
          placeholder: 'Precio'
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
            data.sitio = sitioId;
            this.createDish(data);
          }
        }
      ]
    });

    await alert.present();
  }

  async showCreateDishWithoutSitio(nombrePlato: string) {
    const alert = await this.alertController.create({
      header: 'Crear Plato',
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          value: nombrePlato,
          placeholder: 'Nombre del plato'
        },
        {
          name: 'descripcion',
          type: 'text',
          placeholder: 'Descripción (opcional)'
        },
        {
          name: 'precio',
          type: 'number',
          placeholder: 'Precio'
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
            this.createDish(data);
          }
        }
      ]
    });

    await alert.present();
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'top',
      color: 'warning'
    });
    await toast.present();
  }

  async createDish(data: any) {
    if (!data.nombre || !data.precio) {
      const toast = await this.toastController.create({
        message: 'El nombre y precio son obligatorios',
        duration: 2000,
        position: 'top',
        color: 'warning'
      });
      await toast.present();
      return;
    }    const dishData: any = {
      nombre: data.nombre,
      descripcion: data.descripcion,
      precio: parseFloat(data.precio),
      pais: this.paisId
    };

    // Add sitio if provided
    if (data.sitio) {
      dishData.sitio = data.sitio;
    }

    this.apiService.createDish(dishData).pipe(
      catchError(async error => {
        console.error('Error al crear plato:', error);
        const toast = await this.toastController.create({
          message: 'Error al crear el plato',
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
          message: 'Plato creado correctamente',
          duration: 2000,
          position: 'top',
          color: 'success'
        });
        await toast.present();
        this.loadPlatos();
      }
    });
  }

  async editDish(plato: Plato) {
    const alert = await this.alertController.create({
      header: 'Editar Plato',
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          value: plato.nombre,
          placeholder: 'Nombre del plato'
        },
        {
          name: 'descripcion',
          type: 'text',
          value: plato.descripcion,
          placeholder: 'Descripción (opcional)'
        },
        {
          name: 'precio',
          type: 'number',
          value: plato.precio?.toString(),
          placeholder: 'Precio'
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
            this.updateDish(plato._id!, data);
          }
        }
      ]
    });

    await alert.present();
  }

  async updateDish(id: string, data: any) {
    if (!data.nombre || !data.precio) {
      const toast = await this.toastController.create({
        message: 'El nombre y precio son obligatorios',
        duration: 2000,
        position: 'top',
        color: 'warning'
      });
      await toast.present();
      return;
    }

    this.apiService.updateDish(id, {
      nombre: data.nombre,
      descripcion: data.descripcion,
      precio: parseFloat(data.precio)
    }).pipe(
      catchError(async error => {
        console.error('Error al actualizar plato:', error);
        const toast = await this.toastController.create({
          message: 'Error al actualizar el plato',
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
          message: 'Plato actualizado correctamente',
          duration: 2000,
          position: 'top',
          color: 'success'
        });
        await toast.present();
        this.loadPlatos();
      }
    });
  }

  async confirmDeleteDish(plato: Plato) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que quieres eliminar el plato ${plato.nombre}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.deleteDish(plato._id!);
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteDish(id: string) {
    this.apiService.deleteDish(id).pipe(
      catchError(async error => {
        console.error('Error al eliminar plato:', error);
        const toast = await this.toastController.create({
          message: 'Error al eliminar el plato',
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
          message: 'Plato eliminado correctamente',
          duration: 2000,
          position: 'top',
          color: 'success'
        });
        await toast.present();
        this.loadPlatos();
      }
    });
  }
}
