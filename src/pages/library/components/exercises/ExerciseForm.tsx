import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Trash,
  Check,
  PencilSimple,
  SpinnerGap,
  Clock,
  Globe,
  Lock,
  Flask,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

import { exerciseService } from "@/services/exercise.service";
import { staticTypeService } from "@/services/staticType.service";
import { useAuth } from "@/hooks/useAuth";
import { Helper } from "@/utils/helper";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

const METRIC_OPTIONS = ["reps", "weight", "distance", "duration"];

export default function ExerciseForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();

  const [isEditing, setIsEditing] = useState(!id);
  const [loading, setLoading] = useState(!!id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    muscle_group: "",
    muscle: "",
    equipment: "",
    variation: "",
    rest_seconds: 60,
    metrics: [] as string[],
    is_public: false,
  });

  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [muscles, setMuscles] = useState<string[]>([]);
  const [equipments, setEquipments] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    const [mg, eq, mu] = await Promise.all([
      staticTypeService.getByRecType("MUSCLE_GROUP"),
      staticTypeService.getByRecType("EQUIPMENT"),
      staticTypeService.getByRecType("MUSCLE"),
    ]);

    setMuscleGroups(mg.map((i: any) => i.value));
    setEquipments(eq.map((i: any) => i.value));
    setMuscles(mu.map((i: any) => i.value));

    if (id) {
      const ex = await exerciseService.get(id);
      if (ex) {
        setForm({
          name: ex.name,
          muscle_group: ex.muscle_group || "",
          muscle: ex.muscle || "",
          equipment: ex.equipment || "",
          variation: ex.variation || "",
          rest_seconds: ex.rest_seconds || 60,
          metrics: (ex.metrics as string[]) || [],
          is_public: !!ex.is_public,
        });
      }
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    if (!form.name || !session?.user.id) return;
    setIsSubmitting(true);
    const payload = {
      ...form,
      id: id || Helper.uuid(),
      user_id: session.user.id,
      updated_at: Helper.nowIso(),
    };
    try {
      if (id) {
        await exerciseService.update(id, payload);
        setIsEditing(false);
      } else {
        await exerciseService.create(payload);
        navigate("/library");
      }
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
    <div className="space-y-4 pb-8">
      {/* IDENTITY SECTION */}
      <section className="rounded-xl border border-(--card-border) bg-(--card-bg) overflow-hidden shadow-sm">
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Flask
                  size={13}
                  weight="fill"
                  className="text-primary opacity-80"
                />
                <span className="text-[9px] uppercase tracking-[0.24em] font-black text-(--text-muted)">
                  Exercise
                </span>
              </div>

              {isEditing ? (
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Pull Up"
                  className="w-full bg-transparent text-[24px] leading-none font-black tracking-tight text-(--text-main) outline-none placeholder:text-(--text-muted)"
                />
              ) : (
                <h1 className="text-[24px] leading-none font-black tracking-tight text-(--text-main)">
                  {form.name}
                </h1>
              )}

              <div className="mt-3">
                {isEditing ? (
                  <input
                    value={form.variation}
                    onChange={(e) =>
                      setForm({ ...form, variation: e.target.value })
                    }
                    placeholder="Variation (optional)"
                    className="w-full h-10 px-3 rounded-xl bg-(--bg-base) border border-(--card-border) text-sm font-bold text-(--text-main) outline-none focus:border-primary/40"
                  />
                ) : form.variation ? (
                  <div className="inline-flex h-8 items-center px-3 rounded-lg bg-primary/10 text-primary text-[10px] uppercase tracking-[0.18em] font-black">
                    {form.variation}
                  </div>
                ) : null}
              </div>
            </div>

            <button
              disabled={!isEditing}
              onClick={() => setForm({ ...form, is_public: !form.is_public })}
              className={`h-11 w-11 rounded-xl border flex items-center justify-center transition-all ${
                form.is_public
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-(--btn-secondary-bg) border-(--card-border) text-(--text-muted)"
              }`}
            >
              {form.is_public ? (
                <Globe size={18} weight="bold" />
              ) : (
                <Lock size={18} weight="bold" />
              )}
            </button>
          </div>
        </div>
      </section>

      {/* CLASSIFICATION */}
      <section className="rounded-xl border border-(--card-border) bg-(--card-bg) p-3 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Flask size={14} weight="bold" className="text-primary opacity-70" />
          <span className="text-[9px] uppercase tracking-[0.22em] font-black text-(--text-muted)">
            Classification
          </span>
        </div>

        {/* Row 1: Muscle Group & Muscle */}
        <div className="grid grid-cols-2 gap-3">
          <SearchableSelect
            label="Group"
            options={muscleGroups}
            value={form.muscle_group}
            disabled={!isEditing}
            onChange={(val) => setForm({ ...form, muscle_group: val || "" })}
          />
          <SearchableSelect
            label="Muscle"
            options={muscles}
            value={form.muscle}
            disabled={!isEditing}
            onChange={(val) => setForm({ ...form, muscle: val || "" })}
          />
        </div>

        {/* Row 2: Equipment */}
        <SearchableSelect
          label="Equipment"
          options={equipments}
          value={form.equipment}
          disabled={!isEditing}
          onChange={(val) => setForm({ ...form, equipment: val || "" })}
        />
      </section>

      {/* METRICS */}
      <section className="rounded-xl border border-(--card-border) bg-(--card-bg) p-3 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Check size={14} weight="bold" className="text-primary opacity-70" />
          <span className="text-[9px] uppercase tracking-[0.22em] font-black text-(--text-muted)">
            Tracking Metrics
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {METRIC_OPTIONS.map((m) => {
            const active = form.metrics.includes(m);
            if (!isEditing && !active) return null;

            return (
              <motion.button
                whileTap={{ scale: 0.97 }}
                key={m}
                disabled={!isEditing}
                onClick={() => {
                  const next = active
                    ? form.metrics.filter((x) => x !== m)
                    : [...form.metrics, m];
                  setForm({ ...form, metrics: next });
                }}
                className={`h-14 rounded-xl border px-3 flex items-center justify-between transition-all ${
                  active
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                    : "bg-(--btn-secondary-bg) border-(--card-border) text-(--text-muted)"
                }`}
              >
                <div className="flex flex-col items-start">
                  <span className="text-[10px] uppercase tracking-[0.18em] font-black leading-none">
                    {m}
                  </span>
                  <span
                    className={`text-[9px] mt-1 ${active ? "text-white/70" : "text-(--text-muted)"}`}
                  >
                    {m === "reps"
                      ? "Count"
                      : m === "weight"
                        ? "Load"
                        : m === "duration"
                          ? "Time"
                          : "Range"}
                  </span>
                </div>

                <AnimatePresence>
                  {active && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-primary"
                    >
                      <Check size={11} weight="bold" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* REST TIMER */}
      <section className="rounded-xl border border-(--card-border) bg-(--card-bg) p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock
              size={15}
              weight="bold"
              className="text-primary opacity-70"
            />
            <span className="text-[9px] uppercase tracking-[0.22em] font-black text-(--text-muted)">
              Rest Timer
            </span>
          </div>
          <div className="text-xl font-black text-primary tabular-nums">
            {form.rest_seconds}s
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="300"
          step="5"
          disabled={!isEditing}
          className="w-full accent-primary bg-(--card-border) h-1.5 rounded-full appearance-none outline-none"
          value={form.rest_seconds}
          onChange={(e) =>
            setForm({ ...form, rest_seconds: parseInt(e.target.value) })
          }
        />
      </section>

      {/* FOOTER */}
      <footer className="fixed bottom-4 inset-x-4 z-50">
        <div className="rounded-2xl border border-(--card-border)/50 bg-(--card-bg)/80 backdrop-blur-xl p-2 flex gap-2 shadow-2xl">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 h-12 rounded-xl bg-primary text-white text-[10px] uppercase tracking-[0.22em] font-black flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-primary/20 transition-all"
              >
                <PencilSimple size={15} weight="bold" />
                Edit
              </button>
              <button
                onClick={() => {
                  if (window.confirm("Delete movement?"))
                    exerciseService
                      .delete(id!)
                      .then(() => navigate("/library"));
                }}
                className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center active:scale-90 border border-red-500/20"
              >
                <Trash size={18} weight="bold" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="flex-1 h-12 rounded-xl bg-primary text-white text-[10px] uppercase tracking-[0.22em] font-black active:scale-95 shadow-lg shadow-primary/20 transition-all"
              >
                {isSubmitting ? "Saving..." : "Save Exercise"}
              </button>
              <button
                onClick={() => (id ? setIsEditing(false) : navigate(-1))}
                className="px-5 h-12 text-[10px] uppercase tracking-[0.22em] font-black text-(--text-muted)"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </footer>
    </div>
  );
}
