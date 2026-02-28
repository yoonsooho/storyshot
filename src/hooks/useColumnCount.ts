"use client";

import { useEffect, useState } from "react";

const BREAKPOINT = 640;

export function useColumnCount(): number {
    const [cols, setCols] = useState(2);

    useEffect(() => {
        const update = () => setCols(window.innerWidth >= BREAKPOINT ? 3 : 2);
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    return cols;
}
