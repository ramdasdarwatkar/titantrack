import type {
  LocalProfile,
  LocalBodyMetric,
  LocalGoal,
  LocalPersonalRecord,
  LocalExercise,
  LocalWorkout,
  LocalSet,
  LocalRoutine,
  LocalRoutineExercise,
  LocalStepCount,
  LocalStaticType,
  SyncTime,
} from "@/types/entity.types";
import Dexie, { type Table } from "dexie";

export class TitanTrackDatabase extends Dexie {
  user_profiles!: Table<LocalProfile, string>;
  body_metrics!: Table<LocalBodyMetric, [string, string]>;
  goals!: Table<LocalGoal, string>;
  personal_records!: Table<LocalPersonalRecord, string>;
  exercises!: Table<LocalExercise, string>;
  workouts!: Table<LocalWorkout, string>;
  sets!: Table<LocalSet, string>;
  routines!: Table<LocalRoutine, string>;
  routine_exercises!: Table<LocalRoutineExercise, string>;
  steps!: Table<LocalStepCount, [string, string]>;
  static_types!: Table<LocalStaticType, number>;
  // **New table for local sync times**
  sync_times!: Table<SyncTime, string>;

  constructor() {
    super("TitanTrackInternal");

    this.version(1).stores({
      user_profiles: "user_id, [user_id+is_dirty], is_dirty",
      body_metrics: "[user_id+date], [user_id+is_dirty], user_id, is_dirty",
      goals: "id, [user_id+name+completed_date], [user_id+is_dirty], is_dirty",
      personal_records:
        "id, [user_id+exercise_id+prtype], [user_id+is_dirty], is_dirty",
      exercises: "id, [user_id+is_dirty], user_id, is_dirty, name",
      workouts: "id, [user_id+is_dirty], user_id, is_dirty, date",
      sets: "id, [user_id+is_dirty], user_id, is_dirty, workout_id, exercise_id",
      routines: "id, [user_id+is_dirty], user_id, is_dirty",
      routine_exercises:
        "[routine_id+exercise_id], [user_id+is_dirty], routine_id, is_dirty",
      steps: "[user_id+date], [user_id+is_dirty],user_id, is_dirty",
      static_types: "id, rec_type, is_dirty",
      // **Sync times table**: key is entity name
      sync_times: "entity",
    });
  }
}

export const db = new TitanTrackDatabase();
