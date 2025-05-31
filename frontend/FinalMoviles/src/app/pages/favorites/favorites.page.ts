import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, 
  IonButton, IonIcon, IonItemGroup, IonItemDivider, IonReorderGroup, IonReorder,
  IonSegment, IonSegmentButton, ToastController, AlertController, IonFab, 
  IonFabButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heart, heartOutline, reorderTwoOutline, addCircle, removeCircle, save, map, location } from 'ionicons/icons';

@Component({
  selector: 'app-favorites',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Mis Favoritos</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Segmented Control -->
      <ion-segment [(ngModel)]="selectedSegment" (ionChange)="segmentChanged($event)">
        <ion-segment-button value="favorites">
          <ion-label>Sitios Favoritos</ion-label>
        </ion-segment-button>
        <ion-segment-button value="route">
          <ion-label>Mi Ruta</ion-label>
        </ion-segment-button>
      </ion-segment>

      <!-- Sitios Favoritos -->
      <div *ngIf="selectedSegment === 'favorites'">
        <div *ngIf="favoriteSites.length === 0" class="ion-padding ion-text-center">
          <ion-icon name="heart-outline" size="large" color="medium"></ion-icon>
          <p>No tienes sitios favoritos aún.</p>
          <ion-button routerLink="/tabs/tab2" fill="outline">
            Explorar Sitios
          </ion-button>
        </div>

        <ion-list *ngIf="favoriteSites.length > 0">
          <ion-item *ngFor="let site of favoriteSites" [routerLink]="['/tabs/sitio', site._id]">
            <ion-icon name="location" slot="start" color="primary"></ion-icon>
            <ion-label>
              <h2>{{ site.nombre }}</h2>
              <p *ngIf="site.tipo">{{ site.tipo }}</p>
              <p *ngIf="site.ciudad?.nombre">{{ site.ciudad?.nombre }}, {{ site.ciudad?.pais?.nombre }}</p>
            </ion-label>
            <ion-button fill="clear" slot="end" (click)="addToRoute(site, $event)">
              <ion-icon name="add-circle" color="success"></ion-icon>
            </ion-button>
            <ion-button fill="clear" slot="end" (click)="removeFavorite(site, $event)">
              <ion-icon name="heart" color="danger"></ion-icon>
            </ion-button>
          </ion-item>
        </ion-list>
      </div>

      <!-- Mi Ruta -->
      <div *ngIf="selectedSegment === 'route'">
        <div *ngIf="routeSites.length === 0" class="ion-padding ion-text-center">
          <ion-icon name="map" size="large" color="medium"></ion-icon>
          <p>Tu ruta está vacía.</p>
          <p>Agrega sitios desde tus favoritos para planificar tu ruta.</p>
          <ion-button (click)="switchToFavorites()" fill="outline">
            Ver Favoritos
          </ion-button>
        </div>

        <ion-list *ngIf="routeSites.length > 0">
          <ion-reorder-group (ionItemReorder)="handleReorder($event)" disabled="false">
            <ion-item *ngFor="let site of routeSites; let i = index">
              <ion-label slot="start">{{ i + 1 }}</ion-label>
              <ion-icon name="location" slot="start" color="primary"></ion-icon>
              <ion-label>
                <h2>{{ site.nombre }}</h2>
                <p *ngIf="site.tipo">{{ site.tipo }}</p>
                <p *ngIf="site.ciudad?.nombre">{{ site.ciudad?.nombre }}</p>
              </ion-label>
              <ion-button fill="clear" slot="end" (click)="removeFromRoute(site)">
                <ion-icon name="remove-circle" color="danger"></ion-icon>
              </ion-button>
              <ion-reorder slot="end">
                <ion-icon name="reorder-two-outline"></ion-icon>
              </ion-reorder>
            </ion-item>
          </ion-reorder-group>
        </ion-list>

        <!-- Botón para guardar ruta -->
        <div class="ion-padding" *ngIf="routeSites.length > 0">
          <ion-button expand="block" (click)="saveRoute()" [disabled]="routeSites.length === 0">
            <ion-icon name="save" slot="start"></ion-icon>
            Guardar Ruta
          </ion-button>
        </div>
      </div>
    </ion-content>
  `,  standalone: true,
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
    IonButton, 
    IonIcon, 
    IonItemGroup, 
    IonItemDivider, 
    IonReorderGroup, 
    IonReorder,
    IonSegment,
    IonSegmentButton,
    IonFab,
    IonFabButton
  ]
})
export class FavoritesPage implements OnInit {
  favoriteSites: any[] = [];
  routeSites: any[] = [];
  selectedSegment: string = 'favorites';

  constructor(
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    addIcons({ heart, heartOutline, reorderTwoOutline, addCircle, removeCircle, save, map, location });
  }

  ngOnInit() {
    this.loadFavorites();
  }

  ionViewWillEnter() {
    this.loadFavorites();
  }

  segmentChanged(ev: any) {
    this.selectedSegment = ev.detail.value;
  }

  switchToFavorites() {
    this.selectedSegment = 'favorites';
  }

  loadFavorites() {
    // Cargar favoritos desde localStorage
    const favorites = localStorage.getItem('favorites');
    if (favorites) {
      this.favoriteSites = JSON.parse(favorites);
    }

    // Cargar ruta planeada
    const route = localStorage.getItem('planned_route');
    if (route) {
      this.routeSites = JSON.parse(route);
    }
  }

  async removeFavorite(site: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    const alert = await this.alertController.create({
      header: 'Eliminar Favorito',
      message: `¿Deseas eliminar "${site.nombre}" de tus favoritos?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: async () => {
            this.favoriteSites = this.favoriteSites.filter(s => s._id !== site._id);
            localStorage.setItem('favorites', JSON.stringify(this.favoriteSites));
            
            const toast = await this.toastController.create({
              message: 'Sitio eliminado de favoritos',
              duration: 2000,
              position: 'bottom',
              color: 'warning'
            });
            await toast.present();
          }
        }
      ]
    });

    await alert.present();
  }

  async addToRoute(site: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    // Check if site is already in route
    const isInRoute = this.routeSites.some(s => s._id === site._id);
    if (isInRoute) {
      const toast = await this.toastController.create({
        message: 'Este sitio ya está en tu ruta',
        duration: 2000,
        position: 'bottom',
        color: 'warning'
      });
      await toast.present();
      return;
    }

    this.routeSites.push(site);
    localStorage.setItem('planned_route', JSON.stringify(this.routeSites));

    const toast = await this.toastController.create({
      message: `"${site.nombre}" agregado a tu ruta`,
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
  }

  async removeFromRoute(site: any) {
    this.routeSites = this.routeSites.filter(s => s._id !== site._id);
    localStorage.setItem('planned_route', JSON.stringify(this.routeSites));

    const toast = await this.toastController.create({
      message: `"${site.nombre}" eliminado de tu ruta`,
      duration: 2000,
      position: 'bottom',
      color: 'warning'
    });
    await toast.present();
  }

  handleReorder(event: any) {
    const itemMove = this.routeSites.splice(event.detail.from, 1)[0];
    this.routeSites.splice(event.detail.to, 0, itemMove);
    event.detail.complete();
    
    // Auto-save the reordered route
    localStorage.setItem('planned_route', JSON.stringify(this.routeSites));
  }

  async saveRoute() {
    if (this.routeSites.length === 0) {
      const toast = await this.toastController.create({
        message: 'No hay sitios en tu ruta para guardar',
        duration: 2000,
        position: 'bottom',
        color: 'warning'
      });
      await toast.present();
      return;
    }

    const alert = await this.alertController.create({
      header: 'Guardar Ruta',
      message: `¿Deseas guardar tu ruta con ${this.routeSites.length} sitio(s)?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: async () => {
            localStorage.setItem('planned_route', JSON.stringify(this.routeSites));
            
            const toast = await this.toastController.create({
              message: 'Ruta guardada exitosamente',
              duration: 3000,
              position: 'bottom',
              color: 'success'
            });
            await toast.present();
          }
        }
      ]
    });

    await alert.present();
  }
}
