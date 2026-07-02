import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SocialSidebarComponent } from './core/components/social-sidebar/social-sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SocialSidebarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'INSTEIP - Aula Virtual';
}
