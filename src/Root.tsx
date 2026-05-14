import { useEffect, useState } from "react";
import { pwaService } from "@/services/pwa.service";
import App from "./App";

export default function Root() {
  const [needRefresh, setNeedRefresh] = useState<boolean>(false);

  useEffect(() => {
    pwaService.register({
      onNeedRefresh: () => setNeedRefresh(true),
      onOfflineReady: () => console.log("TitanTrack: Cached for offline use."),
    });
  }, []);

  const handleUpdate = () => {
    setNeedRefresh(false);
    pwaService.updateApp();
  };

  return (
    <>
      <App />

      {/* PWA UPDATE BANNER */}
      {needRefresh && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-md pointer-events-none">
          <div className="glass p-5 rounded-3xl border border-primary/20 shadow-2xl animate-in fade-in slide-in-from-bottom-5 pointer-events-auto flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-text-main">
                Update Available
              </span>
              <span className="text-xs text-text-muted">
                New version of TitanTrack is ready.
              </span>
            </div>
            <button
              onClick={handleUpdate}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-tighter transition-all active:scale-95 hover:brightness-110 shadow-lg shadow-primary/20"
            >
              Update
            </button>
          </div>
        </div>
      )}

      {/* OFFLINE READY TOAST */}
      {/* {offlineReady && !needRefresh && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="glass px-4 py-2 rounded-full border border-white/5 text-[10px] uppercase tracking-widest text-text-muted font-bold">
            TitanTrack: Offline Ready
          </div>
        </div>
      )} */}
    </>
  );
}
