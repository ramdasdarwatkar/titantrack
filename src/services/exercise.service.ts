import { db } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/types/database.types";
import type { LocalExercise } from "@/types/entity.types";
import type { SyncResult } from "@/types/titantrack.types";
import { Helper } from "@/utils/helper";

export type ExerciseId = string;

export class ExerciseService {
  // =========================
  // CREATE
  // =========================
  async create(exercise: Tables<"exercises">): Promise<void> {
    await db.exercises.put({
      ...exercise,
      is_dirty: 1,
      last_synced_at: Helper.nowIso(),
    });
  }

  // =========================
  // UPDATE (partial safe merge)
  // =========================
  async update(
    id: ExerciseId,
    changes: Partial<Tables<"exercises">>,
  ): Promise<void> {
    const existing = await db.exercises.get(id);
    if (!existing) return;

    await db.exercises.put({
      ...existing,
      ...changes,
      is_dirty: 1,
      last_synced_at: Helper.nowIso(),
    });
  }

  // =========================
  // GET SINGLE
  // =========================
  async get(id: ExerciseId): Promise<LocalExercise | null> {
    const result = await db.exercises.get(id);
    return result ?? null;
  }

  // =========================
  // LIST (user scoped)
  // =========================
  async list(userId: string): Promise<LocalExercise[]> {
    return db.exercises.where("user_id").equals(userId).toArray();
  }

  // =========================
  // DELETE
  // =========================
  async delete(id: ExerciseId): Promise<void> {
    await db.exercises.delete(id);
  }

  // =========================
  // 🔼 SYNC TO SUPABASE
  // =========================
  async syncToSupabase(userId: string): Promise<SyncResult> {
    let uploaded = 0;
    let failed = 0;

    const dirtyRecords = await db.exercises
      .where("[user_id+is_dirty]")
      .equals([userId, 1])
      .toArray();

    for (const record of dirtyRecords) {
      const { is_dirty, last_synced_at, ...data } = record;

      const { error } = await supabase.from("exercises").upsert(data);

      if (error) {
        failed++;
        continue;
      }

      uploaded++;

      await db.exercises.update(record.id, {
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

    const { data, error } = await supabase
      .from("exercises")
      .select("*")
      .eq("user_id", userId)
      .gt("updated_at", bufferedIso);

    if (error || !data) {
      return { uploaded: 0, failed: 0, downloaded: 0 };
    }

    for (const item of data) {
      const existing = await db.exercises.get(item.id);

      if (existing?.is_dirty === 1) continue;

      await db.exercises.put({
        ...item,
        is_dirty: 0,
        last_synced_at: Helper.nowIso(),
      });

      downloaded++;
    }

    return { uploaded: 0, failed: 0, downloaded };
  }
}

export const exerciseService = new ExerciseService();
