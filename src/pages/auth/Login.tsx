import React, { useState } from "react";
import {
  EnvelopeSimpleIcon as EnvelopeSimple,
  LockSimpleIcon as LockSimple,
  EyeIcon as Eye,
  EyeSlashIcon as EyeSlash,
  SunIcon as Sun,
  MoonIcon as Moon,
} from "@phosphor-icons/react";
import { authService } from "@/services/auth.service";
import ParticleBackground from "@/components/ParticleBackground";
import { AuthError } from "@supabase/supabase-js";
import { useTheme } from "@/hooks/useTheme";

export default function Login(): React.JSX.Element {
  const { isDark, toggleDark } = useTheme();
  const [show, setShow] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [err, setErr] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);

  const submit = async (
    e: React.SyntheticEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setErr("");
    setBusy(true);

    try {
      await authService.signIn(email.trim(), password);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErr(error.message);
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error
      ) {
        setErr((error as AuthError).message);
      } else {
        setErr("An unexpected error occurred");
      }
      setBusy(false);
    }
  };

  return (
    <div className="root-wrap">
      <ParticleBackground />

      <button type="button" onClick={toggleDark} className="theme-toggle">
        {isDark ? (
          <Sun size={22} weight="bold" />
        ) : (
          <Moon size={22} weight="bold" />
        )}
      </button>

      {/* auth-card: login-specific, centered, max-width constrained */}
      <div className="auth-card glass-frosted bg-(--login-card-bg)!">
        <header className="text-center pt-2">
          <div className="flex items-center justify-center gap-3 mb-3">
            <svg width="32" height="26" viewBox="0 0 28 22" fill="none">
              <path
                d="M2 19 L8 6 L14 14 L20 6 L26 19"
                stroke="currentColor"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-3xl font-bold tracking-wider">
              TitanTrack
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Time to level up your training
          </p>
        </header>

        <div className="flex-1" />

        <form onSubmit={submit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-md font-semibold tracking-wider ml-1">
              Email
            </label>
            <div className="input-wrap">
              <EnvelopeSimple
                size={20}
                className="text-muted-foreground opacity-60"
              />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-md font-semibold tracking-wider ml-1">
              Password
            </label>
            <div className="input-wrap">
              <LockSimple
                size={20}
                className="text-muted-foreground opacity-60"
              />
              <input
                type={show ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                required
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="text-muted-foreground opacity-60 hover:opacity-100"
              >
                {show ? <EyeSlash size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {err && <p className="text-red-400 text-sm text-center">{err}</p>}

          <div className="flex flex-col gap-3 pt-1">
            <button type="submit" disabled={busy} className="btn-signin">
              {busy ? (
                "Signing in..."
              ) : (
                <>
                  Sign In <span className="text-[20px] leading-none">→</span>
                </>
              )}
            </button>

            <button type="button" className="btn-secondary">
              Create an account
            </button>

            <button type="button" className="btn-secondary">
              Forgot your password?
            </button>
          </div>
        </form>

        <div className="flex-1" />

        <footer className="text-center pb-2">
          <p className="text-[12px] text-muted-foreground leading-[1.8] px-4">
            By continuing, you agree to our <br />
            <span className="text-primary font-medium cursor-pointer">
              Terms of Use (EULA)
            </span>{" "}
            &{" "}
            <span className="text-primary font-medium cursor-pointer">
              Privacy Policy
            </span>
          </p>
        </footer>
      </div>
    </div>
  );
}
