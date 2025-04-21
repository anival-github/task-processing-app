import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngxs/store';
import { FetchTasks } from './store/tasks/tasks.actions';
import { WebSocketService } from './services/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'frontend';
  private wsStatusSubscription?: Subscription;

  constructor(
    private store: Store,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit(): void {
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