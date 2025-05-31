import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, 
  IonLabel, IonSpinner, IonCard, IonCardHeader, IonCardTitle, 
  IonCardContent, IonIcon, IonBadge, IonRefresher, IonRefresherContent,
  IonSegment, IonSegmentButton, IonButton
} from '@ionic/angular/standalone';
import { ApiService } from '../../services/api.service';
import { catchError, of } from 'rxjs';
import { addIcons } from 'ionicons';
import { trophy, location, barChart, refresh, earth } from 'ionicons/icons';

interface TopSite {
  _id: string;
  nombreSitio: string;
  cantidadVisitas: number;
}

@Component({
  selector: 'app-top-sites',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Top 10 Sitios Más Visitados</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <!-- Segment para seleccionar país -->
      <ion-segment [(ngModel)]="selectedCountry" (ionChange)="onCountryChange($event)" class="ion-padding" *ngIf="countries.length > 0">
        <ion-segment-button *ngFor="let country of countries" [value]="country.nombre">
          <ion-label>{{ country.nombre }}</ion-label>
        </ion-segment-button>
      </ion-segment>

      <div *ngIf="loading" class="ion-padding ion-text-center">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
        <p>{{ countries.length === 0 ? 'Cargando países...' : 'Cargando estadísticas...' }}</p>
      </div>      <div *ngIf="error" class="ion-padding ion-text-center">
        <ion-icon name="bar-chart" size="large" color="danger"></ion-icon>
        <p>Error al cargar las estadísticas</p>
        <ion-button (click)="loadTopSites()" color="primary">
          <ion-icon name="refresh" slot="start"></ion-icon>
          Reintentar
        </ion-button>
      </div>

      <div *ngIf="!loading && !error">
        <!-- Header Card -->
        <ion-card class="header-card">
          <ion-card-header>
            <ion-card-title class="ion-text-center">
              <ion-icon name="trophy" color="warning"></ion-icon>
              Top 10 - {{ selectedCountry }}
            </ion-card-title>
          </ion-card-header>
          <ion-card-content class="ion-text-center">
            <p>Los sitios turísticos más populares basados en visitas registradas</p>
          </ion-card-content>
        </ion-card>

        <!-- Top Sites List -->
        <ion-list *ngIf="topSites.length > 0" lines="full">
          <ion-item 
            *ngFor="let site of topSites; let i = index" 
            [routerLink]="['/tabs/sitio', site._id]"
            class="top-site-item">
            
            <!-- Ranking Badge -->
            <ion-badge 
              slot="start" 
              [color]="getRankingColor(i + 1)"
              class="ranking-badge">
              {{ i + 1 }}
            </ion-badge>

            <!-- Site Info -->
            <ion-label>
              <h2>{{ site.nombreSitio }}</h2>
              <p>
                <ion-icon name="location" size="small"></ion-icon>
                {{ site.cantidadVisitas }} {{ site.cantidadVisitas === 1 ? 'visita' : 'visitas' }}
              </p>
            </ion-label>

            <!-- Trophy Icon for Top 3 -->
            <ion-icon 
              *ngIf="i < 3"
              name="trophy" 
              slot="end" 
              [color]="getTrophyColor(i + 1)">
            </ion-icon>

            <!-- Visit Count Badge -->
            <ion-badge 
              slot="end" 
              color="primary" 
              class="visit-count">
              {{ site.cantidadVisitas }}
            </ion-badge>
          </ion-item>
        </ion-list>

        <!-- Empty State -->
        <ion-card *ngIf="topSites.length === 0 && !loading">
          <ion-card-content class="ion-text-center">
            <ion-icon name="earth" size="large" color="medium"></ion-icon>
            <h2>No hay datos disponibles</h2>
            <p>No se encontraron sitios visitados para {{ selectedCountry }}</p>
            <ion-button routerLink="/tabs/tab2" fill="outline">
              <ion-icon name="location" slot="start"></ion-icon>
              Explorar Sitios
            </ion-button>
          </ion-card-content>
        </ion-card>

        <!-- Statistics Card -->
        <ion-card *ngIf="topSites.length > 0" class="stats-card">          <ion-card-header>
            <ion-card-title>
              <ion-icon name="bar-chart"></ion-icon>
              Estadísticas
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="stats-grid">
              <div class="stat-item">
                <h3>{{ topSites.length }}</h3>
                <p>Sitios en ranking</p>
              </div>
              <div class="stat-item">
                <h3>{{ getTotalVisits() }}</h3>
                <p>Total de visitas</p>
              </div>
              <div class="stat-item" *ngIf="topSites.length > 0">
                <h3>{{ topSites[0].cantidadVisitas }}</h3>
                <p>Más visitado</p>
              </div>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [`
    .header-card {
      background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-secondary));
      color: white;
    }

    .header-card ion-card-title,
    .header-card ion-card-content {
      color: white;
    }

    .top-site-item {
      margin: 8px 16px;
      border-radius: 12px;
      border: 1px solid var(--ion-color-light);
    }

    .ranking-badge {
      font-weight: bold;
      font-size: 1.2rem;
      min-width: 40px;
      min-height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .visit-count {
      font-weight: bold;
    }

    .stats-card {
      margin: 16px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      text-align: center;
    }

    .stat-item h3 {
      margin: 0;
      font-size: 1.8rem;
      color: var(--ion-color-primary);
      font-weight: bold;
    }

    .stat-item p {
      margin: 4px 0 0 0;
      color: var(--ion-color-medium);
      font-size: 0.9rem;
    }

    ion-segment {
      background: var(--ion-color-light);
      border-radius: 12px;
      margin: 8px;
    }
  `],  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
    IonLabel, IonSpinner, IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonIcon, IonBadge, IonRefresher, IonRefresherContent,
    IonSegment, IonSegmentButton, IonButton
  ]
})
export class TopSitesPage implements OnInit {
  topSites: TopSite[] = [];
  countries: any[] = [];
  loading: boolean = true;
  error: boolean = false;
  selectedCountry: string = '';

