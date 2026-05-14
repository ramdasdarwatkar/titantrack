import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Trash,
  PencilSimple,
  SpinnerGap,
  Flask,
  Plus,
  CaretUp,
  CaretDown,
} from "@phosphor-icons/react";

import { routineService } from "@/services/routine.service";
import { exerciseService } from "@/services/exercise.service";
import { useAuth } from "@/hooks/useAuth";
import { Helper } from "@/utils/helper";
import type { LocalExercise } from "@/types/entity.types";
import ExerciseSelectorModal from "@/pages/library/components/exercises/ExerciseSelectorModal";

interface RoutineEntry extends LocalExercise {
  sets: number;
  val1: number;
  val2: number;
}

export default function RoutineForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();

  const [isEditing, setIsEditing] = useState(!id);
  const [loading, setLoading] = useState(!!id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [selected, setSelected] = useState<RoutineEntry[]>([]);
  const [showSelector, setShowSelector] = useState(false);
  const [library, setLibrary] = useState<LocalExercise[]>([]);

  const loadData = useCallback(async () => {
    if (!session?.user.id) return;
    const lib = await exerciseService.list(session.user.id);
    setLibrary(lib);

    if (id) {
      const res = await routineService.get(id);
      if (res) {
        setName(res.routine.name);
        const hydrated = res.exercises
          .sort((a, b) => a.sequence_number - b.sequence_number)
          .map((re) => {
            const ex = lib.find((l) => l.id === re.exercise_id);
            return {
              ...ex!,
              sets: re.sets || 3,
              val1: re.value1 || 0,
              val2: re.value2 || 0,
            };
          });
        setSelected(hydrated);
      }
      setLoading(false);
    }
  }, [id, session?.user.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExercisesSelected = (exercises: LocalExercise[]) => {
    const newItems = exercises.map((ex) => {
      // FIX: Ensure metrics is treated as an array for TS
      const metricsArr = Array.isArray(ex.metrics) ? ex.metrics : [];
      const isTimed =
        metricsArr.includes("duration") || metricsArr.includes("distance");

      return {
        ...ex,
        sets: 3,
        val1: isTimed ? 60 : 8,
        val2: isTimed ? 0 : 12,
      };
    });
    setSelected([...selected, ...newItems]);
    setShowSelector(false);
  };

  const updateEntry = (idx: number, key: keyof RoutineEntry, val: number) => {
    const clone = [...selected];
    (clone[idx] as any)[key] = val;
    setSelected(clone);
  };

  const swap = (idxA: number, idxB: number) => {
    const clone = [...selected];
    [clone[idxA], clone[idxB]] = [clone[idxB], clone[idxA]];
    setSelected(clone);
  };

  const handleSave = async () => {
    if (!name || selected.length === 0 || !session?.user.id) return;
    setIsSubmitting(true);
    const routineId = id || Helper.uuid();
    const payload = {
      routine: {
        id: routineId,
        name,
        user_id: session.user.id,
        updated_at: Helper.nowIso(),
      },
      exercises: selected.map((ex, i) => ({
        routine_id: routineId,
        exercise_id: ex.id,
        sequence_number: i + 1,
        sets: ex.sets,
        value1: ex.val1,
        value2: ex.val2,
      })),
    };

    try {
      if (id) {
        await routineService.update(id, payload.routine, payload.exercises);
        setIsEditing(false);
      } else {
        await routineService.create(payload);
        navigate("/library");
      }
      await loadData();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <SpinnerGap className="animate-spin text-primary" size={32} />
      </div>
    );

  return (
    <div className="space-y-4 pb-32">
      {/* IDENTITY SECTION */}
      <section className="rounded-xl border border-(--card-border) bg-(--card-bg) p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-2.5">
          <Flask size={13} weight="fill" className="text-primary opacity-80" />
          <span className="text-[9px] uppercase tracking-[0.24em] font-black text-(--text-muted)">
            Routine Identity
          </span>
        </div>
        {isEditing ? (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-transparent text-[24px] leading-none font-black tracking-tight text-(--text-main) outline-none border-b border-primary/20 pb-1 placeholder:text-(--text-muted)"
            placeholder="ROUTINE NAME"
          />
        ) : (
          <h1 className="text-[24px] leading-none font-black tracking-tight text-(--text-main)">
            {name || "Untitled Routine"}
          </h1>
        )}
      </section>

      {/* FLOW SECTION */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <span className="text-[9px] uppercase tracking-[0.22em] font-black text-(--text-muted)">
            Sequence Flow
          </span>
          {isEditing && (
            <button
              onClick={() => setShowSelector(true)}
              className="flex items-center gap-1.5 text-primary active:scale-95 transition-all"
            >
              <Plus size={14} weight="bold" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Add Movements
              </span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          {selected.map((ex, i) => {
            // FIX: Ensure metrics is treated as array
            const metricsArr = Array.isArray(ex.metrics) ? ex.metrics : [];
            const hasDuration = metricsArr.includes("duration");

            return (
              <div
                key={i}
                className="rounded-xl border border-(--card-border) bg-(--card-bg) overflow-hidden shadow-sm"
              >
                <div className="px-4 py-3 flex items-center justify-between border-b border-(--card-border)/50 bg-(--bg-base)/20">
                  <div className="flex flex-col min-w-0">
                    <h3 className="font-black text-sm uppercase tracking-tight truncate text-(--text-main) flex items-baseline gap-1">
                      {ex.name}
                      {ex.variation && (
                        <span className="text-[10px] lowercase text-primary font-bold">
                          ({ex.variation})
                        </span>
                      )}
                    </h3>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-(--text-muted) opacity-60">
                        {ex.muscle_group || "Other"} • {ex.muscle || "General"}
                      </span>
                      <span className="text-[8px] font-medium uppercase tracking-tight text-(--text-muted) opacity-40">
                        {ex.equipment || "No Equipment"}
                      </span>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        disabled={i === 0}
                        onClick={() => swap(i, i - 1)}
                        className="w-8 h-8 rounded-md bg-(--btn-secondary-bg) border border-(--card-border) flex items-center justify-center text-(--text-muted) active:text-primary active:scale-90 transition-all disabled:opacity-20"
                      >
                        <CaretUp size={14} weight="bold" />
                      </button>
                      <button
                        disabled={i === selected.length - 1}
                        onClick={() => swap(i, i + 1)}
                        className="w-8 h-8 rounded-md bg-(--btn-secondary-bg) border border-(--card-border) flex items-center justify-center text-(--text-muted) active:text-primary active:scale-90 transition-all disabled:opacity-20"
                      >
                        <CaretDown size={14} weight="bold" />
                      </button>
                      <button
                        onClick={() =>
                          setSelected(selected.filter((_, idx) => idx !== i))
                        }
                        className="w-8 h-8 rounded-md bg-(--btn-secondary-bg) border border-(--card-border) flex items-center justify-center text-red-500 active:scale-90 transition-all ml-1"
                      >
                        <Trash size={14} weight="bold" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex gap-3 mb-2 px-1">
                    <span className="flex-1 text-[8px] font-black text-(--text-muted) uppercase text-center tracking-widest opacity-40">
                      Sets
                    </span>
                    <span className="flex-1 text-[8px] font-black text-(--text-muted) uppercase text-center tracking-widest opacity-40">
                      {hasDuration ? "Secs" : "Min"}
                    </span>
                    <span className="flex-1 text-[8px] font-black text-(--text-muted) uppercase text-center tracking-widest opacity-40">
                      {hasDuration ? "Mtrs" : "Max"}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-1 h-11 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-center">
                      <span className="text-primary font-black text-xs uppercase italic">
                        {ex.sets}
                      </span>
                    </div>
                    <InputBox
                      value={ex.val1}
                      disabled={!isEditing}
                      onChange={(v) => updateEntry(i, "val1", parseInt(v))}
                    />
                    <InputBox
                      value={ex.val2}
                      disabled={!isEditing}
                      onChange={(v) => updateEntry(i, "val2", parseInt(v))}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="fixed bottom-6 inset-x-6 z-40">
        <div className="rounded-xl border border-(--card-border)/50 bg-(--card-bg)/80 backdrop-blur-xl p-2 flex gap-2 shadow-2xl">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 h-12 rounded-xl bg-primary text-white text-[10px] uppercase tracking-[0.2em] font-black flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-primary/20"
              >
                <PencilSimple size={16} weight="bold" /> Edit Parameters
              </button>
              <button
                onClick={() => {
                  if (window.confirm("Delete routine?"))
                    routineService.delete(id!).then(() => navigate("/library"));
                }}
                className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/10 active:scale-90 transition-all"
              >
                <Trash size={20} weight="bold" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={!name || selected.length === 0 || isSubmitting}
                className="flex-1 h-12 rounded-xl bg-primary text-white text-[10px] uppercase tracking-[0.2em] font-black active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-40"
              >
                {isSubmitting ? "Syncing..." : "Save Routine"}
              </button>
              <button
                onClick={() => (id ? setIsEditing(false) : navigate(-1))}
                className="px-5 h-12 text-[10px] uppercase tracking-[0.2em] font-black text-(--text-muted) active:opacity-50"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </footer>

      <ExerciseSelectorModal
        isOpen={showSelector}
        onClose={() => setShowSelector(false)}
        onConfirm={handleExercisesSelected}
        library={library}
      />
    </div>
  );
}

function InputBox({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex-1">
      <input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full h-11 rounded-xl bg-(--bg-base) text-center font-black text-sm text-(--text-main) outline-none border border-(--card-border) focus:border-primary/40 disabled:opacity-50 transition-all"
      />
    </div>
  );
}
