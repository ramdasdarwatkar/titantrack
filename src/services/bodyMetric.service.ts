import { db } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/types/database.types";
import type { LocalBodyMetric } from "@/types/entity.types";
import type { SyncResult } from "@/types/titantrack.types";
import { Helper } from "@/utils/helper";

export type BodyMetricId = [string, string];

export class BodyMetricService {
  // =========================
  // CREATE
  // =========================
  async create(metric: Tables<"body_metrics">): Promise<void> {
    await db.body_metrics.put({
      ...metric,
      is_dirty: 1,
      last_synced_at: Helper.nowIso(),
    });
  }

  // =========================
  // UPDATE (partial safe merge)
  // =========================
  async update(
    id: BodyMetricId,
    changes: Partial<Tables<"body_metrics">>,
  ): Promise<void> {
    const [userId, date] = id;

    const existing = await db.body_metrics.get([userId, date]);
    if (!existing) return;

    await db.body_metrics.put({
      ...existing,
      ...changes,
      is_dirty: 1,
      last_synced_at: Helper.nowIso(),
    });
  }

  // =========================
  // GET SINGLE
  // =========================
  async get(id: BodyMetricId): Promise<LocalBodyMetric | null> {
    const result = await db.body_metrics.get(id);
    return result ?? null;
  }

  // =========================
  // LIST
  // =========================
  async list(userId: string): Promise<LocalBodyMetric[]> {
    return db.body_metrics.where("user_id").equals(userId).toArray();
  }

  // =========================
  // GET LATEST
  // =========================
  async getLatest(userId: string): Promise<LocalBodyMetric | null> {
    const all = await this.list(userId);
    if (!all.length) return null;

    return all.reduce((latest, current) =>
      new Date(current.date) > new Date(latest.date) ? current : latest,
    );
  }

  // =========================
  // DELETE
  // =========================
  async delete(id: BodyMetricId): Promise<void> {
    await db.body_metrics.delete(id);
  }

  // =========================
  // 🔼 SYNC TO SUPABASE (UPLOAD)
  // =========================
  async syncToSupabase(userId: string): Promise<SyncResult> {
    let uploaded = 0;
    let failed = 0;

    const dirtyRecords = await db.body_metrics
      .where("[user_id+is_dirty]")
      .equals([userId, 1])
      .toArray();

    for (const record of dirtyRecords) {
      const { is_dirty, last_synced_at, ...data } = record;

      const { error } = await supabase.from("body_metrics").upsert(data);

      if (error) {
        failed++;
        continue;
      }

      uploaded++;

      await db.body_metrics.update([record.user_id, record.date], {
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
      .from("body_metrics")
      .select("*")
      .eq("user_id", userId)
      .gt("updated_at", bufferedIso);

    if (error || !data) {
      return { uploaded: 0, failed: 0, downloaded: 0 };
    }

    for (const item of data) {
      const existing = await db.body_metrics.get([item.user_id, item.date]);

      // protect unsynced local changes
      if (existing?.is_dirty === 1) continue;

      await db.body_metrics.put({
        ...item,
        is_dirty: 0,
        last_synced_at: Helper.nowIso(),
      });

      downloaded++;
    }

    return {
      uploaded: 0,
      failed: 0,
      downloaded,
    };
  }
}

export const bodyMetricService = new BodyMetricService();
