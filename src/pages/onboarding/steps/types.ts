export interface OnboardingFormData {
  name: string;
  gender: string;
  dob: string;
  height_cm: number | "";
  weight_kg: number | "";
  target_weight_kg: number | "";
  target_weekly_days: number;
  target_monthly_days: number;
  xp_level: string;
  starting_xp: number;
}
