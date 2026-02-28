export type BackgroundType = "gradient" | "image";

export type MoodId = "calm" | "happy" | "tired" | "focused";

export type GradientId = "sunset" | "ocean" | "mono";

export type CardAspectId = "9_16" | "4_5" | "3_4" | "1_1" | "3_2" | "4_3" | "16_9";

export interface StoryFormState {
    /** 제목 (선택). 있으면 카드 상단에 표시 */
    title?: string;
    textMain: string;
    textSecondary: string;
    date: string;
    mood: MoodId;
    backgroundType: BackgroundType;
    gradient: GradientId;
    imageDataUrl: string | null;
    imageFileName: string | null;
    /** 0~100, 사진 배경일 때 어두운 오버레이 강도 */
    overlayIntensity?: number;
    /** 메인 문장 텍스트 색상 (CSS color) */
    textMainColor?: string;
    /** 보조 문장 텍스트 색상 (CSS color) */
    textSecondaryColor?: string;
    /** 날짜 텍스트 색상 (CSS color) */
    dateColor?: string;
    /** 오늘의 기분 뱃지 텍스트 색상 (CSS color) */
    moodColor?: string;
    /** 카드 비율 (기본 9:16) */
    cardAspect?: CardAspectId;
    /** 글자 블록 위치 (카드 내 %). 드래그로 변경 가능 */
    positionMood?: { x: number; y: number };
    positionTitle?: { x: number; y: number };
    positionMain?: { x: number; y: number };
    positionSecondary?: { x: number; y: number };
    positionDate?: { x: number; y: number };
    /** 글자 블록 가로 넓이 (카드 대비 %). 리사이즈 핸들로 조절 */
    widthMood?: number;
    widthTitle?: number;
    widthMain?: number;
    widthSecondary?: number;
    widthDate?: number;
    /** 오늘의 기분 문구 (비어 있으면 mood에 따른 기본 문구 사용) */
    moodText?: string;
    /** 오늘의 기분 이모지 (비어 있으면 mood에 따른 기본 이모지 사용) */
    moodEmoji?: string;
}

export const DEFAULT_POSITIONS = {
    mood: { x: 6, y: 6 },
    title: { x: 10, y: 28 },
    main: { x: 10, y: 40 },
    secondary: { x: 10, y: 48 },
    date: { x: 72, y: 85 },
} as const;

export const DEFAULT_WIDTHS = {
    mood: 50,
    title: 85,
    main: 85,
    secondary: 85,
    date: 40,
} as const;

