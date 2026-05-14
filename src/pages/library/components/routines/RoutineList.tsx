import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, SpinnerGap, Stack } from "@phosphor-icons/react";
import { routineService } from "@/services/routine.service";
import { useAuth } from "@/hooks/useAuth";

export default function RoutineList() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [routines, setRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRoutines() {
      if (!session?.user.id) return;
      const list = await routineService.list(session.user.id);

      const hydrated = await Promise.all(
        list.map(async (r) => {
          const full = await routineService.get(r.id);
          return { ...r, count: full?.exercises?.length || 0 };
        }),
      );

      setRoutines(hydrated);
      setLoading(false);
    }
    loadRoutines();
  }, [session?.user.id]);

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-4 pt-2">
      <AnimatePresence mode="popLayout">
        {routines.map((routine) => (
          <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={routine.id}
            className="p-5 bg-(--card-bg) border border-(--card-border) rounded-xl space-y-5 shadow-sm"
          >
            {/* TOP INFO ROW — Clickable for Edit/View */}
            <button
              onClick={() => navigate(`/library/routine/${routine.id}`)}
              className="flex w-full items-center justify-between px-1 active:opacity-60 transition-opacity group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-(--bg-base) border border-(--card-border) text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Stack size={22} weight="fill" />
                </div>

                <div className="flex flex-col justify-center text-left min-w-0 h-11">
                  <h3 className="font-black text-base uppercase tracking-tight text-(--text-main) leading-none truncate">
                    {routine.name}
                  </h3>
                  <p className="text-[10px] font-bold text-(--text-muted) uppercase tracking-widest mt-1.5 leading-none">
                    {routine.count}{" "}
                    {routine.count === 1 ? "exercise" : "exercises"}
                  </p>
                </div>
              </div>
            </button>

            {/* FULL WIDTH START WORKOUT BUTTON */}
            <button
              onClick={() => navigate(`/workout/start/${routine.id}`)}
              className="w-full h-14 bg-primary text-white rounded-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
            >
              <Play size={20} weight="fill" />
              <span className="font-black text-xs uppercase tracking-[0.2em]">
                Start Workout
              </span>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {routines.length === 0 && (
        <div className="py-20 text-center opacity-20 uppercase font-black text-xs tracking-widest">
          No routines found
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex justify-center py-24 text-primary">
      <SpinnerGap size={36} weight="bold" className="animate-spin" />
    </div>
  );
}
