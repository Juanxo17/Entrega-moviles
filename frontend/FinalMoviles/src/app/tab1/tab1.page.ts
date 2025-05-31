import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonList, 
  IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon, 
  IonAvatar, IonBadge, IonSpinner } from '@ionic/angular/standalone';
import { AuthStateService } from '../services/auth-state.service';
import { ApiService } from '../services/api.service';
import { User } from '../interfaces/user.interface';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { addIcons } from 'ionicons';
import { logOut, statsChart, bookmark, people } from 'ionicons/icons';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,  
  imports: [
    CommonModule,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonItem, 
    IonLabel, 
    IonList, 
    IonButton, 
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon,
    IonAvatar,
    IonBadge,
    IonSpinner
  ],
})
export class Tab1Page implements OnInit {
  currentUser: User | null = null;
  visitCount: number = 0;
  tagCount: number = 0;
  loading: boolean = true;

  constructor(
    private authStateService: AuthStateService,
    private apiService: ApiService
  ) {
    addIcons({ logOut, statsChart, bookmark, people });
  }

  ngOnInit() {
    this.authStateService.currentUser.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadUserActivity();
      } else {
        this.loading = false;
      }
    });
  }

  loadUserActivity() {
    this.loading = true;
    
    const visitas$ = this.apiService.getVisitas().pipe(
      catchError(error => {
        console.error('Error al cargar visitas:', error);
        return of([]);
      })
    );
    
    const tags$ = this.apiService.getTags().pipe(
      catchError(error => {
        console.error('Error al cargar tags:', error);
        return of([]);
      })
    );
    
    forkJoin([visitas$, tags$]).subscribe({
      next: ([visitas, tags]) => {
        this.visitCount = visitas.length;
        this.tagCount = tags.length;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  logout() {
    this.authStateService.logout();
  }
}
