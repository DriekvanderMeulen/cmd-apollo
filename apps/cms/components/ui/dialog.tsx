"use client";

import * as RdxDialog from "@radix-ui/react-dialog";
import { KeyboardEvent, useCallback, useEffect } from "react";
import { HiMiniXMark } from "react-icons/hi2";

import { Button } from "@/components/ui";

interface DialogProps {
  title: string;
  description?: string;
  triggerTitle?: string;
  triggerVariant?: "primary" | "secondary" | "secondary-gray" | "danger";
  renderTrigger?: React.ReactNode;
  children?: React.ReactNode;
  onOpenChange?: (isOpen: boolean) => void;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

function Dialog({
  title,
  description,
  children,
  triggerTitle,
  triggerVariant,
  renderTrigger,
  onOpenChange,
  isOpen,
  setIsOpen,
}: DialogProps) {
  const handleEscape = useCallback(
    (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape" && setIsOpen && isOpen) {
        setIsOpen(false);
      }
    },
    [isOpen, setIsOpen],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <RdxDialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <RdxDialog.Trigger
        asChild
        onClick={setIsOpen ? () => setIsOpen(true) : undefined}
      >
        {renderTrigger ? (
          renderTrigger
        ) : triggerTitle ? (
          <Button title={triggerTitle} variant={triggerVariant} />
        ) : null}
      </RdxDialog.Trigger>
      <RdxDialog.Portal>
        <RdxDialog.Overlay
          onClick={setIsOpen ? () => setIsOpen(false) : undefined}
          className="dialog-overlay fixed inset-0 z-40 bg-neutral-900/40 backdrop-blur-sm"
        />
        <RdxDialog.Content className="dialog-content no-scrollbar fixed left-1/2 top-1/2 z-50 max-h-[560px] min-w-[640px] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-scroll rounded-xl bg-white shadow-xl border border-neutral-200">
          <div className="sticky top-0">
            <div className="flex items-start justify-between bg-white px-6 pb-2 pt-6 border-b border-neutral-200">
              <div>
                <RdxDialog.Title className="mb-1 text-xl font-semibold text-neutral-900">
                  {title}
                </RdxDialog.Title>
                <RdxDialog.Description className="whitespace-pre-line text-sm text-neutral-500">
                  {description}
                </RdxDialog.Description>
              </div>
              <RdxDialog.Close
                onClick={setIsOpen ? () => setIsOpen(false) : undefined}
                className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700 transition-colors"
              >
                <HiMiniXMark size={20} />
              </RdxDialog.Close>
            </div>
          </div>
          <div className="px-6 py-5">{children}</div>
        </RdxDialog.Content>
      </RdxDialog.Portal>
    </RdxDialog.Root>
  );
}

export default Dialog;
