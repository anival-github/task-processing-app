import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MenuComponent } from '../menu/menu.component';
import { HeaderComponent } from '../header/header.component';
import { LogoContainerComponent } from '../logo-container/logo-container.component';
import { Store } from '@ngxs/store';
import { AddTask } from '../../store/tasks/tasks.actions';

@Component({
  selector: 'app-task-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MenuComponent,
    HeaderComponent,
    LogoContainerComponent
  ],
  templateUrl: './task-page.component.html',
  styleUrls: ['./task-page.component.scss']
})
export class TaskPageComponent implements OnInit {
  answer: string = '';
  wordCount: number = 0;
  maxWords: number = 200;
  isMenuOpen: boolean = false;

  constructor(private store: Store) {}

  ngOnInit() {
    this.isMenuOpen = false;
  }

  onAnswerChange(event: any) {
    this.answer = event.target.value;
    this.wordCount = this.answer.length;
  }

  onSubmit() {
    if (this.answer && this.answer.trim().length > 0) {
      this.store.dispatch(new AddTask({ answer: this.answer.trim() }));
      this.answer = '';
      this.wordCount = 0;
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }
} 