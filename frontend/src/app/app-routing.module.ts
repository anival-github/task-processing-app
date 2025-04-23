import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DesktopLayoutComponent } from './pages/desktop-layout/desktop-layout.component';
import { MobileTaskPageComponent } from './pages/mobile-task-page/mobile-task-page.component';
import { MobileDashboardPageComponent } from './pages/mobile-dashboard-page/mobile-dashboard-page.component';

const routes: Routes = [
  { path: '', component: DesktopLayoutComponent },
  { path: 'task', component: MobileTaskPageComponent },
  { path: 'dashboard', component: MobileDashboardPageComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 