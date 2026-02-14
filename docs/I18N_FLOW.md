# 국제화(i18n) 흐름 – 한 줄 요약

| 단계 | 어디서 | 뭐가 일어남 |
|------|--------|-------------|
| **1** | **middleware** (`src/middleware.ts`) | 사용자가 `/`로 들어오면 **`/ko`로 리다이렉트**. `/ko`, `/en`이면 그대로 통과. 요청에 **locale 정보**를 실어서 다음 단계로 넘김 (헤더 등). |
| **2** | **request.ts** (`src/i18n/request.ts`) | URL에 들어 있는 **locale(ko/en)** 에 맞는 **번역 파일**을 고름. `messages/ko.json` 또는 `messages/en.json`을 불러와서 **locale + messages** 를 반환. |
| **3** | **루트 layout** (`src/app/layout.tsx`) | 요청에 실린 locale 값을 읽어서 **`<html lang="ko">` 또는 `lang="en"`** 으로 넣어 줌. 화면/SEO용 언어 표시. |
| **4** | **[locale] layout** (`src/app/[locale]/layout.tsx`) | URL의 locale이 **ko 또는 en인지 검사**. 허용된 값이 아니면 404. **getMessages()** 로 2단계에서 준 messages를 받아서 **NextIntlClientProvider**에 넣음. 그래서 아래 페이지·컴포넌트에서 `t("키")` 로 번역을 쓸 수 있음. **generateMetadata** 로 locale마다 다른 title, description 등 메타데이터 생성. |
| **5** | **[locale] page** (`src/app/[locale]/page.tsx`) | **useTranslations("home")** 으로 `t` 함수 받음. `t("title")`, `t("subtitle")` 처럼 **messages의 키**를 넣으면 그 locale에 맞는 **문자열**이 나옴. 그걸로 화면 렌더. |
| **6** | **LocaleSwitcher** (`src/components/LocaleSwitcher.tsx`) | "English" / "한국어" 버튼. **i18n용 Link**에 **href는 그대로 두고 locale만 바꿔서** (`locale="en"` 또는 `"ko"`) 같은 페이지의 **다른 언어 버전**(`/en`, `/ko`)으로 이동시킴. |

**한 줄로:**  
주소에 `/ko` 또는 `/en`이 들어가고 → 그걸로 번역 JSON을 고르고 → Provider에 넣은 뒤 → 페이지는 `t("키")`만 부르면 그 언어로 보인다.
