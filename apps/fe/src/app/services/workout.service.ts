import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Workout, Exercise, Set } from '@strength-tracker/util';

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private apiUrl = '/api/workouts';
  private http = inject(HttpClient);

  // Workout operations
  getAllWorkouts(): Observable<Workout[]> {
    return this.http.get<Workout[]>(this.apiUrl);
  }

  getWorkoutById(id: string): Observable<Workout> {
    return this.http.get<Workout>(`${this.apiUrl}/${id}`);
  }

  createWorkout(workout: Omit<Workout, 'id'>): Observable<Workout> {
    return this.http.post<Workout>(this.apiUrl, workout);
  }

  updateWorkout(id: string, workout: Partial<Workout>): Observable<Workout> {
    return this.http.put<Workout>(`${this.apiUrl}/${id}`, workout);
  }

  deleteWorkout(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${id}`);
  }

  // Exercise operations
  addExerciseToWorkout(workoutId: string, exercise: Omit<Exercise, 'id'>): Observable<Workout> {
    return this.http.post<Workout>(`${this.apiUrl}/${workoutId}/exercises`, exercise);
  }

  updateExercise(workoutId: string, exerciseId: string, exercise: Partial<Exercise>): Observable<Workout> {
    return this.http.put<Workout>(`${this.apiUrl}/${workoutId}/exercises/${exerciseId}`, exercise);
  }

  deleteExercise(workoutId: string, exerciseId: string): Observable<Workout> {
    return this.http.delete<Workout>(`${this.apiUrl}/${workoutId}/exercises/${exerciseId}`);
  }

  // Set operations
  addSetToExercise(workoutId: string, exerciseId: string, set: Set): Observable<Workout> {
    return this.http.post<Workout>(`${this.apiUrl}/${workoutId}/exercises/${exerciseId}/sets`, set);
  }

  updateSet(workoutId: string, exerciseId: string, setIndex: number, set: Partial<Set>): Observable<Workout> {
    return this.http.put<Workout>(
      `${this.apiUrl}/${workoutId}/exercises/${exerciseId}/sets/${setIndex}`,
      set
    );
  }

  deleteSet(workoutId: string, exerciseId: string, setIndex: number): Observable<Workout> {
    return this.http.delete<Workout>(
      `${this.apiUrl}/${workoutId}/exercises/${exerciseId}/sets/${setIndex}`
    );
  }
}
