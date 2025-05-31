import { Component, EnvironmentInjector, inject, OnInit } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { person, heart, bookmark, settings, earth, trophy } from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { AuthStateService } from '../services/auth-state.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, CommonModule],
})
export class TabsPage implements OnInit {
  public environmentInjector = inject(EnvironmentInjector);
  isAdmin = false;
  constructor(private authStateService: AuthStateService) {
    addIcons({ person, heart, bookmark, settings, earth, trophy });
  }

  ngOnInit() {
    this.authStateService.currentUser.subscribe(user => {
      this.isAdmin = user?.rol === 'ADMIN';
    });
  }
}
