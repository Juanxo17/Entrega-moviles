import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, 
  IonSkeletonText, IonSpinner, IonButton, IonIcon, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonBackButton, IonButtons, IonGrid, IonRow, IonCol,
  IonCardSubtitle } from '@ionic/angular/standalone';
import { ApiService,  Sitio } from '../../services/api.service';
import { Famoso } from 'src/app/interfaces/famoso.interface';
import { Ciudad } from 'src/app/interfaces/ciudad.interface';
import { catchError, forkJoin } from 'rxjs';
import { of } from 'rxjs';
import { addIcons } from 'ionicons';
import { business, people, location, restaurant, arrowBack } from 'ionicons/icons';

@Component({
  selector: 'app-city-detail',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/tab2"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ ciudad?.nombre || 'Detalles de Ciudad' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div *ngIf="loading" class="ion-padding ion-text-center">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Cargando información...</p>
      </div>

      <div *ngIf="error" class="ion-padding ion-text-center">
        <ion-icon name="alert-circle-outline" size="large" color="danger"></ion-icon>
        <p>Error al cargar la información. Intenta de nuevo.</p>
        <ion-button (click)="loadData()">Reintentar</ion-button>
      </div>

      <div *ngIf="!loading && !error && ciudad">
        <ion-card>
          <ion-card-header>
            <ion-card-title>{{ ciudad.nombre }}</ion-card-title>
            <ion-card-subtitle *ngIf="paisNombre">{{ paisNombre }}</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <p>Explora los sitios, personajes famosos y más de {{ ciudad.nombre }}.</p>
          </ion-card-content>
        </ion-card>

        <ion-grid>
          <ion-row>
            <ion-col size="12">
              <ion-card>
                <ion-card-header>
                  <ion-card-title>
                    <ion-icon name="location"></ion-icon> Sitios Turísticos
                  </ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  <ion-list lines="none" *ngIf="sitios.length > 0">
                    <ion-item *ngFor="let sitio of sitios" [routerLink]="['/tabs/sitio', sitio._id]">
                      <ion-label>
                        {{ sitio.nombre }}
                      </ion-label>
                      <ion-icon name="chevron-forward" slot="end"></ion-icon>
                    </ion-item>
                  </ion-list>
                  <p *ngIf="sitios.length === 0" class="ion-text-center">
                    No hay sitios registrados para esta ciudad.
                  </p>
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>

          <ion-row>
            <ion-col size="12">
              <ion-card>
                <ion-card-header>
                  <ion-card-title>
                    <ion-icon name="people"></ion-icon> Personajes Famosos
                  </ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  <ion-list lines="none" *ngIf="famosos.length > 0">
                    <ion-item *ngFor="let famoso of famosos" [routerLink]="['/tabs/famoso', famoso._id]">                      <ion-label>
                        {{ famoso.nombre }}
                        <p *ngIf="famoso.actividadFama">{{ famoso.actividadFama }}</p>
                      </ion-label>
                      <ion-icon name="chevron-forward" slot="end"></ion-icon>
                    </ion-item>
                  </ion-list>
                  <p *ngIf="famosos.length === 0" class="ion-text-center">
                    No hay personajes famosos registrados para esta ciudad.
                  </p>
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>
    </ion-content>
  `,
  styles: [`
    ion-content {
      --padding-top: 16px;
      --padding-bottom: 16px;
      --padding-start: 16px;
      --padding-end: 16px;
    }
    ion-card {
      margin-bottom: 16px;
    }
  `],  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonSkeletonText,
    IonSpinner,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonBackButton,
    IonButtons,
    IonGrid,
    IonRow,
    IonCol
  ]
})
export class CityDetailPage implements OnInit {
  ciudadId: string = '';
  ciudad: Ciudad | null = null;
  paisNombre: string = '';
  sitios: Sitio[] = [];
  famosos: Famoso[] = [];
  loading: boolean = true;
  error: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {
    addIcons({ business, people, location, restaurant, arrowBack });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.ciudadId = id;
        this.loadData();
      } else {
        this.router.navigate(['/tabs/tab2']);
      }
    });
  }

  loadData() {
    this.loading = true;
    this.error = false;

    this.apiService.getCiudadById(this.ciudadId).pipe(
      catchError(error => {
        console.error('Error al cargar ciudad:', error);
        this.error = true;
        this.loading = false;
        return of(null);
      })
    ).subscribe(ciudad => {
      if (ciudad) {
        this.ciudad = ciudad;
        
        // Get país name if available
        if (typeof ciudad.pais === 'object' && ciudad.pais) {
          this.paisNombre = ciudad.pais.nombre;
        } else if (typeof ciudad.pais === 'string') {
          this.apiService.getPaisById(ciudad.pais).subscribe(pais => {
            if (pais) {
              this.paisNombre = pais.nombre;
            }
          });
        }

        // Load related data
        const sitios$ = this.apiService.getSitios().pipe(
          catchError(error => {
            console.error('Error al cargar sitios:', error);
            return of([]);
          })
        );

        const famosos$ = this.apiService.getFamosos().pipe(
          catchError(error => {
            console.error('Error al cargar famosos:', error);
            return of([]);
          })
        );

        forkJoin([sitios$, famosos$]).subscribe(([sitios, famosos]) => {
          // Filter sitios by ciudad
          this.sitios = sitios.filter(sitio => {
            if (typeof sitio.ciudad === 'string') {
              return sitio.ciudad === this.ciudadId;
            } else {
              return sitio.ciudad._id === this.ciudadId;
            }
          });          // Filter famosos by ciudadNacimiento
          this.famosos = famosos.filter(famoso => {
            if (typeof famoso.ciudadNacimiento === 'string') {
              return famoso.ciudadNacimiento === this.ciudadId;
            } else {
              return famoso.ciudadNacimiento._id === this.ciudadId;
            }
          });

          this.loading = false;
        });
      } else {
        this.loading = false;
      }
    });
  }
}
