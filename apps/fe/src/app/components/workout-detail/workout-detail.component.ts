import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { WorkoutService } from '../../services/workout.service';
import { Workout } from '../../models/workout.model';

@Component({
  selector: 'app-workout-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto p-4">
      <div *ngIf="loading" class="text-center py-8">
        <p class="text-gray-500">Loading workout details...</p>
      </div>

      <div *ngIf="!loading && workout">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h1 class="text-2xl font-bold">{{ workout.name }}</h1>
            <p class="text-gray-500">{{ workout.date | date:'mediumDate' }}</p>
          </div>
          <div class="flex space-x-2">
            <button
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              [routerLink]="['/workouts']">
              Back to Workouts
            </button>
            <button
              class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              [routerLink]="['/workouts', workout.id, 'edit']">
              Edit Workout
            </button>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div class="flex justify-between items-center mb-2">
            <h2 class="text-lg font-semibold">Status</h2>
            <span
              [class.bg-green-100]="workout.completed"
              [class.text-green-800]="workout.completed"
              [class.bg-yellow-100]="!workout.completed"
              [class.text-yellow-800]="!workout.completed"
              class="px-3 py-1 rounded-full text-sm font-medium">
              {{ workout.completed ? 'Completed' : 'In Progress' }}
            </span>
          </div>

          <div *ngIf="workout.notes" class="mt-4">
            <h3 class="text-md font-medium mb-2">Notes</h3>
            <p class="text-gray-700 whitespace-pre-line">{{ workout.notes }}</p>
          </div>
        </div>

        <div class="mb-6">
          <h2 class="text-xl font-semibold mb-4">Exercises</h2>

          <div *ngIf="workout.exercises.length === 0" class="text-center py-6 bg-gray-50 rounded-lg">
            <p class="text-gray-500">No exercises in this workout</p>
          </div>

          <div *ngFor="let exercise of workout.exercises; let i = index" class="bg-white rounded-lg shadow-sm p-4 mb-4">
            <h3 class="text-lg font-medium mb-3">{{ i + 1 }}. {{ exercise.name }}</h3>

            <div *ngIf="exercise.sets.length === 0" class="text-center py-4 bg-gray-50 rounded-lg">
              <p class="text-gray-500">No sets for this exercise</p>
            </div>

            <table *ngIf="exercise.sets.length > 0" class="w-full">
              <thead>
                <tr class="border-b text-left">
                  <th class="pb-2 pr-4">Set</th>
                  <th class="pb-2 pr-4">Reps</th>
                  <th class="pb-2 pr-4">Weight</th>
                  <th class="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let set of exercise.sets; let j = index" class="border-b">
                  <td class="py-2 pr-4">{{ j + 1 }}</td>
                  <td class="py-2 pr-4">{{ set.reps }}</td>
                  <td class="py-2 pr-4">{{ set.weight }}</td>
                  <td class="py-2">
                    <span
                      [class.bg-green-100]="set.completed"
                      [class.text-green-800]="set.completed"
                      [class.bg-gray-100]="!set.completed"
                      [class.text-gray-800]="!set.completed"
                      class="px-2 py-1 rounded-full text-xs font-medium">
                      {{ set.completed ? 'Completed' : 'Not Done' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="flex justify-between">
          <button
            class="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
            (click)="deleteWorkout()">
            Delete Workout
          </button>

          <button
            *ngIf="!workout.completed"
            class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            (click)="markAsCompleted()">
            Mark as Completed
          </button>
        </div>
      </div>
    </div>
  `,
})
export class WorkoutDetailComponent implements OnInit {
  private workoutService = inject(WorkoutService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  workout: Workout | null = null;
  loading = true;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadWorkout(params['id']);
      }
    });
  }

  loadWorkout(id: string): void {
    this.loading = true;
    this.workoutService.getWorkoutById(id).subscribe({
      next: (workout) => {
        this.workout = workout;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading workout', error);
        this.loading = false;
        this.router.navigate(['/workouts']);
      }
    });
  }

  markAsCompleted(): void {
    if (!this.workout) return;

    this.workoutService.updateWorkout(this.workout.id, { completed: true }).subscribe({
      next: (updatedWorkout) => {
        this.workout = updatedWorkout;
      },
      error: (error) => {
        console.error('Error updating workout', error);
      }
    });
  }

  deleteWorkout(): void {
    if (!this.workout) return;

    if (confirm('Are you sure you want to delete this workout?')) {
      this.workoutService.deleteWorkout(this.workout.id).subscribe({
        next: () => {
          this.router.navigate(['/workouts']);
        },
        error: (error) => {
          console.error('Error deleting workout', error);
        }
      });
    }
  }
}
