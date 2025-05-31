import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-crud-base',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/tab4"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ title }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="showAddModal()">
            <ion-icon name="add"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-item *ngFor="let item of items">
          <ion-label>
            <h2>{{ item.nombre }}</h2>
            <p *ngIf="item.descripcion">{{ item.descripcion }}</p>
          </ion-label>
          <ion-button slot="end" (click)="editItem(item)">
            <ion-icon name="create"></ion-icon>
          </ion-button>
          <ion-button slot="end" color="danger" (click)="deleteItem(item._id)">
            <ion-icon name="trash"></ion-icon>
          </ion-button>
        </ion-item>
      </ion-list>

      <!-- Add/Edit Modal -->
      <ion-modal [isOpen]="isModalOpen">
        <ng-template>
          <ion-header>
            <ion-toolbar>
              <ion-title>{{ isEditing ? 'Editar' : 'Agregar' }}</ion-title>
              <ion-buttons slot="end">
                <ion-button (click)="closeModal()">Cerrar</ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <ng-container *ngTemplateOutlet="formTemplate"></ng-container>
              
              <ion-button expand="block" type="submit" [disabled]="form.invalid">
                {{ isEditing ? 'Actualizar' : 'Crear' }}
              </ion-button>
            </form>
          </ion-content>
        </ng-template>
      </ion-modal>
    </ion-content>
  `,
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class CrudBaseComponent {
  @Input() title: string = '';
  @Input() formTemplate: any;
  items: any[] = [];
  form: FormGroup;
  isModalOpen = false;
  isEditing = false;
  currentItem: any = null;

  constructor(
    private formBuilder: FormBuilder,
    private adminService: AdminService
  ) {
    this.form = this.formBuilder.group({});
  }

  showAddModal() {
    this.isEditing = false;
    this.currentItem = null;
    this.form.reset();
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.form.reset();
  }

  editItem(item: any) {
    this.isEditing = true;
    this.currentItem = item;
    this.form.patchValue(item);
    this.isModalOpen = true;
  }

  deleteItem(id: string) {
    // This should be overridden by child components
  }

  onSubmit() {
    if (this.form.invalid) return;

    if (this.isEditing) {
      // Update logic should be implemented in child components
    } else {
      // Create logic should be implemented in child components
    }
  }
}
