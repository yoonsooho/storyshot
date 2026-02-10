import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const siteTitle = "StoryShot – 오늘의 한 줄 인스타 스토리 카드 생성기";
const siteDescription =
    "StoryShot은 사진과 텍스트만으로 인스타 스토리, 카카오톡 프로필, 블로그 썸네일에 쓰기 좋은 9:16 한 줄 스토리 카드를 만들어주는 웹 서비스입니다. 브라우저에서만 동작하며, 입력한 정보와 이미지는 서버에 저장되지 않습니다.";

export const metadata: Metadata = {
    metadataBase:
        typeof process !== "undefined" && process.env.NEXT_PUBLIC_SITE_URL
            ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
            : undefined,
    title: {
        default: siteTitle,
        template: "%s | StoryShot",
    },
    description: siteDescription,
    keywords: [
        "StoryShot",
        "스토리샷",
        "인스타 스토리 카드",
        "인스타 스토리 이미지 생성",
        "카카오톡 프로필 이미지",
        "텍스트 카드 생성기",
        "오늘의 한 줄",
        "명언 카드",
    ],
    alternates: {
        canonical: "/",
    },
    robots: {
        index: true,
        follow: true,
    },
    openGraph: {
        title: siteTitle,
        description: siteDescription,
        type: "website",
        url: "/",
        images: [
            {
                url: "/og-card.png",
                width: 1200,
                height: 630,
                alt: "StoryShot – 오늘의 한 줄 인스타 스토리 카드 생성기",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: siteTitle,
        description: siteDescription,
        images: ["/og-card.png"],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <Script
                    id="adsbygoogle-init"
                    async
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8116400352006173"
                    crossOrigin="anonymous"
                    strategy="afterInteractive"
                />
                {children}
            </body>
        </html>
    );
}
