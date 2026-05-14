import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSync } from "@/hooks/useSync";

// Layouts
import MainLayout from "@/components/layouts/MainLayout";
import SubLayout from "@/components/layouts/SubLayout";

// Pages
import Login from "@/pages/auth/Login";
import Onboarding from "@/pages/onboarding/Onboarding";
import Dashboard from "@/pages/dashboard/Dashboard";
import WorkoutDetail from "@/pages/workout/WorkoutDetail";
import SplashScreen from "@/components/SplashScreen";
import ProfilePage from "@/pages/profile/Profile";
import Library from "@/pages/library";
import ExerciseForm from "@/pages/library/components/exercises/ExerciseForm";
import RoutineForm from "@/pages/library/components/routines/RoutineForm";

/*
  Named functions instead of const arrows — prevents HMR remount issues.
  Replace each with a real import as you build the page.
*/

function Analytics() {
  return <div className="p-6 text-(--text-main)">Analytics Page</div>;
}

function Settings() {
  return <div className="p-6 text-(--text-main)">Settings Page</div>;
}

export const AppRouter = () => {
  const { session, isInitialized: authReady } = useAuth();
  const { hasProfile } = useSync();

  const isCheckingProfile = session && hasProfile === null;

  if (!authReady || isCheckingProfile) {
    return <SplashScreen />;
  }

  return (
    <Routes>
      {!session ? (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        <>
          {!hasProfile ? (
            <>
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="*" element={<Navigate to="/onboarding" replace />} />
            </>
          ) : (
            <>
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/library" element={<Library />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              <Route path="/library/exercise">
                <Route element={<SubLayout title="Exercise Detail" />}>
                  <Route path=":id" element={<ExerciseForm />} />
                </Route>
              </Route>

              {/* Inside AppRouter.tsx protected routes section */}
              <Route path="/library/exercise/create">
                <Route element={<SubLayout title="Create Exercise" />}>
                  <Route index element={<ExerciseForm />} />
                </Route>
              </Route>

              <Route path="/library/routine/:id">
                <Route element={<SubLayout title="Routine Details" />}>
                  <Route index element={<RoutineForm />} />
                </Route>
              </Route>

              <Route path="/library/routine/create">
                <Route element={<SubLayout title="Create Routine" />}>
                  <Route index element={<RoutineForm />} />
                </Route>
              </Route>

              <Route path="/workout">
                <Route element={<SubLayout title="Workout Session" />}>
                  <Route path=":id" element={<WorkoutDetail />} />
                </Route>
              </Route>

              <Route path="/settings">
                <Route element={<SubLayout title="Settings" />}>
                  <Route index element={<Settings />} />
                </Route>
              </Route>

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </>
          )}
        </>
      )}
    </Routes>
  );
};
