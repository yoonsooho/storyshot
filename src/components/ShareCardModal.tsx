"use client";

import { useTranslations } from "next-intl";
import { CommonModal } from "@/components/common/CommonModal";

type ShareCardModalProps = {
    open: boolean;
    onClose: () => void;
    caption: string;
    onCaptionChange: (value: string) => void;
    onSubmit: () => void;
    loading?: boolean;
    /** 메인(카드 만들기)용: 캡션만. 갤러리용: 파일+캡션 */
    mode: "caption-only" | "file-and-caption";
    /** mode === "file-and-caption" 일 때 */
    file?: File | null;
    onFileChange?: (file: File | null) => void;
};

export function ShareCardModal({
    open,
    onClose,
    caption,
    onCaptionChange,
    onSubmit,
    loading = false,
    mode,
    file,
    onFileChange,
}: ShareCardModalProps) {
    const t = useTranslations("home");
    const tGallery = useTranslations("gallery");

    const modalTitle = mode === "caption-only" ? t("shareModalTitle") : tGallery("shareModalTitle");
    const titleLabel = mode === "caption-only" ? t("shareModalTitleLabel") : tGallery("shareModalTitleLabel");
    const bodyLabel = mode === "caption-only" ? t("shareModalBodyLabel") : tGallery("shareModalBodyLabel");
    const titlePlaceholder =
        mode === "caption-only" ? t("shareModalTitlePlaceholder") : tGallery("shareModalTitlePlaceholder");
    const bodyPlaceholder =
        mode === "caption-only" ? t("shareModalBodyPlaceholder") : tGallery("shareModalBodyPlaceholder");

    const canSubmit = mode === "caption-only" ? true : !!file;

    const captionFirstLine = caption.indexOf("\n") >= 0 ? caption.slice(0, caption.indexOf("\n")) : caption;
    const captionRest = caption.indexOf("\n") >= 0 ? caption.slice(caption.indexOf("\n") + 1) : "";

    const handleCaptionTitleChange = (value: string) => {
        onCaptionChange(value.trim() + (captionRest.trim() ? "\n" + captionRest : ""));
    };
    const handleCaptionBodyChange = (value: string) => {
        onCaptionChange((captionFirstLine.trim() ? captionFirstLine.trim() + "\n" : "") + value.trim());
    };

    return (
        <CommonModal open={open} onClose={onClose} ariaLabelledBy="share-modal-title">
            <div className="w-full max-w-md min-w-[280px] rounded-2xl bg-white p-5 shadow-xl sm:p-6">
                <h2 id="share-modal-title" className="text-lg font-semibold text-slate-900">
                    {modalTitle}
                </h2>

                {mode === "file-and-caption" && (
                    <div className="mt-4">
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            {tGallery("shareModalImageLabel")}
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
                            onChange={(e) => onFileChange?.(e.target.files?.[0] ?? null)}
                        />
                        {file && (
                            <p className="mt-1 text-xs text-slate-500">
                                {tGallery("shareModalImageChosen")}: {file.name}
                            </p>
                        )}
                    </div>
                )}

                <div className="mt-4 space-y-4">
                    <div>
                        <label
                            htmlFor="share-caption-title"
                            className="mb-1.5 block text-sm font-medium text-slate-700"
                        >
                            {titleLabel}
                        </label>
                        <input
                            id="share-caption-title"
                            type="text"
                            value={captionFirstLine}
                            onChange={(e) => handleCaptionTitleChange(e.target.value)}
                            placeholder={titlePlaceholder}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="share-caption-body" className="mb-1.5 block text-sm font-medium text-slate-700">
                            {bodyLabel}
                        </label>
                        <textarea
                            id="share-caption-body"
                            value={captionRest}
                            onChange={(e) => handleCaptionBodyChange(e.target.value)}
                            placeholder={bodyPlaceholder}
                            rows={4}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="interact-scale focus-ring rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        {t("shareModalCancel")}
                    </button>
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={loading || !canSubmit}
                        className="interact-scale focus-ring rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-black disabled:pointer-events-none disabled:opacity-60"
                    >
                        {loading ? t("shareSending") : t("shareModalSubmit")}
                    </button>
                </div>
            </div>
        </CommonModal>
    );
}
