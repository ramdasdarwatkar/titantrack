import { createContext } from "react";

export interface SyncState {
  isSyncing: boolean;
  isEngineLoading: boolean;
  hasProfile: boolean | null;
}

export interface SyncContextType extends SyncState {
  syncNow: () => Promise<void>;
  // Called by Onboarding after completeOnboarding() so hasProfile
  // updates without waiting for the next full mount cycle
  refreshProfile: () => Promise<void>;
}

export const SyncContext = createContext<SyncContextType | undefined>(
  undefined,
);
