"use client";

import { useEffect, useRef } from "react";

const AD_CLIENT = "ca-pub-8116400352006173";

type AdFormat = "auto" | "rectangle" | "horizontal" | "vertical";

interface AdBannerProps {
    /** AdSense 광고 단위 슬롯 ID. 승인 후 AdSense에서 광고 단위 생성 시 발급됩니다. */
    adSlot: string;
    /** 광고 형식. 기본값 auto(반응형) */
    format?: AdFormat;
    className?: string;
}

declare global {
    interface Window {
        adsbygoogle: unknown[];
    }
}

export function AdBanner({ adSlot, format = "auto", className = "" }: AdBannerProps) {
    const insRef = useRef<HTMLModElement>(null);

    useEffect(() => {
        if (!adSlot || adSlot.startsWith("REPLACE_")) return;
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.warn("AdSense push error", e);
        }
    }, [adSlot]);

    return (
        <div className={`min-h-[90px] w-full overflow-hidden rounded-xl bg-slate-100/80 [.adsbygoogle]:min-h-[90px] ${className}`}>
            <ins
                ref={insRef}
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client={AD_CLIENT}
                data-ad-slot={adSlot}
                data-ad-format={format}
                data-full-width-responsive="true"
            />
        </div>
    );
}
