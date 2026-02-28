"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export function Header() {
    const t = useTranslations("home");

    return (
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-3 py-3 backdrop-blur sm:px-4 sm:py-4">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
                <Link
                    href="/"
                    className="interact-scale focus-ring min-w-0 truncate text-lg font-semibold tracking-tight text-slate-900 hover:text-slate-700 sm:text-xl md:text-2xl rounded-lg outline-offset-2"
                >
                    {t("title")}
                </Link>

                <nav className="flex shrink-0 items-center gap-2">
                    <Link
                        href="/gallery"
                        className="interact-scale focus-ring inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 hover:shadow"
                    >
                        {t("galleryLink")}
                    </Link>

                    <LocaleSwitcher />
                </nav>
            </div>
        </header>
    );
}
