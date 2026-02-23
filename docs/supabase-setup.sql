-- StoryShot 갤러리: Supabase 대시보드 → SQL Editor에서 실행하세요.
-- 1) 테이블 생성
CREATE TABLE IF NOT EXISTS public.shared_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    caption TEXT,
    locale TEXT NOT NULL DEFAULT 'ko',
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) RLS 활성화
ALTER TABLE public.shared_cards ENABLE ROW LEVEL SECURITY;

-- 3) 정책: 누구나 approved만 조회
CREATE POLICY "Public read approved"
ON public.shared_cards FOR SELECT
USING (status = 'approved');

-- 4) 정책: 익명 포함 누구나 삽입 (갤러리 공유용)
CREATE POLICY "Anyone can insert"
ON public.shared_cards FOR INSERT
WITH CHECK (true);

-- 5) Storage 버킷은 대시보드에서 수동 생성 권장:
--    Storage → New bucket → Name: card-images, Public: ON
--    그 다음 Policies에서:
--    - "Public read": SELECT for all on card-images
--    - "Authenticated or anon upload": INSERT for all on card-images

-- (선택) Storage 버킷을 SQL로 만들려면:
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('card-images', 'card-images', true, 5242880)
ON CONFLICT (id) DO NOTHING;

-- Storage 정책: 누구나 card-images에 업로드
CREATE POLICY "Anyone can upload to card-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'card-images');

-- Storage 정책: 누구나 card-images 읽기
CREATE POLICY "Public read card-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'card-images');
