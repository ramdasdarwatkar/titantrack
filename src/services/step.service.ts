import { db } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/types/database.types";
import type { LocalStepCount } from "@/types/entity.types";
import { Helper } from "@/utils/helper";
import type { SyncResult } from "@/types/titantrack.types";
export type StepId = [string, string]; // [user_id, date]

export class StepService {
  // =========================
  // UPSERT (daily overwrite)
  // =========================
  async upsert(step: Tables<"steps">): Promise<void> {
    await db.steps.put({
      ...step,
      is_dirty: 1,
      last_synced_at: Helper.nowIso(),
    });
  }

  // =========================
  // GET
  // =========================
  async get(id: StepId): Promise<LocalStepCount | null> {
    const result = await db.steps.get(id);
    return result ?? null;
  }

  // =========================
  // LIST
  // =========================
  async list(userId: string): Promise<LocalStepCount[]> {
    return db.steps.where("user_id").equals(userId).toArray();
  }

  // =========================
  // DELETE
  // =========================
  async delete(id: StepId): Promise<void> {
    await db.steps.delete(id);
  }

  // =========================
  // 🔼 SYNC TO SUPABASE
  // =========================
  async syncToSupabase(userId: string): Promise<SyncResult> {
    let uploaded = 0;
    let failed = 0;

    const dirty = await db.steps
      .where("[user_id+is_dirty]")
      .equals([userId, 1])
      .toArray();

    for (const record of dirty) {
      const { is_dirty, last_synced_at, ...data } = record;

      const { error } = await supabase.from("steps").upsert(data);

      if (error) {
        failed++;
        continue;
      }

      uploaded++;

      await db.steps.update([record.user_id, record.date], {
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
      .from("steps")
      .select("*")
      .eq("user_id", userId)
      .gt("updated_at", bufferedIso);

    if (error || !data) {
      return { uploaded: 0, failed: 0, downloaded: 0 };
    }

    for (const item of data) {
      const existing = await db.steps.get([item.user_id, item.date]);

      if (existing?.is_dirty === 1) continue;

      await db.steps.put({
        ...item,
        is_dirty: 0,
        last_synced_at: Helper.nowIso(),
      });

      downloaded++;
    }

    return { uploaded: 0, failed: 0, downloaded };
  }
}

export const stepService = new StepService();
