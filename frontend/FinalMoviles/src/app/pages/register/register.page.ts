import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Registro</ion-title>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/login"></ion-back-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">        <ion-item>
          <ion-label position="floating">Nombre</ion-label>
          <ion-input type="text" formControlName="nombre"></ion-input>
        </ion-item>
        <div *ngIf="registerForm.get('nombre')?.invalid && registerForm.get('nombre')?.touched" class="error-message">
          <span *ngIf="registerForm.get('nombre')?.errors?.['required']">El nombre es requerido</span>
        </div>

        <ion-item>
          <ion-label position="floating">Correo electrónico</ion-label>
          <ion-input type="email" formControlName="email"></ion-input>
        </ion-item>
        <div *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched" class="error-message">
          <span *ngIf="registerForm.get('email')?.errors?.['required']">El correo es requerido</span>
          <span *ngIf="registerForm.get('email')?.errors?.['email']">Ingrese un correo válido</span>
        </div>        <ion-item>
          <ion-label position="floating">Contraseña</ion-label>
          <ion-input type="password" formControlName="password"></ion-input>
        </ion-item>
        <div *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched" class="error-message">
          <span *ngIf="registerForm.get('password')?.errors?.['required']">La contraseña es requerida</span>
          <span *ngIf="registerForm.get('password')?.errors?.['minlength']">La contraseña debe tener al menos 6 caracteres</span>
        </div>

        <!-- Selector de rol temporal -->
        <ion-item>
          <ion-label position="floating">Rol</ion-label>
          <ion-select formControlName="rol">
            <ion-select-option value="USUARIO">Usuario</ion-select-option>
            <ion-select-option value="ADMIN">Administrador</ion-select-option>
          </ion-select>
        </ion-item>
        <div class="ion-text-center ion-padding-top">
          <ion-text color="danger">
            <small>⚠️ Esta opción es temporal. Elimínala después de crear tu administrador inicial.</small>
          </ion-text>
        </div>

        <ion-button 
          expand="block" 
          type="submit" 
          [disabled]="registerForm.invalid || isLoading"
          class="ion-margin-top">
          <ion-spinner *ngIf="isLoading" name="crescent"></ion-spinner>
          <span *ngIf="!isLoading">Registrarse</span>
        </ion-button>
      </form>

      <div class="ion-text-center ion-margin-top">
        <ion-text>¿Ya tienes cuenta?</ion-text>
        <ion-button fill="clear" (click)="goToLogin()">Iniciar Sesión</ion-button>
      </div>

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
export class RegisterPage {
  registerForm: FormGroup;
  isLoading = false;
  showError = false;
  errorMessage = '';  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rol: ['USUARIO'] // Valor por defecto
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;    this.authService.register(this.registerForm.value).subscribe({
      next: (response) => {        this.isLoading = false;
        this.router.navigate(['/tabs/tab1']);
      },
      error: (error) => {
        this.isLoading = false;
        this.showError = true;
        this.errorMessage = error.error?.message || 'Error al registrar usuario';
        console.error('Error de registro:', error);
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
