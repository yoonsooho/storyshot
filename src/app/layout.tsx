import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

/** Cloudflare Pages: root layout must run on Edge when using edge in [locale] */
export const runtime = "edge";

const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const headersList = await headers();
    const locale = headersList.get("x-next-intl-locale") ?? "ko";
    return (
        <html lang={locale}>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                {/* Google AdSense */}
                <Script
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8116400352006173"
                    async
                    crossOrigin="anonymous"
                    strategy="afterInteractive"
                />

                {gaId && (
                    <>
                        <Script
                            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
                            strategy="afterInteractive"
                        />
                        <Script id="ga-init" strategy="afterInteractive">
                            {`
                                window.dataLayer = window.dataLayer || [];
                                function gtag(){dataLayer.push(arguments);}
                                gtag('js', new Date());
                                gtag('config', '${gaId}');
                            `}
                        </Script>
                    </>
                )}
                {children}
            </body>
        </html>
    );
}
