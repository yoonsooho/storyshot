## StoryShot – 오늘의 한 줄 인스타 스토리 카드 생성기

StoryShot은 **사진 + 텍스트로 인스타 스토리/카카오톡 프로필/블로그 썸네일에 쓰기 좋은 9:16 카드**를 만드는 개인 사이드 프로젝트입니다.

-   **Live**: https://storyshot.pages.dev/
-   **Stack**: Next.js (App Router), React, TypeScript, Tailwind CSS v4, next-intl (ko/en)

예시 썸네일(OG 이미지):

![StoryShot OG Image](./public/og-card.png)

---

### 주요 기능

-   **오늘의 한 줄 / 보조 문장 입력**
    -   메인 문장 + 서브 문장을 입력해서 한 장짜리 스토리 카드 생성
-   **기분 선택**
    -   😌 차분함 / 😊 좋음 / 😮‍💨 피곤함 / 🔥 집중 등의 간단한 기분 토글
-   **배경 선택**
    -   그라데이션 템플릿 3종 (노을/바다/모노톤)
    -   사용자 사진 업로드 후, 위에 텍스트를 얹어서 카드 생성
-   **9:16 비율 미리보기**
    -   인스타 스토리/모바일 화면 비율에 맞는 카드 미리보기
-   **PNG 다운로드**
    -   html-to-image 를 사용해 카드 영역을 PNG 파일(`story-card.png`)로 저장
    -   저장한 이미지를 그대로 인스타/카톡/블로그 등에 업로드해서 사용 가능
-   **갤러리 공유 (Supabase)**
    -   Supabase 설정 시, 만든 카드를 갤러리에 공유하고 다른 사람 카드를 볼 수 있음
    -   무료 플랜: Storage 1GB, 파일당 50MB 이하 → PNG 카드 업로드에 충분

메인 카드 만들기·다운로드는 **클라이언트 사이드에서만** 동작하며, 갤러리 기능을 쓰지 않으면 입력/이미지는 서버에 저장되지 않습니다.

---

### 다국어 (next-intl)

- **한국어(ko) / 영어(en)** 지원. URL은 `/ko`, `/en` 이며, 루트 `/` 접속 시 `/ko` 로 리다이렉트됩니다.
- **LocaleSwitcher** 컴포넌트로 같은 페이지의 `/ko` ↔ `/en` 전환이 가능합니다.
- **구성**: `middleware`에서 locale 리다이렉트, `src/i18n/request.ts`에서 locale별 `messages` 로드, `[locale]/layout`에서 `NextIntlClientProvider`·메타데이터, 페이지에서 `useTranslations('home')`로 `t()` 사용. 상세는 `docs/I18N_GUIDE.md`, `docs/I18N_FLOW.md` 참고.

---

### Lighthouse / 성능 (FCP 대응)

- **First Contentful Paint (NO_FCP)** 로 Performance 점수가 측정되지 않던 문제를 아래처럼 맞춰 두었습니다.
  - **원인**: 페이지/폼/카드 진입 애니메이션이 모두 `opacity: 0`으로 시작해, 그동안 브라우저가 "그린 콘텐츠"가 없다고 판단함.
  - **해결**: 키프레임과 `.card-preview-initial`의 시작 `opacity`를 **0.1**로 변경해, 첫 프레임부터 픽셀이 그려지도록 하고 transform 애니메이션은 유지. FCP가 정상 측정되도록 함.

---

### SEO 및 메타데이터 설정

#### 1. 기본 메타데이터 (`src/app/layout.tsx`)

-   `Metadata`를 이용해 기본 SEO 정보를 설정했습니다.
    -   `title`: `"StoryShot – 오늘의 한 줄 인스타 스토리 카드 생성기"`
    -   `description`: 인스타 스토리/카카오톡/블로그 썸네일 용도 중심으로 작성
    -   `keywords`: `"StoryShot", "스토리샷", "인스타 스토리 카드", "오늘의 한 줄" 등`
    -   `alternates.canonical`: `/`
    -   `robots.index = true`, `robots.follow = true`
-   Open Graph / Twitter 카드
    -   `og:image`, `twitter:image` 모두 `"/og-card.png"` 를 사용
    -   `public/og-card.png` 로 정적 썸네일 이미지를 배치

#### 2. robots 설정 (`src/app/robots.ts`)

```ts
export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://storyshot.pages.dev";

    return {
        rules: {
            userAgent: "*",
            allow: "/",
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
```

-   모든 크롤러에 대해 전체 경로 크롤링 허용
-   `Sitemap: https://storyshot.pages.dev/sitemap.xml` 을 명시

#### 3. sitemap 설정 (`src/app/sitemap.ts`)

```ts
export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://storyshot.pages.dev";

    return [
        {
            url: `${baseUrl}/`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1,
        },
    ];
}
```

-   현재 단일 페이지 구조라 루트(`/`)만 포함
-   배포 후 `/sitemap.xml` 경로로 자동 노출

