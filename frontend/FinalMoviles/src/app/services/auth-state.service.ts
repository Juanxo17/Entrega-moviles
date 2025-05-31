import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular/standalone';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) { }

  get currentUser(): Observable<User | null> {
    return this.authService.currentUser;
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated;
  }

  async logout(): Promise<void> {
    this.authService.logout();
    this.router.navigate(['/login']);
    
    const toast = await this.toastController.create({
      message: 'Sesión cerrada correctamente',
      duration: 2000,
      position: 'top',
      color: 'success'
    });
    
    await toast.present();
  }

  async checkAuthStatus(): Promise<boolean> {
    if (this.isAuthenticated) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
