import { Routes } from '@angular/router';
import { DonateMockComponent } from './pages/donate-mock.component';
import { HomeComponent } from './pages/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'donate-mock', component: DonateMockComponent },
  { path: '**', redirectTo: '' },
];

