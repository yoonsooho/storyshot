"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Header } from "@/components/Header";
import { ShareCardModal } from "@/components/ShareCardModal";
import { CommonModal } from "@/components/CommonModal";
import { supabase, isGalleryEnabled, type SharedCard } from "@/lib/supabase/client";
import { uploadCardToGalleryFromFile } from "@/lib/supabase/upload";

export default function GalleryPage() {
    const t = useTranslations("gallery");
    const locale = useLocale();
    const [cards, setCards] = useState<SharedCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [setupHint, setSetupHint] = useState(false);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [shareFile, setShareFile] = useState<File | null>(null);
    const [shareCaption, setShareCaption] = useState("");
    const [shareLoading, setShareLoading] = useState(false);
    const [detailCard, setDetailCard] = useState<SharedCard | null>(null);

    /** caption을 "첫 줄 = 제목, 나머지 = 글" 형태로 파싱 */
    function parseCaption(caption: string | null): { title: string | null; body: string } {
        if (!caption?.trim()) return { title: null, body: "" };
        const firstNewline = caption.indexOf("\n");
        if (firstNewline === -1) return { title: null, body: caption.trim() };
        return {
            title: caption.slice(0, firstNewline).trim() || null,
            body: caption.slice(firstNewline + 1).trim(),
        };
    }

    const handleDownloadCardImage = async (imageUrl: string) => {
        try {
            const res = await fetch(imageUrl, { mode: "cors" });
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "story-card.png";
            a.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error(e);
            window.open(imageUrl, "_blank");
        }
    };

    const fetchCards = useCallback(() => {
        if (!supabase) return;
        supabase
            .from("shared_cards")
            .select("id, image_url, caption, locale, created_at, status")
            .eq("status", "approved")
            .order("created_at", { ascending: false })
            .limit(100)
            .then(({ data, error: e }) => {
                if (!e) setCards((data as SharedCard[]) ?? []);
            });
    }, []);

    useEffect(() => {
        if (!supabase) {
            setError("Supabase not configured");
            setLoading(false);
            return;
        }
        supabase
            .from("shared_cards")
            .select("id, image_url, caption, locale, created_at, status")
            .eq("status", "approved")
            .order("created_at", { ascending: false })
            .limit(100)
            .then(({ data, error: e }) => {
                setLoading(false);
                if (e) {
                    setError(e.message);
                    const isTableMissing =
                        (e as { code?: string; status?: number }).code === "PGRST301" ||
                        (e as { status?: number }).status === 404 ||
                        /does not exist|not found|404/i.test(e.message ?? "");
                    setSetupHint(isTableMissing);
                    return;
                }
                setCards((data as SharedCard[]) ?? []);
            });
    }, []);

    const handleShareFromGallerySubmit = async () => {
        if (!shareFile) return;
        setShareLoading(true);
        try {
            const result = await uploadCardToGalleryFromFile({
                file: shareFile,
                caption: shareCaption.trim() || undefined,
                locale,
            });
            if (result) {
                setShareModalOpen(false);
                setShareFile(null);
                setShareCaption("");
                fetchCards();
                alert(t("shareSuccess"));
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

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-900">
                <Header showGallery={isGalleryEnabled} linkTitleToHome />
                <div className="mx-auto max-w-4xl px-3 py-6 sm:px-4 sm:py-8">
                    <p className="text-slate-500">{t("loading")}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-900">
                <Header showGallery={isGalleryEnabled} linkTitleToHome />
                <div className="mx-auto max-w-4xl px-3 py-6 sm:px-4 sm:py-8">
                    <p className="text-red-600">{t("error")}</p>
                    {setupHint && (
                        <p className="mt-2 max-w-lg rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                            {t("errorSetupHint")}
                        </p>
                    )}
                    <Link href="/" className="mt-4 inline-block text-sm text-slate-600 underline hover:text-slate-900">
                        {t("backHome")}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Header showGallery={isGalleryEnabled} linkTitleToHome />
            <div className="mx-auto max-w-4xl px-3 py-6 sm:px-4 sm:py-8">
                <section className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{t("title")}</h1>
                        <p className="text-sm text-slate-600">{t("subtitle")}</p>
                    </div>
                    {isGalleryEnabled && (
                        <button
                            type="button"
                            onClick={() => {
                                setShareFile(null);
                                setShareCaption("");
                                setShareModalOpen(true);
                            }}
                            className="shrink-0 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:border-slate-400 hover:bg-slate-50"
                        >
                            {t("shareButton")}
                        </button>
                    )}
                </section>

                <ShareCardModal
                    open={shareModalOpen}
                    onClose={() => {
                        setShareModalOpen(false);
                        setShareFile(null);
                        setShareCaption("");
                    }}
                    caption={shareCaption}
                    onCaptionChange={setShareCaption}
                    onSubmit={handleShareFromGallerySubmit}
                    loading={shareLoading}
                    mode="file-and-caption"
                    file={shareFile}
                    onFileChange={setShareFile}
                />

                <CommonModal open={!!detailCard} onClose={() => setDetailCard(null)} ariaLabelledBy="detail-modal-title">
                    {detailCard && (
                        <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
                            <div className="flex min-h-0 shrink-0 items-center justify-center overflow-hidden bg-slate-100 p-3" style={{ maxHeight: "50vh" }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={detailCard.image_url}
                                    alt={detailCard.caption ?? ""}
                                    className="max-h-[48vh] w-auto max-w-full object-contain"
                                />
                            </div>
                            <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
                                {(() => {
                                    const { title, body } = parseCaption(detailCard.caption);
                                    return (
                                        <>
                                            {title ? (
                                                <div>
                                                    <p id="detail-modal-title" className="text-xs font-medium text-slate-500">
                                                        {t("detailModalTitle")}
                                                    </p>
                                                    <p className="mt-0.5 text-base font-semibold text-slate-900">{title}</p>
                                                </div>
                                            ) : null}
                                            {body ? (
                                                <div>
                                                    <p className="text-xs font-medium text-slate-500">{t("detailModalBody")}</p>
                                                    <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-700">{body}</p>
                                                </div>
                                            ) : null}
                                            {!title && !body && detailCard.caption ? (
                                                <p className="whitespace-pre-wrap text-sm text-slate-700">{detailCard.caption}</p>
                                            ) : null}
                                        </>
                                    );
                                })()}
                            </div>
                            <div className="flex shrink-0 gap-2 border-t border-slate-200 p-4">
                                <button
                                    type="button"
                                    onClick={() => handleDownloadCardImage(detailCard.image_url)}
                                    className="flex-1 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                                >
                                    {t("detailModalDownload")}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDetailCard(null)}
                                    className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    {t("detailModalClose")}
                                </button>
                            </div>
                        </div>
                    )}
                </CommonModal>

                {cards.length === 0 ? (
                    <p className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-500">
                        {t("empty")}
                    </p>
                ) : (
                    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                        {cards.map((card) => {
                            const { title, body } = parseCaption(card.caption);
                            const summary = title ? `${title} ${body ? " · " + body.slice(0, 30) + (body.length > 30 ? "…" : "") : ""}` : (card.caption ?? "").slice(0, 60);
                            return (
                                <li key={card.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() => setDetailCard(card)}
                                        className="block w-full text-left"
                                    >
                                        <span className="block aspect-[9/16] w-full bg-slate-100">
                                            <Image
                                                src={card.image_url}
                                                alt={card.caption ?? ""}
                                                width={360}
                                                height={640}
                                                className="h-full w-full object-cover"
                                                unoptimized
                                            />
                                        </span>
                                        {(title || body || card.caption) ? (
                                            <p className="line-clamp-2 p-2 text-xs text-slate-600 sm:p-3 sm:text-sm">
                                                {summary || " "}
                                            </p>
                                        ) : null}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}

