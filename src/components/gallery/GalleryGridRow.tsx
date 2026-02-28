"use client";

import type { CSSProperties } from "react";
import { GalleryCardItem } from "@/components/gallery/GalleryCardItem";
import type { SharedCard } from "@/lib/supabase/client";

export type GalleryGridRowProps = {
    index: number;
    style?: CSSProperties;
    cards: SharedCard[];
    columnCount: number;
    onCardClick: (card: SharedCard) => void;
};

export function GalleryGridRow({
    index,
    style = {},
    cards,
    columnCount,
    onCardClick,
}: GalleryGridRowProps) {
    const start = index * columnCount;
    const rowCards = cards.slice(start, start + columnCount);
    return (
        <div style={style}>
            <ul className="grid list-none grid-cols-2 gap-3 p-0 m-0 sm:grid-cols-3 sm:gap-4 pb-12">
                {rowCards.map((card, i) => (
                    <GalleryCardItem key={card.id} card={card} index={start + i} onClick={() => onCardClick(card)} />
                ))}
                {rowCards.length < columnCount &&
                    Array.from({ length: columnCount - rowCards.length }, (_, i) => (
                        <li key={`pad-${index}-${i}`} aria-hidden className="list-none" />
                    ))}
            </ul>
        </div>
    );
}
