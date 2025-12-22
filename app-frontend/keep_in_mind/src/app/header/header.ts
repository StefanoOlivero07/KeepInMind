import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  activeLinkId: number = 0;
  
  getActiveClass(linkId: number): string {
    return this.activeLinkId == linkId ? "active" : "";
  }

  onClickLink(event: Event) {
    this.activeLinkId = parseInt((event.target as HTMLLinkElement).id);
  }
}
