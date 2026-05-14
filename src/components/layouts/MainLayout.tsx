import { Outlet, useLocation } from "react-router-dom";
import { useLayoutEffect } from "react";
import BottomNav from "@/components/navigation/BottomNav";

export default function MainLayout() {
  const location = useLocation();

  useLayoutEffect(() => {
    const el = document.getElementById("main-scroll");
    if (el) el.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <div
      className="w-full flex flex-col bg-(--bg-base) overflow-hidden"
      style={{ height: "var(--app-height, 100dvh)" }}
    >
      {/* TOP SHIELD — covers notch / Dynamic Island */}
      <div
        className="shrink-0 bg-(--bg-base) pointer-events-none"
        style={{ height: "env(safe-area-inset-top, 0px)" }}
      />

      {/* SCROLL AREA
          scroll-contained: prevents pull-to-refresh and rubber-band overscroll
          no-scrollbar: hides scrollbar track visually
      */}
      <main
        id="main-scroll"
        className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar scroll-contained min-h-0"
      >
        <Outlet />

        {/*
          Bottom spacer: gives the last piece of content breathing room
          above the nav bar. 80px covers the nav height (~64px) + a gap.
          Safe area is already handled by BottomNav itself.
        */}
        {/* <div style={{ height: "80px" }} /> */}
      </main>

      {/* BOTTOM NAV */}
      <div className="shrink-0">
        <BottomNav />
      </div>
    </div>
  );
}
