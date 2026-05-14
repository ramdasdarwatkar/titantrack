import { db } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/types/database.types";
import type { SyncResult } from "@/types/titantrack.types";
import { Helper } from "@/utils/helper";

export type RoutineId = string;

export type RoutineWithExercises = {
  routine: Tables<"routines">;
  exercises: Tables<"routine_exercises">[];
};

export class RoutineService {
  // =========================
  // CREATE (routine + exercises)
  // =========================
  async create(data: RoutineWithExercises): Promise<void> {
    const now = Helper.nowIso();

    await db.transaction("rw", db.routines, db.routine_exercises, async () => {
      await db.routines.put({
        ...data.routine,
        is_dirty: 1,
        last_synced_at: now,
      });

      for (const ex of data.exercises) {
        await db.routine_exercises.put({
          ...ex,
          is_dirty: 1,
          last_synced_at: now,
        });
      }
    });
  }

  // =========================
  // UPDATE (replace exercises)
  // =========================
  async update(
    id: RoutineId,
    routineChanges: Partial<Tables<"routines">>,
    exercises: Tables<"routine_exercises">[],
  ): Promise<void> {
    const existing = await db.routines.get(id);
    if (!existing) return;

    const now = Helper.nowIso();

    await db.transaction("rw", db.routines, db.routine_exercises, async () => {
      // update routine
      await db.routines.put({
        ...existing,
        ...routineChanges,
        is_dirty: 1,
        last_synced_at: now,
      });

      // delete old exercises
      await db.routine_exercises.where("routine_id").equals(id).delete();

      // insert new exercises
      for (const ex of exercises) {
        await db.routine_exercises.put({
          ...ex,
          routine_id: id,
          is_dirty: 1,
          last_synced_at: now,
        });
      }
    });
  }

  // =========================
  // GET (with exercises)
  // =========================
  async get(id: RoutineId): Promise<RoutineWithExercises | null> {
    const routine = await db.routines.get(id);
    if (!routine) return null;

    const exercises = await db.routine_exercises
      .where("routine_id")
      .equals(id)
      .toArray();

    return { routine, exercises };
  }

  // =========================
  // LIST
  // =========================
  async list(userId: string) {
    return db.routines.where("user_id").equals(userId).toArray();
  }

  // =========================
  // DELETE
  // =========================
  async delete(id: RoutineId): Promise<void> {
    await db.transaction("rw", db.routines, db.routine_exercises, async () => {
      await db.routines.delete(id);

      await db.routine_exercises.where("routine_id").equals(id).delete();
    });
  }

  // =========================
  // 🔼 SYNC TO SUPABASE
  // =========================
  async syncToSupabase(userId: string) {
    let uploaded = 0;
    let failed = 0;

    const routines = await db.routines
      .where("[user_id+is_dirty]")
      .equals([userId, 1])
      .toArray();

    for (const routine of routines) {
      const { is_dirty, last_synced_at, ...routineData } = routine;

      const exercises = await db.routine_exercises
        .where("routine_id")
        .equals(routine.id)
        .toArray();

      const exData = exercises.map(({ is_dirty, last_synced_at, ...e }) => e);

      // 🔥 upsert routine
      const { error: rErr } = await supabase
        .from("routines")
        .upsert(routineData);

      if (rErr) {
        failed++;
        continue;
      }

      // 🔥 replace exercises (simple strategy)
      await supabase
        .from("routine_exercises")
        .delete()
        .eq("routine_id", routine.id);

      const { error: eErr } = await supabase
        .from("routine_exercises")
        .insert(exData);

      if (eErr) {
        failed++;
        continue;
      }

      uploaded++;

      await db.routines.update(routine.id, {
        is_dirty: 0,
        last_synced_at: Helper.nowIso(),
      });
    }

    return { uploaded, failed, downloaded: 0 };
  }

  // =========================
  // 🔽 SYNC FROM SUPABASE
  // =========================
  async syncFromSupabase(
    userId: string,
    lastSyncedAt: string,
  ): Promise<SyncResult> {
    let downloaded = 0;

    const syncDate = new Date(lastSyncedAt);
    syncDate.setMinutes(syncDate.getMinutes() - 10);

    const bufferedIso = syncDate.toISOString();

    const { data: routines } = await supabase
      .from("routines")
      .select("*")
      .eq("user_id", userId)
      .gt("updated_at", bufferedIso);

    if (!routines) return { uploaded: 0, failed: 0, downloaded: 0 };

    for (const routine of routines) {
      const existing = await db.routines.get(routine.id);
      if (existing?.is_dirty === 1) continue;

      const { data: exercises } = await supabase
        .from("routine_exercises")
        .select("*")
        .eq("routine_id", routine.id);

      await db.transaction(
        "rw",
        db.routines,
        db.routine_exercises,
        async () => {
          await db.routines.put({
            ...routine,
            is_dirty: 0,
            last_synced_at: Helper.nowIso(),
          });

          // replace exercises locally
          await db.routine_exercises
            .where("routine_id")
            .equals(routine.id)
            .delete();

          for (const ex of exercises || []) {
            await db.routine_exercises.put({
              ...ex,
              is_dirty: 0,
              last_synced_at: Helper.nowIso(),
            });
          }
        },
      );

      downloaded++;
    }

    return { uploaded: 0, failed: 0, downloaded };
  }
}

export const routineService = new RoutineService();
