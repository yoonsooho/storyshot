import React from "react";

export type BackgroundType = "gradient" | "image";
export type MoodId = "calm" | "happy" | "tired" | "focused";
export type GradientId = "sunset" | "ocean" | "mono";

export type CardAspectId = "9_16" | "4_5" | "3_4" | "1_1" | "3_2" | "4_3" | "16_9";

export interface StoryFormState {
    /** 제목 (선택). 있으면 카드 상단에 표시 */
    title?: string;
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
    /** 글자 블록 위치 (카드 내 %). 드래그로 변경 가능 */
    positionMood?: { x: number; y: number };
    positionTitle?: { x: number; y: number };
    positionMain?: { x: number; y: number };
    positionSecondary?: { x: number; y: number };
    positionDate?: { x: number; y: number };
    /** 글자 블록 가로 넓이 (카드 대비 %). 리사이즈 핸들로 조절 */
    widthMood?: number;
    widthTitle?: number;
    widthMain?: number;
    widthSecondary?: number;
    widthDate?: number;
    /** 제목 텍스트 색상 (CSS color) */
    titleColor?: string;
    /** 오늘의 기분 문구 (비어 있으면 mood에 따른 기본 문구 사용) */
    moodText?: string;
    /** 오늘의 기분 이모지 (비어 있으면 mood에 따른 기본 이모지 사용) */
    moodEmoji?: string;
}

export const DEFAULT_POSITIONS = {
    mood: { x: 6, y: 6 },
    title: { x: 10, y: 28 },
    main: { x: 10, y: 40 },
    secondary: { x: 10, y: 48 },
    date: { x: 72, y: 85 },
} as const;

export const DEFAULT_WIDTHS = {
    mood: 50,
    title: 85,
    main: 85,
    secondary: 85,
    date: 40,
} as const;

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
    const titleColor = form.titleColor || "#f9fafb";
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

    const posMood = form.positionMood ?? DEFAULT_POSITIONS.mood;
    const posTitle = form.positionTitle ?? DEFAULT_POSITIONS.title;
    const posMain = form.positionMain ?? DEFAULT_POSITIONS.main;
    const posSecondary = form.positionSecondary ?? DEFAULT_POSITIONS.secondary;
    const posDate = form.positionDate ?? DEFAULT_POSITIONS.date;
    const widthMood = form.widthMood ?? DEFAULT_WIDTHS.mood;
    const widthTitle = form.widthTitle ?? DEFAULT_WIDTHS.title;
    const widthMain = form.widthMain ?? DEFAULT_WIDTHS.main;
    const widthSecondary = form.widthSecondary ?? DEFAULT_WIDTHS.secondary;
    const widthDate = form.widthDate ?? DEFAULT_WIDTHS.date;

    const defaultMoodLabel =
        form.mood === "happy"
            ? "좋은 하루"
            : form.mood === "tired"
            ? "조금 지침"
            : form.mood === "focused"
            ? "집중"
            : "편한 하루";
    const moodLabel = form.moodText?.trim() || defaultMoodLabel;

    const defaultMoodEmoji =
        form.mood === "happy" ? "😊" : form.mood === "tired" ? "😮‍💨" : form.mood === "focused" ? "🔥" : "😌";
    const moodEmoji = form.moodEmoji?.trim() || defaultMoodEmoji;

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

                <div className="relative h-full w-full text-slate-50" style={{ zIndex: 10 }}>
                    <div
                        className="absolute inline-flex max-w-[var(--block-width)] items-center gap-2 rounded-full bg-black/35 px-3 py-1 text-[11px] backdrop-blur-sm"
                        style={{
                            left: `${posMood.x}%`,
                            top: `${posMood.y}%`,
                            color: moodColor,
                            ["--block-width" as string]: `${widthMood}%`,
                        }}
                    >
                        <span>{moodEmoji}</span>
                        <span>{moodLabel}</span>
                    </div>

                    {form.title?.trim() ? (
                        <p
                            className="absolute max-w-[var(--block-width)] break-words text-base font-bold leading-snug sm:text-lg"
                            style={{
                                left: `${posTitle.x}%`,
                                top: `${posTitle.y}%`,
                                textShadow: "0 1px 6px rgba(15,23,42,0.9)",
                                color: titleColor,
                                ["--block-width" as string]: `${widthTitle}%`,
                            }}
                        >
                            {form.title.trim()}
                        </p>
                    ) : null}
                    <p
                        className="absolute max-w-[var(--block-width)] break-words text-lg font-semibold leading-relaxed sm:text-xl"
                        style={{
                            left: `${posMain.x}%`,
                            top: `${posMain.y}%`,
                            textShadow: "0 1px 6px rgba(15,23,42,0.9)",
                            color: mainColor,
                            ["--block-width" as string]: `${widthMain}%`,
                        }}
                    >
                        {form.textMain || "오늘을 한 문장으로 남겨보세요."}
                    </p>
                    {form.textSecondary && (
                        <p
                            className="absolute max-w-[var(--block-width)] text-[13px] leading-relaxed"
                            style={{
                                left: `${posSecondary.x}%`,
                                top: `${posSecondary.y}%`,
                                textShadow: "0 1px 4px rgba(15,23,42,0.8)",
                                color: secondaryColor,
                                ["--block-width" as string]: `${widthSecondary}%`,
                            }}
                        >
                            {form.textSecondary}
                        </p>
                    )}

                    <div
                        className="absolute max-w-[var(--block-width)] rounded-full bg-black/35 px-3 py-1 text-[11px] font-medium backdrop-blur-sm"
                        style={{
                            left: `${posDate.x}%`,
                            top: `${posDate.y}%`,
                            color: dateColor,
                            ["--block-width" as string]: `${widthDate}%`,
                        }}
                    >
                        {form.date || "오늘"}
                    </div>
                </div>
            </div>
        </div>
    );
}
