import { NavLink, useLocation } from "react-router-dom";
import {
  HouseIcon,
  BarbellIcon,
  ChartLineUpIcon,
  UserIcon,
} from "@phosphor-icons/react";

const NAV_ITEMS = [
  { path: "/dashboard", icon: HouseIcon, label: "Home" },
  { path: "/library", icon: BarbellIcon, label: "Library" },
  { path: "/analytics", icon: ChartLineUpIcon, label: "Progress" },
  { path: "/profile", icon: UserIcon, label: "Profile" },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav
      className="
        bg-white/80 dark:bg-black/40
        backdrop-blur-xl
        border-t border-(--card-border)
        flex items-center justify-around
        px-2
        w-full
      "
      style={{
        paddingTop: "1rem",
        paddingBottom: "max(0.5rem, env(safe-area-inset-bottom, 0px))",
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={`
              flex flex-col items-center gap-1 pb-3 transition-all duration-300
              ${isActive ? "text-primary scale-110" : "text-(--text-muted) opacity-60"}
            `}
          >
            <item.icon size={24} weight={isActive ? "fill" : "bold"} />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {item.label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}