  constructor(private apiService: ApiService) {
    addIcons({ trophy, location, barChart, refresh, earth });
  }

  ngOnInit() {
    this.loadCountries();
  }

  loadCountries() {
    this.apiService.getPaises().pipe(
      catchError(error => {
        console.error('Error al cargar países:', error);
        this.loading = false;
        return of([]);
      })
    ).subscribe(countries => {
      this.countries = countries;
      if (countries.length > 0) {
        this.selectedCountry = countries[0].nombre;
        this.loadTopSites();
      } else {
        this.loading = false;
      }
    });
  }

  onCountryChange(event: any) {
    this.selectedCountry = event.detail.value;
    this.loadTopSites();
  }

  loadTopSites() {
    this.loading = true;
    this.error = false;

    this.apiService.getTop10PorPais(this.selectedCountry).pipe(
      catchError(error => {
        console.error('Error al cargar top sitios:', error);
        this.error = true;
        this.loading = false;
        return of([]);
      })
    ).subscribe(sites => {
      this.topSites = sites;
      this.loading = false;
    });
  }

  handleRefresh(event: any) {
    this.loadTopSites();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  getRankingColor(position: number): string {
    switch (position) {
      case 1: return 'warning';  // Gold
      case 2: return 'medium';   // Silver
      case 3: return 'tertiary'; // Bronze
      default: return 'primary';
    }
  }

  getTrophyColor(position: number): string {
    switch (position) {
      case 1: return 'warning';  // Gold
      case 2: return 'medium';   // Silver
      case 3: return 'tertiary'; // Bronze
      default: return 'primary';
    }
  }

  getTotalVisits(): number {
    return this.topSites.reduce((total, site) => total + site.cantidadVisitas, 0);
  }
}
