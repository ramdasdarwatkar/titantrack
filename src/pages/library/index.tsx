import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Barbell, Stack } from "@phosphor-icons/react";
import ExerciseList from "./components/exercises/ExerciseList";
import RoutineList from "./components/routines/RoutineList";

type TabType = "exercises" | "routines";

export default function Library() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>(
    () => (localStorage.getItem("lib_active_tab") as TabType) || "exercises",
  );

  useEffect(() => {
    localStorage.setItem("lib_active_tab", activeTab);
  }, [activeTab]);

  const handleAdd = () => {
    const path =
      activeTab === "exercises"
        ? "/library/exercise/create"
        : "/library/routine/create";
    navigate(path);
  };

  return (
    <div className="flex flex-col h-full bg-(--bg-base) select-none overflow-hidden">
      {/* HEADER */}
      <header className="px-6 pb-4 flex items-center justify-between shrink-0">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-(--text-main) leading-none">
          Library
        </h1>
        <button
          onClick={handleAdd}
          className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg active:scale-90 transition-all"
        >
          <Plus size={28} weight="bold" />
        </button>
      </header>

      {/* TABS WITH SLIDING INDICATOR */}
      <section className="px-6 pb-2 shrink-0">
        <div className="flex p-1 bg-(--btn-secondary-bg) rounded-2xl border border-(--btn-secondary-border) relative">
          {/* Tab 1: Exercises */}
          <button
            onClick={() => setActiveTab("exercises")}
            className={`flex-1 relative flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors duration-300 z-10 ${
              activeTab === "exercises" ? "text-white" : "text-(--text-muted)"
            }`}
          >
            <Barbell
              size={18}
              weight={activeTab === "exercises" ? "fill" : "bold"}
            />
            Exercises
            {activeTab === "exercises" && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-primary rounded-xl shadow-lg -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
          </button>

          {/* Tab 2: Routines */}
          <button
            onClick={() => setActiveTab("routines")}
            className={`flex-1 relative flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors duration-300 z-10 ${
              activeTab === "routines" ? "text-white" : "text-(--text-muted)"
            }`}
          >
            <Stack
              size={18}
              weight={activeTab === "routines" ? "fill" : "bold"}
            />
            Routines
            {activeTab === "routines" && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-primary rounded-xl shadow-lg -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
          </button>
        </div>
      </section>

      {/* CONTENT WITH FADE-IN */}
      <main className="flex-1 overflow-y-auto no-scrollbar px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="pb-32"
          >
            {activeTab === "exercises" ? <ExerciseList /> : <RoutineList />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
