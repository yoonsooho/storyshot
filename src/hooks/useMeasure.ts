import { useRef, useEffect, useState } from "react";

export function useMeasure() {
    const ref = useRef<HTMLDivElement | null>(null);
    const [bounds, setBounds] = useState({ height: 0 });

    useEffect(() => {
        if (!ref.current) return;
        const observer = new ResizeObserver(([entry]) => {
            if (entry) {
                setBounds({ height: entry.contentRect.height });
            }
        });
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return [ref, bounds] as const;
}
