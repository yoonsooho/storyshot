# StoryShot – 오늘의 한 줄 인스타 스토리 카드 생성기

StoryShot은 **인스타 스토리, 카카오톡 프로필, 블로그 썸네일에 바로 쓸 수 있는 한 줄 스토리 카드**를 브라우저에서 만들고 PNG로 저장할 수 있는 웹 앱입니다.

기존에 쓰던 텍스트 카드/스토리 제작 방식의 불편한 점을 줄이기 위해:

- **한 페이지에서** 오늘의 한 줄, 보조 문장, 날짜, 기분을 입력하고
- **그라데이션 또는 업로드한 사진**을 배경으로 선택하며
- **9:16·4:5·1:1 등 여러 비율**로 미리보기 후
- **글자 블록을 드래그해 위치 조절**, 클릭해 색상 변경, 넓이 조절까지 한 화면에서 처리할 수 있게 했습니다.

즉, **"오늘의 한 줄 + 배경 + 비율 + 레이아웃 조정 → PNG 다운로드"**까지 **클라이언트에서만** 동작하는 단일 페이지 도구라는 점이 특징입니다. 입력한 텍스트와 업로드한 이미지는 서버로 전송되지 않습니다.

- **다국어**: next-intl로 한국어(ko) / 영어(en) 지원, URL `/ko`, `/en` 및 LocaleSwitcher로 전환
- **Cloudflare Pages**로 배포하여 엣지에서 빠르게 서빙

- **github**: (본인 저장소 URL 추가)
- **url**: https://storyshot.pages.dev

---

## 구현 중 생긴 문제 및 해결

- **Lighthouse에서 First Contentful Paint(NO_FCP) 에러로 Performance 점수 측정 실패**
  - **원인**: 페이지/폼/카드 진입 애니메이션이 모두 `opacity: 0`으로 시작해, 그동안 브라우저가 "그린 콘텐츠"가 없다고 판단함.
  - **해결**: 키프레임과 `.card-preview-initial`의 시작 `opacity`를 **0.1**로 변경해, 첫 프레임부터 픽셀이 그려지도록 하고 transform 애니메이션은 유지. FCP가 정상 측정되도록 함.

- **Lighthouse Best Practices 점수 저하 (소스맵, 서드파티 쿠키, deprecated API)**
  - **Missing source maps**: `next.config.mjs`에 **`productionBrowserSourceMaps: true`** 추가해 프로덕션 JS에도 브라우저용 소스맵 생성. 디버깅·에러 추적에 활용.
  - **Third-party cookies / Deprecated APIs**: Google AdSense·GA 스크립트에서 발생. 우리 코드가 아니라 스크립트 자체 이슈라, 동의 후 로딩을 도입하지 않는 한 제거 불가. AdSense 사용 시 흔한 trade-off로 두고 무시.

- **Cloudflare Pages 배포 시 Next.js 호환**
  - **대응**: **루트 `layout.tsx`**, `[locale]/layout.tsx`, `not-found.tsx`에 **`export const runtime = 'edge'`** 지정. next-on-pages와 호환되도록 미들웨어만 사용하고, 정적 생성 제한 등 Cloudflare 제약에 맞춤. (루트 layout에 edge가 없으면 "Application error: a server-side exception" 발생해 추가 적용)

- **다국어 라우팅 (next-intl)**
  - **설계**: `middleware`에서 `/` → `/ko` 리다이렉트, `request.ts`에서 locale별 `messages` 로드, `[locale]/layout`에서 Provider·메타데이터, 페이지에서 `useTranslations('home')`로 `t()` 사용. LocaleSwitcher는 `@/i18n/navigation`의 `Link` + `locale`로 `/ko` ↔ `/en` 전환.

---

## 사용 기술 및 언어

- **FE**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, next-intl(i18n), html-to-image(PNG 추출)
- **배포**: Cloudflare Pages (next-on-pages, Wrangler), Edge Runtime
- **기타**: Google AdSense, GA4(선택), SEO(robots, sitemap, 메타/OG)
