import type { SyncResult } from "@/types/titantrack.types";

export interface BaseService<T, Id = unknown> {
  create(data: T): Promise<void>;

  update(id: Id, changes: Partial<T>): Promise<void>;

  get(id: Id): Promise<T | null>;

  list(userId: string): Promise<T[]>;

  delete(id: Id): Promise<void>;

  syncToSupabase(userId: string): Promise<SyncResult>;

  syncFromSupabase(userId: string): Promise<SyncResult>;
}
