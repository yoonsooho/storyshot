import React from "react";

export interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
  rows?: number;
}

export function Field({ label, value, onChange, textarea, rows = 3 }: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5 text-xs sm:text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      {textarea ? (
        <textarea
          rows={rows}
          className="min-h-[80px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner shadow-slate-100 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 shadow-inner shadow-slate-100 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

