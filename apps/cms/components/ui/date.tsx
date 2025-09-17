"use client";

import { dayjs } from "@/utils/dayjs";

interface RelativeDateProps {
  date: Date;
}

export function RelativeDate({ date }: RelativeDateProps) {
  return <>{dayjs().to(dayjs(date))}</>;
}

interface FormatDateProps {
  date: Date;
  format: string;
}

export function FormatDate({ date, format }: FormatDateProps) {
  return <>{dayjs(date).format(format)}</>;
}
