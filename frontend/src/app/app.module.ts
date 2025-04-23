import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { TaskFormComponent } from './components/task-form/task-form.component';
import { TaskDashboardComponent } from './components/task-dashboard/task-dashboard.component';
import { DesktopLayoutComponent } from './pages/desktop-layout/desktop-layout.component';
import { MobileTaskPageComponent } from './pages/mobile-task-page/mobile-task-page.component';
import { MobileDashboardPageComponent } from './pages/mobile-dashboard-page/mobile-dashboard-page.component';
import { environment } from '../environments/environment';
import { TasksState } from './store/tasks/tasks.state';

@NgModule({
  declarations: [
    TaskFormComponent,
    DesktopLayoutComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    AppComponent,
    HeaderComponent,
    TaskDashboardComponent,
    MobileTaskPageComponent,
    MobileDashboardPageComponent,
    NgxsModule.forRoot([TasksState], {
      developmentMode: !environment.production
    }),
    NgxsLoggerPluginModule.forRoot({
      disabled: environment.production
    }),
    NgxsReduxDevtoolsPluginModule.forRoot({
      disabled: environment.production
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { } 