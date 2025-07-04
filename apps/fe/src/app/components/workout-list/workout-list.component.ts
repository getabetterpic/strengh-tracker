import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WorkoutService } from '../../services/workout.service';
import { Workout } from '@strength-tracker/util';

@Component({
  selector: 'app-workout-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './workout-list.component.html',
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
