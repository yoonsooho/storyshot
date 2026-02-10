import React from "react";

export type BackgroundType = "gradient" | "image";
export type MoodId = "calm" | "happy" | "tired" | "focused";
export type GradientId = "sunset" | "ocean" | "mono";

export interface StoryFormState {
  textMain: string;
  textSecondary: string;
  date: string;
  mood: MoodId;
  backgroundType: BackgroundType;
  gradient: GradientId;
  imageDataUrl: string | null;
  imageFileName: string | null;
}

export interface StoryCardPreviewProps {
  form: StoryFormState;
  cardRef: React.RefObject<HTMLDivElement | null>;
}

export function StoryCardPreview({ form, cardRef }: StoryCardPreviewProps) {
  const gradientBackground =
    form.gradient === "sunset"
      ? "linear-gradient(145deg, #312e81 0%, #7c2d12 40%, #f97316 70%, #facc15 100%)"
      : form.gradient === "ocean"
      ? "linear-gradient(150deg, #0f172a 0%, #0369a1 35%, #0891b2 65%, #a5f3fc 100%)"
      : "linear-gradient(145deg, #020617 0%, #111827 40%, #4b5563 100%)";

  const showImage = form.backgroundType === "image" && form.imageDataUrl;

  const moodLabel =
    form.mood === "happy"
      ? "Good day"
      : form.mood === "tired"
      ? "A little tired"
      : form.mood === "focused"
      ? "In focus"
      : "Easy day";

  const moodEmoji =
    form.mood === "happy" ? "😊" : form.mood === "tired" ? "😮‍💨" : form.mood === "focused" ? "🔥" : "😌";

  return (
    <div
      ref={cardRef}
      className="relative aspect-[9/16] w-full max-w-[360px] overflow-hidden rounded-[32px] shadow-md"
      style={{
        background: gradientBackground,
        border: "1px solid rgba(15,23,42,0.4)",
      }}
    >
      <div className="relative h-full w-full">
        {showImage && (
          <img
            src={form.imageDataUrl as string}
            alt="배경"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ zIndex: 0 }}
          />
        )}

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            zIndex: 5,
            background: showImage
              ? "linear-gradient(to top, rgba(15,23,42,0.9), rgba(15,23,42,0.78), rgba(15,23,42,0.94))"
              : "radial-gradient(circle at 0% 0%, rgba(248,250,252,0.15), transparent 55%), radial-gradient(circle at 100% 100%, rgba(15,23,42,0.85), rgba(15,23,42,0.95))",
          }}
        />

        <div
          className="relative flex h-full flex-col justify-between px-6 py-6 text-slate-50 sm:px-7 sm:py-7"
          style={{ zIndex: 10 }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-black/35 px-3 py-1 text-[11px] backdrop-blur-sm">
              <span>{moodEmoji}</span>
              <span className="uppercase tracking-[0.16em]">{moodLabel}</span>
            </div>
            <div className="rounded-full bg-black/35 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] backdrop-blur-sm">
              Today
            </div>
          </div>

          <div className="mt-6 flex flex-1 flex-col justify-center">
            <p
              className="text-balance text-lg font-semibold leading-relaxed sm:text-xl"
              style={{ textShadow: "0 1px 6px rgba(15,23,42,0.9)" }}
            >
              {form.textMain || "오늘을 한 문장으로 남겨보세요."}
            </p>
            {form.textSecondary && (
              <p
                className="mt-3 text-[13px] leading-relaxed text-slate-200/85"
                style={{ textShadow: "0 1px 4px rgba(15,23,42,0.8)" }}
              >
                {form.textSecondary}
              </p>
            )}
          </div>

          <div className="mt-4 flex items-end justify-between text-[11px]">
            <div className="flex flex-col">
              <span className="uppercase tracking-[0.18em] text-slate-200/80">Invite Card Web</span>
              <span className="mt-0.5 text-[10px] text-slate-300/75">One line, one moment.</span>
            </div>
            <div className="rounded-full bg-black/35 px-3 py-1 text-[11px] font-medium text-slate-100 backdrop-blur-sm">
              {form.date || "오늘"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

