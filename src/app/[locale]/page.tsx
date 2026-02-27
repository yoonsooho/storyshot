"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import * as htmlToImage from "html-to-image";
import { useTranslations } from "next-intl";
import type { StoryFormState, GradientId, CardAspectId, MoodId } from "@/components/StoryCardPreview";
import { DEFAULT_POSITIONS, DEFAULT_WIDTHS } from "@/components/StoryCardPreview";
import { Header } from "@/components/Header";
import { ShareCardModal } from "@/components/ShareCardModal";
import { AdBanner } from "@/components/AdBanner";
import { trackEvent } from "@/lib/analytics";
import { uploadCardToGallery } from "@/lib/supabase/upload";
import { isGalleryEnabled } from "@/lib/supabase/client";

const initialState: StoryFormState = {
    title: "",
    textMain: "오늘은 여기까지. 그래도 잘했다.",
    textSecondary: "작은 진도라도 매일 나아가면 언젠가는 도착한다.",
    date: "2026.02.10",
    mood: "calm",
    backgroundType: "gradient",
    gradient: "sunset",
    imageDataUrl: null,
    imageFileName: null,
    overlayIntensity: 85,
    textMainColor: "#f9fafb",
    textSecondaryColor: "#e5e7eb",
    dateColor: "#f9fafb",
    moodColor: "#f9fafb",
    cardAspect: "9_16",
};

const MOOD_EMOJI_OPTIONS = [
    "😌",
    "😊",
    "😮‍💨",
    "🔥",
    "😢",
    "😤",
    "🧘",
    "🤔",
    "😴",
    "✨",
    "💪",
    "🌸",
    "🎉",
    "🙏",
    "⭐",
    "😅",
    "🍀",
    "💫",
    "🌙",
    "☀️",
    "❤️",
    "🎯",
    "😎",
    "🤗",
    "🌈",
];

function defaultMoodEmojiFor(mood: MoodId): string {
    return mood === "happy" ? "😊" : mood === "tired" ? "😮‍💨" : mood === "focused" ? "🔥" : "😌";
}

