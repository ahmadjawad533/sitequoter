import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#1D4ED8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "SiteQuote - Fast HVAC Quoting for Contractors",
    template: "%s | SiteQuote",
  },
  description:
    "Turn job photos and notes into a priced, professional HVAC quote in minutes. Built for small residential HVAC contractors.",
  applicationName: "SiteQuote",
  authors: [{ name: "SiteQuote" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "SiteQuote - Fast HVAC Quoting for Contractors",
    description:
      "Turn job photos and notes into a priced, professional HVAC quote in minutes.",
    url: "https://sitequote.app",
    siteName: "SiteQuote",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans bg-[#F3F4F6] text-[#111827] antialiased">
        {children}
      </body>
    </html>
  );
}
