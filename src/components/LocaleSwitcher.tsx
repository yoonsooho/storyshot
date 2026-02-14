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
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
            {label}
        </Link>
    );
}
