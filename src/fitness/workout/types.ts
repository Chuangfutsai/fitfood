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

export interface ActiveSession extends Session {
  pending?: { name: string; sets: number }[];
}

export interface WorkoutState {
  version: 1;
  sessions: Session[];
  active: ActiveSession | null;
}
