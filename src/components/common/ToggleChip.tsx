import React from "react";

export interface ToggleChipProps {
  active: boolean;
  label: string;
  onClick: () => void;
}

export function ToggleChip({ active, label, onClick }: ToggleChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`focus-ring interact-scale inline-flex min-h-[44px] items-center justify-center gap-1 rounded-full border px-4 py-2.5 ${
        active
          ? "border-slate-900 bg-slate-900 text-slate-50 shadow-sm"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <span>{label}</span>
    </button>
  );
}

