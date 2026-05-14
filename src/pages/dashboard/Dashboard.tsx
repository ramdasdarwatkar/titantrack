import { Link } from "react-router-dom";
import {
  BarbellIcon,
  CaretRightIcon,
  ArrowsClockwise,
} from "@phosphor-icons/react";

import { useSync } from "@/hooks/useSync";

export default function Dashboard() {
  const { syncNow, isSyncing } = useSync();

  return (
    <div className="flex flex-col gap-6 px-6 pb-8">
      {/* HEADER */}
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-(--text-main)">
            Dashboard
          </h1>

          <p className="text-(--text-muted)">Welcome back, athlete.</p>
        </div>

        {/* SYNC BUTTON */}
        <button
          onClick={syncNow}
          disabled={isSyncing}
          // className="
          //   flex h-11 w-11 items-center justify-center
          //   rounded-2xl border border-(--card-border)
          //   bg-(--card-bg)
          //   text-primary
          //   transition-all
          //   active:scale-95
          //   disabled:opacity-60
          // "
          className="p-3 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 active:scale-90 transition-all"
          aria-label="Add New"
        >
          <ArrowsClockwise
            size={24}
            weight="bold"
            className={isSyncing ? "animate-spin" : ""}
          />
        </button>
      </header>

      {/* ACTION CARD */}
      <Link
        to="/workout/today-session"
        className="
          content-card
          flex flex-row
          items-center
          justify-between
          p-6
          active:scale-[0.98]
          transition-all
        "
      >
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <BarbellIcon size={28} weight="fill" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-(--text-main)">
              Today's Session
            </h3>

            <p className="text-sm text-(--text-muted)">Push Day • 45 mins</p>
          </div>
        </div>

        <CaretRightIcon
          size={20}
          weight="bold"
          className="text-(--text-muted)"
        />
      </Link>
    </div>
  );
}
