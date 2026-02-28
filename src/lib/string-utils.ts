/** caption을 "첫 줄 = 제목, 나머지 = 글" 형태로 파싱 */
export function parseCaption(caption: string | null): { title: string | null; body: string } {
    if (!caption?.trim()) return { title: null, body: "" };
    const firstNewline = caption.indexOf("\n");
    if (firstNewline === -1) return { title: null, body: caption.trim() };
    return {
        title: caption.slice(0, firstNewline).trim() || null,
        body: caption.slice(firstNewline + 1).trim(),
    };
}
