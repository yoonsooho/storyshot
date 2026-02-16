import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import("next").NextConfig} */
const nextConfig = {
    productionBrowserSourceMaps: true,
};

if (process.env.NODE_ENV === "development") {
    await setupDevPlatform();
}

export default withNextIntl(nextConfig);
