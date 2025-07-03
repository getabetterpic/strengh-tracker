import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WorkoutService } from '../../services/workout.service';
import { Workout } from '../../models/workout.model';

@Component({
  selector: 'app-workout-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto p-4">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">My Workouts</h1>
        <button
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          [routerLink]="['/workouts/new']">
          Add Workout
        </button>
      </div>

      <div *ngIf="loading" class="text-center py-8">
        <p class="text-gray-500">Loading workouts...</p>
      </div>

      <div *ngIf="!loading && workouts.length === 0" class="text-center py-8 bg-gray-50 rounded-lg">
        <p class="text-gray-500 mb-4">No workouts found</p>
        <button
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          [routerLink]="['/workouts/new']">
          Create Your First Workout
        </button>
      </div>

      <div *ngIf="!loading && workouts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div *ngFor="let workout of workouts"
             class="border rounded-lg p-4 hover:shadow-md transition-shadow"
             [class.bg-green-50]="workout.completed"
             [class.border-green-200]="workout.completed">
          <div class="flex justify-between items-start">
            <h2 class="text-xl font-semibold">{{ workout.name }}</h2>
            <span *ngIf="workout.completed" class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
              Completed
            </span>
          </div>
          <p class="text-gray-500 text-sm mb-2">
            {{ workout.date | date:'mediumDate' }}
          </p>
          <p class="mb-4">
            {{ workout.exercises.length }} exercise(s)
          </p>
          <div class="flex justify-end space-x-2">
            <button
              class="text-blue-500 hover:text-blue-700"
              [routerLink]="['/workouts', workout.id]">
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class WorkoutListComponent implements OnInit {
  private workoutService = inject(WorkoutService);

  workouts: Workout[] = [];
  loading = true;

  ngOnInit(): void {
    this.loadWorkouts();
  }

  loadWorkouts(): void {
    this.loading = true;
    this.workoutService.getAllWorkouts().subscribe({
      next: (workouts) => {
        this.workouts = workouts;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading workouts', error);
        this.loading = false;
      }
    });
  }
}
