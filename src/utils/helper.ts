/* =========================
   Helper Class
========================= */

export class Helper {
  /* Generate UUID v4 */
  static uuid(): string {
    // Native (best)
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    // Fallback using crypto.getRandomValues (better than Math.random)
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);

      // Per RFC 4122 v4
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;

      return [...bytes]
        .map((b, i) => {
          const hex = b.toString(16).padStart(2, "0");
          return [4, 6, 8, 10].includes(i) ? `-${hex}` : hex;
        })
        .join("");
    }

    // Last fallback (least secure)
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /* Current ISO timestamp */
  static nowIso(): string {
    return new Date().toISOString();
  }

  /* Today YYYY-MM-DD */
  static todayStr(): string {
    return Helper.dateStr(new Date());
  }

  /* Format date YYYY-MM-DD */
  static dateStr(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
}
