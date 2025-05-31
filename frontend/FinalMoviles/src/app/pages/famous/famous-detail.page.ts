import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, 
  IonSkeletonText, IonSpinner, IonButton, IonIcon, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonBackButton, IonButtons, IonGrid, IonRow, IonCol,
  IonCardSubtitle, AlertController, ToastController } from '@ionic/angular/standalone';
import { ApiService} from '../../services/api.service';
import { AuthStateService } from '../../services/auth-state.service';
import { Famoso } from 'src/app/interfaces/famoso.interface';
import { User } from 'src/app/interfaces/user.interface';
import { catchError } from 'rxjs';
import { of } from 'rxjs';
import { addIcons } from 'ionicons';
import { people, arrowBack, business, camera } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-famous-detail',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/tab2"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ famoso?.nombre || 'Personaje Famoso' }}</ion-title>
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

      <div *ngIf="!loading && !error && famoso">
        <ion-card>
          <ion-card-header>
            <ion-card-title>{{ famoso.nombre }}</ion-card-title>
            <ion-card-subtitle *ngIf="famoso.actividadFama">{{ famoso.actividadFama }}</ion-card-subtitle>
          </ion-card-header>          <ion-card-content>
            <p>Personaje famoso de {{ ciudadNombre }}</p>

            <div class="ion-padding-top">
              <ion-item lines="none">
                <ion-icon name="business" slot="start"></ion-icon>
                <ion-label>
                  <h3>Ciudad de Nacimiento</h3>
                  <p>{{ ciudadNombre }}</p>
                </ion-label>
              </ion-item>
            </div>

            <div class="ion-padding-top">
              <ion-button expand="block" fill="outline" (click)="registrarEncuentro()">
                <ion-icon name="camera" slot="start"></ion-icon>
                Registrar Encuentro
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>
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
    IonIcon,    IonCard,
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
export class FamousDetailPage implements OnInit {
  famosoId: string = '';
  famoso: Famoso | null = null;
  ciudadNombre: string = '';
  loading: boolean = true;
  error: boolean = false;
  currentUser: User | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private authStateService: AuthStateService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({ people, arrowBack, business, camera });
  }
  ngOnInit() {
    this.authStateService.currentUser.subscribe(user => {
      this.currentUser = user;
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.famosoId = id;
        this.loadData();
      } else {
        this.router.navigate(['/tabs/tab2']);
      }
    });
  }

  loadData() {
    this.loading = true;
    this.error = false;

    this.apiService.getFamosoById(this.famosoId).pipe(
      catchError(error => {
        console.error('Error al cargar famoso:', error);
        this.error = true;
        this.loading = false;
        return of(null);
      })
    ).subscribe(famoso => {
      if (famoso) {
        this.famoso = famoso;
          // Get ciudad name if available
        if (typeof famoso.ciudadNacimiento === 'object' && famoso.ciudadNacimiento) {
          this.ciudadNombre = famoso.ciudadNacimiento.nombre;
        } else if (typeof famoso.ciudadNacimiento === 'string') {
          this.apiService.getCiudadById(famoso.ciudadNacimiento).subscribe(ciudad => {
            if (ciudad) {
              this.ciudadNombre = ciudad.nombre;
            }
          });
        }

        this.loading = false;      } else {
        this.loading = false;
      }
    });
  }

  async registrarEncuentro() {
    if (!this.currentUser) {
      const toast = await this.toastController.create({
        message: 'Debes iniciar sesión para registrar un encuentro',
        duration: 2000,
        position: 'top',
        color: 'warning'
      });
      await toast.present();
      return;
    }

    if (!this.famoso) {
      const toast = await this.toastController.create({
        message: 'Error: No se pudo cargar la información del personaje',
        duration: 2000,
        position: 'top',
        color: 'danger'
      });
      await toast.present();
      return;
    }

    try {
      // Get current location
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      // Take a photo
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
      });

      // Create the encounter
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      this.apiService.createEncuentro(
        this.famoso._id!,
        image.base64String,
        location
      ).pipe(
        catchError(async error => {
          console.error('Error al crear encuentro:', error);
          const toast = await this.toastController.create({
            message: 'Error al registrar el encuentro',
            duration: 2000,
            position: 'top',
            color: 'danger'
          });
          await toast.present();
          return of(null);
        })
      ).subscribe(async response => {
        if (response) {
          const toast = await this.toastController.create({
            message: `Encuentro con ${this.famoso!.nombre} registrado correctamente`,
            duration: 3000,
            position: 'top',
            color: 'success'
          });
          await toast.present();
        }
      });

    } catch (error) {
      console.error('Error al registrar encuentro:', error);
      
      let errorMessage = 'Error al registrar el encuentro';
      if (error && typeof error === 'object' && 'message' in error) {
        if ((error as any).message.includes('User cancelled')) {
          errorMessage = 'Registro de encuentro cancelado';
        } else if ((error as any).message.includes('location')) {
          errorMessage = 'No se pudo obtener la ubicación';
        }
      }

      const toast = await this.toastController.create({
        message: errorMessage,
        duration: 2000,
        position: 'top',
        color: 'warning'
      });
      await toast.present();
    }
  }
}
