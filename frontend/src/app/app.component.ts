import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngxs/store';
import { FetchTasks } from './store/tasks/tasks.actions';
import { WebSocketService } from './services/websocket.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'frontend';
  private wsStatusSubscription?: Subscription;
  private readonly mobileBreakpoint = 768;

  constructor(
    private store: Store,
    private webSocketService: WebSocketService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (window.innerWidth < this.mobileBreakpoint) {
      this.router.navigate(['/task']);
    } else {
      this.router.navigate(['/']);
    }

    this.store.dispatch(new FetchTasks());
    this.webSocketService.connect();

    this.wsStatusSubscription = this.webSocketService.connectionStatus$.subscribe(isConnected => {
      console.log('WebSocket Connected:', isConnected);
    });
  }

  ngOnDestroy(): void {
    this.webSocketService.disconnect();
    if (this.wsStatusSubscription) {
      this.wsStatusSubscription.unsubscribe();
    }
  }
} 