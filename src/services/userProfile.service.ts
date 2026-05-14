import { db } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/types/database.types";
import type { LocalProfile } from "@/types/entity.types";
import { Helper } from "@/utils/helper";

export type UserId = string;

export type SyncResult = {
  uploaded: number;
  failed: number;
  downloaded: number;
};

export class UserProfileService {
  // =========================
  // CREATE / UPSERT (local-first)
  // =========================
  async upsert(profile: Tables<"user_profiles">): Promise<void> {
    const record: LocalProfile = {
      ...profile,
      is_dirty: 1,
      last_synced_at: Helper.nowIso(),
    };

    await db.user_profiles.put(record);
  }

  // =========================
  // GET (cache-aside)
  // =========================
  async get(userId: string): Promise<LocalProfile | null> {
    // 1. Local first
    const local = await db.user_profiles.get(userId);
    if (local) return local;

    // 2. Remote fallback
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error || !data) return null;

    // 3. Cache locally
    const record: LocalProfile = {
      ...data,
      is_dirty: 0,
      last_synced_at: Helper.nowIso(),
    };

    await db.user_profiles.put(record);

    return record;
  }

  // =========================
  // LIST (local only)
  // =========================
  async list(): Promise<LocalProfile[]> {
    return db.user_profiles.toArray();
  }

  // =========================
  // DELETE
  // =========================
  async delete(userId: string): Promise<void> {
    await db.user_profiles.delete(userId);
  }

  // =========================
  // 🔼 SYNC TO SUPABASE (UPLOAD)
  // =========================
  async syncToSupabase(userId: string): Promise<SyncResult> {
    let uploaded = 0;
    let failed = 0;

    const record = await db.user_profiles.get(userId);

    if (!record || record.is_dirty !== 1) {
      return { uploaded: 0, failed: 0, downloaded: 0 };
    }

    try {
      const { is_dirty, last_synced_at, ...data } = record;

      const { error } = await supabase.from("user_profiles").upsert(data);

      if (error) {
        failed++;
        return { uploaded, failed, downloaded: 0 };
      }

      uploaded++;

      await db.user_profiles.update(userId, {
        is_dirty: 0,
        last_synced_at: Helper.nowIso(),
      });
    } catch {
      failed++;
    }

    return { uploaded, failed, downloaded: 0 };
  }

  // =========================
  // 🔽 SYNC FROM SUPABASE (DOWNLOAD)
  // Profile is a single row — lastSyncedAt not used for filtering,
  // but we still protect local unsynced changes.
  // =========================
  async syncFromSupabase(
    userId: string,
    lastSyncedAt: string,
  ): Promise<SyncResult> {
    console.log("Syncing user profile from Supabase for user:", lastSyncedAt);
    const existing = await db.user_profiles.get(userId);

    // Protect local unsynced changes — don't overwrite dirty records
    if (existing?.is_dirty === 1) {
      return { uploaded: 0, failed: 0, downloaded: 0 };
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return { uploaded: 0, failed: 0, downloaded: 0 };
    }

    const record: LocalProfile = {
      ...data,
      is_dirty: 0,
      last_synced_at: Helper.nowIso(),
    };

    await db.user_profiles.put(record);

    return { uploaded: 0, failed: 0, downloaded: 1 };
  }
}

export const userProfileService = new UserProfileService();
