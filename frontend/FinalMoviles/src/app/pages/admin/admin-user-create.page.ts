import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-user-create',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Crear Usuario</ion-title>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/tab1"></ion-back-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
        <ion-item>
          <ion-label position="floating">Nombre</ion-label>
          <ion-input type="text" formControlName="nombre"></ion-input>
        </ion-item>
        <div *ngIf="userForm.get('nombre')?.invalid && userForm.get('nombre')?.touched" class="error-message">
          <span *ngIf="userForm.get('nombre')?.errors?.['required']">El nombre es requerido</span>
        </div>

        <ion-item>
          <ion-label position="floating">Correo electrónico</ion-label>
          <ion-input type="email" formControlName="email"></ion-input>
        </ion-item>
        <div *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched" class="error-message">
          <span *ngIf="userForm.get('email')?.errors?.['required']">El correo es requerido</span>
          <span *ngIf="userForm.get('email')?.errors?.['email']">Ingrese un correo válido</span>
        </div>

        <ion-item>
          <ion-label position="floating">Contraseña</ion-label>
          <ion-input type="password" formControlName="password"></ion-input>
        </ion-item>
        <div *ngIf="userForm.get('password')?.invalid && userForm.get('password')?.touched" class="error-message">
          <span *ngIf="userForm.get('password')?.errors?.['required']">La contraseña es requerida</span>
          <span *ngIf="userForm.get('password')?.errors?.['minlength']">La contraseña debe tener al menos 6 caracteres</span>
        </div>

        <ion-item>
          <ion-label>Rol</ion-label>
          <ion-select formControlName="rol" interface="action-sheet">
            <ion-select-option value="USUARIO">Usuario</ion-select-option>
            <ion-select-option value="ADMIN">Administrador</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-button 
          expand="block" 
          type="submit" 
          [disabled]="userForm.invalid || isLoading"
          class="ion-margin-top">
          <ion-spinner *ngIf="isLoading" name="crescent"></ion-spinner>
          <span *ngIf="!isLoading">Crear Usuario</span>
        </ion-button>
      </form>

      <ion-toast 
        [isOpen]="showError"
        [message]="errorMessage"
        [duration]="3000"
        (didDismiss)="showError = false"
        color="danger"
        position="top">
      </ion-toast>
    </ion-content>
  `,
  styles: [`
    .error-message {
      color: var(--ion-color-danger);
      padding: 0.4rem 0 0 1rem;
      font-size: 0.8rem;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class AdminUserCreatePage {
  userForm: FormGroup;
  isLoading = false;
  showError = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.userForm = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rol: ['USUARIO', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.userForm.invalid) {
      return;
    }

    this.isLoading = true;
    
    // Aquí usaríamos un servicio específico para la creación de usuarios por admin
    this.authService.register(this.userForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(['/tabs/tab1']);
      },
      error: (error) => {
        this.isLoading = false;
        this.showError = true;
        this.errorMessage = error.error?.message || 'Error al crear usuario';
        console.error('Error de creación:', error);
      }
    });
  }
}
