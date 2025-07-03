import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { WorkoutService } from '../../services/workout.service';
import { Workout, Exercise, Set } from '../../models/workout.model';

@Component({
  selector: 'app-workout-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="container mx-auto p-4">
      <div class="mb-6">
        <h1 class="text-2xl font-bold">{{ isEditMode ? 'Edit Workout' : 'Create Workout' }}</h1>
      </div>

      <form [formGroup]="workoutForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Workout Name</label>
            <input
              type="text"
              id="name"
              formControlName="name"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Upper Body, Leg Day, etc."
            >
            <div *ngIf="workoutForm.get('name')?.invalid && workoutForm.get('name')?.touched" class="text-red-500 text-sm mt-1">
              Workout name is required
            </div>
          </div>

          <div>
            <label for="date" class="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              id="date"
              formControlName="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            <div *ngIf="workoutForm.get('date')?.invalid && workoutForm.get('date')?.touched" class="text-red-500 text-sm mt-1">
              Date is required
            </div>
          </div>

          <div>
            <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              id="notes"
              formControlName="notes"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Any notes about this workout..."
            ></textarea>
          </div>

          <div class="mt-6">
            <div class="flex justify-between items-center mb-2">
              <h2 class="text-lg font-semibold">Exercises</h2>
              <button
                type="button"
                (click)="addExercise()"
                class="text-blue-500 hover:text-blue-700 text-sm"
              >
                + Add Exercise
              </button>
            </div>

            <div formArrayName="exercises" class="space-y-6">
              <div *ngFor="let exercise of exercisesFormArray.controls; let i = index" [formGroupName]="i" class="border p-4 rounded-md">
                <div class="flex justify-between items-center mb-3">
                  <h3 class="font-medium">Exercise #{{ i + 1 }}</h3>
                  <button
                    type="button"
                    (click)="removeExercise(i)"
                    class="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>

                <div class="mb-3">
                  <label [for]="'exercise-name-' + i" class="block text-sm font-medium text-gray-700 mb-1">Exercise Name</label>
                  <input
                    [id]="'exercise-name-' + i"
                    type="text"
                    formControlName="name"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Bench Press, Squat, etc."
                  >
                  <div *ngIf="exercise.get('name')?.invalid && exercise.get('name')?.touched" class="text-red-500 text-sm mt-1">
                    Exercise name is required
                  </div>
                </div>

                <div class="mt-4">
                  <div class="flex justify-between items-center mb-2">
                    <h4 class="text-sm font-medium">Sets</h4>
                    <button
                      type="button"
                      (click)="addSet(i)"
                      class="text-blue-500 hover:text-blue-700 text-xs"
                    >
                      + Add Set
                    </button>
                  </div>

                  <div formArrayName="sets">
                    <div *ngIf="getSetsFormArray(i).controls.length === 0" class="text-gray-500 text-sm py-2">
                      No sets added yet. Click "Add Set" to add one.
                    </div>

                    <table *ngIf="getSetsFormArray(i).controls.length > 0" class="w-full text-sm">
                      <thead>
                        <tr class="border-b">
                          <th class="text-left py-2">#</th>
                          <th class="text-left py-2">Reps</th>
                          <th class="text-left py-2">Weight</th>
                          <th class="text-left py-2">Completed</th>
                          <th class="text-left py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let set of getSetsFormArray(i).controls; let j = index" [formGroupName]="j" class="border-b">
                          <td class="py-2">{{ j + 1 }}</td>
                          <td class="py-2">
                            <input
                              type="number"
                              formControlName="reps"
                              class="w-16 px-2 py-1 border border-gray-300 rounded-md"
                              min="1"
                            >
                          </td>
                          <td class="py-2">
                            <input
                              type="number"
                              formControlName="weight"
                              class="w-16 px-2 py-1 border border-gray-300 rounded-md"
                              min="0"
                              step="0.5"
                            >
                          </td>
                          <td class="py-2">
                            <input
                              type="checkbox"
                              formControlName="completed"
                              class="h-4 w-4 text-blue-600 rounded"
                            >
                          </td>
                          <td class="py-2">
                            <button
                              type="button"
                              (click)="removeSet(i, j)"
                              class="text-red-500 hover:text-red-700 text-xs"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="exercisesFormArray.controls.length === 0" class="text-center py-6 bg-gray-50 rounded-lg mt-4">
              <p class="text-gray-500 mb-2">No exercises added yet</p>
              <button
                type="button"
                (click)="addExercise()"
                class="text-blue-500 hover:text-blue-700"
              >
                Add Your First Exercise
              </button>
            </div>
          </div>

          <div class="mt-4">
            <div class="flex items-center">
              <input
                type="checkbox"
                id="completed"
                formControlName="completed"
                class="h-4 w-4 text-blue-600 rounded"
              >
              <label for="completed" class="ml-2 block text-sm text-gray-700">Mark workout as completed</label>
            </div>
          </div>
        </div>

        <div class="flex justify-between pt-4">
          <button
            type="button"
            (click)="goBack()"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            [disabled]="workoutForm.invalid"
            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isEditMode ? 'Update' : 'Create' }} Workout
          </button>
        </div>
      </form>
    </div>
  `,
})
export class WorkoutFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private workoutService = inject(WorkoutService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  workoutForm: FormGroup;
  isEditMode = false;
  workoutId: string | null = null;

  ngOnInit(): void {
    this.initForm();

    this.route.params.subscribe(params => {
      if (params['id'] && params['id'] !== 'new') {
        this.isEditMode = true;
        this.workoutId = params['id'];
        this.loadWorkout(this.workoutId);
      }
    });
  }

  initForm(): void {
    this.workoutForm = this.fb.group({
      name: ['', Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      notes: [''],
      exercises: this.fb.array([]),
      completed: [false]
    });
  }

  loadWorkout(id: string): void {
    this.workoutService.getWorkoutById(id).subscribe({
      next: (workout) => {
        // Format date for the date input
        const formattedDate = new Date(workout.date).toISOString().split('T')[0];

        // Update form with workout data
        this.workoutForm.patchValue({
          name: workout.name,
          date: formattedDate,
          notes: workout.notes || '',
          completed: workout.completed
        });

        // Clear existing exercises
        while (this.exercisesFormArray.length) {
          this.exercisesFormArray.removeAt(0);
        }

        // Add exercises from the workout
        workout.exercises.forEach(exercise => {
          const exerciseGroup = this.fb.group({
            id: [exercise.id],
            name: [exercise.name, Validators.required],
            sets: this.fb.array([])
          });

          this.exercisesFormArray.push(exerciseGroup);

          // Add sets to the exercise
          const setsArray = exerciseGroup.get('sets') as FormArray;
          exercise.sets.forEach(set => {
            setsArray.push(this.fb.group({
              reps: [set.reps, [Validators.required, Validators.min(1)]],
              weight: [set.weight, [Validators.required, Validators.min(0)]],
              completed: [set.completed]
            }));
          });
        });
      },
      error: (error) => {
        console.error('Error loading workout', error);
        this.router.navigate(['/workouts']);
      }
    });
  }

  get exercisesFormArray(): FormArray {
    return this.workoutForm.get('exercises') as FormArray;
  }

  getSetsFormArray(exerciseIndex: number): FormArray {
    return this.exercisesFormArray.at(exerciseIndex).get('sets') as FormArray;
  }

  addExercise(): void {
    const exerciseGroup = this.fb.group({
      name: ['', Validators.required],
      sets: this.fb.array([])
    });

    this.exercisesFormArray.push(exerciseGroup);
  }

  removeExercise(index: number): void {
    this.exercisesFormArray.removeAt(index);
  }

  addSet(exerciseIndex: number): void {
    const setsArray = this.getSetsFormArray(exerciseIndex);
    setsArray.push(this.fb.group({
      reps: [10, [Validators.required, Validators.min(1)]],
      weight: [0, [Validators.required, Validators.min(0)]],
      completed: [false]
    }));
  }

  removeSet(exerciseIndex: number, setIndex: number): void {
    const setsArray = this.getSetsFormArray(exerciseIndex);
    setsArray.removeAt(setIndex);
  }

  onSubmit(): void {
    if (this.workoutForm.invalid) {
      return;
    }

    const formValue = this.workoutForm.value;
    const workoutData: Partial<Workout> = {
      name: formValue.name,
      date: new Date(formValue.date),
      notes: formValue.notes,
      exercises: formValue.exercises,
      completed: formValue.completed
    };

    if (this.isEditMode && this.workoutId) {
      this.workoutService.updateWorkout(this.workoutId, workoutData).subscribe({
        next: () => {
          this.router.navigate(['/workouts']);
        },
        error: (error) => {
          console.error('Error updating workout', error);
        }
      });
    } else {
      this.workoutService.createWorkout(workoutData as Omit<Workout, 'id'>).subscribe({
        next: () => {
          this.router.navigate(['/workouts']);
        },
        error: (error) => {
          console.error('Error creating workout', error);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/workouts']);
  }
}
