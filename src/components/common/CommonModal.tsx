"use client";

import { useEffect, useState } from "react";
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
    const [isVisible, setIsVisible] = useState(open);

    useEffect(() => {
        if (open) {
            // open이 true가 되면 즉시 보여야 함. 린트 에러(동기 setState) 회피를 위해 비동기로 처리.
            const timer = setTimeout(() => setIsVisible(true), 0);
            return () => clearTimeout(timer);
        }
    }, [open]);

    useEffect(() => {
        if (!isVisible) return;
        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = original;
        };
    }, [isVisible]);

    if (!isVisible || typeof document === "undefined") return null;

    const animationClass = open ? "modal-backdrop-enter" : "modal-backdrop-exit";
    const contentAnimationClass = open ? "modal-content-enter" : "modal-content-exit";
    const defaultOverlay = "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm";

    const handleAnimationEnd = (e: React.AnimationEvent) => {
        // 백드롭 애니메이션이 끝났을 때만 처리 (자식 요소 애니메이션 종료 이벤트 버블링 방지)
        if (e.target === e.currentTarget && !open) {
            setIsVisible(false);
        }
    };

    return createPortal(
        <div
            className={overlayClassName ?? `${defaultOverlay} ${animationClass} ${!open ? "pointer-events-none" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={ariaLabelledBy}
            onAnimationEnd={handleAnimationEnd}
        >
            <div
                className={`min-h-full min-w-full flex items-center justify-center ${contentAnimationClass}`}
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
            >
                {children}
            </div>
        </div>,
        document.body
    );
}
