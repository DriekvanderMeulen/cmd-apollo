import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export * from "./labels";
export * from "./error";
export * from "./dayjs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
