import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ShareCardModal } from "./ShareCardModal";

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string) => key,
}));

describe("ShareCardModal", () => {
    const defaultProps = {
        open: true,
        onClose: vi.fn(),
        caption: "",
        onCaptionChange: vi.fn(),
        onSubmit: vi.fn(),
        mode: "caption-only" as const,
    };

    it("when open, shows dialog with title and submit button", () => {
        render(<ShareCardModal {...defaultProps} />);
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText("shareModalTitle")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "shareModalSubmit" })).toBeInTheDocument();
    });

    it("when closed, does not show dialog", () => {
        render(<ShareCardModal {...defaultProps} open={false} />);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
});
