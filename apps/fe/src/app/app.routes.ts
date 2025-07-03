import { Route } from '@angular/router';
import { WorkoutListComponent } from './components/workout-list/workout-list.component';
import { WorkoutFormComponent } from './components/workout-form/workout-form.component';
import { WorkoutDetailComponent } from './components/workout-detail/workout-detail.component';

export const appRoutes: Route[] = [
  { path: '', redirectTo: 'workouts', pathMatch: 'full' },
  { path: 'workouts', component: WorkoutListComponent },
  { path: 'workouts/new', component: WorkoutFormComponent },
  { path: 'workouts/:id', component: WorkoutDetailComponent },
  { path: 'workouts/:id/edit', component: WorkoutFormComponent },
  { path: '**', redirectTo: 'workouts' }
];
