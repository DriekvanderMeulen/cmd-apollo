import type { Metadata } from "next";
import localFont from "next/font/local";
import "react-datepicker/dist/react-datepicker.css";

import "./globals.css";

export const metadata: Metadata = {
  title: "ApolloView CMS",
  description: "ApolloView CMS, the content management system for the ApolloView app",
};

const sf = localFont({
  src: [
    {
      path: "./fonts/SF-Pro-Text-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/SF-Pro-Text-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/SF-Pro-Text-Semibold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/SF-Pro-Text-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/SF-Pro-Text-Black.otf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-sf",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${sf.className} h-full`}>{children}</body>
    </html>
  );
}
