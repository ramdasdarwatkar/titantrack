import { db } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import type { Tables, Enums } from "@/types/database.types";
import type { LocalStaticType } from "@/types/entity.types";
import type { SyncResult } from "@/types/titantrack.types";
import { Helper } from "@/utils/helper";

export type StaticTypeId = number;
export type StaticDataType = Enums<"STATIC_DATA">;

export class StaticTypeService {
  // =========================
  // CREATE
  // =========================
  async create(staticType: Tables<"static_types">): Promise<void> {
    const record: LocalStaticType = {
      ...staticType,
      is_dirty: 1,
      last_synced_at: Helper.nowIso(),
    };

    await db.static_types.put(record);
  }

  // =========================
  // UPDATE
  // =========================
  async update(
    id: StaticTypeId,
    changes: Partial<Tables<"static_types">>,
  ): Promise<void> {
    const existing = await db.static_types.get(id);

    if (!existing) return;

    await db.static_types.put({
      ...existing,
      ...changes,
      is_dirty: 1,
      last_synced_at: Helper.nowIso(),
    });
  }

  // =========================
  // GET (local only)
  // =========================
  async get(id: StaticTypeId): Promise<LocalStaticType | null> {
    const result = await db.static_types.get(id);

    return result ?? null;
  }

  // =========================
  // LIST
  // =========================
  async list(): Promise<LocalStaticType[]> {
    return db.static_types.toArray();
  }

  // =========================
  // GET BY REC TYPE
  // =========================
  async getByRecType(recType: StaticDataType): Promise<LocalStaticType[]> {
    return db.static_types.where("rec_type").equals(recType).toArray();
  }

  // =========================
  // DELETE
  // =========================
  async delete(id: StaticTypeId): Promise<void> {
    await db.static_types.delete(id);
  }

  // =========================
  // 🔼 SYNC TO SUPABASE (UPLOAD)
  // =========================
  async syncToSupabase(): Promise<SyncResult> {
    let uploaded = 0;
    let failed = 0;

    const dirtyRecords = await db.static_types
      .filter((s) => s.is_dirty === 1)
      .toArray();

    for (const record of dirtyRecords) {
      const { is_dirty, last_synced_at, ...data } = record;

      const { error } = await supabase.from("static_types").upsert(data);

      if (error) {
        failed++;
        continue;
      }

      uploaded++;

      await db.static_types.update(record.id, {
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
    console.log(`Syncing for user: ${userId}`);
    console.log(`Syncing static_types from Supabase since ${lastSyncedAt}`);
    const syncDate = new Date(lastSyncedAt);
    syncDate.setMinutes(syncDate.getMinutes() - 10);

    const bufferedIso = syncDate.toISOString();

    const { data, error } = await supabase
      .from("static_types")
      .select("*")
      .gt("last_updated_timestamp", bufferedIso);

    if (error || !data) {
      return {
        uploaded: 0,
        failed: 0,
        downloaded: 0,
      };
    }

    for (const item of data) {
      const existing = await db.static_types.get(item.id);

      // protect unsynced local changes
      if (existing?.is_dirty === 1) continue;

      const record: LocalStaticType = {
        ...item,
        is_dirty: 0,
        last_synced_at: Helper.nowIso(),
      };

      await db.static_types.put(record);

      downloaded++;
    }

    return {
      uploaded: 0,
      failed: 0,
      downloaded,
    };
  }
}

export const staticTypeService = new StaticTypeService();
