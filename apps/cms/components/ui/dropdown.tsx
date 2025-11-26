"use client";

import * as RadixDropdown from "@radix-ui/react-dropdown-menu";

import { cn } from "@/utils";

interface DropdownProps {
  trigger: React.ReactNode;
  items: {
    label: string;
    onClick: () => void;
    isDanger?: boolean;
  }[];
  align?: "start" | "center" | "end";
}

function Dropdown({ trigger, items, align }: DropdownProps) {
  return (
    <RadixDropdown.Root>
      <RadixDropdown.Trigger className="focus:outline-none">
        {trigger}
      </RadixDropdown.Trigger>
      <RadixDropdown.Portal>
        <RadixDropdown.Content
          align={align}
          className="relative z-50 w-48 rounded-lg border border-neutral-200 bg-white p-1 shadow-lg data-[side=bottom]:animate-slide-up-fade data-[side=top]:animate-slide-down-fade"
        >
          {items.map((item, i) => (
            <RadixDropdown.DropdownMenuItem
              className={cn(
                "cursor-pointer rounded-md px-3 py-2 text-sm font-medium outline-none transition-colors",
                item.isDanger
                  ? "text-red-600 focus:bg-red-50"
                  : "text-neutral-700 focus:bg-neutral-100",
              )}
              key={`dropdown-item-${i}`}
              onClick={item.onClick}
            >
              {item.label}
            </RadixDropdown.DropdownMenuItem>
          ))}
        </RadixDropdown.Content>
      </RadixDropdown.Portal>
    </RadixDropdown.Root>
  );
}

export default Dropdown;
