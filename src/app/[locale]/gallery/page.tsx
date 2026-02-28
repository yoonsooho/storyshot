"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useWindowVirtualizer, type VirtualItem } from "@tanstack/react-virtual";
import { useInView } from "react-intersection-observer";
import { Footer } from "@/components/Footer";
import { CommonModal } from "@/components/common/CommonModal";
import { ShareCardModal } from "@/components/ShareCardModal";
import { GalleryDetailContent } from "@/components/gallery/GalleryDetailContent";
import { GalleryGridRow } from "@/components/gallery/GalleryGridRow";
import { GalleryIntro } from "@/components/gallery/GalleryIntro";
import { useColumnCount } from "@/hooks/useColumnCount";
import { supabase, isGalleryEnabled, type SharedCard } from "@/lib/supabase/client";
import { uploadCardToGalleryFromFile } from "@/lib/supabase/upload";

const PAGE_SIZE = 6;
const DEFAULT_ROW_HEIGHT = 560;
const SENTINEL_HEIGHT = 120;

/**
 * 갤러리 가상화 + 무한 스크롤 구조 요약
 *
 * 1. @tanstack/react-virtual (useWindowVirtualizer)
 *    - 스크롤은 브라우저 창(문서) 기준. 보이는 행만 DOM에 그려서 성능 유지.
 *    - scrollMargin: 갤러리 섹션 시작 위치(헤더·인트로 높이). 리스트가 문서에서 어디서부터인지 알려줌.
 *    - getTotalSize(): 전체 리스트 높이 → 컨테이너 높이로 사용해 페이지 전체 세로 스크롤 생성.
 *    - getVirtualItems(): 현재 뷰포트에 들어오는 행만 반환. 각 항목의 start/size로 위치 계산.
 *
 * 2. react-intersection-observer (useInView)
 *    - 리스트 맨 아래 sentinel div에 ref 연결. 이 div가 화면에 들어오면 inView === true.
 *    - inView가 true일 때 다음 페이지 fetch → 무한 스크롤.
 */
export default function GalleryPage() {
    const locale = useLocale();
    const t = useTranslations("gallery");
    const columnCount = useColumnCount();
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
    const [scrollMargin, setScrollMargin] = useState(0);
    const listRef = useRef<HTMLDivElement>(null);
    const loadMoreTriggerRef = useRef(false);

    const rowCount = Math.ceil(cards.length / columnCount);
    const rowVirtualizer = useWindowVirtualizer({
        count: rowCount,
        estimateSize: () => DEFAULT_ROW_HEIGHT,
        overscan: 2,
        scrollMargin: scrollMargin,
    });

    const { ref: loadMoreRef, inView } = useInView({
        rootMargin: "200px 0px",
        threshold: 0,
    });

    useLayoutEffect(() => {
        if (listRef.current) {
            setScrollMargin(listRef.current.getBoundingClientRect().top + window.scrollY);
        }
    }, [cards.length]);

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
        setCards((prev: SharedCard[]) => (append ? [...prev, ...list] : list));
        setHasMore(list.length === PAGE_SIZE);
    }, []);

    useEffect(() => {
        if (!inView || !hasMore || isFetchingMore || loadMoreTriggerRef.current) return;
        loadMoreTriggerRef.current = true;
        const next = page + 1;
        setPage(next);
        setIsFetchingMore(true);
        fetchCards(next, true).finally(() => {
            setIsFetchingMore(false);
            loadMoreTriggerRef.current = false;
        });
    }, [inView, hasMore, isFetchingMore, page, fetchCards]);

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
                    <section
                        ref={listRef}
                        className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-3 pb-12 sm:px-4"
                        aria-label="Gallery grid"
                    >
                        <div
                            style={{
                                height: `${rowVirtualizer.getTotalSize() + SENTINEL_HEIGHT}px`,
                                width: "100%",
                                position: "relative",
                            }}
                        >
                            {rowVirtualizer.getVirtualItems().map((virtualRow: VirtualItem) => (
                                <div
                                    key={virtualRow.key}
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        height: `${virtualRow.size}px`,
                                        transform: `translateY(${virtualRow.start - scrollMargin}px)`,
                                    }}
                                >
                                    <GalleryGridRow
                                        index={virtualRow.index}
                                        style={{}}
                                        cards={cards}
                                        columnCount={columnCount}
                                        onCardClick={setDetailCard}
                                    />
                                </div>
                            ))}
                            <div
                                ref={loadMoreRef}
                                aria-hidden
                                style={{
                                    position: "absolute",
                                    top: rowVirtualizer.getTotalSize(),
                                    left: 0,
                                    width: "100%",
                                    height: SENTINEL_HEIGHT,
                                }}
                            />
                        </div>
                        {isFetchingMore && <p className="py-4 text-center text-sm text-slate-500">{t("loading")}</p>}
                    </section>
                )}
            </main>

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
