import { Route } from '@angular/router';
import { WorkoutListComponent } from './components/workout-list/workout-list.component';
import { WorkoutFormComponent } from './components/workout-form/workout-form.component';
import { WorkoutDetailComponent } from './components/workout-detail/workout-detail.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { authGuard } from './services/auth/auth.guard';
import { publicGuard } from './services/auth/public.guard';

export const appRoutes: Route[] = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [publicGuard] },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [publicGuard],
  },
  {
    path: 'workouts',
    component: WorkoutListComponent,
    canActivate: [authGuard],
  },
  {
    path: 'workouts/new',
    component: WorkoutFormComponent,
    canActivate: [authGuard],
  },
  {
    path: 'workouts/:id',
    component: WorkoutDetailComponent,
    canActivate: [authGuard],
  },
  {
    path: 'workouts/:id/edit',
    component: WorkoutFormComponent,
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'workouts' },
];