#### 4. Google Search Console 소유권 인증

-   HTML 파일 방식 인증을 사용했습니다.
-   `public/googleaffbcddc16034708.html`:

```text
google-site-verification: googleaffbcddc16034708.html
```

-   배포 후 `https://storyshot.pages.dev/googleaffbcddc16034708.html` 에 접근 가능  
    → GSC에서 HTML 파일 방식으로 소유권 확인

---

### Analytics & 광고 수익화 설정

#### 1. Google Analytics 4 연동

-   GA4 데이터 스트림(웹) 생성 후 발급받은 **측정 ID (`G-XXXX...`)** 를 사용했습니다.
-   `NEXT_PUBLIC_GA_MEASUREMENT_ID` 환경 변수를 통해 ID를 주입합니다.
-   `src/app/layout.tsx`에서 `next/script`를 사용해 gtag를 초기화합니다.

```ts
const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko">
            <body>
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
```

-   기본 **페이지뷰/세션/기본 이벤트**를 수집하며, 향후 필요 시 `gtag('event', 'download_card', {...})` 형태로 커스텀 이벤트를 추가해 행동 단위 트래킹이 가능합니다.

#### 2. Google AdSense 연동

-   AdSense 사이트 등록 및 `ca-pub-...` 퍼블리셔 ID를 사용해 전역 스크립트를 로드합니다.
-   서명 메타 태그:

```ts
export const metadata: Metadata = {
    // ...
    other: {
        "google-adsense-account": "ca-pub-8116400352006173",
    },
};
```

-   전역 스크립트는 `next/script`로 한 번만 로드합니다.
-   광고 배너용 재사용 컴포넌트(`src/components/AdBanner.tsx`)를 만들어 페이지 어디에서나 간단히 삽입 가능합니다.

```tsx
export function AdBanner({ adSlot }: { adSlot: string }) {
    useEffect(() => {
        if (!adSlot || adSlot.startsWith("REPLACE_")) return;
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    }, [adSlot]);

    return (
        <div className="min-h-[90px] w-full rounded-xl bg-slate-100/80">
            <ins
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client="ca-pub-8116400352006173"
                data-ad-slot={adSlot}
                data-ad-format="auto"
                data-full-width-responsive="true"
            />
        </div>
    );
}
```

-   실제 운영 시에는 AdSense에서 발급된 **광고 단위 슬롯 ID** 를 `adSlot`에 전달하여 배너를 노출합니다.

---

### 갤러리 (Supabase) 설정

갤러리 공유 기능을 쓰려면 [Supabase](https://supabase.com) 무료 프로젝트를 만들고 아래를 진행하세요.

1. **프로젝트 생성**  
   대시보드에서 새 프로젝트 생성 후, **Settings → API** 에서  
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`  
   - **anon public** 키 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
   로 복사해 `.env.local`에 넣습니다. (참고: `.env.example`)

2. **DB·Storage 설정**  
   **SQL Editor**에서 `docs/supabase-setup.sql` 내용을 그대로 실행합니다.  
   - `shared_cards` 테이블 생성 및 RLS  
   - `card-images` 스토리지 버킷 및 정책 (또는 Storage 메뉴에서 버킷을 수동 생성 후 정책만 SQL로 추가)

3. **동작**  
   - 환경 변수가 있으면 메인 페이지에 **갤러리에 공유** 버튼과 **갤러리** 링크가 보입니다.  
   - 공유 시 카드 PNG가 Storage에 올라가고 `shared_cards`에 한 줄이 추가되며, `/ko/gallery`(또는 `/en/gallery`)에서 목록을 볼 수 있습니다.

Supabase 무료 플랜: Storage 1GB, 파일당 50MB 이하이면 이미지 업로드 가능합니다.

---

### 갤러리 리스트 가상화 및 사용 라이브러리

갤러리(`/ko/gallery`, `/en/gallery`)는 카드가 많아져도 **DOM 개수를 줄이기 위해 가상화**를 적용했고, **무한 스크롤**로 다음 페이지를 불러옵니다. 스크롤은 **브라우저 창(문서) 기준**으로만 동작해, 내부에 별도 스크롤 영역이 없습니다.

#### 1. @tanstack/react-virtual (`useWindowVirtualizer`)

- **역할**: 스크롤은 문서 전체로 하고, **보이는 행만** DOM에 그려서 성능을 유지합니다. 스크롤을 내리면 위쪽 행은 DOM에서 사라지고, 아래쪽 행만 새로 그려집니다.
- **사용 위치**: `src/app/[locale]/gallery/page.tsx`

**주요 옵션**

| 옵션 | 의미 |
|------|------|
| `count` | 가상화할 행 개수 (`rowCount`) |
| `estimateSize()` | 한 행의 예상 높이(px). 여기서는 560 |
| `overscan` | 보이는 영역 밖에 몇 행을 더 그릴지 (기본 2). 스크롤 시 깜빡임 감소 |
| `scrollMargin` | 리스트가 문서 맨 위에서 얼마나 아래에 있는지(px). 헤더·인트로 높이 반영 |

**주요 메서드**

| 메서드 | 의미 |
|--------|------|
| `getTotalSize()` | 전체 리스트 높이. 이 값으로 컨테이너 높이를 잡아 페이지 세로 스크롤을 만듦 |
| `getVirtualItems()` | **현재 뷰포트에 들어오는 행만** 담은 배열. 각 항목에 `key`, `index`, `start`, `size` 등 포함 |

**코드 사용 예**

```tsx
const rowVirtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => DEFAULT_ROW_HEIGHT, // 560
    overscan: 2,
    scrollMargin: scrollMargin,
});

