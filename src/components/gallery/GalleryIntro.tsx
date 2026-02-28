"use client";

import { useTranslations } from "next-intl";
import { useMeasure } from "@/hooks/useMeasure";

export function GalleryIntro({
    isGalleryEnabled,
    openShareModal,
}: {
    isGalleryEnabled: boolean;
    openShareModal: () => void;
}) {
    const t = useTranslations("gallery");
    const [ref] = useMeasure();

    return (
        <div ref={ref} className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-3 py-6 sm:gap-6 sm:px-4 sm:py-8">
            <section className="flex flex-col gap-2" aria-label="Intro">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{t("title")}</h1>
                        <p className="text-sm text-slate-600">{t("subtitle")}</p>
                    </div>
                    {isGalleryEnabled && (
                        <button
                            type="button"
                            onClick={openShareModal}
                            className="interact-scale focus-ring shrink-0 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:border-slate-400 hover:bg-slate-50"
                        >
                            {t("shareButton")}
                        </button>
                    )}
                </div>
            </section>
        </div>
    );
}
