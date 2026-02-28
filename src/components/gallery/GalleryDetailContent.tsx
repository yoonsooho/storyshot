import { parseCaption } from "@/lib/string-utils";
import type { SharedCard } from "@/lib/supabase/client";

interface GalleryDetailContentProps {
    card: SharedCard;
    onClose: () => void;
    onDownload: () => void;
    t: (key: string) => string;
}

export function GalleryDetailContent({ card, onClose, onDownload, t }: GalleryDetailContentProps) {
    const { title, body } = parseCaption(card.caption);

    return (
        <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            <div
                className="flex min-h-0 shrink-0 items-center justify-center overflow-hidden bg-slate-100 p-3"
                style={{ maxHeight: "50vh" }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={card.image_url}
                    alt={card.caption ?? ""}
                    className="max-h-[48vh] w-auto max-w-full object-contain"
                />
            </div>
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
                {title && (
                    <div>
                        <p id="detail-modal-title" className="text-xs font-medium text-slate-500">
                            {t("detailModalTitle")}
                        </p>
                        <p className="mt-0.5 text-base font-semibold text-slate-900">{title}</p>
                    </div>
                )}
                {body && (
                    <div>
                        <p className="text-xs font-medium text-slate-500">{t("detailModalBody")}</p>
                        <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-700">{body}</p>
                    </div>
                )}
                {!title && !body && card.caption && (
                    <p className="whitespace-pre-wrap text-sm text-slate-700">{card.caption}</p>
                )}
            </div>
            <div className="flex shrink-0 gap-2 border-t border-slate-200 p-4">
                <button
                    type="button"
                    onClick={onDownload}
                    className="interact-lift focus-ring focus-ring-dark flex-1 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                >
                    {t("detailModalDownload")}
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className="interact-scale focus-ring rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                    {t("detailModalClose")}
                </button>
            </div>
        </div>
    );
}
