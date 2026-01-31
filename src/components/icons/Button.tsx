import clsx from "clsx";
import { useState } from "preact/hooks";
import { Caret } from "./Caret";
import type Preact from "preact";

export type Intent = "primary" | "secondary" | "success" | "warning" | "danger";

const INTENT_CLASSES: Record<Intent, string> = {
  primary: "bg-violet-800",
  secondary: "bg-gray-800",
  success: "bg-lime-600",
  warning: "bg-amber-600",
  danger: "bg-rose-800",
};

export function GenericBox({
  children,
  className,
  active,
  label,
  disabled,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  intent = "secondary",
  ...props
}: { active?: boolean; label?: string; intent?: Intent } & Preact.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(
        "border-2 p-2 relative",
        active && !disabled && "bg-amber-100 text-gray-300 border-black",
        disabled && "text-gray-600 border-gray-600",
        !active && !disabled && [INTENT_CLASSES[intent], "text-white border-white"],

        className,
      )}
      disabled={disabled}
      onPointerDown={disabled ? undefined : onPointerDown}
      onPointerUp={disabled || !active ? undefined : onPointerUp}
      onPointerLeave={disabled ? undefined : onPointerLeave}
      {...props}
    >
      <span className={clsx((active || disabled) && "text-gray-600", "absolute bottom-1 right-2 text-lg font-mono")}>
        {label}
      </span>
      {children}
    </button>
  );
}

export function CaretButton({
  label,
  rotation,
  disabled,
  onPress,
  onRelease,
}: {
  icon?: Preact.ComponentChildren;
  label?: string;
  rotation?: number;
  disabled?: boolean;
  onPress?: () => void;
  onRelease?: () => void;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <GenericBox
      active={pressed}
      label={label}
      disabled={disabled}
      className="aspect-square"
      onPointerDown={() => {
        setPressed(true);
        onPress?.();
      }}
      onPointerUp={() => {
        onRelease?.();
        setPressed(false);
      }}
      onPointerLeave={() => {
        if (pressed) onRelease?.();
        setPressed(false);
      }}
      onPointerCancel={() => {
        if (pressed) onRelease?.();
        setPressed(false);
      }}
      aria-pressed={pressed}
    >
      <Caret rotation={rotation ?? 0} className={clsx("w-full h-full", pressed && "fill-gray-800 stroke-gray-800")} />
    </GenericBox>
  );
}

export function IconButton({
  icon,
  onClick,
  label,
  disabled,
}: {
  icon: Preact.ComponentChildren;
  onClick?: () => void;
  label?: string;
  disabled?: boolean;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <GenericBox
      active={pressed}
      label={label}
      disabled={disabled}
      className="aspect-square"
      onPointerDown={() => {
        setPressed(true);
        onClick?.();
      }}
      onPointerUp={() => {
        setPressed(false);
      }}
      onPointerLeave={() => setPressed(false)}
      aria-pressed={pressed}
    >
      <div
        className={clsx("w-[60%] m-auto pb-4", disabled ? "fill-gray-600" : pressed ? "fill-gray-800" : "fill-white")}
      >
        {icon}
      </div>
    </GenericBox>
  );
}

export function ToggleButton({
  label,
  disabled,
  active,
  onChange,
}: {
  label?: string;
  disabled?: boolean;
  active?: boolean;
  onChange?: (active: boolean) => void;
}) {
  return (
    <GenericBox
      active={active}
      disabled={disabled}
      className={clsx("flex flex-col aspect-square", active && !disabled && "outline-3 outline-amber-100 border-amber-100! bg-gray-800")}
      onPointerDown={() => onChange?.(!active)}
      aria-pressed={active}
    >
      <svg viewBox="0 0 24 4" className={clsx("w-full", active ? "stroke-amber-100" : "stroke-gray-600")}>
        <line x1="2" y1="2" x2="22" y2="2" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <div
        className={clsx(
          "flex-1 flex items-center justify-center text-2xl font-semibold font-mono",
          active && !disabled ? "fill-amber-100" : disabled ? "fill-gray-600" : "fill-white",
        )}
      >
        <svg viewBox="0 0 24 12" className="w-full">
          <text x={12} y={6.5} textAnchor="middle" alignmentBaseline="middle" fontSize={8}>
            {label}
          </text>
        </svg>
      </div>
    </GenericBox>
  );
}

interface Cycle {
  label: string;
  icon: Preact.ComponentChildren;
  value?: Record<string, number>;
}

export function CycleButton({ cycles, disabled }: { cycles: Cycle[]; disabled?: boolean }) {
  const [index, setIndex] = useState(0);
  const current = cycles[index];

  if (!cycles || cycles.length === 0) return null;

  return (
    <GenericBox
      className="aspect-square flex flex-col"
      onPointerDown={() => setIndex((i) => (i + 1) % cycles.length)}
      label={current.label}
      disabled={disabled}
    >
      <svg viewBox="0 0 24 4" className="w-full">
        {cycles.map((_, i) => {
          const r = 1;
          const gap = 1;
          const visualTotalWidth = 22;
          const segmentVisualWidth = (visualTotalWidth - (cycles.length - 1) * gap) / cycles.length;

          const startX = 1 + i * (segmentVisualWidth + gap);
          const endX = startX + segmentVisualWidth;

          const isFirst = i === 0;
          const isLast = i === cycles.length - 1;

          const lineX1 = isFirst ? startX + r : startX;
          const lineX2 = isLast ? endX - r : endX;

          const active = i === index;

          return (
            <g
              key={i}
              className={active && !disabled ? "stroke-amber-100 fill-amber-100" : "stroke-gray-600 fill-gray-600"}
            >
              <line x1={lineX1} y1="2" x2={lineX2} y2="2" strokeWidth="2" />
              {isFirst && <circle cx={lineX1} cy="2" r={r} className="stroke-none" />}
              {isLast && <circle cx={lineX2} cy="2" r={r} className="stroke-none" />}
            </g>
          );
        })}
      </svg>

      <div className="flex-1 flex items-center justify-center w-full fill-white">
        {typeof current.icon === "string" ? (
          <svg viewBox="0 0 24 12" className={clsx("w-full font-mono", disabled ? "fill-gray-600" : "fill-white")}>
            <text x={12} y={4} textAnchor="middle" alignmentBaseline="middle" fontSize={8}>
              {current.icon}
            </text>
          </svg>
        ) : (
          <div className="w-[60%] fill-white stroke-white">{current.icon}</div>
        )}
      </div>
    </GenericBox>
  );
}
