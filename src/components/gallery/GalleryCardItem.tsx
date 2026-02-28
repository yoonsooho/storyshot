import Image from "next/image";
import { parseCaption } from "@/lib/string-utils";
import type { SharedCard } from "@/lib/supabase/client";

interface GalleryCardItemProps {
    card: SharedCard;
    index: number;
    onClick: () => void;
}

export function GalleryCardItem({ card, index, onClick }: GalleryCardItemProps) {
    const { title } = parseCaption(card.caption);

    return (
        <li
            className="gallery-item-stagger overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            style={{ animationDelay: `${index * 40}ms` }}
        >
            <button
                type="button"
                onClick={onClick}
                className="interact-card-hover focus-ring block w-full cursor-pointer text-left"
            >
                <span className="block aspect-9/16 w-full bg-slate-100">
                    <Image
                        src={card.image_url}
                        alt={card.caption ?? ""}
                        width={360}
                        height={640}
                        className="h-full w-full object-cover"
                        unoptimized
                    />
                </span>
                {title ? (
                    <p className="line-clamp-1 p-2 text-sm font-medium text-slate-900 sm:p-3">
                        {title}
                    </p>
                ) : (
                    <div className="h-2" /> // 제목 없으면 여백만 살짝
                )}
            </button>
        </li>
    );
}
