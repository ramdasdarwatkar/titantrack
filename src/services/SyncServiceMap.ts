import { bodyMetricService } from "@/services/bodyMetric.service";
import { goalService } from "@/services/goal.service";
import { userProfileService } from "@/services/userProfile.service";
import { workoutService } from "./workout.service";
import { exerciseService } from "./exercise.service";
import { setService } from "./set.service";
import { stepService } from "./step.service";
import { routineService } from "./routine.service";
import { personalRecordService } from "./personalRecord.service";
import { staticTypeService } from "./staticType.service";

// Every service listed here is synced by syncManager.synchronizeDatabase().
// If a service is missing here, its data is never uploaded or downloaded.
export const syncServiceMap = {
  user_profiles: userProfileService,
  body_metrics: bodyMetricService,
  goals: goalService,
  workouts: workoutService,
  exercises: exerciseService,
  sets: setService,
  steps: stepService,
  routines: routineService,
  personal_records: personalRecordService,
  static_types: staticTypeService,
} as const;
