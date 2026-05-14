import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { SyncProvider } from "@/providers/SyncProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { AppRouter } from "@/navigation/AppRouter";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const SyncError = (
  <div
    style={{
      height: "var(--app-height, 100dvh)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "12px",
      padding: "24px",
      background: "var(--bg-base)",
      color: "var(--text-main)",
      textAlign: "center",
    }}
  >
    <p style={{ fontSize: "15px", color: "var(--text-muted)", margin: 0 }}>
      Could not connect to TitanTrack services.
    </p>
    <button
      onClick={() => window.location.reload()}
      style={{
        padding: "14px 32px",
        borderRadius: "16px",
        border: "none",
        background: "var(--primary)",
        color: "white",
        fontSize: "15px",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      Reload
    </button>
  </div>
);

/*
  PROVIDER NESTING ORDER — do not change without reading this.

  ThemeProvider
  └─ No dependencies. Outermost so every provider and page
     can read theme state. Reads/writes localStorage only.

  AuthProvider
  └─ No dependencies. Must wrap SyncProvider because
     SyncProvider calls useAuth() internally.

  ErrorBoundary (outer)
  └─ Wraps the data layer. If SyncProvider throws (e.g. Supabase
     unreachable), this catches it and shows a hard-reload fallback.
     Auth/sync state may be corrupt at this point so a soft reset
     is not enough.

  SyncProvider
  └─ Depends on AuthProvider (calls useAuth).
     MUST stay outside BrowserRouter — it does not use routing.
     If SyncProvider ever needs useNavigate or useLocation, it must
     be moved inside BrowserRouter, which means BrowserRouter must
     move above it in the tree.

  BrowserRouter
  └─ All routing hooks (useNavigate, useLocation, useParams) require
     a Router ancestor. Pages and layouts live inside here.

  ToastProvider
  └─ Inside BrowserRouter so toasts can be triggered from any page.
     Renders the toast container as a portal-like fixed overlay.

  ErrorBoundary (inner)
  └─ Wraps the router/page tree. Catches page-level render errors
     and offers a "Try again" reset without a full reload, preserving
     the user's session.
*/
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ErrorBoundary fallback={SyncError}>
          <SyncProvider>
            <BrowserRouter basename="/titantrack/">
              <ToastProvider>
                <ErrorBoundary>
                  <AppRouter />
                </ErrorBoundary>
              </ToastProvider>
            </BrowserRouter>
          </SyncProvider>
        </ErrorBoundary>
      </AuthProvider>
    </ThemeProvider>
  );
}
