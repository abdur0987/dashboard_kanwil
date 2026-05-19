import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Dashboard Digital Kanwil Kemenag Lampung",
  description:
    "Dashboard data strategis, agenda eksekutif, publikasi, video, kontak, dan lokasi Kanwil Kemenag Provinsi Lampung.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
