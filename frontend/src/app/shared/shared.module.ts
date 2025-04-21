import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from './components/status-badge/status-badge.component';
import { HeaderComponent } from './components/header/header.component';

@NgModule({
  declarations: [
    LoadingSpinnerComponent,
    StatusBadgeComponent,
    HeaderComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    LoadingSpinnerComponent,
    StatusBadgeComponent,
    HeaderComponent
  ]
})
export class SharedModule { }
