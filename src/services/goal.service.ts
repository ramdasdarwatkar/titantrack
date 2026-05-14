import { db } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/types/database.types";
import type { LocalGoal } from "@/types/entity.types";
import type { SyncResult } from "@/types/titantrack.types";
import { Helper } from "@/utils/helper";

export type GoalId = string;

export class GoalService {
  // =========================
  // CREATE
  // =========================
  async create(goal: Tables<"goals">): Promise<void> {
    const record: LocalGoal = {
      ...goal,
      is_dirty: 1,
      last_synced_at: Helper.nowIso(),
    };

    await db.goals.put(record);
  }

  // =========================
  // UPDATE
  // =========================
  async update(id: GoalId, changes: Partial<Tables<"goals">>): Promise<void> {
    const existing = await db.goals.get(id);
    if (!existing) return;

    await db.goals.put({
      ...existing,
      ...changes,
      is_dirty: 1,
      last_synced_at: Helper.nowIso(),
    });
  }

  // =========================
  // GET (local only)
  // =========================
  async get(id: GoalId): Promise<LocalGoal | null> {
    const result = await db.goals.get(id);
    return result ?? null;
  }

  // =========================
  // LIST
  // =========================
  async list(userId: string): Promise<LocalGoal[]> {
    return db.goals.where("user_id").equals(userId).toArray();
  }

  // =========================
  // DELETE
  // =========================
  async delete(id: GoalId): Promise<void> {
    await db.goals.delete(id);
  }

  // =========================
  // 🔼 SYNC TO SUPABASE (UPLOAD)
  // =========================
  async syncToSupabase(userId: string): Promise<SyncResult> {
    let uploaded = 0;
    let failed = 0;

    const dirtyRecords = await db.goals
      .where("user_id")
      .equals(userId)
      .and((g) => g.is_dirty === 1)
      .toArray();

    for (const record of dirtyRecords) {
      const { is_dirty, last_synced_at, ...data } = record;

      const { error } = await supabase.from("goals").upsert(data);

      if (error) {
        failed++;
        continue;
      }

      uploaded++;

      await db.goals.update(record.id, {
        is_dirty: 0,
        last_synced_at: Helper.nowIso(),
      });
    }

    return {
      uploaded,
      failed,
      downloaded: 0,
    };
  }

  // =========================
  // 🔽 SYNC FROM SUPABASE (DOWNLOAD)
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
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .gt("updated_at", bufferedIso);

    if (error || !data) {
      return { uploaded: 0, failed: 0, downloaded: 0 };
    }

    for (const item of data) {
      const existing = await db.goals.get(item.id);

      // protect unsynced local changes
      if (existing?.is_dirty === 1) continue;

      const record: LocalGoal = {
        ...item,
        is_dirty: 0,
        last_synced_at: Helper.nowIso(),
      };

      await db.goals.put(record);
      downloaded++;
    }

    return {
      uploaded: 0,
      failed: 0,
      downloaded,
    };
  }
}

export const goalService = new GoalService();
