"use client";

import { useEffect, useRef, useState } from "react";
import * as htmlToImage from "html-to-image";
import type { StoryFormState, GradientId, CardAspectId } from "../components/StoryCardPreview";
import { AdBanner } from "../components/AdBanner";
import { trackEvent } from "../lib/analytics";

const initialState: StoryFormState = {
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

export default function Home() {
    const [form, setForm] = useState<StoryFormState>(initialState);
    const [mounted, setMounted] = useState(false);
    const [activeTextTarget, setActiveTextTarget] = useState<"main" | "secondary" | "date" | "mood" | null>(null);
    const cardRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 80);
        return () => clearTimeout(timer);
    }, []);

    const handleDownloadPng = async () => {
        if (typeof window === "undefined") return;

        const target = cardRef.current;
        if (!target) {
            alert("카드 영역을 찾지 못했습니다.");
            return;
        }

        try {
            const dataUrl = await htmlToImage.toPng(target, {
                cacheBust: true,
                pixelRatio: window.devicePixelRatio || 1,
                backgroundColor: "#ffffff",
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
            alert("이미지로 저장하는 중 문제가 발생했습니다.");
        }
    };

    const handleChange = <K extends keyof StoryFormState>(field: K, value: StoryFormState[K]) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                setForm(
                    (prev) =>
                        ({
                            ...prev,
                            backgroundType: "image",
                            imageDataUrl: reader.result,
                            imageFileName: file.name,
                        } as StoryFormState)
                );

                trackEvent("upload_background_image", {
                    file_name: file.name,
                    file_type: file.type,
                });
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 page-shell">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
                <header className="flex flex-col gap-2">
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                        StoryShot – 오늘의 한 줄 인스타 스토리 카드 만들기
                    </h1>
                    <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
                        사진 또는 배경을 고르고, 오늘을 담고 싶은 한 줄을 적어보세요. 인스타 스토리, 카카오톡 프로필,
                        블로그 글 썸네일에 바로 쓸 수 있는 스토리 카드를 만들어 드립니다.
                    </p>
                    <div className="mt-3 max-w-2xl rounded-2xl bg-slate-900/3 px-3 py-2.5 text-[11px] text-slate-700 ring-1 ring-slate-100 sm:text-xs">
                        <p className="font-medium text-slate-900">사용 방법</p>
                        <ol className="mt-1.5 list-decimal space-y-0.5 pl-4">
                            <li>왼쪽에서 오늘의 한 줄, 보조 문장, 날짜, 기분을 입력합니다.</li>
                            <li>배경을 그라데이션 또는 사진으로 선택하고, 필요하면 배경 어둡기를 조절합니다.</li>
                            <li>
                                <strong>카드의 글자를 클릭</strong>하면 색상 선택기가 나타납니다. (메인 문장, 보조 문장,
                                날짜, 기분 뱃지 모두 클릭 가능)
                            </li>
                            <li>
                                원하는 카드 비율을 선택한 뒤, 아래의 「PNG로 카드 저장」 버튼을 눌러 이미지를
                                저장합니다.
                            </li>
                        </ol>
                    </div>
                </header>

                {/* 구글 에드센스: 승인 후 AdSense에서 광고 단위 생성 → adSlot을 해당 슬롯 ID로 교체 */}
                <AdBanner adSlot="REPLACE_WITH_YOUR_SLOT_ID" className="my-2" />

                <main className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)]">
                    {/* 폼 영역 */}
                    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6 form-panel">
                        <h2 className="mb-4 text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
                            카드 내용 설정
                        </h2>

                        <div className="flex flex-col gap-4">
                            <Field
                                label="오늘의 한 줄"
                                value={form.textMain}
                                onChange={(v) => handleChange("textMain", v)}
                            />
                            <Field
                                label="보조 문장 (선택)"
                                textarea
                                rows={3}
                                value={form.textSecondary}
                                onChange={(v) => handleChange("textSecondary", v)}
                            />

                            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                                <Field label="날짜" value={form.date} onChange={(v) => handleChange("date", v)} />
                                <fieldset className="flex flex-col gap-2 text-xs sm:text-sm">
                                    <legend className="text-xs font-medium text-slate-700">오늘의 기분</legend>
                                    <div className="flex flex-wrap gap-2">
                                        <ToggleChip
                                            active={form.mood === "calm"}
                                            label="😌 차분함"
                                            onClick={() => handleChange("mood", "calm")}
                                        />
                                        <ToggleChip
                                            active={form.mood === "happy"}
                                            label="😊 좋음"
                                            onClick={() => handleChange("mood", "happy")}
                                        />
                                        <ToggleChip
                                            active={form.mood === "tired"}
                                            label="😮‍💨 피곤함"
                                            onClick={() => handleChange("mood", "tired")}
                                        />
                                        <ToggleChip
                                            active={form.mood === "focused"}
                                            label="🔥 집중"
                                            onClick={() => handleChange("mood", "focused")}
                                        />
                                    </div>
                                </fieldset>
                            </div>

                            <div className="mt-2 flex flex-col gap-4 border-t border-dashed border-slate-200 pt-4">
                                <fieldset className="flex flex-col gap-2">
                                    <legend className="text-xs font-medium text-slate-700">배경 선택</legend>

                                    <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                                        <ToggleChip
                                            active={form.backgroundType === "gradient"}
                                            label="그라데이션 배경"
                                            onClick={() => handleChange("backgroundType", "gradient")}
                                        />
                                        <ToggleChip
                                            active={form.backgroundType === "image"}
                                            label="사진 업로드"
                                            onClick={() => handleChange("backgroundType", "image")}
                                        />
                                    </div>

                                    {form.backgroundType === "image" && (
                                        <div className="mt-2 space-y-3">
                                            <label className="flex flex-col gap-1.5 text-xs sm:text-sm">
                                                <span className="font-medium text-slate-700">배경 사진 업로드</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="block cursor-pointer text-xs text-slate-600 file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-50 hover:file:bg-black"
                                                />
                                                <span className="text-[11px] text-slate-400">
                                                    인물/풍경 사진, 스크린샷 등 어떤 이미지든 올릴 수 있어요.
                                                </span>
                                                {form.imageDataUrl && (
                                                    <span className="text-[11px] text-slate-500">
                                                        현재 적용된 사진: {form.imageFileName ?? "이전에 선택한 이미지"}
                                                    </span>
                                                )}
                                            </label>

                                            {form.imageDataUrl && (
                                                <label className="flex flex-col gap-1 text-[11px] sm:text-xs">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium text-slate-700">
                                                            배경 어둡기 (텍스트 가독성)
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
                                                        값이 높을수록 사진 위에 더 어두운 레이어를 씌워서 글자가 잘
                                                        보이게 합니다.
                                                    </span>
                                                </label>
                                            )}
                                        </div>
                                    )}

                                    {form.backgroundType === "gradient" && (
                                        <div className="mt-2 flex flex-wrap gap-2 text-xs sm:text-sm">
                                            <TemplateChip
                                                id="sunset"
                                                label="노을"
                                                description="보라 · 오렌지 그라데이션"
                                                active={form.gradient === "sunset"}
                                                onClick={() => handleChange("gradient", "sunset")}
                                            />
                                            <TemplateChip
                                                id="ocean"
                                                label="바다"
                                                description="블루 · 민트 그라데이션"
                                                active={form.gradient === "ocean"}
                                                onClick={() => handleChange("gradient", "ocean")}
                                            />
                                            <TemplateChip
                                                id="mono"
                                                label="모노톤"
                                                description="차분한 회색 톤"
                                                active={form.gradient === "mono"}
                                                onClick={() => handleChange("gradient", "mono")}
                                            />
                                        </div>
                                    )}
                                </fieldset>

                                <fieldset className="flex flex-col gap-2">
                                    <legend className="text-xs font-medium text-slate-700">카드 비율</legend>
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
                                    <span className="text-[10px] text-slate-400">
                                        세로(9:16~3:4) · 정사각형(1:1) · 가로(3:2~16:9)
                                    </span>
                                </fieldset>
                            </div>
                        </div>
                    </section>

                    {/* 미리보기 영역 */}
                    <section className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
                                스토리 카드 미리보기
                            </h2>
                            <p className="text-[11px] text-slate-500 sm:text-xs">
                                💡 글자를 클릭하면 색상을 바꿀 수 있어요
                            </p>
                        </div>

                        <div
                            className={`relative flex min-h-[420px] flex-1 items-center justify-center rounded-2xl bg-slate-900/5 p-3 sm:min-h-[520px] md:min-h-[640px] card-preview-shell sm:p-4 ${
                                mounted ? "card-preview-enter" : "card-preview-initial"
                            }`}
                        >
                            <CardPreview
                                form={form}
                                cardRef={cardRef}
                                activeTextTarget={activeTextTarget}
                                onTextTargetSelect={setActiveTextTarget}
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
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={handleDownloadPng}
                                className="inline-flex items-center gap-2 rounded-full border border-slate-900 bg-slate-900 px-4 py-1.5 text-xs font-medium text-slate-50 shadow-sm transition hover:-translate-y-0.5 hover:bg-black hover:shadow-md active:translate-y-0"
                            >
                                <span>PNG로 카드 저장</span>
                            </button>
                        </div>

                        <p className="text-xs leading-relaxed text-slate-500 sm:text-[13px]">
                            이 페이지는 클라이언트 사이드로만 동작하며, 입력한 정보와 이미지는 브라우저를 벗어나지
                            않습니다. 만든 카드는 인스타 스토리, 카카오톡 프로필, 블로그 글 썸네일 등 원하는 곳에
                            자유롭게 사용해 보세요.
                        </p>
                    </section>
                </main>
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
                    className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 shadow-inner shadow-slate-100 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
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
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 transition ${
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
            className={`flex min-w-[120px] flex-col items-start rounded-xl border px-3 py-2 text-left transition ${
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

interface CardPreviewProps {
    form: StoryFormState;
    activeTextTarget?: "main" | "secondary" | "date" | "mood" | null;
    onTextTargetSelect?: (target: "main" | "secondary" | "date" | "mood" | null) => void;
    onTextColorChange?: (target: "main" | "secondary" | "date" | "mood", color: string) => void;
}

function CardPreview({
    form,
    cardRef,
    activeTextTarget,
    onTextTargetSelect,
    onTextColorChange,
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
                        <div className="relative">
                            <div
                                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-black/35 px-3 py-1 text-[11px] backdrop-blur-sm transition-colors hover:bg-black/50"
                                style={{ color: moodColor }}
                                title="클릭하면 색상 변경"
                                onClick={() => onTextTargetSelect?.(activeTextTarget === "mood" ? null : "mood")}
                            >
                                <span>{moodEmoji}</span>
                                <span className="uppercase tracking-[0.16em]">{moodLabel}</span>
                            </div>
                            {activeTextTarget === "mood" && (
                                <div className="absolute left-0 top-full z-20 mt-2 flex items-center gap-2 rounded-xl bg-white/95 px-3 py-1.5 text-[11px] text-slate-700 shadow-lg ring-1 ring-slate-200">
                                    <span>텍스트 색상</span>
                                    <input
                                        type="color"
                                        value={form.moodColor || "#f9fafb"}
                                        onChange={(e) => onTextColorChange?.("mood", e.target.value)}
                                        className="h-5 w-5 cursor-pointer rounded-full border border-slate-200 bg-white p-0"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex flex-1 flex-col justify-center space-y-3">
                        <div className="relative">
                            <p
                                className="text-balance text-lg font-semibold leading-relaxed sm:text-xl cursor-pointer rounded-md px-1 -mx-1 transition-colors hover:bg-white/10"
                                style={{ textShadow: "0 1px 6px rgba(15,23,42,0.9)", color: mainColor }}
                                title="클릭하면 색상 변경"
                                onClick={() => onTextTargetSelect?.(activeTextTarget === "main" ? null : "main")}
                            >
                                {form.textMain || "오늘을 한 문장으로 남겨보세요."}
                            </p>
                            {activeTextTarget === "main" && (
                                <div className="absolute left-0 top-full z-20 mt-2 flex items-center gap-2 rounded-xl bg-white/95 px-3 py-1.5 text-[11px] text-slate-700 shadow-lg ring-1 ring-slate-200">
                                    <span>텍스트 색상</span>
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
                            <div className="relative">
                                <p
                                    className="text-[13px] leading-relaxed cursor-pointer rounded-md px-1 -mx-1 transition-colors hover:bg-white/10"
                                    style={{
                                        textShadow: "0 1px 4px rgba(15,23,42,0.8)",
                                        color: secondaryColor,
                                    }}
                                    title="클릭하면 색상 변경"
                                    onClick={() =>
                                        onTextTargetSelect?.(activeTextTarget === "secondary" ? null : "secondary")
                                    }
                                >
                                    {form.textSecondary}
                                </p>
                                {activeTextTarget === "secondary" && (
                                    <div className="absolute left-0 top-full z-20 mt-2 flex items-center gap-2 rounded-xl bg-white/95 px-3 py-1.5 text-[11px] text-slate-700 shadow-lg ring-1 ring-slate-200">
                                        <span>텍스트 색상</span>
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
                    </div>

                    <div className="mt-4 flex items-end justify-end text-[11px]">
                        <div className="relative">
                            <div
                                className="rounded-full bg-black/35 px-3 py-1 text-[11px] font-medium backdrop-blur-sm cursor-pointer transition-colors hover:bg-black/50"
                                style={{ color: dateColor }}
                                title="클릭하면 색상 변경"
                                onClick={() => onTextTargetSelect?.(activeTextTarget === "date" ? null : "date")}
                            >
                                {form.date || "오늘"}
                            </div>
                            {activeTextTarget === "date" && (
                                <div className="absolute bottom-full right-0 z-20 mb-2 flex items-center gap-2 rounded-xl bg-white/95 px-3 py-1.5 text-[11px] text-slate-700 shadow-lg ring-1 ring-slate-200">
                                    <span>텍스트 색상</span>
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
        </div>
    );
}