// 컨테이너 높이 = 전체 높이 + sentinel 영역
<div style={{ height: rowVirtualizer.getTotalSize() + SENTINEL_HEIGHT, position: "relative" }}>
    {rowVirtualizer.getVirtualItems().map((virtualRow) => (
        <div
            key={virtualRow.key}
            style={{
                position: "absolute",
                transform: `translateY(${virtualRow.start - scrollMargin}px)`,
                height: virtualRow.size,
            }}
        >
            <GalleryGridRow index={virtualRow.index} ... />
        </div>
    ))}
</div>
```

- `scrollMargin`은 갤러리 섹션 ref의 `getBoundingClientRect().top + window.scrollY`로 한 번 잡고, `virtualRow.start - scrollMargin`으로 **문서 좌표 → 컨테이너 기준 Y**로 변환해 배치합니다.

#### 2. react-intersection-observer (`useInView`)

- **역할**: 리스트 **맨 아래 sentinel** div가 화면에 들어오면 `inView`가 true가 되고, 이때 다음 페이지를 fetch해서 **무한 스크롤**을 구현합니다.
- **사용 위치**: `src/app/[locale]/gallery/page.tsx`

**주요 옵션**

| 옵션 | 의미 |
|------|------|
| `ref` | 감시할 DOM에 붙이는 ref. 이 요소가 보이면 `inView`가 true |
| `inView` | ref가 붙은 요소가 현재 보이는지 여부 (boolean) |
| `rootMargin` | 뷰포트 확장. `"200px 0px"`면 아래쪽 200px 전에 미리 트리거 |
| `threshold` | 얼마나 보여야 “보인다”로 할지. 0이면 1px만 보여도 true |

**코드 사용 예**

```tsx
const { ref: loadMoreRef, inView } = useInView({
    rootMargin: "200px 0px",
    threshold: 0,
});

// 리스트 맨 아래에 보이지 않는 sentinel div
<div ref={loadMoreRef} style={{ position: "absolute", top: rowVirtualizer.getTotalSize(), height: SENTINEL_HEIGHT }} />

// inView가 true일 때 다음 페이지 로드
useEffect(() => {
    if (!inView || !hasMore || isFetchingMore) return;
    fetchCards(page + 1, true);
}, [inView, hasMore, isFetchingMore, page, fetchCards]);
```

#### 3. 전체 흐름 요약

1. **데이터**: `cards`, `rowCount`, `hasMore`, `page`로 “지금까지 불러온 카드”와 “다음 페이지 존재 여부” 관리.
2. **가상화**: `useWindowVirtualizer`에 `rowCount`, `estimateSize`, `scrollMargin`을 넘겨서, 문서 스크롤에 맞춰 `getVirtualItems()`로 “지금 그릴 행”만 받음.
3. **레이아웃**: 높이 `getTotalSize() + SENTINEL_HEIGHT`인 컨테이너를 두고, 그 안에 `getVirtualItems()` 결과만 `translateY(virtualRow.start - scrollMargin)`으로 배치.
4. **무한 스크롤**: 리스트 맨 아래 sentinel에 `useInView`의 ref를 달고, `inView`가 true일 때만 `fetchCards(next, true)` 호출.

이렇게 **@tanstack/react-virtual**로 “어떤 행을 어디에 그릴지”를 결정하고, **react-intersection-observer**로 “언제 다음 페이지를 불러올지”를 결정하는 구조입니다.

---

### 로컬 개발

```bash
pnpm install
pnpm dev
# 또는
npm install
npm run dev
```

-   기본 포트: `http://localhost:3000`

---

### 사용 흐름 (요약)

1. **오늘의 한 줄 / 보조 문장 입력**
2. 날짜 + 오늘의 기분 선택
3. 그라데이션 배경 또는 사진 업로드 선택
4. 우측 미리보기에서 9:16 스토리 카드 확인
5. `PNG로 카드 저장` 버튼으로 이미지 다운로드
6. 인스타 스토리 / 카카오톡 프로필 / 블로그 썸네일 등에 업로드해서 사용

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
