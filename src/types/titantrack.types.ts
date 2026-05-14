export type GenderType = "male" | "female" | "other" | "prefer_not_to_say";

export type OnboardingData = {
  name: string;
  gender: GenderType;
  dob: string;
  height: number;
  weight: number;
  goalWeight: number;
  weeklyTarget: number;
  monthlyTarget: number;
  initXp: number;
};

export const GOAL_TYPES = {
  MEASUREMENT: "measurement",
  EXERCISE: "exercise",
  DAYS: "days",
} as const;

export type GoalType = (typeof GOAL_TYPES)[keyof typeof GOAL_TYPES];

export type LocalEntity<T> = T & {
  is_dirty: 0 | 1;
  last_synced_at?: string | null;
};

export type SyncResult = {
  uploaded: number;
  failed: number;
  downloaded: number;
};
