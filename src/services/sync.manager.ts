import type { LocalProfile } from "@/types/entity.types";
import { userProfileService } from "./userProfile.service";
import { db } from "@/lib/db";
import { syncServiceMap } from "./SyncServiceMap";
import { Helper } from "@/utils/helper";

class SyncManager {
  async getProfile(userId: string): Promise<LocalProfile | null> {
    const profile = await userProfileService.get(userId);
    return profile;
  }

  async synchronizeDatabase(
    userId: string,
    tableName?: keyof typeof syncServiceMap,
  ): Promise<void> {
    if (tableName) {
      const service = syncServiceMap[tableName];

      await this.syncTable(userId, tableName, service);
      return;
    }

    const tables = Object.keys(syncServiceMap) as Array<
      keyof typeof syncServiceMap
    >;

    for (const tableName of tables) {
      console.log(`Syncing table: ${tableName}`);
      const service = syncServiceMap[tableName];

      await this.syncTable(userId, tableName, service);
    }
  }

  private async syncTable(
    userId: string,
    tableName: string,
    service: any,
  ): Promise<void> {
    // 1️⃣ Upload local dirty changes
    await service.syncToSupabase(userId);

    // 2️⃣ Get last sync time
    const lastSyncedAt =
      (await this.getLastSyncTime(tableName)) ??
      new Date(
        new Date().setFullYear(new Date().getFullYear() - 1),
      ).toISOString(); // default to 1 year ago if never synced

    // 3️⃣ Download remote changes (incremental based on last sync)
    console.log(`Syncing ${tableName} from Supabase since ${lastSyncedAt}`);
    await service.syncFromSupabase(userId, lastSyncedAt);

    // 4️⃣ Update sync timestamp
    await this.updateSyncTime(tableName);
  }

  // =========================
  // SYNC TIME (CENTRALIZED)
  // =========================
  async updateSyncTime(entity: string) {
    await db.sync_times.put({
      entity,
      lastSyncedAt: Helper.nowIso(),
    });
  }

  async getLastSyncTime(entity: string) {
    const record = await db.sync_times.get(entity);
    if (!record) return new Date(0).toISOString(); // fallback to epoch
    return record.lastSyncedAt;
  }
}

export const syncManager = new SyncManager();
