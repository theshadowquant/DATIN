import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DATIN Command Center — Data2Innovate Club Management",
  description: "Centralized Club Management, Digital Membership Passes, Events, and Innovation Workspace for DATIN | Data2Innovate.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#f1ebdd] text-nirmaan-black selection:bg-nirmaan-amber selection:text-nirmaan-black">
        {children}
      </body>
    </html>
  );
}
