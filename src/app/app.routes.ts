import { Routes } from '@angular/router';
import { GameComponent } from './components/game/00-game/game.component';
import { EditorComponent } from './components/editor/00-editor/editor.component';

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
