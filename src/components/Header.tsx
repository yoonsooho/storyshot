"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

type HeaderProps = {
    /** 갤러리 버튼 표시 여부 (Supabase 설정 시 true) */
    showGallery?: boolean;
    /** true면 타이틀에 홈 링크 적용 (갤러리 페이지 등에서 사용) */
    linkTitleToHome?: boolean;
};

export function Header({ showGallery = false, linkTitleToHome = false }: HeaderProps) {
    const t = useTranslations("home");

    return (
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-3 py-3 backdrop-blur sm:px-4 sm:py-4">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
                {linkTitleToHome ? (
                    <Link
                        href="/"
                        className="min-w-0 truncate text-lg font-semibold tracking-tight text-slate-900 hover:text-slate-700 sm:text-xl md:text-2xl"
                    >
                        {t("title")}
                    </Link>
                ) : (
                    <h1 className="min-w-0 truncate text-lg font-semibold tracking-tight text-slate-900 sm:text-xl md:text-2xl">
                        {t("title")}
                    </h1>
                )}

                <nav className="flex shrink-0 items-center gap-2">
                    {showGallery && (
                        <Link
                            href="/gallery"
                            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:shadow"
                        >
                            {t("galleryLink")}
                        </Link>
                    )}
                    <LocaleSwitcher />
                </nav>
            </div>
        </header>
    );
}
