import { db } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/types/database.types";
import type { LocalSet } from "@/types/entity.types";
import type { SyncResult } from "@/types/titantrack.types";
import { Helper } from "@/utils/helper";

export type SetId = string;

export class SetService {
  // =========================
  // CREATE
  // =========================
  async create(set: Tables<"sets">): Promise<void> {
    await db.sets.put({
      ...set,
      is_dirty: 1,
      last_synced_at: Helper.nowIso(),
    });
  }

  // =========================
  // UPDATE
  // =========================
  async update(id: SetId, changes: Partial<Tables<"sets">>): Promise<void> {
    const existing = await db.sets.get(id);
    if (!existing) return;

    await db.sets.put({
      ...existing,
      ...changes,
      is_dirty: 1,
      last_synced_at: Helper.nowIso(),
    });
  }

  // =========================
  // GET
  // =========================
  async get(id: SetId): Promise<LocalSet | null> {
    const result = await db.sets.get(id);
    return result ?? null;
  }

  // =========================
  // LIST (by user)
  // =========================
  async list(userId: string): Promise<LocalSet[]> {
    return db.sets.where("user_id").equals(userId).toArray();
  }

  // =========================
  // LIST (by workout)
  // =========================
  async listByWorkout(workoutId: string): Promise<LocalSet[]> {
    return db.sets.where("workout_id").equals(workoutId).toArray();
  }

  // =========================
  // LIST (by exercise)
  // =========================
  async listByExercise(exerciseId: string): Promise<LocalSet[]> {
    return db.sets.where("exercise_id").equals(exerciseId).toArray();
  }

  // =========================
  // DELETE
  // =========================
  async delete(id: SetId): Promise<void> {
    await db.sets.delete(id);
  }

  // =========================
  // 🔼 SYNC TO SUPABASE
  // =========================
  async syncToSupabase(userId: string): Promise<SyncResult> {
    let uploaded = 0;
    let failed = 0;

    const dirtyRecords = await db.sets
      .where("[user_id+is_dirty]")
      .equals([userId, 1])
      .toArray();

    for (const record of dirtyRecords) {
      const { is_dirty, last_synced_at, ...data } = record;

      const { error } = await supabase.from("sets").upsert(data);

      if (error) {
        failed++;
        continue;
      }

      uploaded++;

      await db.sets.update(record.id, {
        is_dirty: 0,
        last_synced_at: Helper.nowIso(),
      });
    }

    return { uploaded, failed, downloaded: 0 };
  }

  // =========================
  // 🔽 SYNC FROM SUPABASE (incremental)
  // =========================
  async syncFromSupabase(
    userId: string,
    lastSyncedAt: string,
  ): Promise<SyncResult> {
    let downloaded = 0;

    // Buffer back 10 min to catch records updated just before last sync
    const syncDate = new Date(lastSyncedAt);
    syncDate.setMinutes(syncDate.getMinutes() - 10);
    const bufferedIso = syncDate.toISOString();

    const { data, error } = await supabase
      .from("sets")
      .select("*")
      .eq("user_id", userId)
      .gt("updated_at", bufferedIso);

    if (error || !data) {
      return { uploaded: 0, failed: 0, downloaded: 0 };
    }

    for (const item of data) {
      const existing = await db.sets.get(item.id);

      if (existing?.is_dirty === 1) continue;

      await db.sets.put({
        ...item,
        is_dirty: 0,
        last_synced_at: Helper.nowIso(),
      });

      downloaded++;
    }

    return { uploaded: 0, failed: 0, downloaded };
  }
}

export const setService = new SetService();
