import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Iniciar Sesión</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <ion-item>
          <ion-label position="floating">Correo electrónico</ion-label>
          <ion-input 
            type="email" 
            formControlName="email"
            inputmode="email"
            auto-complete="email"
            [clearInput]="true"
            required></ion-input>
        </ion-item>
        <div *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" class="error-message">
          <span *ngIf="loginForm.get('email')?.errors?.['required']">El correo es requerido</span>
          <span *ngIf="loginForm.get('email')?.errors?.['email']">Ingrese un correo válido</span>
        </div>

        <ion-item>
          <ion-label position="floating">Contraseña</ion-label>
          <ion-input 
            type="password" 
            formControlName="password"
            [clearInput]="true"
            [clearOnEdit]="false"
            required></ion-input>
        </ion-item>
        <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="error-message">
          <span *ngIf="loginForm.get('password')?.errors?.['required']">La contraseña es requerida</span>
        </div>

        <ion-button 
          expand="block" 
          type="submit" 
          [disabled]="loginForm.invalid || isLoading"
          class="ion-margin-top">
          <ion-spinner *ngIf="isLoading" name="crescent"></ion-spinner>
          <span *ngIf="!isLoading">Iniciar Sesión</span>
        </ion-button>
      </form>

      <div class="ion-text-center ion-margin-top">
        <ion-text>¿No tienes cuenta?</ion-text>
        <ion-button fill="clear" (click)="goToRegister()">Regístrate</ion-button>
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
    ion-item {
      --background: transparent;
      --padding-start: 0;
    }
    ion-input {
      --padding-start: 16px;
      --padding-end: 16px;
      --background: #ffffff;
      margin: 8px 0;
      border-radius: 4px;
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
export class LoginPage {
  loginForm: FormGroup;
  isLoading = false;
  showError = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['joseligo14@gmail.com', [Validators.required, Validators.email]],
      password: ['JuanJose', [Validators.required]]
    });
  }
  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(['/tabs/tab1']);
      },
      error: (error) => {
        this.isLoading = false;
        this.showError = true;
        this.errorMessage = error.error?.message || 'Error al iniciar sesión';
        console.error('Error de login:', error);
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
