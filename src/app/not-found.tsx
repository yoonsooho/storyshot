import Link from "next/link";

/** Cloudflare Pages: non-static routes must use Edge Runtime */
export const runtime = "edge";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-slate-900">
            <h1 className="text-2xl font-semibold">404</h1>
            <p className="text-slate-600">페이지를 찾을 수 없습니다.</p>
            <Link
                href="/ko"
                className="rounded-full border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-50 transition hover:bg-slate-800"
            >
                홈으로
            </Link>
        </div>
    );
}
