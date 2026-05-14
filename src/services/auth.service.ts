import { supabase } from "@/lib/supabase";
import type { AuthResponse } from "@supabase/supabase-js";

/**
 * Responsibility: Handle external identity provider interactions.
 * Adheres to SRP: This class ONLY touches the network/auth provider.
 */
class AuthService {
  /**
   * Signs in the user.
   * Note: The AuthProvider listener in our architecture will automatically
   * detect this success and update the global session state.
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    // We wrap the call to ensure types are handled correctly
    const response = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (response.error) {
      throw response.error;
    }

    return response;
  }

  /**
   * Clears the local session and notifies the AuthProvider.
   */
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  }
}

export const authService = new AuthService();
