"use client";

import { useEffect, useRef, useState } from "react";
import * as htmlToImage from "html-to-image";
import type { StoryFormState, GradientId } from "../components/StoryCardPreview";
import { AdBanner } from "../components/AdBanner";

const initialState: StoryFormState = {
    textMain: "오늘은 여기까지. 그래도 잘했다.",
    textSecondary: "작은 진도라도 매일 나아가면 언젠가는 도착한다.",
    date: "2026.02.10",
    mood: "calm",
    backgroundType: "gradient",
    gradient: "sunset",
    imageDataUrl: null,
    imageFileName: null,
};

export default function Home() {
    const [form, setForm] = useState<StoryFormState>(initialState);
    const [mounted, setMounted] = useState(false);
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
                        블로그 글 썸네일에 바로 쓸 수 있는 9:16 비율의 스토리 카드를 만들어 드립니다.
                    </p>
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
                                        <div className="mt-2">
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
                            </div>
                        </div>
                    </section>

                    {/* 미리보기 영역 */}
                    <section className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
                                스토리 카드 미리보기
                            </h2>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-600">
                                Client-side only
                            </span>
                        </div>

                        <div
                            className={`relative flex min-h-[260px] flex-1 items-center justify-center rounded-2xl bg-slate-900/5 p-3 sm:min-h-[320px] sm:p-4 card-preview-shell ${
                                mounted ? "card-preview-enter" : "card-preview-initial"
                            }`}
                        >
                            <CardPreview form={form} cardRef={cardRef} />
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
}

function CardPreview({ form, cardRef }: CardPreviewProps & { cardRef: React.RefObject<HTMLDivElement | null> }) {
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
