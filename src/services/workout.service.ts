import { db } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/types/database.types";
import type { LocalWorkout } from "@/types/entity.types";
import type { SyncResult } from "@/types/titantrack.types";
import { Helper } from "@/utils/helper";

export type WorkoutId = string;

export class WorkoutService {
  // =========================
  // CREATE
  // =========================
  async create(workout: Tables<"workouts">): Promise<void> {
    await db.workouts.put({
      ...workout,
      is_dirty: 1,
      last_synced_at: Helper.nowIso(),
    });
  }

  // =========================
  // UPDATE
  // =========================
  async update(
    id: WorkoutId,
    changes: Partial<Tables<"workouts">>,
  ): Promise<void> {
    const existing = await db.workouts.get(id);
    if (!existing) return;

    await db.workouts.put({
      ...existing,
      ...changes,
      is_dirty: 1,
      last_synced_at: Helper.nowIso(),
    });
  }

  // =========================
  // GET
  // =========================
  async get(id: WorkoutId): Promise<LocalWorkout | null> {
    const result = await db.workouts.get(id);
    return result ?? null;
  }

  // =========================
  // LIST
  // =========================
  async list(userId: string): Promise<LocalWorkout[]> {
    return db.workouts.where("user_id").equals(userId).toArray();
  }

  // =========================
  // DELETE
  // =========================
  async delete(id: WorkoutId): Promise<void> {
    await db.workouts.delete(id);
  }

  // =========================
  // 🔼 SYNC TO SUPABASE
  // =========================
  async syncToSupabase(userId: string): Promise<SyncResult> {
    let uploaded = 0;
    let failed = 0;

    const dirtyRecords = await db.workouts
      .where("[user_id+is_dirty]")
      .equals([userId, 1])
      .toArray();

    for (const record of dirtyRecords) {
      const { is_dirty, last_synced_at, ...data } = record;

      const { error } = await supabase.from("workouts").upsert(data);

      if (error) {
        failed++;
        continue;
      }

      uploaded++;

      await db.workouts.update(record.id, {
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
      .from("workouts")
      .select("*")
      .eq("user_id", userId)
      .gt("updated_at", bufferedIso);

    if (error || !data) {
      return { uploaded: 0, failed: 0, downloaded: 0 };
    }

    for (const item of data) {
      const existing = await db.workouts.get(item.id);

      if (existing?.is_dirty === 1) continue;

      await db.workouts.put({
        ...item,
        is_dirty: 0,
        last_synced_at: Helper.nowIso(),
      });

      downloaded++;
    }

    return { uploaded: 0, failed: 0, downloaded };
  }
}

export const workoutService = new WorkoutService();
