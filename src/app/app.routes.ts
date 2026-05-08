import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home.component';
import { DonateMockComponent } from './pages/donate-mock.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'aportar',
    component: DonateMockComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];