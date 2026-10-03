import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#101014",
};

export const metadata: Metadata = {
  title: "StreamBox - Minimalist Video Streaming",
  description:
    "Minimalist, Netflix-inspired video streaming web application with automatic Google Drive synchronization.",
  openGraph: {
    title: "StreamBox - Minimalist Video Streaming",
    description:
      "Minimalist, Netflix-inspired video streaming web application with automatic Google Drive synchronization.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StreamBox - Minimalist Video Streaming",
    description:
      "Minimalist, Netflix-inspired video streaming web application with automatic Google Drive synchronization.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body suppressHydrationWarning className="bg-[#101014] text-white min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
