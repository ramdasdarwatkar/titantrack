import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Barbell, SpinnerGap, CaretRight } from "@phosphor-icons/react";
import { exerciseService } from "@/services/exercise.service";
import { useAuth } from "@/hooks/useAuth";
import type { LocalExercise } from "@/types/entity.types";

export default function ExerciseList() {
  const { session } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState<LocalExercise[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Data
  useEffect(() => {
    if (!session?.user.id) return;
    exerciseService.list(session.user.id).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, [session?.user.id]);

  // 2. Derive Categories (Move ALL to the end)
  const categories = useMemo(() => {
    const primaryOrder = [
      "BICEP",
      "TRICEP",
      "FOREARM",
      "SHOULDER",
      "CHEST",
      "BACK",
      "LEG",
      "CORE",
      "CARDIO",
    ];

    const existingGroups = Array.from(
      new Set(data.map((ex) => (ex.muscle_group || "OTHER").toUpperCase())),
    );

    const sorted = primaryOrder.filter((cat) => existingGroups.includes(cat));
    const others = existingGroups.filter((cat) => !primaryOrder.includes(cat));

    const result = [...sorted, ...others.sort(), "ALL"];
    return result.length > 0 ? result : ["ALL"];
  }, [data]);

  // 3. State for Active Chip - Initialized from SessionStorage
  const [activeChip, setActiveChip] = useState(() => {
    return sessionStorage.getItem("exercise_active_chip") || "";
  });

  // 4. Determine which chip is ACTUALLY active
  // If no chip is selected yet and data is loaded, default to the first category
  const currentActive =
    activeChip || (categories[0] !== "ALL" ? categories[0] : "ALL");

  // 5. Update SessionStorage when chip changes (No synchronous setState here)
  useEffect(() => {
    if (currentActive) {
      sessionStorage.setItem("exercise_active_chip", currentActive);
    }
  }, [currentActive]);

  const filtered = useMemo(() => {
    return data.filter(
      (ex) =>
        currentActive === "ALL" ||
        ex.muscle_group?.toUpperCase() === currentActive,
    );
  }, [data, currentActive]);

  if (loading) return <LoadingState />;

  return (
    <div className="flex flex-col h-full bg-(--bg-base)">
      {/* CHIPS */}
      <div className="sticky top-0 z-20 bg-(--bg-base)/90 backdrop-blur-md py-3 -mx-6 px-6 overflow-hidden border-b border-(--card-border)/10">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveChip(cat)}
              className={`
                px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border
                ${
                  currentActive === cat
                    ? "bg-primary border-primary text-white"
                    : "bg-(--btn-secondary-bg) text-(--text-muted) border-(--btn-secondary-border)"
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* LIST */}
      <div className="mt-2">
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <motion.button
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                key={item.id}
                onClick={() => navigate(`/library/exercise/${item.id}`)}
                className="group relative flex w-full items-center justify-between border-b border-(--card-border)/40 py-5 active:bg-primary/5 transition-colors text-left"
              >
                {item.is_dirty === 1 && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-orange-500" />
                )}

                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-(--card-bg) border border-(--card-border) text-(--text-muted) group-hover:text-primary transition-colors">
                    <Barbell size={22} weight="fill" />
                  </div>

                  <div className="flex flex-col justify-center min-w-0 h-11">
                    <h3 className="truncate text-base font-black uppercase tracking-tight text-(--text-main) leading-none group-hover:text-primary transition-colors">
                      {item.name}
                    </h3>

                    {item.variation && (
                      <p className="truncate text-[10px] font-bold text-primary uppercase tracking-widest leading-none mt-1.5">
                        {item.variation}
                      </p>
                    )}
                  </div>
                </div>

                <CaretRight
                  size={18}
                  weight="bold"
                  className="shrink-0 text-(--text-muted) opacity-20 group-hover:opacity-100 transition-all ml-4"
                />
              </motion.button>
            ))
          ) : (
            <div className="py-20 text-center flex flex-col items-center justify-center opacity-20">
              <p className="uppercase font-black text-xs tracking-widest">
                No Exercises found
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex justify-center py-24 text-primary">
      <SpinnerGap size={34} weight="bold" className="animate-spin" />
    </div>
  );
}
