import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { onboardingService } from "@/services/onboarding.service";
import { useAuth } from "@/hooks/useAuth";
import { useSync } from "@/hooks/useSync";
import { useToast } from "@/hooks/useToast";
import "@/pages/onboarding/Onboarding.css";

// Step Components
import { Identity } from "@/pages/onboarding/steps/Identity";
import { Measurement } from "@/pages/onboarding/steps/Measurement";
import { Target } from "@/pages/onboarding/steps/Target";
import { Experience } from "@/pages/onboarding/steps/Experience";
import { Summary } from "@/pages/onboarding/steps/Summary";

import type { OnboardingData, GenderType } from "@/types/titantrack.types";

export interface OnboardingFormData {
  name: string;
  gender: string;
  dob: string;
  height_cm: number | "";
  weight_kg: number | "";
  target_weight_kg: number | "";
  target_weekly_days: number;
  target_monthly_days: number | "";
  xp_level: "beginner" | "intermediate" | "advanced" | "elite" | "";
  starting_xp: number;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth() as { user: { id: string } | null };
  const { syncNow, refreshProfile } = useSync();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [data, setData] = useState<OnboardingFormData>({
    name: "",
    gender: "",
    dob: "",
    height_cm: "",
    weight_kg: "",
    target_weight_kg: "",
    target_weekly_days: 0,
    target_monthly_days: 0,
    xp_level: "",
    starting_xp: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setSubmitting] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!data.name.trim()) e.name = "Please enter your name.";
      if (!data.gender) e.gender = "Please select a gender option.";
      if (!data.dob) e.dob = "Please enter your date of birth.";
    }
    if (step === 2) {
      if (!data.height_cm || Number(data.height_cm) < 100)
        e.height = "Valid height (100–250cm) required.";
      if (!data.weight_kg || Number(data.weight_kg) < 20)
        e.weight = "Valid weight (20–300kg) required.";
    }
    if (step === 3) {
      if (!data.target_weekly_days) e.weekly = "Select your weekly frequency.";
      if (!data.target_monthly_days) e.monthly = "Select your monthly target.";
      if (!data.target_weight_kg) e.tw = "Please set a goal weight.";
    }
    if (step === 4 && !data.xp_level)
      e.xp = "Please select your experience level.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (validate()) {
      setDir(1);
      setStep((s) => s + 1);
    }
  };

  const back = () => {
    setDir(-1);
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    if (!user?.id) return;
    setSubmitting(true);

    try {
      const payload: OnboardingData = {
        name: data.name,
        gender: data.gender as GenderType,
        dob: data.dob,
        height: Number(data.height_cm),
        weight: Number(data.weight_kg),
        goalWeight: Number(data.target_weight_kg),
        weeklyTarget: data.target_weekly_days,
        monthlyTarget: Number(data.target_monthly_days),
        initXp: data.starting_xp,
      };

      // 1. Write profile + body metrics + goals to local DB
      await onboardingService.completeOnboarding(user.id, payload);

      // 2. Upload dirty records to Supabase
      await syncNow();

      // 3. Flip hasProfile in SyncContext so AppRouter stops
      //    redirecting back to /onboarding
      await refreshProfile();

      showToast("Welcome to TitanTrack! 🎉", "success");

      // 4. Navigate — hasProfile is now true so the route resolves correctly
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Onboarding submit failed:", err);
      showToast("Something went wrong. Please try again.", "error");
      setSubmitting(false);
    }
  };

  return (
    <div className="ob-screen-root">
      <div className="ob-orb-1" />
      <div className="ob-orb-2" />
      <div className="ob-main-container">
        <div className="ob-progress-nav">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className={`ob-dot ${s <= step ? "active" : ""}`} />
          ))}
        </div>

        <div className="ob-viewport">
          <AnimatePresence custom={dir} mode="wait">
            <motion.div
              key={step}
              className="ob-slide"
              initial={{ x: dir > 0 ? "50%" : "-50%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: dir > 0 ? "-50%" : "50%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="ob-scroll-view">
                {step === 1 && (
                  <Identity data={data} setData={setData} errors={errors} />
                )}
                {step === 2 && (
                  <Measurement data={data} setData={setData} errors={errors} />
                )}
                {step === 3 && (
                  <Target data={data} setData={setData} errors={errors} />
                )}
                {step === 4 && <Experience data={data} setData={setData} />}
                {step === 5 && <Summary data={data} />}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="ob-actions-footer">
          {step > 1 && (
            <button
              className="ob-btn-back"
              onClick={back}
              disabled={isSubmitting}
            >
              Back
            </button>
          )}
          <button
            className="ob-btn-next"
            onClick={step < 5 ? next : handleSubmit}
            disabled={isSubmitting}
          >
            {step < 5
              ? "Continue →"
              : isSubmitting
                ? "Saving..."
                : "🏁 Start Journey"}
          </button>
        </div>
      </div>
    </div>
  );
}
