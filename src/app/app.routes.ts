import { Routes } from '@angular/router';
import { GameComponent } from './components/game/game/game.component';
import { EditorComponent } from './components/editor/editor/editor.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: GameComponent
  },
  {
    path: 'editor',
    component: EditorComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
