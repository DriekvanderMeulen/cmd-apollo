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
          className="dialog-overlay fixed inset-0 z-40 bg-neutral-200/70 backdrop-blur"
        />
        <RdxDialog.Content className="dialog-content no-scrollbar fixed left-1/2 top-1/2 z-50 max-h-[512px] min-w-[672px] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-scroll rounded-3xl bg-white">
          <div className="sticky top-0">
            <div className="flex items-start justify-between bg-white px-7 pb-1 pt-7">
              <div>
                <RdxDialog.Title className="mb-1 text-2xl font-bold">
                  {title}
                </RdxDialog.Title>
                <RdxDialog.Description className="whitespace-pre-line text-sm text-neutral-500">
                  {description}
                </RdxDialog.Description>
              </div>
              <RdxDialog.Close
                onClick={setIsOpen ? () => setIsOpen(false) : undefined}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-base-black"
              >
                <HiMiniXMark className="text-neutral-700" size={18} />
              </RdxDialog.Close>
            </div>
            <div className="h-6 bg-gradient-to-b from-white"></div>
          </div>
          <div className="px-7 pb-7">{children}</div>
        </RdxDialog.Content>
      </RdxDialog.Portal>
    </RdxDialog.Root>
  );
}

export default Dialog;
