import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { WorkoutService } from '../../services/workout.service';
import { Exercise, Workout, WeightUnit } from '@strength-tracker/util';
import { toSignal } from '@angular/core/rxjs-interop';
import { PreferencesService } from '../../services/preferences/preferences.service';
import { WeightUnitSelectorComponent } from '../weight-unit-selector/weight-unit-selector.component';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  finalize,
  of,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';

@Component({
  selector: 'app-workout-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, WeightUnitSelectorComponent],
  templateUrl: './workout-detail.component.html',
})
export class WorkoutDetailComponent {
  private workoutService = inject(WorkoutService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private preferencesService = inject(PreferencesService);
  private updateWorkoutTrigger$ = new BehaviorSubject<void>(undefined);

  // Expose weight unit to template
  WeightUnit = WeightUnit;

  loading = signal(true);
  workout$ = combineLatest([
    this.route.paramMap,
    this.updateWorkoutTrigger$,
  ]).pipe(
    tap(() => this.loading.set(true)),
    tap(() => {
      console.log('workout triggered...');
    }),
    switchMap(([params]) =>
      this.workoutService.getWorkoutById(params.get('id') ?? '').pipe(
        tap(console.log),
        finalize(() => this.loading.set(false))
      )
    ),
    catchError((error) => {
      console.error('Error loading workout', error);
      this.loading.set(false);
      this.router.navigate(['/workouts']);
      return of({ exercises: [] as Exercise[] } as Workout);
    }),
    shareReplay(1)
  );
  workout = toSignal(this.workout$, {
    initialValue: { exercises: [] as Exercise[] } as Workout,
  });

  markAsCompleted(): void {
    this.workoutService
      .updateWorkout(this.workout().id, {
        completedAt: new Date().toISOString(),
      })
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

  // Format weight with the current unit preference
  formatWeight(weight: number): string {
    const currentUnit = this.preferencesService.getWeightUnit();

    // Convert from kg (stored value) to the preferred unit
    const convertedWeight = this.preferencesService.convertWeight(
      weight,
      WeightUnit.KG,
      currentUnit
    );

    // Format with 1 decimal place and the unit
    return `${convertedWeight.toFixed(1)} ${currentUnit}`;
  }

  // Get the current weight unit
  getCurrentWeightUnit(): WeightUnit {
    return this.preferencesService.getWeightUnit();
  }
}
