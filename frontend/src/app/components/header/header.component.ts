import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Input() showMenuButton: boolean = false;
  @Output() menuToggle = new EventEmitter<void>();

  onMenuButtonClick(): void {
    this.menuToggle.emit();
  }
}
