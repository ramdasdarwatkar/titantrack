import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useAuth } from "@/hooks/useAuth";
import { SyncContext, type SyncState } from "@/context/SyncContext";
import { syncManager } from "@/services/sync.manager";

const INITIAL_STATE: SyncState = {
  isSyncing: false,
  isEngineLoading: true,
  hasProfile: null,
};

export const SyncProvider = ({ children }: { children: ReactNode }) => {
  const { session, isInitialized } = useAuth();
  const hasAutoSynced = useRef(false);

  const [syncState, setSyncState] = useState<SyncState>(INITIAL_STATE);

  // Stable upload+download sync — never enters state
  const syncNow = useCallback(async () => {
    if (!session) return;
    try {
      setSyncState((prev) => ({ ...prev, isSyncing: true }));
      await syncManager.synchronizeDatabase(session.user.id);
    } catch (error) {
      console.error("Manual Sync Error:", error);
    } finally {
      setSyncState((prev) => ({ ...prev, isSyncing: false }));
    }
  }, [session]);

  // Called after onboarding completes to flip hasProfile without remount.
  // Without this, AppRouter sees hasProfile=false and redirects back to
  // /onboarding even after navigate("/") is called.
  const refreshProfile = useCallback(async () => {
    if (!session) return;
    const profile = await syncManager.getProfile(session.user.id);
    setSyncState((prev) => ({ ...prev, hasProfile: !!profile }));
  }, [session]);

  useEffect(() => {
    if (!isInitialized) return;

    (async () => {
      if (!session) {
        setSyncState({
          isSyncing: false,
          isEngineLoading: false,
          hasProfile: null,
        });
        return;
      }

      setSyncState((prev) => ({ ...prev, isEngineLoading: true }));

      try {
        const profile = await syncManager.getProfile(session.user.id);

        setSyncState({
          hasProfile: !!profile,
          isEngineLoading: false,
          isSyncing: false,
        });

        if (profile && !hasAutoSynced.current) {
          hasAutoSynced.current = true;
          setSyncState((prev) => ({ ...prev, isEngineLoading: true }));
          await syncNow();
          setSyncState((prev) => ({ ...prev, isEngineLoading: false }));
        }
      } catch (error) {
        console.error("Critical Sync Error:", error);
        setSyncState((prev) => ({ ...prev, isEngineLoading: false }));
      }
    })();
  }, [session, isInitialized, syncNow]);

  const contextValue = useMemo(
    () => ({ ...syncState, syncNow, refreshProfile }),
    [syncState, syncNow, refreshProfile],
  );

  return (
    <SyncContext.Provider value={contextValue}>{children}</SyncContext.Provider>
  );
};
