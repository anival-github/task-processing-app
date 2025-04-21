import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { environment } from '../../environments/environment';
import { UpdateTaskStatus } from '../store/tasks/tasks.actions';
import { Task } from '../models/task.model';
import { Subject, Observable, timer, Subscription } from 'rxjs';
import { retryWhen, delayWhen } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket!: WebSocket;
  private messageSubject = new Subject<any>();
  private connectionStatusSubject = new Subject<boolean>();
  private reconnectSubscription?: Subscription;

  public messages$: Observable<any> = this.messageSubject.asObservable();
  public connectionStatus$: Observable<boolean> = this.connectionStatusSubject.asObservable();

  constructor(private store: Store) { }

  public connect(): void {
    // Ensure previous connection and reconnect attempts are closed
    this.disconnect(); 

    const wsUrl = environment.wsUrl || 'ws://localhost:8081';
    console.log(`WebSocketService: Connecting to ${wsUrl}...`);
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = (event) => {
      console.log('WebSocketService: Connection opened', event);
      this.connectionStatusSubject.next(true);
      // Reset reconnect delay on successful connection
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('WebSocketService: Message received', message);
        this.messageSubject.next(message);

        // Dispatch action if it looks like a task update
        if (message && message.taskId && message.status) {
          this.store.dispatch(new UpdateTaskStatus(message as Task));
        } else {
          console.warn('WebSocketService: Received message is not a task update', message);
        }
      } catch (e) {
        console.error('WebSocketService: Error parsing message data', event.data, e);
      }
    };

    this.socket.onerror = (event) => {
      console.error('WebSocketService: Error observed', event);
      this.connectionStatusSubject.next(false);
      // Error event will likely be followed by onclose
    };

    this.socket.onclose = (event) => {
      console.log(`WebSocketService: Connection closed. Code: ${event.code}, Reason: ${event.reason}. Reconnecting...`, event);
      this.connectionStatusSubject.next(false);
      this.scheduleReconnect();
    };
  }

  public disconnect(): void {
    if (this.reconnectSubscription) {
        this.reconnectSubscription.unsubscribe();
        this.reconnectSubscription = undefined;
    }
    if (this.socket) {
      this.socket.close();
      console.log('WebSocketService: Disconnected manually.');
    }
  }

  private scheduleReconnect(): void {
    // Simple reconnect after 5 seconds
    // More sophisticated strategies (exponential backoff) could be used here
    if (!this.reconnectSubscription) {
        this.reconnectSubscription = timer(5000).subscribe(() => {
            console.log('WebSocketService: Attempting to reconnect...');
            this.connect();
        });
    }
  }

  public sendMessage(message: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
      console.log('WebSocketService: Message sent', message);
    } else {
      console.error('WebSocketService: Cannot send message, socket not open.');
    }
  }
} 