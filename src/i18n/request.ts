import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import koMessages from "../../messages/ko.json";
import enMessages from "../../messages/en.json";

const messagesMap: Record<string, typeof koMessages> = { ko: koMessages, en: enMessages };

export default getRequestConfig(async ({ requestLocale }) => {
    const requested = await requestLocale;
    const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
    return {
        locale,
        messages: messagesMap[locale] ?? messagesMap.ko,
    };
});
