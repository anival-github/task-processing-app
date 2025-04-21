import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Task } from '../models/task.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /** GET tasks from the server */
  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/tasks`)
      .pipe(
        tap(tasks => console.log('Fetched tasks:', tasks)),
        catchError(this.handleError<Task[]>('getTasks', []))
      );
  }

  /** POST: add a new task answer to the server */
  submitTask(taskData: { taskId: string; answer: string }): Observable<any> { // Backend might return simple success/task id
    return this.http.post<any>(`${this.apiUrl}/tasks`, taskData)
      .pipe(
        tap(response => console.log(`Submitted task ${taskData.taskId} response:`, response)),
        catchError(this.handleError<any>('submitTask'))
      );
  }

  // Basic error handler
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`, error);
      // Let the app keep running by returning an empty result or rethrow
      // return of(result as T);
      return throwError(() => new Error(`${operation} failed: ${error.message || 'Server error'}`));
    };
  }
}
