import type { Tables } from "./database.types";

export type LocalRecord<T> = T & {
  is_dirty: 0 | 1;
  last_synced_at?: string | null;
};

export type LocalProfile = LocalRecord<Tables<"user_profiles">>;
export type LocalBodyMetric = LocalRecord<Tables<"body_metrics">>;
export type LocalGoal = LocalRecord<Tables<"goals">>;
export type LocalPersonalRecord = LocalRecord<Tables<"personal_records">>;
export type LocalWorkout = LocalRecord<Tables<"workouts">>;
export type LocalExercise = LocalRecord<Tables<"exercises">>;
export type LocalSet = LocalRecord<Tables<"sets">>;
export type LocalRoutine = LocalRecord<Tables<"routines">>;
export type LocalXpLog = LocalRecord<Tables<"xp_log">>;
export type LocalStepCount = LocalRecord<Tables<"steps">>;
export type LocalRoutineExercise = LocalRecord<Tables<"routine_exercises">>;
export type LocalStaticType = LocalRecord<Tables<"static_types">>;

export interface SyncTime {
  entity: string;
  lastSyncedAt: string;
}
