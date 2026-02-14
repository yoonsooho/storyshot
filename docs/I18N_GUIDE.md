# StoryShot 국제화(i18n) 가이드

이 문서는 이 프로젝트에 **next-intl**을 사용해 한국어(ko) / 영어(en) 국제화를 적용한 방법을 단계별로 설명합니다.

---

## 1. 개요

- **라이브러리**: [next-intl](https://next-intl.dev/) (Next.js App Router용)
- **지원 언어**: 한국어(ko, 기본), 영어(en)
- **URL 구조**: 경로 기반 — `/ko`, `/en` (루트 `/` 접속 시 `/ko`로 리다이렉트)
- **번역 저장**: 프로젝트 루트의 `messages/ko.json`, `messages/en.json`

---

## 2. 추가된/수정된 파일 구조

```
프로젝트 루트/
├── messages/
│   ├── ko.json          # 한국어 번역
│   └── en.json          # 영어 번역
├── next.config.mjs      # next-intl 플러그인 적용
├── src/
│   ├── proxy.ts         # Next.js 16: locale 리다이렉트/라우팅 (구 middleware)
│   ├── i18n/
│   │   ├── routing.ts   # locale 목록, 기본값, URL 접두사 설정
│   │   ├── request.ts   # 요청별 locale·메시지 로드 (getRequestConfig)
│   │   └── navigation.ts # locale 인식 Link, usePathname, useRouter
│   ├── app/
│   │   ├── layout.tsx   # 루트 레이아웃 (html lang, 스크립트)
│   │   └── [locale]/    # locale별 라우트
│   │       ├── layout.tsx  # NextIntlClientProvider, 메타데이터
│   │       └── page.tsx    # 메인 페이지 (useTranslations 사용)
│   └── components/
│       └── LocaleSwitcher.tsx  # 언어 전환 링크 (한국어 ↔ English)
```

---

## 3. 단계별 설명

### 3.1 패키지 설치

```bash
pnpm add next-intl
```

- Next.js App Router와 호환되는 i18n 라이브러리입니다.
- 서버/클라이언트 컴포넌트 모두에서 번역과 locale 기반 라우팅을 지원합니다.

---

### 3.2 Next.js 설정 (`next.config.mjs`)

```js
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();
// ...
export default withNextIntl(nextConfig);
```

- `createNextIntlPlugin()`이 **기본 경로** `src/i18n/request.ts`를 사용합니다.
- 이 파일에서 요청마다 locale과 메시지를 결정합니다.

---

### 3.3 라우팅 설정 (`src/i18n/routing.ts`)

```ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
    locales: ["ko", "en"],
    defaultLocale: "ko",
    localePrefix: "always",
});
```

| 옵션 | 의미 |
|------|------|
| `locales` | 지원하는 언어 코드 배열 |
| `defaultLocale` | 기본 언어. `/` 접속 시 이 locale으로 리다이렉트 |
| `localePrefix: "always"` | URL에 항상 locale 접두사 사용 (`/ko`, `/en`) |

- 이 객체는 **proxy**, **request**, **navigation**에서 공통으로 사용합니다.

---

### 3.4 요청별 설정 (`src/i18n/request.ts`)

```ts
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
    const requested = await requestLocale;
    const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default,
    };
});
```

- **역할**: 요청이 들어올 때마다 (URL의 `[locale]`에 맞춰) 사용할 **locale**과 **messages**를 정합니다.
- `requestLocale`: URL의 `[locale]` 세그먼트 (proxy가 설정).
- `hasLocale(routing.locales, requested)`: `requested`가 허용된 locale인지 검사.
- 허용되지 않으면 `defaultLocale`(ko)을 쓰고, 해당 locale의 JSON을 동적 import 해서 `messages`로 넘깁니다.
- 이 값들은 **서버 컴포넌트**와 **NextIntlClientProvider**에 전달됩니다.

---

### 3.5 Proxy (`src/proxy.ts`) — Next.js 16

```ts
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
    matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
```

- Next.js 16에서는 **middleware.ts 대신 proxy.ts**를 사용합니다. (같은 역할)
- **하는 일**:
  - `/` 접속 시 → `defaultLocale`인 `/ko`로 리다이렉트
  - `/ko`, `/en` 등 허용된 locale 접두사가 있으면 그대로 통과
  - 요청에 **locale 정보**를 붙여서 다음 단계(레이아웃, request.ts)에서 사용할 수 있게 함
- `matcher`: `api`, `_next`, `_vercel`, 정적 파일(확장자 있는 경로)은 제외하고 나머지 경로에만 동작합니다.

---

### 3.6 네비게이션 유틸 (`src/i18n/navigation.ts`)

```ts
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
```

- **Link**: `<a>` 대신 사용. `href`와 `locale`을 넣으면 현재 locale을 바꾼 URL로 이동합니다.
- **usePathname**: locale 접두사를 뺀 pathname (예: `/ko` → `/`).
- **useRouter**, **redirect**, **getPathname**: locale을 고려한 라우팅/리다이렉트/경로 생성용입니다.
- **언어 전환**처럼 “같은 페이지, 다른 locale”으로 가는 링크는 여기서 제공하는 `Link` + `locale` prop을 쓰는 것이 좋습니다.

---

### 3.7 번역 파일 (`messages/ko.json`, `messages/en.json`)

- **위치**: 프로젝트 루트 `messages/` 폴더.
- **구조**: 네임스페이스 단위로 묶어서 사용합니다.

```json
{
    "meta": {
        "title": "페이지 제목",
        "description": "메타 설명"
    },
    "home": {
        "title": "화면 제목",
        "subtitle": "부제목",
        "formTitle": "폼 섹션 제목",
        ...
    }
}
```

- **meta**: SEO·메타데이터용 (layout의 `generateMetadata`에서 사용).
- **home**: 메인 페이지 UI 문구. 클라이언트에서 `useTranslations("home")`으로 사용.
- **변수 치환**: `"currentPhoto": "현재 적용된 사진: {name}"` → `t("currentPhoto", { name: "파일명" })`.

---

### 3.8 루트 레이아웃 (`src/app/layout.tsx`)

- **역할**: `<html>`, `<body>`, 공통 스크립트(GA, AdSense), 폰트.
- **locale 반영**:
  - next-intl proxy가 요청에 `x-next-intl-locale` 헤더를 붙입니다.
  - `headers().get("x-next-intl-locale")`로 읽어서 `<html lang={locale}>`에 넣습니다.
- 메타데이터(타이틀, 설명 등)는 **locale별**로 다르게 주려고 `app/[locale]/layout.tsx`의 `generateMetadata`에서 처리합니다.

---

### 3.9 locale 레이아웃 (`src/app/[locale]/layout.tsx`)

- **역할**:
  1. URL의 `[locale]`이 허용 목록에 있는지 검사 → 아니면 `notFound()`.
  2. `setRequestLocale(locale)` 호출 → 정적 생성 시 올바른 locale 사용.
  3. `getMessages()`로 해당 locale 메시지를 가져와 **NextIntlClientProvider**에 전달.
  4. **generateMetadata**: `getTranslations({ locale, namespace: "meta" })`로 `meta.title`, `meta.description`을 넣어 SEO/OG 설정.
  5. **generateStaticParams**: `["ko", "en"]`을 반환해 빌드 시 `/ko`, `/en` 경로를 미리 생성합니다.

- 이 레이아웃 덕분에 **같은 페이지 컴포넌트**가 locale만 바뀌어서 ko/en 각각 렌더링됩니다.

---

### 3.10 메인 페이지 (`src/app/[locale]/page.tsx`)

- **클라이언트 컴포넌트** (`"use client"`).
- 번역 사용:

```ts
const t = useTranslations("home");

// 사용 예
<h1>{t("title")}</h1>
<p>{t("subtitle")}</p>
<Field label={t("textMainLabel")} ... />
```

- **네임스페이스**: `useTranslations("home")` → `messages/*.json`의 `home` 객체 키만 사용.
- **변수**: `t("currentPhoto", { name: fileName })`.
- **카드 미리보기**처럼 같은 파일 안의 내부 컴포넌트에는 `translations` prop으로 `t("...")` 결과를 넘겨서, 한 곳에서만 `useTranslations`를 쓰도록 했습니다.

---

### 3.11 언어 전환 컴포넌트 (`src/components/LocaleSwitcher.tsx`)

```tsx
import { Link, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";

export function LocaleSwitcher() {
    const pathname = usePathname();  // locale 제외 경로 (예: "/")
    const locale = useLocale();      // 현재 locale ("ko" | "en")
    const nextLocale = locale === "ko" ? "en" : "ko";
    const label = locale === "ko" ? "English" : "한국어";
    return (
        <Link href="/" locale={nextLocale}>
            {label}
        </Link>
    );
}
```

- **i18n 전용 Link**를 쓰면 `href`는 그대로 두고 `locale`만 바꿔서 같은 페이지의 다른 언어 버전으로 이동합니다.
- 메인 페이지 헤더에 `<LocaleSwitcher />`를 넣어 두었습니다.

---

## 4. 데이터 흐름 요약

1. 사용자가 **`/`** 접속 → **proxy**가 `/ko`로 리다이렉트.
2. **`/ko`** 요청 → `app/[locale]/layout.tsx`에서 `locale = "ko"`.
3. **request.ts**의 `getRequestConfig`가 `locale: "ko"`, `messages: messages/ko.json` 반환.
4. **LocaleLayout**이 `NextIntlClientProvider`에 `messages`와 `locale` 전달.
5. **page.tsx**에서 `useTranslations("home")`으로 `t("title")` 등 호출 → `messages.home.title` 사용.
6. **루트 layout**은 `x-next-intl-locale`로 `<html lang="ko">` 설정.

---

## 5. 새 번역 키 추가 방법

1. **messages/ko.json**, **messages/en.json**에 같은 키를 추가합니다.

   ```json
   "home": {
       "newLabel": "새 라벨 (한국어)"
   }
   ```

   ```json
   "home": {
       "newLabel": "New label (English)"
   }
   ```

2. 컴포넌트에서 사용:

   ```ts
   const t = useTranslations("home");
   return <span>{t("newLabel")}</span>;
   ```

3. **변수**가 필요하면:

   - JSON: `"greeting": "Hello, {name}!"`
   - 코드: `t("greeting", { name: "User" })`

---

## 6. 새 언어(예: ja) 추가 방법

1. **routing.ts**에 locale 추가:
   ```ts
   locales: ["ko", "en", "ja"],
   ```

2. **messages/ja.json** 생성 후, ko/en과 같은 키 구조로 일본어 문구 작성.

3. **proxy**는 routing 설정을 쓰므로 자동으로 `/ja` 허용.

4. **generateStaticParams**는 `routing.locales`를 쓰므로 `ja`도 자동 포함.

5. **LocaleSwitcher**에 일본어 전환 버튼을 추가하려면, `nextLocale`/`label` 로직을 ko/en/ja에 맞게 확장하면 됩니다.

---

## 7. 참고 사항

- **정적 생성**: `[locale]/layout.tsx`의 `generateStaticParams`와 `setRequestLocale(locale)`로 빌드 시 ko/en 경로가 정적으로 생성됩니다.
- **사이트맵**: `app/sitemap.ts`에서 `["ko", "en"]`을 순회해 `/ko`, `/en` URL을 넣었습니다.
- **next-intl 문서**: [App Router 설정](https://next-intl.dev/docs/getting-started/app-router), [라우팅 설정](https://next-intl.dev/docs/routing/setup) 참고.

이 가이드로 국제화 구조를 재현하거나 수정할 때 참고하시면 됩니다.
