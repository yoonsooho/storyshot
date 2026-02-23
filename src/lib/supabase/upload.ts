import { supabase } from "./client";

const BUCKET = "card-images";

function dataUrlToBlob(dataUrl: string): Blob {
    const [header, base64] = dataUrl.split(",");
    const mime = header?.match(/data:([^;]+)/)?.[1] ?? "image/png";
    const binary = atob(base64 ?? "");
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mime });
}

export async function uploadCardToGallery(params: {
    dataUrl: string;
    caption?: string;
    locale: string;
}): Promise<{ id: string; imageUrl: string } | null> {
    if (!supabase) return null;

    const blob = dataUrlToBlob(params.dataUrl);
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.png`;

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, blob, { contentType: "image/png", upsert: false });

    if (uploadError) {
        console.error("Supabase storage upload error:", uploadError);
        return null;
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(uploadData.path);
    const imageUrl = urlData.publicUrl;

    const { data: row, error: insertError } = await supabase
        .from("shared_cards")
        .insert({
            image_url: imageUrl,
            caption: params.caption?.trim() || null,
            locale: params.locale,
            status: "approved",
        })
        .select("id")
        .single();

    if (insertError) {
        console.error("Supabase insert error:", insertError);
        return null;
    }

    return { id: row.id, imageUrl };
}

/** 갤러리 페이지에서 이미지 파일 + 글으로 공유할 때 */
export async function uploadCardToGalleryFromFile(params: {
    file: File;
    caption?: string;
    locale: string;
}): Promise<{ id: string; imageUrl: string } | null> {
    if (!supabase) return null;

    const ext = params.file.name.split(".").pop()?.toLowerCase() || "png";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, params.file, { contentType: params.file.type || "image/png", upsert: false });

    if (uploadError) {
        console.error("Supabase storage upload error:", uploadError);
        return null;
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(uploadData.path);
    const imageUrl = urlData.publicUrl;

    const { data: row, error: insertError } = await supabase
        .from("shared_cards")
        .insert({
            image_url: imageUrl,
            caption: params.caption?.trim() || null,
            locale: params.locale,
            status: "approved",
        })
        .select("id")
        .single();

    if (insertError) {
        console.error("Supabase insert error:", insertError);
        return null;
    }

    return { id: row.id, imageUrl };
}
