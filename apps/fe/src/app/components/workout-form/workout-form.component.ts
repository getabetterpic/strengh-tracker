import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { WorkoutService } from '../../services/workout.service';
import { Workout, Exercise, Set, WeightUnit } from '@strength-tracker/util';
import { PreferencesService } from '../../services/preferences/preferences.service';
import { WeightUnitSelectorComponent } from '../weight-unit-selector/weight-unit-selector.component';

@Component({
  selector: 'app-workout-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    WeightUnitSelectorComponent,
  ],
  templateUrl: './workout-form.component.html',
})
export class WorkoutFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private workoutService = inject(WorkoutService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private preferencesService = inject(PreferencesService);

  // Expose weight unit to template
  WeightUnit = WeightUnit;

  workoutForm!: FormGroup;
  isEditMode = false;
  workoutId: string | null = null;

  ngOnInit(): void {
    this.initForm();

    this.route.params.subscribe((params) => {
      if (params['id'] && params['id'] !== 'new') {
        this.isEditMode = true;
        this.workoutId = params['id'];
        if (this.workoutId) {
          this.loadWorkout(this.workoutId);
        }
      }
    });
  }

  initForm(): void {
    this.workoutForm = this.fb.group({
      name: ['', Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      notes: [''],
      exercises: this.fb.array([]),
      completed: [false],
    });
  }

  loadWorkout(id: string): void {
    this.workoutService.getWorkoutById(id).subscribe({
      next: (workout) => {
        // Format date for the date input
        const formattedDate = new Date(workout.date)
          .toISOString()
          .split('T')[0];

        // Update form with workout data
        this.workoutForm.patchValue({
          name: workout.name,
          date: formattedDate,
          notes: workout.notes || '',
          completedAt: workout.completedAt,
        });

        // Clear existing exercises
        while (this.exercisesFormArray.length) {
          this.exercisesFormArray.removeAt(0);
        }

        // Add exercises from the workout
        workout.exercises.forEach((exercise) => {
          const exerciseGroup = this.fb.group({
            id: [exercise.id],
            name: [exercise.name, Validators.required],
            sets: this.fb.array([]),
          });

          this.exercisesFormArray.push(exerciseGroup);

          // Add sets to the exercise
          const setsArray = exerciseGroup.get('sets') as FormArray;
          exercise.sets.forEach((set) => {
            // Convert weight from kg to the current unit for display
            const displayWeight = this.convertFromKg(set.weight);

            setsArray.push(
              this.fb.group({
                reps: [set.reps, [Validators.required, Validators.min(1)]],
                weight: [
                  displayWeight,
                  [Validators.required, Validators.min(0)],
                ],
                completed: [set.completed],
              })
            );
          });
        });
      },
      error: (error) => {
        console.error('Error loading workout', error);
        this.router.navigate(['/workouts']);
      },
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
      sets: this.fb.array([]),
    });

    this.exercisesFormArray.push(exerciseGroup);
  }

  removeExercise(index: number): void {
    this.exercisesFormArray.removeAt(index);
  }

  addSet(exerciseIndex: number): void {
    const setsArray = this.getSetsFormArray(exerciseIndex);
    setsArray.push(
      this.fb.group({
        reps: [10, [Validators.required, Validators.min(1)]],
        weight: [0, [Validators.required, Validators.min(0)]],
        completed: [false],
      })
    );
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

    // Convert weights from current unit to kg for storage
    const exercises = formValue.exercises.map((exercise: any) => {
      return {
        ...exercise,
        sets: exercise.sets.map((set: any) => {
          return {
            ...set,
            weight: this.convertToKg(set.weight),
          };
        }),
      };
    });

    const workoutData: Partial<Workout> = {
      name: formValue.name,
      date: new Date(formValue.date).toISOString().slice(0, 10),
      notes: formValue.notes,
      exercises: exercises,
      completedAt: formValue.completedAt || null,
    };

    if (this.isEditMode && this.workoutId) {
      this.workoutService.updateWorkout(this.workoutId, workoutData).subscribe({
        next: () => {
          this.router.navigate(['/workouts']);
        },
        error: (error) => {
          console.error('Error updating workout', error);
        },
      });
    } else {
      this.workoutService
        .createWorkout(workoutData as Omit<Workout, 'id'>)
        .subscribe({
          next: () => {
            this.router.navigate(['/workouts']);
          },
          error: (error) => {
            console.error('Error creating workout', error);
          },
        });
    }
  }

  goBack(): void {
    this.router.navigate(['/workouts']);
  }

  // Get the current weight unit
  getCurrentWeightUnit(): WeightUnit {
    return this.preferencesService.getWeightUnit();
  }

  // Convert weight from the current unit to kg for storage
  convertToKg(weight: number): number {
    const currentUnit = this.getCurrentWeightUnit();
    if (currentUnit === WeightUnit.KG) {
      return weight;
    }
    // Convert from lbs to kg
    return this.preferencesService.convertWeight(
      weight,
      WeightUnit.LBS,
      WeightUnit.KG
    );
  }

  // Convert weight from kg to the current unit for display
  convertFromKg(weight: number): number {
    const currentUnit = this.getCurrentWeightUnit();
    if (currentUnit === WeightUnit.KG) {
      return weight;
    }
    // Convert from kg to lbs
    return this.preferencesService.convertWeight(
      weight,
      WeightUnit.KG,
      WeightUnit.LBS
    );
  }

  // Format weight with the appropriate unit
  formatWeight(weight: number): string {
    const currentUnit = this.getCurrentWeightUnit();
    const convertedWeight = this.convertFromKg(weight);
    return `${convertedWeight.toFixed(1)} ${currentUnit}`;
  }
}
