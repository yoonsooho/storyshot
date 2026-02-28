"use client";

import { useEffect, useRef, useState } from "react";
import * as htmlToImage from "html-to-image";
import { useTranslations } from "next-intl";
import type { StoryFormState, CardAspectId, MoodId } from "@/types/StoryCardPreview";
import { ShareCardModal } from "@/components/ShareCardModal";
import { CardPreview } from "@/components/CardPreview";
import { Field } from "@/components/common/Field";
import { ToggleChip } from "@/components/common/ToggleChip";
import { TemplateChip } from "@/components/common/TemplateChip";
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
                        className="focus-ring interact-scale mt-2 flex items-center gap-1.5 rounded-lg px-1 py-0.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-700"
                        aria-expanded={useMethodOpen}
                    >
                        <span
                            className={`inline-block transition-transform duration-200 ${
                                useMethodOpen ? "rotate-90" : ""
                            }`}
                            aria-hidden
                        >
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
                            className="focus-ring interact-scale flex items-center gap-1.5 rounded-lg px-1 py-0.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-700"
                            aria-expanded={learnMoreOpen}
                        >
                            <span
                                className={`inline-block transition-transform duration-200 ${
                                    learnMoreOpen ? "rotate-90" : ""
                                }`}
                                aria-hidden
                            >
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
                                            className="input-focus-ring min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner shadow-slate-100 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200 focus-ring sm:h-9 sm:py-0"
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
                                                    className={`emoji-chip focus-ring flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border text-lg sm:h-8 sm:w-8 sm:min-h-0 sm:min-w-0 ${
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
                                className="interact-lift focus-ring focus-ring-dark inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-full border border-slate-900 bg-slate-900 px-5 py-2.5 text-sm font-medium text-slate-50 shadow-sm hover:bg-black hover:shadow-md"
                            >
                                <span>{t("downloadBtn")}</span>
                            </button>
                            {isGalleryEnabled && (
                                <button
                                    type="button"
                                    onClick={handleOpenShareModal}
                                    className="interact-scale focus-ring inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:border-slate-400 hover:bg-slate-50"
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
