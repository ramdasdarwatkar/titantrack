import { userProfileService } from "@/services/userProfile.service";
import { bodyMetricService } from "@/services/bodyMetric.service";
import { goalService } from "@/services/goal.service";
import { Helper } from "@/utils/helper";
import type { OnboardingData } from "@/types/titantrack.types";
import type { Tables } from "@/types/database.types";

export const onboardingService = {
  async completeOnboarding(userId: string, data: OnboardingData) {
    try {
      const now = Helper.nowIso();
      const today = Helper.todayStr();

      await createNewUserProfile(userId, now, data);
      await initializeBodyMetrics(userId, today, data, now);
      await createOnboardingGoals(userId, data, now);
    } catch (err) {
      console.error("Onboarding failed:", err);
      throw err;
    }
  },
};

async function createNewUserProfile(
  userId: string,
  now: string,
  data: OnboardingData,
) {
  const newProfile: Tables<"user_profiles"> = {
    user_id: userId,
    created_at: now,
    updated_at: now,
    name: data.name,
    current_xp: 0,
    xp: data.initXp,
    dob: data.dob,
    gender: data.gender,
    role: "USER",
  };

  await userProfileService.upsert(newProfile);
}

async function initializeBodyMetrics(
  userId: string,
  today: string,
  data: OnboardingData,
  now: string,
) {
  const bodyMetric: Tables<"body_metrics"> = {
    user_id: userId,
    date: today,
    weight: data.weight,
    height: data.height,
    updated_at: now,
    belly: null,
    chest: null,
    bicep: null,
    forearm: null,
    hip: null,
    thigh: null,
    shoulder: null,
    waist: null,
  };

  await bodyMetricService.create(bodyMetric);
}

async function createOnboardingGoals(
  userId: string,
  data: OnboardingData,
  now: string, // single timestamp for all three goals
) {
  const goals: Tables<"goals">[] = [
    {
      id: crypto.randomUUID(),
      user_id: userId,
      name: "weight",
      goaltype: "MEASUREMENT",
      target: data.goalWeight,
      created_at: now,
      updated_at: now,
      completed_at: null,
    },
    {
      id: crypto.randomUUID(),
      user_id: userId,
      name: "WEEK",
      goaltype: "WORKOUT_DAYS",
      target: data.weeklyTarget,
      created_at: now,
      updated_at: now,
      completed_at: null,
    },
    {
      id: crypto.randomUUID(),
      user_id: userId,
      name: "MONTH",
      goaltype: "WORKOUT_DAYS",
      target: data.monthlyTarget,
      created_at: now,
      updated_at: now,
      completed_at: null,
    },
  ];

  for (const goal of goals) {
    await goalService.create(goal);
  }
}
