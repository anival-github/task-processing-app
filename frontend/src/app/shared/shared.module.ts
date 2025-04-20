import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from './components/status-badge/status-badge.component';



@NgModule({
  declarations: [
    LoadingSpinnerComponent,
    StatusBadgeComponent
  ],
  imports: [
    CommonModule
  ]
})
export class SharedModule { }
