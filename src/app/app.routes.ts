import { Routes } from '@angular/router';
import { MenuComponent } from './components/menu/menu/menu.component';
import { EditorComponent } from './components/editor/editor/editor.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: MenuComponent
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
