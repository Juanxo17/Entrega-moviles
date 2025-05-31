import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthStateService } from './services/auth-state.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(
    private authStateService: AuthStateService,
    private router: Router
  ) {}

  ngOnInit() {
    // Verificar estado de autenticación al iniciar la app
    this.checkAuthState();
  }  private async checkAuthState() {
    if (this.authStateService.isAuthenticated) {
      // Si el usuario está autenticado, redirigir a la página de bienvenida
      this.router.navigate(['/tabs/tab1']);
    } else {
      // Si no está autenticado, redirigir al login
      this.router.navigate(['/login']);
    }
  }
}
