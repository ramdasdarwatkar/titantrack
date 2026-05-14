// src/pages/ProfilePage.tsx

import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.service";

/**
 * Responsibility: Render the authenticated user's profile UI.
 * Adheres to SRP: This component ONLY handles UI + user actions.
 */
export default function ProfilePage() {
  const navigate = useNavigate();

  /**
   * Handles user sign out.
   * AuthProvider/session listener will automatically update global auth state.
   */
  const handleSignOut = async (): Promise<void> => {
    try {
      await authService.signOut();

      // Redirect after logout
      navigate("/login");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="flex flex-col items-center">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
            U
          </div>

          {/* User Info */}
          <h1 className="mt-4 text-2xl font-bold text-gray-800">Profile</h1>

          <p className="text-gray-500 mt-1">Welcome back 👋</p>
        </div>

        {/* Actions */}
        <div className="mt-8">
          <button
            onClick={handleSignOut}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-colors duration-200"
          >
            Sign Out
          </button>
        </div>
      </div>
    </main>
  );
}
