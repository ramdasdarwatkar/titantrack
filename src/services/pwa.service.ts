import { registerSW } from "virtual:pwa-register";

// Define a type for the update function provided by vite-plugin-pwa
type SWUpdateFunction = (reload?: boolean) => Promise<void>;

class PWAService {
  private updateFunction: SWUpdateFunction | undefined;

  /**
   * Initializes the Service Worker registration.
   * @param callbacks - Hooks for UI updates
   */
  public register(callbacks: {
    onNeedRefresh: () => void;
    onOfflineReady: () => void;
  }) {
    this.updateFunction = registerSW({
      onNeedRefresh: () => callbacks.onNeedRefresh(),
      onOfflineReady: () => callbacks.onOfflineReady(),
      onRegisterError(error: Error) {
        console.error("SW Registration Error:", error);
      },
    });
  }

  /**
   * Forces the Service Worker to update and reloads the page.
   * Includes a safety delay for DB transactions.
   */
  public async updateApp(): Promise<void> {
    try {
      // Ensure local DB (Dexie/IDB) transactions are finished
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (this.updateFunction) {
        await this.updateFunction(true);
      }
    } catch (error) {
      console.error("Failed to update app:", error);
    }
  }
}

export const pwaService = new PWAService();
