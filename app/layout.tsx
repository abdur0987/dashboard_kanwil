import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Dashboard Digital Instansi",
  description: "Dashboard data strategis, publikasi, video, kontak, dan lokasi instansi.",
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
