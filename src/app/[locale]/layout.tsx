import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";

/** Cloudflare Pages: non-static routes must use Edge Runtime */
export const runtime = "edge";

type Props = {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    if (!hasLocale(routing.locales, locale)) return {};
    const t = await getTranslations({ locale, namespace: "meta" });
    const title = t("title");
    const description = t("description");
    const baseUrl =
        typeof process !== "undefined" && process.env.NEXT_PUBLIC_SITE_URL
            ? process.env.NEXT_PUBLIC_SITE_URL
            : "https://storyshot.pages.dev";
    return {
        metadataBase: new URL(baseUrl),
        title: { default: title, template: "%s | StoryShot" },
        description,
        keywords:
            locale === "ko"
                ? ["StoryShot", "스토리샷", "인스타 스토리 카드", "카카오톡 프로필", "텍스트 카드 생성기", "오늘의 한 줄"]
                : ["StoryShot", "Instagram story", "story card", "KakaoTalk", "card maker"],
        alternates: { canonical: `/${locale}` },
        robots: { index: true, follow: true },
        other: { "google-adsense-account": "ca-pub-8116400352006173" },
        openGraph: {
            title,
            description,
            type: "website",
            url: `${baseUrl}/${locale}`,
            images: [{ url: "/og-card.png", width: 1200, height: 630, alt: title }],
        },
        twitter: { card: "summary_large_image", title, description, images: ["/og-card.png"] },
    };
}

export default async function LocaleLayout({ children, params }: Props) {
    const { locale } = await params;
    if (!hasLocale(routing.locales, locale)) notFound();
    setRequestLocale(locale);
    const messages = await getMessages();
    return (
        <NextIntlClientProvider messages={messages} locale={locale}>
            {children}
        </NextIntlClientProvider>
    );
}
