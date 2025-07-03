export interface Exercise {
  id: string;
  name: string;
  sets: Set[];
}

export interface Set {
  reps: number;
  weight: number;
  completed: boolean;
}

export interface Workout {
  id: string;
  date: Date;
  name: string;
  exercises: Exercise[];
  notes?: string;
  completed: boolean;
}
