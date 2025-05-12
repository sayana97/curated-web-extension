import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  // Logic for the sidebar can be added here
  logout() {
    // Implement logout logic
    console.log('User logged out');
  }
}
