"use client";

import { useRef } from "react";
import Image from "next/image";
import type { StoryFormState, CardAspectId } from "@/types/StoryCardPreview";
import { DEFAULT_POSITIONS, DEFAULT_WIDTHS } from "@/types/StoryCardPreview";

export type PositionTarget = "main" | "secondary" | "date" | "mood";

export interface CardPreviewTranslations {
    placeholderMain: string;
    placeholderDate: string;
    textColor: string;
    dragHint: string;
    resizeHint: string;
    altBackground: string;
    moodPlaceholderCalm: string;
    moodPlaceholderHappy: string;
    moodPlaceholderTired: string;
    moodPlaceholderFocused: string;
}

export interface CardPreviewProps {
    form: StoryFormState;
    cardRef: React.RefObject<HTMLDivElement | null>;
    activeTextTarget?: "main" | "secondary" | "date" | "mood" | null;
    onTextTargetSelect?: (target: "main" | "secondary" | "date" | "mood" | null) => void;
    onTextColorChange?: (target: "main" | "secondary" | "date" | "mood", color: string) => void;
    onPositionChange?: (target: PositionTarget, pos: { x: number; y: number }) => void;
    onWidthChange?: (target: PositionTarget, width: number) => void;
    translations?: CardPreviewTranslations;
}

const defaultTranslations: CardPreviewTranslations = {
    placeholderMain: "오늘을 한 문장으로 남겨보세요.",
    placeholderDate: "오늘",
    textColor: "텍스트 색상",
    dragHint: "드래그: 위치 변경 · 클릭: 색상 변경",
    resizeHint: "드래그: 넓이 조절",
    altBackground: "배경",
    moodPlaceholderCalm: "편한 하루",
    moodPlaceholderHappy: "좋은 하루",
    moodPlaceholderTired: "조금 지침",
    moodPlaceholderFocused: "집중",
};

