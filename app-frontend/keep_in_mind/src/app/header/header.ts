import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  @Output() logoutEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  activeSection: number = 0;

  onClickLink(event: Event) {
    this.activeSection = parseInt((event.target as HTMLLinkElement).id);
  }

  onClickLogout() {
    this.logoutEvent.emit(true);
  }
}