export default function Home() {
    const t = useTranslations("home");
    const [form, setForm] = useState<StoryFormState>(initialState);
    const [mounted, setMounted] = useState(false);
    const [activeTextTarget, setActiveTextTarget] = useState<"main" | "secondary" | "date" | "mood" | null>(null);
    const [useMethodOpen, setUseMethodOpen] = useState(false);
    const [learnMoreOpen, setLearnMoreOpen] = useState(false);
    const cardRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 80);
        return () => clearTimeout(timer);
    }, []);

    const handleDownloadPng = async () => {
        if (typeof window === "undefined") return;

        const target = cardRef.current;
        if (!target) {
            alert(t("alertCardNotFound"));
            return;
        }

        try {
            const dataUrl = await htmlToImage.toPng(target, {
                cacheBust: true,
                pixelRatio: window.devicePixelRatio || 1,
                backgroundColor: "transparent",
                filter: (node) => {
                    if (node instanceof Element && node.closest?.("[data-card-export-ignore]")) return false;
                    return true;
                },
            });

            const link = document.createElement("a");
            link.href = dataUrl;
            link.download = "story-card.png";
            link.click();

            trackEvent("download_card", {
                background_type: form.backgroundType,
                gradient: form.gradient,
                has_image: !!form.imageDataUrl,
                has_secondary_text: !!form.textSecondary,
                mood: form.mood,
            });
        } catch (error) {
            console.error(error);
            alert(t("alertSaveError"));
        }
    };

    const [shareLoading, setShareLoading] = useState(false);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [shareCaption, setShareCaption] = useState("");

    const handleOpenShareModal = () => {
        if (!isGalleryEnabled) {
            alert(t("shareNotConfigured"));
            return;
        }
        setShareCaption([form.title ?? "", form.textMain, form.textSecondary].filter(Boolean).join("\n"));
        setShareModalOpen(true);
    };

    const handleShareToGallery = async (caption: string) => {
        if (typeof window === "undefined") return;
        const target = cardRef.current;
        if (!target) {
            alert(t("alertCardNotFound"));
            return;
        }
        setShareLoading(true);
        try {
            const dataUrl = await htmlToImage.toPng(target, {
                cacheBust: true,
                pixelRatio: window.devicePixelRatio || 1,
                backgroundColor: "transparent",
                filter: (node) => {
                    if (node instanceof Element && node.closest?.("[data-card-export-ignore]")) return false;
                    return true;
                },
            });
            const locale = document.documentElement.lang || "ko";
            const result = await uploadCardToGallery({ dataUrl, caption: caption.trim() || undefined, locale });
            if (result) {
                trackEvent("share_to_gallery", { locale });
                window.location.href = `/${locale}/gallery`;
            } else {
                alert(t("shareError"));
            }
        } catch (e) {
            console.error(e);
            alert(t("shareError"));
        } finally {
            setShareLoading(false);
        }
    };

    const handleChange = <K extends keyof StoryFormState>(field: K, value: StoryFormState[K]) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const MAX_IMAGE_SIZE_MB = 10;
    const MAX_IMAGE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert(t("imageUploadErrorType"));
            event.target.value = "";
            return;
        }
        if (file.size > MAX_IMAGE_BYTES) {
            alert(t("imageUploadErrorSize", { max: MAX_IMAGE_SIZE_MB }));
            event.target.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            try {
                if (typeof reader.result === "string") {
                    setForm((prev: StoryFormState) => {
                        return {
                            ...prev,
                            backgroundType: "image",
                            imageDataUrl: reader.result as string,
                            imageFileName: file.name,
                        };
                    });
                    trackEvent("upload_background_image", {
                        file_name: file.name,
                        file_type: file.type,
                    });
                }
            } catch (e) {
                console.error(e);
                alert(t("imageUploadErrorGeneric"));
            }
            event.target.value = "";
        };
        reader.onerror = () => {
            console.error("FileReader error", reader.error);
            alert(t("imageUploadErrorGeneric"));
            event.target.value = "";
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 page-shell">
            <Header showGallery={isGalleryEnabled} />

            <ShareCardModal
                open={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
                caption={shareCaption}
                onCaptionChange={setShareCaption}
                onSubmit={() => handleShareToGallery(shareCaption)}
                loading={shareLoading}
                mode="caption-only"
            />

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-3 py-6 sm:gap-6 sm:px-4 sm:py-8">
                <section className="flex flex-col gap-2" aria-label="Intro">
                    <p className="max-w-2xl text-[13px] leading-relaxed text-slate-600 sm:text-sm md:text-base">
                        {t("subtitle")}
                    </p>
                    <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-slate-500 sm:text-[13px]">
                        {t("introShort")}
                    </p>
                    <div className="mt-3 max-w-2xl rounded-xl border border-slate-200/80 bg-slate-50/50 px-3 py-2.5 text-[11px] text-slate-600 sm:text-xs">
                        <p className="font-medium text-slate-700">{t("tipsTitle")}</p>
                        <ul className="mt-1.5 list-disc space-y-0.5 pl-4">
                            <li>{t("tips1")}</li>
                            <li>{t("tips2")}</li>
                            <li>{t("tips3")}</li>
                        </ul>
                    </div>
                    <button
                        type="button"
                        onClick={() => setUseMethodOpen((o) => !o)}
                        className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700"
                        aria-expanded={useMethodOpen}
                    >
                        <span className={useMethodOpen ? "rotate-90" : ""} aria-hidden>
                            ▸
                        </span>
                        {useMethodOpen ? t("howToUseToggleClose") : t("howToUseToggle")}
                    </button>
                    {useMethodOpen && (
                        <div className="mt-2 max-w-2xl rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 text-[11px] text-slate-600 sm:text-xs">
                            <ol className="list-decimal space-y-1 pl-4">
                                <li>{t("howToUseStep1")}</li>
                                <li>{t("howToUseStep2")}</li>
                                <li>{t("howToUseStep3")}</li>
                                <li>{t("howToUseStep4")}</li>
                            </ol>
                        </div>
                    )}
                    {/* 소개 · FAQ: 접었다 펼치기 */}
                    <div className="mt-4 border-t border-slate-200 pt-4">
                        <button
                            type="button"
                            onClick={() => setLearnMoreOpen((o) => !o)}
                            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700"
                            aria-expanded={learnMoreOpen}
                        >
                            <span className={learnMoreOpen ? "rotate-90" : ""} aria-hidden>
                                ▸
                            </span>
                            {learnMoreOpen ? t("learnMoreClose") : t("learnMore")}
                        </button>
                        {learnMoreOpen && (
                            <div className="mt-4 space-y-6 text-slate-600">
                                <div>
                                    <h3 className="mb-1.5 text-sm font-semibold text-slate-900">{t("aboutTitle")}</h3>
                                    <p className="text-[13px] leading-relaxed">{t("aboutBody")}</p>
                                </div>
                                <div>
                                    <h3 className="mb-3 text-sm font-semibold text-slate-900">{t("faqTitle")}</h3>
                                    <dl className="space-y-3">
                                        {([1, 2, 3, 4, 5, 6] as const).map((n) => (
                                            <div key={n}>
                                                <dt className="text-[13px] font-medium text-slate-800">
                                                    {t(`faqQ${n}`)}
                                                </dt>
                                                <dd className="mt-0.5 text-[12px] leading-relaxed text-slate-600">
                                                    {t(`faqA${n}`)}
                                                </dd>
                                            </div>
                                        ))}
                                    </dl>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <main className="grid gap-5 sm:gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)]">
                    {/* 폼 영역 */}
                    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-6 form-panel">
                        <h2 className="mb-4 text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
                            {t("formTitle")}
                        </h2>

                        <div className="flex flex-col gap-4">
                            <Field
                                label={t("titleLabel")}
                                value={form.title ?? ""}
                                onChange={(v) => handleChange("title", v)}
                            />
                            <Field
                                label={t("textMainLabel")}
                                value={form.textMain}
                                onChange={(v) => handleChange("textMain", v)}
                            />
                            <Field
                                label={t("textSecondaryLabel")}
                                textarea
                                rows={3}
                                value={form.textSecondary}
                                onChange={(v) => handleChange("textSecondary", v)}
                            />

                            <div className="flex flex-col gap-4">
                                <Field
                                    label={t("dateLabel")}
                                    value={form.date}
                                    onChange={(v) => handleChange("date", v)}
                                />
                                <fieldset className="flex flex-col gap-2 text-xs sm:text-sm">
                                    <legend className="text-xs font-medium text-slate-700">{t("moodLabel")}</legend>
                                    <div className="flex flex-wrap gap-2">
                                        <ToggleChip
                                            active={form.mood === "calm"}
                                            label={t("moodCalm")}
                                            onClick={() => handleChange("mood", "calm")}
                                        />
                                        <ToggleChip
                                            active={form.mood === "happy"}
                                            label={t("moodHappy")}
                                            onClick={() => handleChange("mood", "happy")}
                                        />
                                        <ToggleChip
                                            active={form.mood === "tired"}
                                            label={t("moodTired")}
                                            onClick={() => handleChange("mood", "tired")}
                                        />
                                        <ToggleChip
                                            active={form.mood === "focused"}
                                            label={t("moodFocused")}
                                            onClick={() => handleChange("mood", "focused")}
                                        />
                                    </div>
                                    <label className="mt-1 flex flex-col gap-1">
                                        <span className="text-[11px] text-slate-500">{t("moodTextPlaceholder")}</span>
                                        <input
                                            type="text"
                                            placeholder={
                                                form.mood === "happy"
                                                    ? t("moodPlaceholderHappy")
                                                    : form.mood === "tired"
                                                    ? t("moodPlaceholderTired")
                                                    : form.mood === "focused"
                                                    ? t("moodPlaceholderFocused")
                                                    : t("moodPlaceholderCalm")
                                            }
                                            value={form.moodText ?? ""}
                                            onChange={(e) => handleChange("moodText", e.target.value)}
                                            className="min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner shadow-slate-100 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200 sm:h-9 sm:py-0"
                                        />
                                    </label>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[11px] text-slate-500">{t("moodEmojiLabel")}</span>
                                        <div className="flex flex-wrap gap-1">
                                            {MOOD_EMOJI_OPTIONS.map((emoji) => (
                                                <button
                                                    key={emoji}
                                                    type="button"
                                                    onClick={() =>
                                                        handleChange("moodEmoji", form.moodEmoji === emoji ? "" : emoji)
                                                    }
                                                    className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border text-lg transition sm:h-8 sm:w-8 sm:min-h-0 sm:min-w-0 ${
                                                        (form.moodEmoji || defaultMoodEmojiFor(form.mood)) === emoji
                                                            ? "border-slate-900 bg-slate-100 ring-1 ring-slate-900"
                                                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                                    }`}
                                                    title={emoji}
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </fieldset>
                            </div>

                            <div className="mt-2 flex flex-col gap-4 border-t border-dashed border-slate-200 pt-4">
                                <fieldset className="flex flex-col gap-2">
                                    <legend className="text-xs font-medium text-slate-700">
                                        {t("backgroundLabel")}
                                    </legend>

                                    <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                                        <ToggleChip
                                            active={form.backgroundType === "gradient"}
                                            label={t("gradientBg")}
                                            onClick={() => handleChange("backgroundType", "gradient")}
                                        />
                                        <ToggleChip
                                            active={form.backgroundType === "image"}
                                            label={t("photoUpload")}
                                            onClick={() => handleChange("backgroundType", "image")}
                                        />
                                    </div>

                                    {form.backgroundType === "image" && (
                                        <div className="mt-2 space-y-3">
                                            <label className="flex flex-col gap-1.5 text-xs sm:text-sm">
                                                <span className="font-medium text-slate-700">
                                                    {t("backgroundPhotoLabel")}
                                                </span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="block cursor-pointer text-xs text-slate-600 file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-50 hover:file:bg-black"
                                                />
                                                <span className="text-[11px] text-slate-400">{t("uploadHint")}</span>
                                                {form.imageDataUrl && (
                                                    <span className="text-[11px] text-slate-500">
                                                        {t("currentPhoto", {
                                                            name: form.imageFileName ?? t("previousPhoto"),
                                                        })}
                                                    </span>
                                                )}
                                            </label>

                                            {form.imageDataUrl && (
                                                <label className="flex flex-col gap-1 text-[11px] sm:text-xs">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium text-slate-700">
                                                            {t("overlayLabel")}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400">
                                                            {form.overlayIntensity ?? 85}%
                                                        </span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min={40}
                                                        max={100}
                                                        step={5}
                                                        value={form.overlayIntensity ?? 85}
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "overlayIntensity",
                                                                Number(
                                                                    e.target.value
                                                                ) as StoryFormState["overlayIntensity"]
                                                            )
                                                        }
                                                        className="accent-slate-900"
                                                    />
                                                    <span className="text-[10px] text-slate-400">
                                                        {t("overlayHint")}
                                                    </span>
                                                </label>
                                            )}
                                        </div>
                                    )}

                                    {form.backgroundType === "gradient" && (
                                        <div className="mt-2 flex flex-wrap gap-2 text-xs sm:text-sm">
                                            <TemplateChip
                                                id="sunset"
                                                label={t("gradientSunset")}
                                                description={t("gradientSunsetDesc")}
                                                active={form.gradient === "sunset"}
                                                onClick={() => handleChange("gradient", "sunset")}
                                            />
                                            <TemplateChip
                                                id="ocean"
                                                label={t("gradientOcean")}
                                                description={t("gradientOceanDesc")}
                                                active={form.gradient === "ocean"}
                                                onClick={() => handleChange("gradient", "ocean")}
                                            />
                                            <TemplateChip
                                                id="mono"
                                                label={t("gradientMono")}
                                                description={t("gradientMonoDesc")}
                                                active={form.gradient === "mono"}
                                                onClick={() => handleChange("gradient", "mono")}
                                            />
                                        </div>
                                    )}
                                </fieldset>

                                <fieldset className="flex flex-col gap-2">
                                    <legend className="text-xs font-medium text-slate-700">
                                        {t("cardRatioLabel")}
                                    </legend>
                                    <div className="flex flex-wrap gap-1.5 text-[11px] sm:gap-2 sm:text-xs">
                                        <ToggleChip
                                            active={form.cardAspect === "9_16" || !form.cardAspect}
                                            label="9:16"
                                            onClick={() => handleChange("cardAspect", "9_16" as CardAspectId)}
                                        />
                                        <ToggleChip
                                            active={form.cardAspect === "4_5"}
                                            label="4:5"
                                            onClick={() => handleChange("cardAspect", "4_5" as CardAspectId)}
                                        />
                                        <ToggleChip
                                            active={form.cardAspect === "3_4"}
                                            label="3:4"
                                            onClick={() => handleChange("cardAspect", "3_4" as CardAspectId)}
                                        />
                                        <ToggleChip
                                            active={form.cardAspect === "1_1"}
                                            label="1:1"
                                            onClick={() => handleChange("cardAspect", "1_1" as CardAspectId)}
                                        />
                                        <ToggleChip
                                            active={form.cardAspect === "3_2"}
                                            label="3:2"
                                            onClick={() => handleChange("cardAspect", "3_2" as CardAspectId)}
                                        />
                                        <ToggleChip
                                            active={form.cardAspect === "4_3"}
                                            label="4:3"
                                            onClick={() => handleChange("cardAspect", "4_3" as CardAspectId)}
                                        />
                                        <ToggleChip
                                            active={form.cardAspect === "16_9"}
                                            label="16:9"
                                            onClick={() => handleChange("cardAspect", "16_9" as CardAspectId)}
                                        />
                                    </div>
                                    <span className="text-[10px] text-slate-400">{t("ratioHint")}</span>
                                </fieldset>
                            </div>
                        </div>
                    </section>

                    {/* 미리보기 영역 */}
                    <section className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base whitespace-nowrap">
                                {t("previewTitle")}
                            </h2>
                            <p className="text-[11px] text-slate-500 sm:text-xs whitespace-nowrap">
                                {t("previewHint")}
                            </p>
                        </div>

                        <div
                            className={`relative flex min-h-[280px] flex-1 items-center justify-center rounded-2xl bg-slate-900/5 p-3 card-preview-shell sm:min-h-[420px] sm:p-4 md:min-h-[520px] lg:min-h-[640px] ${
                                mounted ? "card-preview-enter" : "card-preview-initial"
                            }`}
                        >
                            <CardPreview
                                form={form}
                                cardRef={cardRef}
                                activeTextTarget={activeTextTarget}
                                onTextTargetSelect={setActiveTextTarget}
                                translations={{
                                    placeholderMain: t("placeholderMain"),
                                    placeholderDate: t("placeholderDate"),
                                    textColor: t("textColor"),
                                    dragHint: t("dragHint"),
                                    resizeHint: t("resizeHint"),
                                    altBackground: t("altBackground"),
                                    moodPlaceholderCalm: t("moodPlaceholderCalm"),
                                    moodPlaceholderHappy: t("moodPlaceholderHappy"),
                                    moodPlaceholderTired: t("moodPlaceholderTired"),
                                    moodPlaceholderFocused: t("moodPlaceholderFocused"),
                                }}
                                onTextColorChange={(target, color) => {
                                    if (target === "main") {
                                        handleChange("textMainColor", color);
                                    } else if (target === "secondary") {
                                        handleChange("textSecondaryColor", color);
                                    } else if (target === "date") {
                                        handleChange("dateColor", color);
                                    } else {
                                        handleChange("moodColor", color);
                                    }
                                }}
                                onPositionChange={(target, pos) => {
                                    if (target === "main") handleChange("positionMain", pos);
                                    else if (target === "secondary") handleChange("positionSecondary", pos);
                                    else if (target === "date") handleChange("positionDate", pos);
                                    else handleChange("positionMood", pos);
                                }}
                                onWidthChange={(target, width) => {
                                    if (target === "main") handleChange("widthMain", width);
                                    else if (target === "secondary") handleChange("widthSecondary", width);
                                    else if (target === "date") handleChange("widthDate", width);
                                    else handleChange("widthMood", width);
                                }}
                            />
                        </div>

                        <div className="flex flex-wrap justify-end gap-2">
                            <button
                                type="button"
                                onClick={handleDownloadPng}
                                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-full border border-slate-900 bg-slate-900 px-5 py-2.5 text-sm font-medium text-slate-50 shadow-sm transition hover:-translate-y-0.5 hover:bg-black hover:shadow-md active:translate-y-0"
                            >
                                <span>{t("downloadBtn")}</span>
                            </button>
                            {isGalleryEnabled && (
                                <button
                                    type="button"
                                    onClick={handleOpenShareModal}
                                    className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 active:translate-y-0"
                                >
                                    <span>{t("shareToGallery")}</span>
                                </button>
                            )}
                        </div>

                        <p className="text-xs leading-relaxed text-slate-500 sm:text-[13px]">{t("disclaimer")}</p>
                    </section>
                </main>

                {/* 구글 에드센스: 콘텐츠 아래 배치. 승인 후 adSlot을 광고 단위 ID로 교체 */}
                <AdBanner adSlot="REPLACE_WITH_YOUR_SLOT_ID" className="my-4" />
            </div>
        </div>
    );
}

interface FieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    textarea?: boolean;
    rows?: number;
}

function Field({ label, value, onChange, textarea, rows = 3 }: FieldProps) {
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
                    className="min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner shadow-slate-100 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200 sm:h-9 sm:py-0"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            )}
        </label>
    );
}

interface ToggleChipProps {
    active: boolean;
    label: string;
    onClick: () => void;
}

function ToggleChip({ active, label, onClick }: ToggleChipProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex min-h-[44px] items-center justify-center gap-1 rounded-full border px-4 py-2.5 transition ${
                active
                    ? "border-slate-900 bg-slate-900 text-slate-50 shadow-sm"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
        >
            <span>{label}</span>
        </button>
    );
}

interface TemplateChipProps {
    id: GradientId;
    label: string;
    description: string;
    active: boolean;
    onClick: () => void;
}

function TemplateChip({ label, description, active, onClick }: TemplateChipProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex min-h-[44px] min-w-[120px] flex-col justify-center rounded-xl border px-3 py-2.5 text-left transition sm:min-h-0 ${
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

type PositionTarget = "main" | "secondary" | "date" | "mood";

interface CardPreviewTranslations {
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

interface CardPreviewProps {
    form: StoryFormState;
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

function CardPreview({
    form,
    cardRef,
    activeTextTarget,
    onTextTargetSelect,
    onTextColorChange,
    onPositionChange,
    onWidthChange,
    translations: tr = defaultTranslations,
}: CardPreviewProps & { cardRef: React.RefObject<HTMLDivElement | null> }) {
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
    const isLandscape = form.cardAspect === "3_2" || form.cardAspect === "4_3" || form.cardAspect === "16_9";

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
                            className="min-w-0 cursor-grab active:cursor-grabbing flex-1 break-words text-lg font-semibold leading-relaxed rounded-md transition-colors hover:bg-white/10 sm:text-xl"
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