export function CardPreview({
    form,
    cardRef,
    activeTextTarget,
    onTextTargetSelect,
    onTextColorChange,
    onPositionChange,
    onWidthChange,
    translations: tr = defaultTranslations,
}: CardPreviewProps) {
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

    const defaultMoodLabel =
        form.mood === "happy"
            ? tr.moodPlaceholderHappy
            : form.mood === "tired"
              ? tr.moodPlaceholderTired
              : form.mood === "focused"
                ? tr.moodPlaceholderFocused
                : tr.moodPlaceholderCalm;
    const moodLabel = form.moodText?.trim() || defaultMoodLabel;

    const defaultMoodEmoji =
        form.mood === "happy" ? "😊" : form.mood === "tired" ? "😮‍💨" : form.mood === "focused" ? "🔥" : "😌";
    const moodEmoji = form.moodEmoji?.trim() || defaultMoodEmoji;

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
    const isLandscape =
        form.cardAspect === "3_2" || form.cardAspect === "4_3" || form.cardAspect === "16_9";

    const posMood = form.positionMood ?? DEFAULT_POSITIONS.mood;
    const posMain = form.positionMain ?? DEFAULT_POSITIONS.main;
    const posSecondary = form.positionSecondary ?? DEFAULT_POSITIONS.secondary;
    const posDate = form.positionDate ?? DEFAULT_POSITIONS.date;
    const widthMood = form.widthMood ?? DEFAULT_WIDTHS.mood;
    const widthMain = form.widthMain ?? DEFAULT_WIDTHS.main;
    const widthSecondary = form.widthSecondary ?? DEFAULT_WIDTHS.secondary;
    const widthDate = form.widthDate ?? DEFAULT_WIDTHS.date;

    const dragRef = useRef<{
        target: PositionTarget;
        startClientX: number;
        startClientY: number;
        startX: number;
        startY: number;
        hasMoved: boolean;
    } | null>(null);

    const clamp = (v: number) => Math.max(0, Math.min(95, v));

    const handlePointerMove = useRef((e: PointerEvent) => {
        const d = dragRef.current;
        if (!d || !cardRef.current || !onPositionChange) return;
        const rect = cardRef.current.getBoundingClientRect();
        const dx = e.clientX - d.startClientX;
        const dy = e.clientY - d.startClientY;
        const dist = Math.hypot(dx, dy);
        if (!d.hasMoved && dist > 6) d.hasMoved = true;
        if (d.hasMoved) {
            const newX = clamp(d.startX + (dx / rect.width) * 100);
            const newY = clamp(d.startY + (dy / rect.height) * 100);
            onPositionChange(d.target, { x: newX, y: newY });
        }
    }).current;

    const onPointerDown = (target: PositionTarget, e: React.PointerEvent) => {
        const pos =
            target === "mood" ? posMood : target === "main" ? posMain : target === "secondary" ? posSecondary : posDate;
        dragRef.current = {
            target,
            startClientX: e.clientX,
            startClientY: e.clientY,
            startX: pos.x,
            startY: pos.y,
            hasMoved: false,
        };
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        window.addEventListener("pointermove", handlePointerMove);
        const onUp = () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", onUp);
            window.removeEventListener("pointercancel", onUp);
            const d = dragRef.current;
            dragRef.current = null;
            if (d && !d.hasMoved) onTextTargetSelect?.(activeTextTarget === d.target ? null : d.target);
        };
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointercancel", onUp);
    };

    const onPointerUp = (target: PositionTarget, e: React.PointerEvent) => {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
        const d = dragRef.current;
        dragRef.current = null;
        if (d && !d.hasMoved) onTextTargetSelect?.(activeTextTarget === target ? null : target);
    };

    const resizeRef = useRef<{
        target: PositionTarget;
        startClientX: number;
        startWidth: number;
    } | null>(null);
    const clampWidth = (v: number) => Math.max(20, Math.min(95, v));

    const onResizePointerDown = (target: PositionTarget, e: React.PointerEvent) => {
        e.stopPropagation();
        const w =
            target === "mood"
                ? widthMood
                : target === "main"
                  ? widthMain
                  : target === "secondary"
                    ? widthSecondary
                    : widthDate;
        resizeRef.current = { target, startClientX: e.clientX, startWidth: w };
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    };

    const onResizePointerMove = (e: React.PointerEvent) => {
        const r = resizeRef.current;
        if (!r || !cardRef.current || !onWidthChange) return;
        const rect = cardRef.current.getBoundingClientRect();
        const dx = e.clientX - r.startClientX;
        const newWidth = clampWidth(r.startWidth + (dx / rect.width) * 100);
        onWidthChange(r.target, newWidth);
    };

    const onResizePointerUp = (e: React.PointerEvent) => {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
        resizeRef.current = null;
    };

    return (
        <div
            ref={cardRef}
            className="relative w-full overflow-hidden shadow-md"
            style={{
                background: gradientBackground,
                border: "none",
                borderRadius: "32px",
                aspectRatio,
                maxWidth: isLandscape ? "520px" : "380px",
            }}
        >
            <div className="relative h-full w-full">
                {showImage && (
                    <Image
                        src={form.imageDataUrl as string}
                        alt={tr.altBackground}
                        width={380}
                        height={676}
                        className="absolute inset-0 h-full w-full object-cover"
                        style={{ zIndex: 0 }}
                        unoptimized
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
                    className="relative h-full w-full select-none text-slate-50"
                    style={{ zIndex: 10 }}
                    onPointerMove={onResizePointerMove}
                    onPointerUp={onResizePointerUp}
                >
                    <div
                        className="absolute flex items-stretch"
                        style={{ left: `${posMood.x}%`, top: `${posMood.y}%`, maxWidth: `${widthMood}%` }}
                    >
                        <div
                            className="inline-flex cursor-grab active:cursor-grabbing items-center gap-2 rounded-full bg-black/35 px-3 py-1 text-[11px] backdrop-blur-sm transition-colors hover:bg-black/50"
                            style={{ color: moodColor }}
                            title={tr.dragHint}
                            onPointerDown={(ev) => onPointerDown("mood", ev)}
                            onPointerUp={(ev) => onPointerUp("mood", ev)}
                        >
                            <span>{moodEmoji}</span>
                            <span>{moodLabel}</span>
                        </div>
                        {onWidthChange && (
                            <div
                                data-card-export-ignore
                                className="flex w-3 shrink-0 cursor-ew-resize items-center justify-end rounded-r-full pr-0.5 opacity-60 hover:opacity-100"
                                title={tr.resizeHint}
                                onPointerDown={(ev) => onResizePointerDown("mood", ev)}
                            >
                                <span className="text-[10px]">▐</span>
                            </div>
                        )}
                        {activeTextTarget === "mood" && (
                            <div
                                data-card-export-ignore
                                className="absolute left-0 top-full z-20 mt-2 flex items-center gap-2 rounded-xl bg-white/95 px-3 py-1.5 text-[11px] text-slate-700 shadow-lg ring-1 ring-slate-200"
                            >
                                <span>{tr.textColor}</span>
                                <input
                                    type="color"
                                    value={form.moodColor || "#f9fafb"}
                                    onChange={(e) => onTextColorChange?.("mood", e.target.value)}
                                    className="h-5 w-5 cursor-pointer rounded-full border border-slate-200 bg-white p-0"
                                />
                            </div>
                        )}
                    </div>

                    <div
                        className="absolute flex max-w-[95%]"
                        style={{ left: `${posMain.x}%`, top: `${posMain.y}%`, width: `${widthMain}%` }}
                    >
                        <p
                            className="min-w-0 cursor-grab active:cursor-grabbing flex-1 wrap-break-word text-lg font-semibold leading-relaxed rounded-md transition-colors hover:bg-white/10 sm:text-xl"
                            style={{
                                textShadow: "0 1px 6px rgba(15,23,42,0.9)",
                                color: mainColor,
                            }}
                            title={tr.dragHint}
                            onPointerDown={(ev) => onPointerDown("main", ev)}
                            onPointerUp={(ev) => onPointerUp("main", ev)}
                        >
                            {form.textMain || tr.placeholderMain}
                        </p>
                        {onWidthChange && (
                            <div
                                data-card-export-ignore
                                className="flex w-3 shrink-0 cursor-ew-resize items-center justify-end pr-0.5 opacity-60 hover:opacity-100"
                                title={tr.resizeHint}
                                onPointerDown={(ev) => onResizePointerDown("main", ev)}
                            >
                                <span className="text-[10px]">▐</span>
                            </div>
                        )}
                        {activeTextTarget === "main" && (
                            <div
                                data-card-export-ignore
                                className="absolute left-0 top-full z-20 mt-2 flex items-center gap-2 rounded-xl bg-white/95 px-3 py-1.5 text-[11px] text-slate-700 shadow-lg ring-1 ring-slate-200"
                            >
                                <span>{tr.textColor}</span>
                                <input
                                    type="color"
                                    value={form.textMainColor || "#f9fafb"}
                                    onChange={(e) => onTextColorChange?.("main", e.target.value)}
                                    className="h-5 w-5 cursor-pointer rounded-full border border-slate-200 bg-white p-0"
                                />
                            </div>
                        )}
                    </div>

                    {form.textSecondary && (
                        <div
                            className="absolute flex max-w-[95%]"
                            style={{
                                left: `${posSecondary.x}%`,
                                top: `${posSecondary.y}%`,
                                width: `${widthSecondary}%`,
                            }}
                        >
                            <p
                                className="min-w-0 cursor-grab active:cursor-grabbing flex-1 text-[13px] leading-relaxed rounded-md transition-colors hover:bg-white/10"
                                style={{
                                    textShadow: "0 1px 4px rgba(15,23,42,0.8)",
                                    color: secondaryColor,
                                }}
                                title={tr.dragHint}
                                onPointerDown={(ev) => onPointerDown("secondary", ev)}
                                onPointerUp={(ev) => onPointerUp("secondary", ev)}
                            >
                                {form.textSecondary}
                            </p>
                            {onWidthChange && (
                                <div
                                    data-card-export-ignore
                                    className="flex w-3 shrink-0 cursor-ew-resize items-center justify-end pr-0.5 opacity-60 hover:opacity-100"
                                    title={tr.resizeHint}
                                    onPointerDown={(ev) => onResizePointerDown("secondary", ev)}
                                >
                                    <span className="text-[10px]">▐</span>
                                </div>
                            )}
                            {activeTextTarget === "secondary" && (
                                <div
                                    data-card-export-ignore
                                    className="absolute left-0 top-full z-20 mt-2 flex items-center gap-2 rounded-xl bg-white/95 px-3 py-1.5 text-[11px] text-slate-700 shadow-lg ring-1 ring-slate-200"
                                >
                                    <span>{tr.textColor}</span>
                                    <input
                                        type="color"
                                        value={form.textSecondaryColor || "#e5e7eb"}
                                        onChange={(e) => onTextColorChange?.("secondary", e.target.value)}
                                        className="h-5 w-5 cursor-pointer rounded-full border border-slate-200 bg-white p-0"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <div
                        className="absolute flex items-stretch"
                        style={{ left: `${posDate.x}%`, top: `${posDate.y}%`, maxWidth: `${widthDate}%` }}
                    >
                        <div
                            className="cursor-grab active:cursor-grabbing rounded-full bg-black/35 px-3 py-1 text-[11px] font-medium backdrop-blur-sm transition-colors hover:bg-black/50"
                            style={{ color: dateColor }}
                            title={tr.dragHint}
                            onPointerDown={(ev) => onPointerDown("date", ev)}
                            onPointerUp={(ev) => onPointerUp("date", ev)}
                        >
                            {form.date || tr.placeholderDate}
                        </div>
                        {onWidthChange && (
                            <div
                                data-card-export-ignore
                                className="flex w-3 shrink-0 cursor-ew-resize items-center justify-end rounded-r-full pr-0.5 opacity-60 hover:opacity-100"
                                title={tr.resizeHint}
                                onPointerDown={(ev) => onResizePointerDown("date", ev)}
                            >
                                <span className="text-[10px]">▐</span>
                            </div>
                        )}
                        {activeTextTarget === "date" && (
                            <div
                                data-card-export-ignore
                                className="absolute bottom-full right-0 z-20 mb-2 flex items-center gap-2 rounded-xl bg-white/95 px-3 py-1.5 text-[11px] text-slate-700 shadow-lg ring-1 ring-slate-200"
                            >
                                <span>{tr.textColor}</span>
                                <input
                                    type="color"
                                    value={form.dateColor || "#f9fafb"}
                                    onChange={(e) => onTextColorChange?.("date", e.target.value)}
                                    className="h-5 w-5 cursor-pointer rounded-full border border-slate-200 bg-white p-0"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
