import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { isGalleryEnabled } from "@/lib/supabase/client";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    if (!hasLocale(routing.locales, locale)) return {};
    const t = await getTranslations({ locale, namespace: "privacy" });
    return {
        title: t("metaTitle"),
        description: t("metaDescription"),
        robots: { index: true, follow: true },
    };
}

export default async function PrivacyPage({ params }: Props) {
    const { locale } = await params;
    if (!hasLocale(routing.locales, locale)) notFound();
    setRequestLocale(locale);
    const t = await getTranslations("privacy");

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
            <Header />
            <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("title")}</h1>
                <p className="mt-2 text-sm text-slate-500">{t("lastUpdated")}</p>

                <div className="prose prose-slate mt-8 max-w-none prose-p:leading-relaxed prose-p:text-slate-700 prose-headings:font-semibold prose-headings:text-slate-900">
                    <section className="mt-6">
                        <h2 className="text-lg font-semibold text-slate-900">{t("section1Title")}</h2>
                        <p className="mt-2">{t("section1Body")}</p>
                    </section>

                    <section className="mt-6">
                        <h2 className="text-lg font-semibold text-slate-900">{t("section2Title")}</h2>
                        <p className="mt-2">{t("section2Body")}</p>
                    </section>

                    <section className="mt-6">
                        <h2 className="text-lg font-semibold text-slate-900">{t("section3Title")}</h2>
                        <p className="mt-2">{t("section3Body")}</p>
                    </section>

                    <section className="mt-6">
                        <h2 className="text-lg font-semibold text-slate-900">{t("section4Title")}</h2>
                        <p className="mt-2">{t("section4Body")}</p>
                    </section>

                    <section className="mt-6">
                        <h2 className="text-lg font-semibold text-slate-900">{t("section5Title")}</h2>
                        <p className="mt-2">{t("section5Body")}</p>
                    </section>

                    <section className="mt-6">
                        <h2 className="text-lg font-semibold text-slate-900">{t("section6Title")}</h2>
                        <p className="mt-2">{t("section6Body")}</p>
                    </section>
                </div>

                <p className="mt-10">
                    <Link href="/" className="text-slate-600 underline hover:text-slate-900">
                        {t("backHome")}
                    </Link>
                </p>
            </main>
            <Footer />
        </div>
    );
}
