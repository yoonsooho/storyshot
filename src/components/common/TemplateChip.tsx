import React from "react";
import type { GradientId } from "@/types/StoryCardPreview";

export interface TemplateChipProps {
  id?: GradientId;
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
}

export function TemplateChip({ label, description, active, onClick }: TemplateChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`focus-ring flex min-h-[44px] min-w-[120px] flex-col justify-center rounded-xl border px-3 py-2.5 text-left interact-scale sm:min-h-0 ${
        active
          ? "border-slate-900 bg-slate-900 text-slate-50 shadow-sm"
          : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <span className="text-xs font-semibold">{label}</span>
      <span className="mt-0.5 text-[11px] text-slate-500">{description}</span>
    </button>
  );
}

