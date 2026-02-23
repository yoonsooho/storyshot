"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export function Footer() {
    const t = useTranslations("footer");

    return (
        <footer className="mt-auto border-t border-slate-200 bg-white/80 px-3 py-6 text-center text-sm text-slate-600 sm:px-4">
            <div className="mx-auto max-w-6xl">
                <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                    <Link href="/privacy" className="underline hover:text-slate-900">
                        {t("privacy")}
                    </Link>
                    <span className="text-slate-300">|</span>
                    <Link href="/terms" className="underline hover:text-slate-900">
                        {t("terms")}
                    </Link>
                </nav>
                <p className="mt-2 text-xs text-slate-500">
                    © {new Date().getFullYear()} StoryShot. {t("allRightsReserved")}
                </p>
            </div>
        </footer>
    );
}
