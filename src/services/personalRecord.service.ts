import { db } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/types/database.types";
import type { LocalPersonalRecord } from "@/types/entity.types";
import { Helper } from "@/utils/helper";
import type { SyncResult } from "@/types/titantrack.types";

export type PRId = string;

export class PersonalRecordService {
  // =========================
  // CREATE (always insert)
  // =========================
  async create(pr: Tables<"personal_records">): Promise<void> {
    await db.personal_records.put({
      ...pr,
      is_dirty: 1,
      last_synced_at: Helper.nowIso(),
    });
  }

  // =========================
  // GET
  // =========================
  async get(id: PRId): Promise<LocalPersonalRecord | null> {
    const result = await db.personal_records.get(id);
    return result ?? null;
  }

  // =========================
  // LIST (by exercise)
  // =========================
  async listByExercise(
    userId: string,
    exerciseId: string,
  ): Promise<LocalPersonalRecord[]> {
    return db.personal_records
      .where("exercise_id")
      .equals(exerciseId)
      .and((x) => x.user_id === userId)
      .toArray();
  }

  // =========================
  // GET BEST (core logic)
  // =========================
  async getBest(
    userId: string,
    exerciseId: string,
    prtype: string,
  ): Promise<LocalPersonalRecord | null> {
    const all = await this.listByExercise(userId, exerciseId);

    const filtered = all.filter((x) => x.prtype === prtype);
    if (!filtered.length) return null;

    return filtered.reduce((best, curr) =>
      curr.value > best.value ? curr : best,
    );
  }

  // =========================
  // DELETE
  // =========================
  async delete(id: PRId): Promise<void> {
    await db.personal_records.delete(id);
  }

  // =========================
  // 🔼 SYNC TO SUPABASE
  // =========================
  async syncToSupabase(userId: string): Promise<SyncResult> {
    let uploaded = 0;
    let failed = 0;

    const dirty = await db.personal_records
      .where("[user_id+is_dirty]")
      .equals([userId, 1])
      .toArray();

    for (const record of dirty) {
      const { is_dirty, last_synced_at, ...data } = record;

      const { error } = await supabase.from("personal_records").insert(data);

      if (error) {
        failed++;
        continue;
      }

      uploaded++;

      await db.personal_records.update(record.id, {
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
      .from("personal_records")
      .select("*")
      .eq("user_id", userId)
      .gt("updated_at", bufferedIso);

    if (error || !data) {
      return { uploaded: 0, failed: 0, downloaded: 0 };
    }

    for (const item of data) {
      const existing = await db.personal_records.get(item.id);

      if (existing?.is_dirty === 1) continue;

      await db.personal_records.put({
        ...item,
        is_dirty: 0,
        last_synced_at: Helper.nowIso(),
      });

      downloaded++;
    }

    return { uploaded: 0, failed: 0, downloaded };
  }
}

export const personalRecordService = new PersonalRecordService();
