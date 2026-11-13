export interface WorkoutSet {
  weightKg: number;
  reps: number;
  done: boolean;
}

export interface WorkoutEntry {
  exerciseId: string;
  sets: WorkoutSet[];
}

export interface Session {
  id: string;
  startedAt: number;
  endedAt?: number;
  restEndsAt?: number;
  entries: WorkoutEntry[];
}

export interface WorkoutState {
  version: 1;
  sessions: Session[];
  active: Session | null;
}
