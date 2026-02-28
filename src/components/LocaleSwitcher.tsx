"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";

export function LocaleSwitcher() {
    const pathname = usePathname();
    const locale = useLocale();
    const nextLocale = locale === "ko" ? "en" : "ko";
    const label = locale === "ko" ? "English" : "한국어";
    const href = pathname === "/" || !pathname ? "/" : pathname;
    return (
        <Link
            href={href}
            locale={nextLocale as "ko" | "en"}
            className="interact-scale focus-ring inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50"
        >
            {label}
        </Link>
    );
}
