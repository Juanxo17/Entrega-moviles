import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, 
  IonSpinner, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, 
  IonCardContent, IonBackButton, IonButtons, IonAlert, AlertController, 
  ToastController, IonSelect, IonSelectOption, IonInput, IonFab, IonFabButton } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { User } from '../../interfaces/user.interface';
import { AuthService } from '../../services/auth.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { addIcons } from 'ionicons';
import { add, arrowBack, people, create, trash } from 'ionicons/icons';

@Component({
  selector: 'app-admin-users',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/tab4"></ion-back-button>
        </ion-buttons>
        <ion-title>Gestión de Usuarios</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div *ngIf="loading" class="ion-text-center">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Cargando usuarios...</p>
      </div>

      <div *ngIf="error" class="ion-padding ion-text-center">
        <ion-icon name="alert-circle-outline" size="large" color="danger"></ion-icon>
        <p>Error al cargar los usuarios. Intenta de nuevo.</p>
        <ion-button (click)="loadUsers()">Reintentar</ion-button>
      </div>

      <ion-card *ngIf="!loading && !error">
        <ion-card-header>
          <ion-card-title>
            <ion-icon name="people"></ion-icon>
            Lista de Usuarios
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list *ngIf="users.length > 0">
            <ion-item *ngFor="let user of users">
              <ion-label>
                <h2>{{ user.nombre }}</h2>
                <p>{{ user.email }}</p>
                <p>Rol: {{ user.rol }}</p>
              </ion-label>
              <ion-button slot="end" fill="clear" color="primary" (click)="editUser(user)">
                <ion-icon name="create"></ion-icon>
              </ion-button>
              <ion-button slot="end" fill="clear" color="danger" (click)="confirmDelete(user)">
                <ion-icon name="trash"></ion-icon>
              </ion-button>
            </ion-item>
          </ion-list>
          <div *ngIf="users.length === 0" class="ion-text-center">
            <p>No hay usuarios registrados.</p>
          </div>
        </ion-card-content>
      </ion-card>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button (click)="openCreateUserModal()">
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
    IonSelect,
    IonSelectOption,
    IonInput,
    IonFab,
    IonFabButton
  ]
})
export class AdminUsersPage implements OnInit {
  users: User[] = [];
  loading: boolean = true;
  error: boolean = false;

  constructor(
    private authService: AuthService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({ add, arrowBack, people, create, trash });
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.error = false;
    
    this.authService.getAllUsers().pipe(
      catchError(error => {
        console.error('Error al cargar usuarios:', error);
        this.error = true;
        this.loading = false;
        return of([]);
      })
    ).subscribe(users => {
      this.users = users;
      this.loading = false;
    });
  }

  async openCreateUserModal() {
    const alert = await this.alertController.create({
      header: 'Crear Usuario',
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          placeholder: 'Nombre'
        },
        {
          name: 'email',
          type: 'email',
          placeholder: 'Correo Electrónico'
        },
        {
          name: 'password',
          type: 'password',
          placeholder: 'Contraseña'
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
            this.createUser(data);
          }
        }
      ]
    });

    await alert.present();
  }

  async createUser(data: any) {
    if (!data.nombre || !data.email || !data.password) {
      const toast = await this.toastController.create({
        message: 'Todos los campos son obligatorios',
        duration: 2000,
        position: 'top',
        color: 'warning'
      });
      await toast.present();
      return;
    }

    this.authService.register({
      nombre: data.nombre,
      email: data.email,
      password: data.password,
      rol: 'USUARIO'
    }).pipe(
      catchError(async error => {
        console.error('Error al crear usuario:', error);
        const toast = await this.toastController.create({
          message: 'Error al crear el usuario',
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
          message: 'Usuario creado correctamente',
          duration: 2000,
          position: 'top',
          color: 'success'
        });
        await toast.present();
        this.loadUsers();
      }
    });
  }

  async editUser(user: User) {
    const alert = await this.alertController.create({
      header: 'Editar Usuario',
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          value: user.nombre,
          placeholder: 'Nombre'
        },
        {
          name: 'email',
          type: 'email',
          value: user.email,
          placeholder: 'Correo Electrónico'
        },
        {
          name: 'rol',
          type: 'text',
          value: user.rol,
          placeholder: 'Rol (ADMIN o USUARIO)'
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
            this.updateUser(user._id!, data);
          }
        }
      ]
    });

    await alert.present();
  }

  async updateUser(id: string, data: any) {
    if (!data.nombre || !data.email || !data.rol) {
      const toast = await this.toastController.create({
        message: 'Todos los campos son obligatorios',
        duration: 2000,
        position: 'top',
        color: 'warning'
      });
      await toast.present();
      return;
    }

    if (data.rol !== 'ADMIN' && data.rol !== 'USUARIO') {
      const toast = await this.toastController.create({
        message: 'El rol debe ser ADMIN o USUARIO',
        duration: 2000,
        position: 'top',
        color: 'warning'
      });
      await toast.present();
      return;
    }

    this.authService.updateUser(id, {
      nombre: data.nombre,
      email: data.email,
      rol: data.rol
    }).pipe(
      catchError(async error => {
        console.error('Error al actualizar usuario:', error);
        const toast = await this.toastController.create({
          message: 'Error al actualizar el usuario',
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
          message: 'Usuario actualizado correctamente',
          duration: 2000,
          position: 'top',
          color: 'success'
        });
        await toast.present();
        this.loadUsers();
      }
    });
  }

  async confirmDelete(user: User) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que quieres eliminar al usuario ${user.nombre}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.deleteUser(user._id!);
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteUser(id: string) {
    this.authService.deleteUser(id).pipe(
      catchError(async error => {
        console.error('Error al eliminar usuario:', error);
        const toast = await this.toastController.create({
          message: 'Error al eliminar el usuario',
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
          message: 'Usuario eliminado correctamente',
          duration: 2000,
          position: 'top',
          color: 'success'
        });
        await toast.present();
        this.loadUsers();
      }
    });
  }
}
