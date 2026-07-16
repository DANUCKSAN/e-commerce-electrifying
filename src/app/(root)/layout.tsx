import type { Metadata, Viewport } from "next";

import "../globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "PVtoEV | Solar, storage and smarter home energy",
    template: "%s | PVtoEV",
  },
  description:
    "Shop solar panels, energy storage, EV chargers and portable coolers from PVtoEV's focused renewable catalogue.",
};

export const viewport: Viewport = {
  themeColor: "#101916",
};

export default function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-light-200 antialiased">
      <body className="min-h-full overflow-x-clip bg-light-200 font-jost text-dark-900">
        <Navbar />
        {children}
        <Footer newsletter={false} />
      </body>
    </html>
  );
}
