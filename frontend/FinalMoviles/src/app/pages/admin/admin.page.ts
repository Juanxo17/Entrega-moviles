import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { AuthStateService } from '../../services/auth-state.service';

@Component({
  selector: 'app-admin',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Panel de Administración</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-list>
        <ion-list-header>
          <ion-label>Gestión de Datos</ion-label>
        </ion-list-header>

        <ion-item button routerLink="/tabs/tab4/paises">
          <ion-icon name="globe-outline" slot="start"></ion-icon>
          <ion-label>Países</ion-label>
        </ion-item>

        <ion-item button routerLink="/tabs/tab4/ciudades">
          <ion-icon name="business-outline" slot="start"></ion-icon>
          <ion-label>Ciudades</ion-label>
        </ion-item>

        <ion-item button routerLink="/tabs/tab4/famosos">
          <ion-icon name="people-outline" slot="start"></ion-icon>
          <ion-label>Personajes Famosos</ion-label>
        </ion-item>

        <ion-item button routerLink="/tabs/tab4/sitios">
          <ion-icon name="location-outline" slot="start"></ion-icon>
          <ion-label>Sitios Turísticos</ion-label>
        </ion-item>

        <ion-item button routerLink="/tabs/tab4/platos">
          <ion-icon name="restaurant-outline" slot="start"></ion-icon>
          <ion-label>Platos Típicos</ion-label>
        </ion-item>

        <ion-list-header>
          <ion-label>Usuarios</ion-label>
        </ion-list-header>

        <ion-item button routerLink="/tabs/tab4/usuarios">
          <ion-icon name="people-outline" slot="start"></ion-icon>
          <ion-label>Gestión de Usuarios</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class AdminPage {
  constructor(private authStateService: AuthStateService) {}
}
