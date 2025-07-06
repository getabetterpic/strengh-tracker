export interface Exercise {
  id: string;
  name: string;
  sets: Set[];
  workoutId: string;
}

export interface Set {
  reps: number;
  weight: number;
  completed: boolean;
}

export interface Workout {
  id: string;
  date: string;
  name: string;
  exercises: Exercise[];
  notes?: string;
  completedAt: string;
}
