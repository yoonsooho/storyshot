"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import { Footer } from "@/components/Footer";
import { CommonModal } from "@/components/common/CommonModal";
import { ShareCardModal } from "@/components/ShareCardModal";
import { GalleryCardItem } from "@/components/gallery/GalleryCardItem";
import { GalleryDetailContent } from "@/components/gallery/GalleryDetailContent";
import { GalleryIntro } from "@/components/gallery/GalleryIntro";
import { supabase, isGalleryEnabled, type SharedCard } from "@/lib/supabase/client";
import { uploadCardToGalleryFromFile } from "@/lib/supabase/upload";

const PAGE_SIZE = 6;

export default function GalleryPage() {
    const locale = useLocale();
    const t = useTranslations("gallery");
    const [cards, setCards] = useState<SharedCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [detailCard, setDetailCard] = useState<SharedCard | null>(null);
    const [shareFile, setShareFile] = useState<File | null>(null);
    const [shareTitle, setShareTitle] = useState("");
    const [shareBody, setShareBody] = useState("");
    const [shareSubmitting, setShareSubmitting] = useState(false);
    const { ref: loadMoreRef, inView } = useInView({ threshold: 0, rootMargin: "200px" });

    const fetchCards = useCallback(async (pageNum: number, append: boolean) => {
        if (!supabase) return;
        const from = pageNum * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        const { data, error: err } = await supabase
            .from("shared_cards")
            .select("id, image_url, caption, locale, status, created_at")
            .eq("status", "approved")
            .order("created_at", { ascending: false })
            .range(from, to);
        if (err) {
            if (pageNum === 0) setError(true);
            setHasMore(false);
            return;
        }
        const list = (data ?? []) as SharedCard[];
        setCards((prev) => (append ? [...prev, ...list] : list));
        setHasMore(list.length === PAGE_SIZE);
    }, []);

    useEffect(() => {
        if (!isGalleryEnabled) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(false);
        fetchCards(0, false).finally(() => setLoading(false));
        setPage(0);
    }, [fetchCards]);

    useEffect(() => {
        if (!inView || !hasMore || isFetchingMore || loading) return;
        const next = page + 1;
        setPage(next);
        setIsFetchingMore(true);
        fetchCards(next, true).finally(() => setIsFetchingMore(false));
    }, [inView, hasMore, isFetchingMore, loading, page, fetchCards]);

    const handleShareSubmit = useCallback(async () => {
        if (!shareFile || !isGalleryEnabled) return;
        setShareSubmitting(true);
        try {
            const caption = [shareTitle.trim(), shareBody.trim()].filter(Boolean).join("\n") || undefined;
            await uploadCardToGalleryFromFile({ file: shareFile, caption, locale });
            setShareModalOpen(false);
            setShareFile(null);
            setShareTitle("");
            setShareBody("");
            setCards([]);
            setPage(0);
            setHasMore(true);
            await fetchCards(0, false);
        } finally {
            setShareSubmitting(false);
        }
    }, [shareFile, shareTitle, shareBody, locale, fetchCards]);

    const handleDownload = useCallback((card: SharedCard) => {
        const a = document.createElement("a");
        a.href = card.image_url;
        a.download = `storyshot-${card.id}.png`;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.click();
    }, []);

    if (!isGalleryEnabled) {
        return (
            <>
                <main className="flex flex-1 flex-col">
                    <div className="mx-auto w-full max-w-4xl px-3 py-8 sm:px-4">
                        <p className="text-slate-600">{t("error")}</p>
                        <p className="mt-2 text-sm text-slate-500">{t("errorSetupHint")}</p>
                        <Link href="/" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline">
                            {t("backHome")}
                        </Link>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <main className="flex flex-1 flex-col">
                <GalleryIntro isGalleryEnabled={isGalleryEnabled} openShareModal={() => setShareModalOpen(true)} />
                {loading ? (
                    <p className="px-3 py-8 text-center text-slate-600 sm:px-4">{t("loading")}</p>
                ) : error ? (
                    <div className="mx-auto max-w-4xl px-3 py-8 sm:px-4">
                        <p className="text-slate-600">{t("error")}</p>
                        <p className="mt-2 text-sm text-slate-500">{t("errorSetupHint")}</p>
                    </div>
                ) : cards.length === 0 ? (
                    <p className="px-3 py-8 text-center text-slate-600 sm:px-4">{t("empty")}</p>
                ) : (
                    <section className="mx-auto w-full max-w-4xl px-3 pb-12 sm:px-4" aria-label="Gallery grid">
                        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-3">
                            {cards.map((card, index) => (
                                <GalleryCardItem
                                    key={card.id}
                                    card={card}
                                    index={index}
                                    onClick={() => setDetailCard(card)}
                                />
                            ))}
                        </ul>
                        <div ref={loadMoreRef} className="h-8 shrink-0" aria-hidden />
                        {isFetchingMore && <p className="py-4 text-center text-sm text-slate-500">{t("loading")}</p>}
                    </section>
                )}
            </main>
            <Footer />

            <ShareCardModal
                open={shareModalOpen}
                onClose={() => {
                    setShareModalOpen(false);
                    setShareFile(null);
                }}
                mode="file-and-caption"
                file={shareFile}
                onFileChange={setShareFile}
                caption={shareTitle + (shareBody ? "\n" + shareBody : "")}
                onCaptionChange={(value) => {
                    const i = value.indexOf("\n");
                    if (i >= 0) {
                        setShareTitle(value.slice(0, i));
                        setShareBody(value.slice(i + 1));
                    } else {
                        setShareTitle(value);
                        setShareBody("");
                    }
                }}
                onSubmit={handleShareSubmit}
                loading={shareSubmitting}
            />

            <CommonModal open={detailCard !== null} onClose={() => setDetailCard(null)}>
                {detailCard && (
                    <GalleryDetailContent
                        card={detailCard}
                        onClose={() => setDetailCard(null)}
                        onDownload={() => handleDownload(detailCard)}
                        t={(key) =>
                            t(
                                key as
                                    | "detailModalClose"
                                    | "detailModalDownload"
                                    | "detailModalTitle"
                                    | "detailModalBody"
                            )
                        }
                    />
                )}
            </CommonModal>
        </>
    );
}
