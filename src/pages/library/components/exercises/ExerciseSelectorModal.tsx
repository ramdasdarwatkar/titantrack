import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MagnifyingGlass, Check, X, Barbell } from "@phosphor-icons/react";
import type { LocalExercise } from "@/types/entity.types";

interface ExerciseSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedExercises: LocalExercise[]) => void;
  library: LocalExercise[];
}

export default function ExerciseSelectorModal({
  isOpen,
  onClose,
  onConfirm,
  library,
}: ExerciseSelectorModalProps) {
  const [search, setSearch] = useState("");
  const [activeChip, setActiveChip] = useState("ALL");
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>([]);

  // Filtering Logic
  const categories = useMemo(() => {
    const groups = Array.from(
      new Set(library.map((ex) => ex.muscle_group || "OTHER")),
    );
    return ["ALL", ...groups.sort()];
  }, [library]);

  const filteredList = useMemo(() => {
    return library.filter((ex) => {
      const matchesSearch = ex.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesChip =
        activeChip === "ALL" || ex.muscle_group === activeChip;
      return matchesSearch && matchesChip;
    });
  }, [library, search, activeChip]);

  const handleConfirm = () => {
    const selected = library.filter((ex) => tempSelectedIds.includes(ex.id));
    onConfirm(selected);
    setTempSelectedIds([]);
    setSearch("");
    setActiveChip("ALL");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-end overflow-hidden">
          {/* 1. BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* 2. SHEET */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              // If dragged down more than 150px or flicked down with velocity
              if (info.offset.y > 150 || info.velocity.y > 500) {
                onClose();
              }
            }}
            className="relative w-full h-[92vh] bg-[#0A0A0A] rounded-t-[2.5rem] border-t border-white/10 flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Grab Handle */}
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-4 mb-2 shrink-0" />

            {/* HEADER AREA */}
            <div className="px-5 pt-4 pb-2 space-y-5 shrink-0">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] italic text-white/90">
                  Select Exercises
                </h3>
                <span className="text-[10px] font-black text-primary uppercase">
                  {tempSelectedIds.length} Selected
                </span>
              </div>

              {/* Search Box */}
              <div className="input-wrap bg-[#1A1A1A] border-white/5 rounded-2xl h-14 flex items-center px-4 gap-3">
                <MagnifyingGlass size={20} className="text-white/30" />
                <input
                  placeholder="Search by name..."
                  className="flex-1 text-sm font-bold bg-transparent outline-none text-white placeholder:text-white/20"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <X
                    size={18}
                    className="text-white/20"
                    onClick={() => setSearch("")}
                  />
                )}
              </div>

              {/* HORIZONTAL CHIPS */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-5 px-5">
                {categories.map((cat) => (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    key={cat}
                    onClick={() => setActiveChip(cat)}
                    className={`
                      px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all
                      ${
                        activeChip === cat
                          ? "bg-primary text-white shadow-lg shadow-primary/20"
                          : "bg-[#1A1A1A] text-white/40 border border-white/5"
                      }
                    `}
                  >
                    {cat}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* LIST AREA */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-4 pb-32 touch-pan-y">
              <motion.div layout className="space-y-1">
                {filteredList.map((ex) => {
                  const isChecked = tempSelectedIds.includes(ex.id);
                  return (
                    <motion.button
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={ex.id}
                      onClick={() =>
                        setTempSelectedIds((prev) =>
                          isChecked
                            ? prev.filter((id) => id !== ex.id)
                            : [...prev, ex.id],
                        )
                      }
                      className="w-full py-4 flex items-center justify-between border-b border-white/5 active:bg-white/[0.03] transition-colors"
                    >
                      <div className="flex flex-col text-left min-w-0 pr-4">
                        <span
                          className={`font-black text-sm uppercase italic tracking-tight truncate ${isChecked ? "text-primary" : "text-white/90"}`}
                        >
                          {ex.name}
                        </span>
                        <span className="text-[10px] font-bold text-white/20 uppercase">
                          {ex.muscle_group || "Other"}
                        </span>
                      </div>

                      <div
                        className={`
                        w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0
                        ${isChecked ? "bg-primary border-primary text-white" : "border-white/10 bg-[#1A1A1A]"}
                      `}
                      >
                        {isChecked && <Check size={14} weight="bold" />}
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>

              {filteredList.length === 0 && (
                <div className="py-20 text-center opacity-20">
                  <Barbell size={40} className="mx-auto mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest">
                    Nothing found
                  </p>
                </div>
              )}
            </div>

            {/* FLOATING ACTION BUTTON */}
            <div className="absolute bottom-0 inset-x-0 p-5 pb-10 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/95 to-transparent z-10">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleConfirm}
                disabled={tempSelectedIds.length === 0}
                className="w-full h-16 rounded-[1.5rem] bg-primary text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
              >
                Confirm Selection ({tempSelectedIds.length})
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
