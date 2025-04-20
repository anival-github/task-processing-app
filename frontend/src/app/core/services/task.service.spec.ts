import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskService } from './task.service';
import { Task, TaskStatus } from '../../store/task.model';
import { environment } from '../../../environments/environment';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/tasks`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService]
    });
    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('submitTask', () => {
    it('should send POST request with task answer', () => {
      const answer = 'test answer';
      const mockResponse: Task = {
        taskId: '123',
        answer,
        status: TaskStatus.PENDING,
        retries: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      service.submitTask(answer).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ answer });
      req.flush(mockResponse);
    });
  });

  describe('getTasks', () => {
    it('should return all tasks', () => {
      const mockTasks: Task[] = [
        {
          taskId: '123',
          answer: 'test answer',
          status: TaskStatus.PENDING,
          retries: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      service.getTasks().subscribe(tasks => {
        expect(tasks).toEqual(mockTasks);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockTasks);
    });
  });

  describe('getTask', () => {
    it('should return a specific task', () => {
      const taskId = '123';
      const mockTask: Task = {
        taskId,
        answer: 'test answer',
        status: TaskStatus.PENDING,
        retries: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      service.getTask(taskId).subscribe(task => {
        expect(task).toEqual(mockTask);
      });

      const req = httpMock.expectOne(`${apiUrl}/${taskId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTask);
    });
  });

  describe('updateTask', () => {
    it('should update task status', () => {
      const taskId = '123';
      const update = { status: TaskStatus.PROCESSED };
      const mockResponse: Task = {
        taskId,
        answer: 'test answer',
        status: TaskStatus.PROCESSED,
        retries: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      service.updateTask(taskId, update).subscribe(task => {
        expect(task).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/${taskId}`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(update);
      req.flush(mockResponse);
    });
  });
});
