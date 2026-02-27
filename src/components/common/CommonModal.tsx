"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

type CommonModalProps = {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    ariaLabelledBy?: string;
    /** 필요하면 오버레이 스타일을 커스터마이징 */
    overlayClassName?: string;
};

export function CommonModal({ open, onClose, children, ariaLabelledBy, overlayClassName }: CommonModalProps) {
    useEffect(() => {
        if (!open) return;
        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = original;
        };
    }, [open]);

    if (!open || typeof document === "undefined") return null;

    return createPortal(
        <div
            className={overlayClassName ?? "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"}
            role="dialog"
            aria-modal="true"
            aria-labelledby={ariaLabelledBy}
            onClick={onClose}
        >
            {children}
        </div>,
        document.body
    );
}
