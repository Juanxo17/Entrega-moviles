import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, 
  IonSkeletonText, IonSpinner, IonButton, IonIcon, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonBackButton, IonButtons } from '@ionic/angular/standalone';
import { ApiService } from '../../services/api.service';
import { Plato } from 'src/app/interfaces/plato.interface';
import { catchError } from 'rxjs';
import { of } from 'rxjs';
import { addIcons } from 'ionicons';
import { restaurant, arrowBack, location, pricetag, globe } from 'ionicons/icons';

@Component({
  selector: 'app-dish-detail',
  templateUrl: './dish-detail.page.html',
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
  `],
  standalone: true,
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
    IonCardContent,
    IonBackButton,
    IonButtons
  ]
})
export class DishDetailPage implements OnInit {
  platoId: string = '';
  plato: Plato | null = null;
  sitioNombre: string = '';
  paisNombre: string = '';
  loading: boolean = true;
  error: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService  ) {
    addIcons({ restaurant, arrowBack, location, pricetag, globe });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.platoId = id;
        this.loadData();
      } else {
        this.router.navigate(['/tabs/tab2']);
      }
    });
  }
  loadData() {
    this.loading = true;
    this.error = false;

    this.apiService.getPlatoById(this.platoId).pipe(
      catchError(error => {
        console.error('Error al cargar plato:', error);
        this.error = true;
        this.loading = false;
        return of(null);
      })
    ).subscribe(plato => {
      if (plato) {
        this.plato = plato;
        
        // Get sitio name if available
        if (typeof plato.sitio === 'object' && plato.sitio) {
          this.sitioNombre = plato.sitio.nombre;
        } else if (typeof plato.sitio === 'string') {
          this.apiService.getSitioById(plato.sitio).subscribe(sitio => {
            if (sitio) {
              this.sitioNombre = sitio.nombre;
            }
          });
        }
        
        // Get país name if available
        if (typeof plato.pais === 'object' && plato.pais) {
          this.paisNombre = plato.pais.nombre;
        } else if (typeof plato.pais === 'string') {
          this.apiService.getPaisById(plato.pais).subscribe(pais => {
            if (pais) {
              this.paisNombre = pais.nombre;
            }
          });
        }

        this.loading = false;
      } else {
        this.loading = false;
      }
    });
  }
  getSitioId(): string {
    if (!this.plato) return '';
    
    if (typeof this.plato.sitio === 'string') {
      return this.plato.sitio;
    } else if (this.plato.sitio && '_id' in this.plato.sitio) {
      return this.plato.sitio._id || '';
    }
    
    return '';
  }
}
