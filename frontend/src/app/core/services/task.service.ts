import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Task } from '../../store/task.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  /**
   * Submit a new task
   * @param answer The task answer to submit
   */
  submitTask(answer: string): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, { answer });
  }

  /**
   * Get all tasks
   */
  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  /**
   * Get a specific task by ID
   * @param taskId The ID of the task to retrieve
   */
  getTask(taskId: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${taskId}`);
  }

  /**
   * Update a task's status
   * @param taskId The ID of the task to update
   * @param task The partial task object with updated fields
   */
  updateTask(taskId: string, task: Partial<Task>): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${taskId}`, task);
  }
}
