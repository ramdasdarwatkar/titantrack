import { useState, useRef, useEffect, useId } from "react";
import { CaretDown, MagnifyingGlass } from "@phosphor-icons/react";

interface Props {
  options: string[];
  value: string | null;
  onChange: (val: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  error?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select…",
  disabled = false,
  label,
  error,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();

  const filtered = query
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("mousedown", handler);

    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const select = (val: string) => {
    onChange(val);
    setOpen(false);
    setQuery("");
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
      }}
    >
      {label && (
        <label
          htmlFor={id}
          style={{
            display: "block",
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            marginBottom: "8px",
          }}
        >
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((p) => !p)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "14px 16px",
          borderRadius: "14px",
          border: `1.5px solid ${
            error ? "#ef4444" : open ? "var(--primary)" : "var(--input-border)"
          }`,
          background: disabled ? "var(--btn-secondary-bg)" : "var(--input-bg)",
          color: value ? "var(--text-main)" : "var(--text-muted)",
          fontSize: "15px",
          fontWeight: value ? 600 : 400,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          transition: "border-color 0.15s",
          textAlign: "left",
        }}
      >
        <span
          style={{
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {value ?? placeholder}
        </span>

        <CaretDown
          size={16}
          weight="bold"
          style={{
            color: "var(--text-muted)",
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
          }}
        />
      </button>

      {/* Error */}
      {error && (
        <p
          style={{
            fontSize: "12px",
            color: "#ef4444",
            marginTop: "6px",
            fontWeight: 600,
          }}
        >
          {error}
        </p>
      )}

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 100,
            background: "var(--bg-base)",
            border: "1.5px solid var(--card-border)",
            borderRadius: "16px",
            boxShadow: "0 16px 48px rgba(0,0,0,0.25)",
            overflow: "hidden",
            animation: "dd-in 0.15s ease",
          }}
        >
          {/* Search */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 14px",
              borderBottom: "1px solid var(--card-border)",
            }}
          >
            <MagnifyingGlass
              size={16}
              style={{
                color: "var(--text-muted)",
                flexShrink: 0,
              }}
            />

            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: "14px",
                color: "var(--text-main)",
              }}
            />
          </div>

          {/* Options */}
          <div
            style={{
              maxHeight: "220px",
              overflowY: "auto",
            }}
          >
            {filtered.length === 0 ? (
              <div
                style={{
                  padding: "16px",
                  textAlign: "center",
                  fontSize: "13px",
                  color: "var(--text-muted)",
                }}
              >
                No results
              </div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => select(opt)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: "14px",
                    fontWeight: opt === value ? 700 : 500,
                    color:
                      opt === value ? "var(--primary)" : "var(--text-main)",
                    background:
                      opt === value
                        ? "color-mix(in oklch, var(--primary) 8%, transparent)"
                        : "transparent",
                    border: "none",
                    cursor: "pointer",
                    transition: "background 0.1s",
                    display: "block",
                  }}
                  onMouseEnter={(e) => {
                    if (opt !== value)
                      (e.target as HTMLElement).style.background =
                        "var(--btn-secondary-bg)";
                  }}
                  onMouseLeave={(e) => {
                    if (opt !== value)
                      (e.target as HTMLElement).style.background =
                        "transparent";
                  }}
                >
                  {opt}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes dd-in {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
