import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CommonModal } from "./CommonModal";

describe("CommonModal", () => {
    it("renders nothing when open is false", () => {
        const { container } = render(
            <CommonModal open={false} onClose={() => {}}>
                <span>내용</span>
            </CommonModal>
        );
        expect(container.firstChild).toBeNull();
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("renders dialog with children when open", () => {
        render(
            <CommonModal open onClose={() => {}}>
                <span>모달 내용</span>
            </CommonModal>
        );
        const dialog = screen.getByRole("dialog");
        expect(dialog).toBeInTheDocument();
        expect(dialog).toHaveAttribute("aria-modal", "true");
        expect(screen.getByText("모달 내용")).toBeInTheDocument();
    });

    it("calls onClose when overlay is clicked", () => {
        const onClose = vi.fn();
        render(
            <CommonModal open onClose={onClose}>
                <span>내용</span>
            </CommonModal>
        );
        const dialog = screen.getByRole("dialog");
        // onClose는 내부 wrapper div의 onClick에 연결되어 있음 (dialog 자체가 아님)
        const clickableOverlay = dialog.firstElementChild;
        if (clickableOverlay) fireEvent.click(clickableOverlay);
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
