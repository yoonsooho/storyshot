import React from "react";

export type BackgroundType = "gradient" | "image";
export type MoodId = "calm" | "happy" | "tired" | "focused";
export type GradientId = "sunset" | "ocean" | "mono";

export type CardAspectId =
  | "9_16"
  | "4_5"
  | "3_4"
  | "1_1"
  | "3_2"
  | "4_3"
  | "16_9";

export interface StoryFormState {
  textMain: string;
  textSecondary: string;
  date: string;
  mood: MoodId;
  backgroundType: BackgroundType;
  gradient: GradientId;
  imageDataUrl: string | null;
  imageFileName: string | null;
  /** 0~100, 사진 배경일 때 어두운 오버레이 강도 */
  overlayIntensity?: number;
  /** 메인 문장 텍스트 색상 (CSS color) */
  textMainColor?: string;
  /** 보조 문장 텍스트 색상 (CSS color) */
  textSecondaryColor?: string;
  /** 날짜 텍스트 색상 (CSS color) */
  dateColor?: string;
  /** 오늘의 기분 뱃지 텍스트 색상 (CSS color) */
  moodColor?: string;
  /** 카드 비율 (기본 9:16) */
  cardAspect?: CardAspectId;
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
  const overlayIntensity = (form.overlayIntensity ?? 85) / 100;
  const mainColor = form.textMainColor || "#f9fafb";
  const secondaryColor = form.textSecondaryColor || "#e5e7eb";
  const dateColor = form.dateColor || "#f9fafb";
  const moodColor = form.moodColor || "#f9fafb";

  const aspectRatioMap: Record<CardAspectId, string> = {
    "9_16": "9 / 16",
    "4_5": "4 / 5",
    "3_4": "3 / 4",
    "1_1": "1 / 1",
    "3_2": "3 / 2",
    "4_3": "4 / 3",
    "16_9": "16 / 9",
  };
  const aspectRatio = aspectRatioMap[form.cardAspect ?? "9_16"];
  const isLandscape = form.cardAspect === "3_2" || form.cardAspect === "4_3" || form.cardAspect === "16_9";

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
      className="relative w-full overflow-hidden rounded-[32px] shadow-md"
      style={{
        background: gradientBackground,
        border: "1px solid rgba(15,23,42,0.4)",
        aspectRatio,
        maxWidth: isLandscape ? "520px" : "380px",
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
              ? `linear-gradient(to top,
                  rgba(15,23,42,${0.9 * overlayIntensity}),
                  rgba(15,23,42,${0.78 * overlayIntensity}),
                  rgba(15,23,42,${0.94 * overlayIntensity})
                )`
              : "radial-gradient(circle at 0% 0%, rgba(248,250,252,0.15), transparent 55%), radial-gradient(circle at 100% 100%, rgba(15,23,42,0.85), rgba(15,23,42,0.95))",
          }}
        />

        <div
          className="relative flex h-full flex-col justify-between px-6 py-6 text-slate-50 sm:px-7 sm:py-7"
          style={{ zIndex: 10 }}
        >
          <div className="flex items-start justify-between gap-3">
            <div
              className="inline-flex items-center gap-2 rounded-full bg-black/35 px-3 py-1 text-[11px] backdrop-blur-sm"
              style={{ color: moodColor }}
            >
              <span>{moodEmoji}</span>
              <span className="uppercase tracking-[0.16em]">{moodLabel}</span>
            </div>
          </div>

          <div className="mt-6 flex flex-1 flex-col justify-center">
            <p
              className="text-balance text-lg font-semibold leading-relaxed sm:text-xl"
              style={{ textShadow: "0 1px 6px rgba(15,23,42,0.9)", color: mainColor }}
            >
              {form.textMain || "오늘을 한 문장으로 남겨보세요."}
            </p>
            {form.textSecondary && (
              <p
                className="mt-3 text-[13px] leading-relaxed"
                style={{ textShadow: "0 1px 4px rgba(15,23,42,0.8)", color: secondaryColor }}
              >
                {form.textSecondary}
              </p>
            )}
          </div>

          <div className="mt-4 flex items-end justify-end text-[11px]">
            <div
              className="rounded-full bg-black/35 px-3 py-1 text-[11px] font-medium backdrop-blur-sm"
              style={{ color: dateColor }}
            >
              {form.date || "오늘"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

