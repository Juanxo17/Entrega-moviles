import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, 
  IonSpinner, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, 
  IonCardContent, IonBackButton, IonButtons, AlertController, 
  ToastController, IonInput, IonFab, IonFabButton, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Plato } from '../../interfaces/plato.interface';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { addIcons } from 'ionicons';
import { add, arrowBack, restaurant, create, trash } from 'ionicons/icons';

@Component({
  selector: 'app-admin-dishes',
  templateUrl: './admin-dishes.page.html',
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
export class AdminDishesPage implements OnInit {
  dishes: Plato[] = [];
  loading = true;
  error = false;

  constructor(
    private apiService: ApiService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({ add, arrowBack, restaurant, create, trash });
  }

  ngOnInit() {
    this.loadDishes();
  }

  loadDishes() {
    this.loading = true;
    this.error = false;
    
    this.apiService.getPlatos().pipe(
      catchError(error => {
        console.error('Error loading dishes:', error);
        this.error = true;
        return of<Plato[]>([]);
      })
    ).subscribe(dishes => {
      this.dishes = dishes;
      this.loading = false;
    });
  }

  async addDish() {
    const alert = await this.alertController.create({
      header: 'Nuevo Plato',
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          placeholder: 'Nombre del plato'
        },
        {
          name: 'descripcion',
          type: 'text',
          placeholder: 'Descripción'
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
          text: 'Guardar',
          handler: (data: { nombre: string; descripcion?: string; precio: number }) => {
            if (data.nombre && data.precio) {
              this.apiService.createDish(data).subscribe({
                next: () => {
                  this.loadDishes();
                  this.showToast('Plato creado exitosamente');
                },
                error: (error) => {
                  console.error('Error creating dish:', error);
                  this.showToast('Error al crear el plato');
                }
              });
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async editDish(dish: Plato) {
    const alert = await this.alertController.create({
      header: 'Editar Plato',
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          value: dish.nombre,
          placeholder: 'Nombre del plato'
        },
        {
          name: 'descripcion',
          type: 'text',
          value: dish.descripcion,
          placeholder: 'Descripción'
        },
        {
          name: 'precio',
          type: 'number',
          value: dish.precio,
          placeholder: 'Precio'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: (data: { nombre: string; descripcion?: string; precio: number }) => {
            if (data.nombre && data.precio) {
              this.apiService.updateDish(dish._id!, data).subscribe({
                next: () => {
                  this.loadDishes();
                  this.showToast('Plato actualizado exitosamente');
                },
                error: (error) => {
                  console.error('Error updating dish:', error);
                  this.showToast('Error al actualizar el plato');
                }
              });
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteDish(dishId: string) {
    const alert = await this.alertController.create({
      header: '¿Eliminar plato?',
      message: '¿Estás seguro de que deseas eliminar este plato?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.apiService.deleteDish(dishId).subscribe({
              next: () => {
                this.loadDishes();
                this.showToast('Plato eliminado exitosamente');
              },
              error: (error) => {
                console.error('Error deleting dish:', error);
                this.showToast('Error al eliminar el plato');
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

  getPaisName(pais: any): string {
    if (typeof pais === 'string') {
      return pais;
    } else if (pais && pais.nombre) {
      return pais.nombre;
    }
    return '';
  }

  getSitioName(sitio: any): string {
    if (typeof sitio === 'string') {
      return sitio;
    } else if (sitio && sitio.nombre) {
      return sitio.nombre;
    }
    return '';
  }
}
