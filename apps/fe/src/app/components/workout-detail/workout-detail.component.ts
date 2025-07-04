import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { WorkoutService } from '../../services/workout.service';
import { Workout } from '@strength-tracker/util';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  finalize,
  from,
  of,
  shareReplay,
  switchMap,
  tap,
  throwError,
} from 'rxjs';

@Component({
  selector: 'app-workout-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './workout-detail.component.html',
})
export class WorkoutDetailComponent {
  private workoutService = inject(WorkoutService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private updateWorkoutTrigger$ = new BehaviorSubject<void>(undefined);

  loading = signal(true);
  workout$ = combineLatest([
    this.route.paramMap,
    this.updateWorkoutTrigger$,
  ]).pipe(
    tap(() => this.loading.set(true)),
    switchMap(([params]) =>
      this.workoutService
        .getWorkoutById(params.get('id') || '')
        .pipe(finalize(() => this.loading.set(false)))
    ),
    catchError((error) => {
      console.error('Error loading workout', error);
      this.loading.set(false);
      this.router.navigate(['/workouts']);
      return of({} as Workout);
    }),
    shareReplay(1)
  );
  workout = toSignal(this.workout$, { initialValue: {} as Workout });

  markAsCompleted(): void {
    this.workoutService
      .updateWorkout(this.workout().id, { completed: true })
      .subscribe({
        next: () => {
          this.updateWorkoutTrigger$.next();
        },
        error: (error) => {
          console.error('Error updating workout', error);
        },
      });
  }

  deleteWorkout(): void {
    if (confirm('Are you sure you want to delete this workout?')) {
      this.workoutService.deleteWorkout(this.workout().id).subscribe({
        next: () => {
          this.router.navigate(['/workouts']);
        },
        error: (error) => {
          console.error('Error deleting workout', error);
        },
      });
    }
  }
}
