import React, { useState } from "react";
import { WDAY_HINTS } from "../constants";
import { MDAY_HINT } from "../utils";
import { type OnboardingFormData } from "../Onboarding";

interface Props {
  data: OnboardingFormData;
  setData: React.Dispatch<React.SetStateAction<OnboardingFormData>>;
  errors: Record<string, string>;
}

export const Target: React.FC<Props> = ({ data, setData, errors }) => {
  const [showManual, setShowManual] = useState(false);

  return (
    <div className="ob-step">
      <div className="ob-head">
        <p className="ob-eyebrow">Step 3 of 5</p>
        <h1 className="ob-title">🎯 Set Targets</h1>
        <p className="ob-sub">How often do you plan to train?</p>
      </div>
      <div className="ob-field">
        <label className="ob-label">Target Weight (kg)</label>
        <div className={`ob-input-box ${errors.tw ? "err" : ""}`}>
          <input
            type="number"
            placeholder="What is your goal weight?"
            value={data.target_weight_kg}
            onChange={(e) =>
              setData((prev) => ({
                ...prev,
                target_weight_kg:
                  e.target.value === "" ? "" : Number(e.target.value),
              }))
            }
          />
        </div>
      </div>
      <div className="ob-field">
        <label className="ob-label">Weekly Goal (Days)</label>
        <div className="ob-pill-selector">
          {[1, 2, 3, 4, 5, 6, 7].map((num) => (
            <button
              key={num}
              className={`pill ${data.target_weekly_days === num ? "sel" : ""}`}
              onClick={() =>
                setData((prev) => ({ ...prev, target_weekly_days: num }))
              }
            >
              {num}
            </button>
          ))}
        </div>
        <p className="ob-active-hint">{WDAY_HINTS[data.target_weekly_days]}</p>
      </div>
      <div className="ob-field">
        <label className="ob-label">Monthly Target Milestone</label>
        {!showManual ? (
          <div className="ob-milestone-grid">
            {[4, 8, 12, 16, 20, 24, 28].map((val) => (
              <button
                key={val}
                className={`milestone-btn ${data.target_monthly_days === val ? "sel" : ""}`}
                onClick={() =>
                  setData((prev) => ({ ...prev, target_monthly_days: val }))
                }
              >
                {val} <small>Days</small>
              </button>
            ))}
            <button
              className="milestone-btn other"
              onClick={() => setShowManual(true)}
            >
              Other <small>Custom</small>
            </button>
          </div>
        ) : (
          <div className="ob-input-box manual-monthly">
            <input
              autoFocus
              type="number"
              placeholder="Enter days (1-31)"
              value={data.target_monthly_days}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  target_monthly_days:
                    e.target.value === "" ? "" : Number(e.target.value),
                }))
              }
            />
            <button
              className="manual-close"
              onClick={() => {
                setShowManual(false);
                setData((prev) => ({ ...prev, target_monthly_days: 16 }));
              }}
            >
              ✕
            </button>
          </div>
        )}
        <p className="ob-active-hint">{MDAY_HINT(data.target_monthly_days)}</p>
      </div>
    </div>
  );
};
