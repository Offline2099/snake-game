import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { Observable, filter, map } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, AsyncPipe],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

  isEditorOpen$: Observable<boolean>;

  constructor(private router: Router) {
    this.isEditorOpen$ = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => event.url.includes('/editor'))
    );     
  }
  
}
