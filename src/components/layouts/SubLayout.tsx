import { Outlet, useNavigate } from "react-router-dom";
import { useLayoutEffect } from "react";
import { CaretLeft } from "@phosphor-icons/react";

interface SubLayoutProps {
  title?: string;
  rightElement?: React.ReactNode;
}

export default function SubLayout({ title, rightElement }: SubLayoutProps) {
  const navigate = useNavigate();

  useLayoutEffect(() => {
    const el = document.getElementById("sub-scroll");
    if (el) el.scrollTo({ top: 0 });
  }, []);

  return (
    <div
      className="w-full flex flex-col bg-(--bg-base) overflow-hidden"
      style={{ height: "var(--app-height, 100dvh)" }}
    >
      {/* HEADER — safe-area top via inline style for iOS notch/Dynamic Island */}
      <header
        className="shrink-0 bg-(--bg-base)/90 backdrop-blur-md border-b border-(--card-border)"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="flex items-center h-14 px-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl active:scale-90 transition-transform"
          >
            <CaretLeft size={22} weight="bold" />
          </button>

          <h1 className="flex-1 text-center text-sm font-bold uppercase tracking-widest">
            {title}
          </h1>

          {/* Right slot — fixed width keeps title visually centered */}
          <div className="w-10 flex justify-end">{rightElement}</div>
        </div>
      </header>

      {/* SCROLL AREA
          scroll-contained: no pull-to-refresh, no rubber-band
          no-scrollbar: clean native feel
      */}
      <main
        id="sub-scroll"
        className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar scroll-contained"
      >
        <div
          className="px-6 py-6"
          style={{
            paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))",
          }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}
